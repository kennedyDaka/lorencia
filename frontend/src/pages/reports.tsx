import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardData {
  totalRevenue: { today: number; thisMonth: number; thisYear: number };
  totalExpenses: { today: number; thisMonth: number; thisYear: number };
  topProducts: { name: string; revenue: number; count: number }[];
  recentSales: { id: string; total: number; createdAt: string; items: { productName: string; qty: number }[] }[];
  lowStockCount: number;
}

interface PnlData {
  revenue: number;
  expenses: { category: string; total: number }[];
  netProfit: number;
}

interface SalesData {
  totalSales: number;
  totalItems: number;
  byDay: { date: string; total: number; count: number }[];
  byPaymentMethod: { method: string; count: number; total: number }[];
  topProducts: { name: string; count: number; revenue: number }[];
}

interface ExpensesData {
  totalExpenses: number;
  byCategory: { category: string; total: number }[];
  byDay: { date: string; total: number }[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export function ReportsPage() {
  const { business } = useParams({ from: "/pos/$business/reports" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];

  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today());

  const { data: dashboard, isLoading: dashLoading } = useQuery<DashboardData>({
    queryKey: ["reports-dashboard", business],
    queryFn: () => apiGet<DashboardData>(`/reports/dashboard/business/${b?.id}`),
    enabled: !!b,
  });

  const { data: pnl, isLoading: pnlLoading } = useQuery<PnlData>({
    queryKey: ["reports-pnl", business, from, to],
    queryFn: () => apiGet<PnlData>(`/reports/pnl/business/${b?.id}?from=${from}&to=${to}`),
    enabled: !!b,
  });

  const { data: sales, isLoading: salesLoading } = useQuery<SalesData>({
    queryKey: ["reports-sales", business, from, to],
    queryFn: () => apiGet<SalesData>(`/reports/sales/business/${b?.id}?from=${from}&to=${to}`),
    enabled: !!b,
  });

  const { data: expenses, isLoading: expLoading } = useQuery<ExpensesData>({
    queryKey: ["reports-expenses", business, from, to],
    queryFn: () => apiGet<ExpensesData>(`/reports/expenses/business/${b?.id}?from=${from}&to=${to}`),
    enabled: !!b,
  });

  if (!b) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Business not found.</div>;
  }

  if (dashLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/pos/$business" params={{ business }} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <BarChart3 className="h-5 w-5" />
          <h1 className="text-lg font-bold">Reports</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Today" revenue={dashboard?.totalRevenue.today} expenses={dashboard?.totalExpenses.today} />
          <StatCard label="This Month" revenue={dashboard?.totalRevenue.thisMonth} expenses={dashboard?.totalExpenses.thisMonth} />
          <StatCard label="This Year" revenue={dashboard?.totalRevenue.thisYear} expenses={dashboard?.totalExpenses.thisYear} />
        </div>

        {/* Top Products & Low Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-lg border border-border bg-card p-4">
            <h2 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Products
            </h2>
            {dashboard?.topProducts && dashboard.topProducts.length > 0 ? (
              <div className="space-y-2">
                {dashboard.topProducts.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {i + 1}. {p.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{p.count} sold</span>
                      <span className="font-medium">{formatMK(p.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No product data.</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Alert
            </h2>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-amber-500">{dashboard?.lowStockCount ?? 0}</div>
              <p className="text-sm text-muted-foreground mt-1">raw materials below threshold</p>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Recent Sales
          </h2>
          {dashboard?.recentSales && dashboard.recentSales.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recentSales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-muted-foreground">{sale.items.length} items</span>
                  <span className="font-medium">{formatMK(sale.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent sales.</p>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-medium mb-3">Date Range</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-sm font-medium">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Profit & Loss */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Profit &amp; Loss
          </h2>
          {pnlLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : pnl ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium text-green-600">{formatMK(pnl.revenue)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Expenses by Category</span>
                {pnl.expenses.length === 0 ? (
                  <p className="text-sm pl-4 text-muted-foreground">None</p>
                ) : (
                  pnl.expenses.map((e, i) => (
                    <div key={i} className="flex justify-between text-sm pl-4">
                      <span className="text-muted-foreground">{e.category}</span>
                      <span>{formatMK(e.total)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="font-medium">Net Profit</span>
                <span className={`font-medium ${pnl.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatMK(pnl.netProfit)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data.</p>
          )}
        </div>

        {/* Sales by Payment Method */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Sales by Payment Method
          </h2>
          {salesLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : sales?.byPaymentMethod && sales.byPaymentMethod.length > 0 ? (
            <div className="space-y-2">
              {sales.byPaymentMethod.map((pm, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{pm.method}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{pm.count} sales</span>
                    <span className="font-medium">{formatMK(pm.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sales data.</p>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Expenses by Category
          </h2>
          {expLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : expenses?.byCategory && expenses.byCategory.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatMK(expenses.totalExpenses)}</span>
              </div>
              {expenses.byCategory.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{e.category}</span>
                  <span className="font-medium">{formatMK(e.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No expenses data.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, revenue = 0, expenses = 0 }: { label: string; revenue?: number; expenses?: number }) {
  const profit = revenue - expenses;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600">Revenue</span>
          <span className="text-sm font-medium text-green-600">{formatMK(revenue)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-600">Expenses</span>
          <span className="text-sm font-medium text-red-600">{formatMK(expenses)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-1">
          <span className="text-sm font-medium">Profit</span>
          <span className={`text-sm font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatMK(profit)}
          </span>
        </div>
      </div>
    </div>
  );
}
