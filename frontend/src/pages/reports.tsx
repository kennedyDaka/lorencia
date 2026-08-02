import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Download,
  ShoppingCart,
  Receipt,
  FileText,
} from "lucide-react";
import { useState, useCallback } from "react";

interface DashboardData {
  totalRevenue: { today: number; thisMonth: number; thisYear: number };
  totalExpenses: { today: number; thisMonth: number; thisYear: number };
  topProducts: { name: string; revenue: number; count: number }[];
  recentSales: {
    id: string;
    total: number;
    createdAt: string;
    items: { productName: string; qty: number }[];
  }[];
  lowStockCount: number;
}

interface PnlData {
  revenue: number;
  expenses: { category: string; total: number }[];
  netProfit: number;
}

interface SalesSummary {
  totalSales: number;
  totalCount: number;
  byPaymentMethod: { method: string; count: number; total: number }[];
  topProducts: { name: string; count: number; revenue: number }[];
}

interface ExpensesSummary {
  totalExpenses: number;
  byCategory: { category: string; total: number; count: number }[];
}

interface SaleRow {
  id: string;
  date: string;
  customer: string;
  paymentMethod: string;
  total: number;
  itemCount: number;
  items: { productName: string; qty: number; unitPrice: number; lineTotal: number }[];
  note: string | null;
}

interface ExpenseRow {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string | null;
  items: { description: string; qty: number; unitPrice: number; lineTotal: number }[];
}

interface DetailedSales {
  sales: SaleRow[];
  totalRevenue: number;
  totalSales: number;
  totalItems: number;
}

interface DetailedExpenses {
  expenses: ExpenseRow[];
  totalExpenses: number;
  totalEntries: number;
}

