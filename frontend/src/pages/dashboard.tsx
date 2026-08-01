import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import {
  Coffee,
  Gift,
  LogOut,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowLeft,
  Package,
  Receipt,
  Users,
  ChefHat,
  Boxes,
  BookOpen,
  Wallet,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  totalRevenue: { today: number; thisMonth: number; thisYear: number };
  totalExpenses: { today: number; thisMonth: number; thisYear: number };
  recentSales: any[];
  lowStockCount: number;
}

interface PnLData {
  revenue: number;
  expenses: { category: string; total: number }[];
  totalExpenses: number;
  netProfit: number;
}

export function DashboardPage() {
  const { email, isLoading: authLoading } = useAuthStore();

  const cafeId = BUSINESSES.cafe.id;
  const giftShopId = BUSINESSES["gift-shop"].id;

  const { data: cafeDash, isLoading: cafeLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", "cafe"],
    queryFn: () => apiGet(`/reports/dashboard/business/${cafeId}`),
  });

  const { data: giftDash, isLoading: giftLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", "gift-shop"],
    queryFn: () => apiGet(`/reports/dashboard/business/${giftShopId}`),
  });

  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const now = new Date().toISOString();

  const { data: cafePnl } = useQuery<PnLData>({
    queryKey: ["pnl", "cafe"],
    queryFn: () => apiGet(`/reports/pnl/business/${cafeId}?from=${startOfYear}&to=${now}`),
  });

  const { data: giftPnl } = useQuery<PnLData>({
    queryKey: ["pnl", "gift-shop"],
    queryFn: () => apiGet(`/reports/pnl/business/${giftShopId}?from=${startOfYear}&to=${now}`),
  });

  const loading = authLoading || cafeLoading || giftLoading;

  const totalTodayRevenue = (cafeDash?.totalRevenue.today ?? 0) + (giftDash?.totalRevenue.today ?? 0);
  const totalTodayExpenses = (cafeDash?.totalExpenses.today ?? 0) + (giftDash?.totalExpenses.today ?? 0);
  const totalMonthRevenue = (cafeDash?.totalRevenue.thisMonth ?? 0) + (giftDash?.totalRevenue.thisMonth ?? 0);
  const totalMonthExpenses = (cafeDash?.totalExpenses.thisMonth ?? 0) + (giftDash?.totalExpenses.thisMonth ?? 0);
  const totalYearRevenue = (cafeDash?.totalRevenue.thisYear ?? 0) + (giftDash?.totalRevenue.thisYear ?? 0);
  const totalYearExpenses = (cafeDash?.totalExpenses.thisYear ?? 0) + (giftDash?.totalExpenses.thisYear ?? 0);

  const revenueByBusiness = [
    { name: "Cafe", value: cafeDash?.totalRevenue.thisMonth ?? 0, fill: "#c7493a" },
    { name: "Gift Shop", value: giftDash?.totalRevenue.thisMonth ?? 0, fill: "#503828" },
  ];

  const pnlByBusiness = [
    { name: "Cafe", profit: cafePnl?.netProfit ?? 0, expenses: cafePnl?.totalExpenses ?? 0 },
    { name: "Gift Shop", profit: giftPnl?.netProfit ?? 0, expenses: giftPnl?.totalExpenses ?? 0 },
  ];

  const allExpenses = [
    ...(cafePnl?.expenses ?? []),
    ...(giftPnl?.expenses ?? []),
  ];
  const expenseByCategory = allExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.total);
    return acc;
  }, {});
  const expenseChartData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ["#c7493a", "#503828", "#d4a27c", "#8b6f47", "#c4956a", "#a67c52"];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{email}</span>
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Today Revenue" value={formatMK(totalTodayRevenue)} icon={<TrendingUp className="h-5 w-5 text-green-600" />} />
          <StatCard label="Today Expenses" value={formatMK(totalTodayExpenses)} icon={<TrendingDown className="h-5 w-5 text-red-600" />} />
          <StatCard label="Month Revenue" value={formatMK(totalMonthRevenue)} icon={<TrendingUp className="h-5 w-5 text-green-600" />} />
          <StatCard label="Month Profit" value={formatMK(totalMonthRevenue - totalMonthExpenses)} icon={<DollarSign className="h-5 w-5 text-primary" />} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Year Revenue" value={formatMK(totalYearRevenue)} icon={<TrendingUp className="h-5 w-5 text-green-600" />} />
          <StatCard label="Year Expenses" value={formatMK(totalYearExpenses)} icon={<TrendingDown className="h-5 w-5 text-red-600" />} />
          <StatCard label="Year Profit" value={formatMK(totalYearRevenue - totalYearExpenses)} icon={<DollarSign className="h-5 w-5 text-primary" />} />
          <StatCard label="Low Stock Items" value={String((cafeDash?.lowStockCount ?? 0) + (giftDash?.lowStockCount ?? 0))} icon={<Package className="h-5 w-5 text-amber-600" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Revenue by Business (This Month)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={revenueByBusiness}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {revenueByBusiness.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatMK(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {revenueByBusiness.map((b) => (
                <div key={b.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: b.fill }} />
                  <span className="text-muted-foreground">{b.name}</span>
                  <span className="font-medium">{formatMK(b.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Profit vs Expenses (Year)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pnlByBusiness}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: number) => formatMK(val)} />
                <Bar dataKey="profit" fill="#c7493a" radius={[4, 4, 0, 0]} name="Net Profit" />
                <Bar dataKey="expenses" fill="#503828" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {expenseChartData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Expenses by Category (Year)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip formatter={(val: number) => formatMK(val)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseChartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BusinessCard slug="cafe" name="Lorencia Cafe" data={cafeDash} icon={<Coffee className="h-8 w-8 text-primary" />} subtitle="POS + Catering + Raw Materials" />
          <BusinessCard slug="gift-shop" name="Lorencia Gift Shop" data={giftDash} icon={<Gift className="h-8 w-8 text-primary" />} subtitle="POS Terminal" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function BusinessCard({
  slug,
  name,
  data,
  icon,
  subtitle,
}: {
  slug: string;
  name: string;
  data: DashboardData | undefined;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <Link
      to="/pos/$business"
      params={{ business: slug }}
      className="group rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{name}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground">Revenue</div>
          <div className="text-sm font-bold">{formatMK(data?.totalRevenue.thisMonth ?? 0)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Expenses</div>
          <div className="text-sm font-bold">{formatMK(data?.totalExpenses.thisMonth ?? 0)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Today</div>
          <div className="text-sm font-bold">{formatMK(data?.totalRevenue.today ?? 0)}</div>
        </div>
      </div>
    </Link>
  );
}