type Tab = "overview" | "sales" | "expenses";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function downloadCSV(filename: string, csv: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCSVValue(v: string | number): string {
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function ReportsPage() {
  const { business } = useParams({ from: "/pos/$business/reports" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const [tab, setTab] = useState<Tab>("overview");
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today());

  const dateParams = `from=${from}&to=${to}`;

  const { data: dashboard, isLoading: dashLoading } = useQuery<DashboardData>({
    queryKey: ["reports-dashboard", business],
    queryFn: () => apiGet<DashboardData>(`/reports/dashboard/business/${b?.id}`),
    enabled: !!b,
  });

  const { data: pnl } = useQuery<PnlData>({
    queryKey: ["reports-pnl", business, from, to],
    queryFn: () => apiGet<PnlData>(`/reports/pnl/business/${b?.id}?${dateParams}`),
    enabled: !!b,
  });

  const { data: salesSummary } = useQuery<SalesSummary>({
    queryKey: ["reports-sales", business, from, to],
    queryFn: () => apiGet<SalesSummary>(`/reports/sales/business/${b?.id}?${dateParams}`),
    enabled: !!b,
  });

  const { data: expensesSummary } = useQuery<ExpensesSummary>({
    queryKey: ["reports-expenses", business, from, to],
    queryFn: () => apiGet<ExpensesSummary>(`/reports/expenses/business/${b?.id}?${dateParams}`),
    enabled: !!b,
  });

  const { data: detailedSales, isLoading: salesLoading } = useQuery<DetailedSales>({
    queryKey: ["reports-sales-detail", business, from, to],
    queryFn: () => apiGet<DetailedSales>(`/reports/sales-detail/business/${b?.id}?${dateParams}`),
    enabled: !!b && tab === "sales",
  });

  const { data: detailedExpenses, isLoading: expLoading } = useQuery<DetailedExpenses>({
    queryKey: ["reports-expenses-detail", business, from, to],
    queryFn: () => apiGet<DetailedExpenses>(`/reports/expenses-detail/business/${b?.id}?${dateParams}`),
    enabled: !!b && tab === "expenses",
  });

  const exportSalesCSV = useCallback(() => {
    if (!detailedSales) return;
    const header = ["Date", "Payment Method", "Items", "Total (MK)", "Item Details"];
    const rows = detailedSales.sales.map((s) => {
      const itemDetails = s.items
        .map((i) => `${i.productName} x${i.qty} @ ${i.unitPrice.toLocaleString()}`)
        .join("; ");
      return [
        new Date(s.date).toLocaleDateString(),
        s.paymentMethod,
        s.itemCount,
        s.total,
        itemDetails,
      ];
    });
    const csv = [header.join(","), ...rows.map((r) => r.map(toCSVValue).join(",")).join("\n")].join("\n");
    downloadCSV(`sales-report-${from}-to-${to}.csv`, csv);
  }, [detailedSales, from, to]);

  const exportExpensesCSV = useCallback(() => {
    if (!detailedExpenses) return;
    const header = ["Date", "Category", "Amount (MK)", "Note", "Item Details"];
    const rows = detailedExpenses.expenses.map((e) => {
      const itemDetails = e.items
        .map((i) => `${i.description} x${i.qty} @ ${i.unitPrice.toLocaleString()}`)
        .join("; ");
      return [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.amount,
        e.note ?? "",
        itemDetails,
      ];
    });
    const csv = [header.join(","), ...rows.map((r) => r.map(toCSVValue).join(",")).join("\n")].join("\n");
    downloadCSV(`expenses-report-${from}-to-${to}.csv`, csv);
  }, [detailedExpenses, from, to]);

  if (!b) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Business not found.
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "sales", label: "Sales Detail", icon: <ShoppingCart className="h-4 w-4" /> },
    { key: "expenses", label: "Expenses Detail", icon: <Receipt className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/pos/$business"
            params={{ business }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <BarChart3 className="h-5 w-5" />
          <h1 className="text-lg font-bold">Reports</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        {/* Date Range */}
        <div className="rounded-lg border border-border bg-card p-4">
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

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <OverviewTab
            dashboard={dashboard}
            pnl={pnl}
            sales={salesSummary}
            expenses={expensesSummary}
            dashLoading={dashLoading}
          />
        )}

        {/* Sales Detail Tab */}
        {tab === "sales" && (
          <SalesDetailTab
            data={detailedSales}
            loading={salesLoading}
            onExport={exportSalesCSV}
            from={from}
            to={to}
          />
        )}

        {/* Expenses Detail Tab */}
        {tab === "expenses" && (
          <ExpensesDetailTab
            data={detailedExpenses}
            loading={expLoading}
            onExport={exportExpensesCSV}
            from={from}
            to={to}
          />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  dashboard,
  pnl,
  sales,
  expenses,
  dashLoading,
}: {
  dashboard?: DashboardData;
  pnl?: PnlData;
  sales?: SalesSummary;
  expenses?: ExpensesSummary;
  dashLoading: boolean;
}) {
  if (dashLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Today"
          revenue={dashboard?.totalRevenue.today}
          expenses={dashboard?.totalExpenses.today}
        />
        <StatCard
          label="This Month"
          revenue={dashboard?.totalRevenue.thisMonth}
          expenses={dashboard?.totalExpenses.thisMonth}
        />
        <StatCard
          label="This Year"
          revenue={dashboard?.totalRevenue.thisYear}
          expenses={dashboard?.totalExpenses.thisYear}
        />
      </div>

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
            <div className="text-3xl font-bold text-amber-500">
              {dashboard?.lowStockCount ?? 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">raw materials below threshold</p>
          </div>
        </div>
      </div>

      {/* Profit & Loss */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-medium mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Profit &amp; Loss
        </h2>
        {pnl ? (
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
              <span
                className={`font-medium ${pnl.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
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
        {sales?.byPaymentMethod && sales.byPaymentMethod.length > 0 ? (
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
        {expenses?.byCategory && expenses.byCategory.length > 0 ? (
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

      {/* Recent Sales */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-medium mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Recent Sales
        </h2>
        {dashboard?.recentSales && dashboard.recentSales.length > 0 ? (
          <div className="space-y-2">
            {dashboard.recentSales.slice(0, 10).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0"
              >
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
    </>
  );
}

function SalesDetailTab({
  data,
  loading,
  onExport,
  from,
  to,
}: {
  data?: DetailedSales;
  loading: boolean;
  onExport: () => void;
  from: string;
  to: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Loading sales data...
      </div>
    );
  }

  if (!data || data.sales.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        No sales found for this date range.
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold">{data.totalSales.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Items Sold</p>
          <p className="text-2xl font-bold">{data.totalItems.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatMK(data.totalRevenue)}</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Sales Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Items</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.sales.map((sale) => (
                <>
                  <tr
                    key={sale.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                  >
                    <td className="px-4 py-3">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{sale.customer}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{sale.itemCount}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatMK(sale.total)}</td>
                  </tr>
                  {expandedId === sale.id && (
                    <tr key={`${sale.id}-detail`}>
                      <td colSpan={5} className="px-4 py-2 bg-muted/20">
                        <div className="space-y-1">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {item.productName} x{item.qty}
                              </span>
                              <span>{formatMK(item.lineTotal)}</span>
                            </div>
                          ))}
                          {sale.note && (
                            <div className="text-xs text-muted-foreground pt-1 border-t border-border mt-1">
                              Note: {sale.note}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ExpensesDetailTab({
  data,
  loading,
  onExport,
  from,
  to,
}: {
  data?: DetailedExpenses;
  loading: boolean;
  onExport: () => void;
  from: string;
  to: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Loading expenses data...
      </div>
    );
  }

  if (!data || data.expenses.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        No expenses found for this date range.
      </div>
    );
  }

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Entries</p>
          <p className="text-2xl font-bold">{data.totalEntries.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">{formatMK(data.totalExpenses)}</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Expenses Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Note</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map((expense) => (
                <>
                  <tr
                    key={expense.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === expense.id ? null : expense.id)
                    }
                  >
                    <td className="px-4 py-3">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                      {expense.note ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">
                      {formatMK(expense.amount)}
                    </td>
                  </tr>
                  {expandedId === expense.id && (
                    <tr key={`${expense.id}-detail`}>
                      <td colSpan={4} className="px-4 py-2 bg-muted/20">
                        <div className="space-y-1">
                          {expense.items.length > 0 ? (
                            expense.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-muted-foreground">
                                  {item.description} x{item.qty}
                                </span>
                                <span>{formatMK(item.lineTotal)}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">No line items</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  revenue = 0,
  expenses = 0,
}: {
  label: string;
  revenue?: number;
  expenses?: number;
}) {
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
          <span
            className={`text-sm font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatMK(profit)}
          </span>
        </div>
      </div>
    </div>
  );
}
