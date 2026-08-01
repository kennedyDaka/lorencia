import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { BUSINESSES } from "@/lib/businesses";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api";
import { formatMK } from "@/lib/utils";
import {
  Coffee,
  Gift,
  LogOut,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
} from "lucide-react";

interface DashboardData {
  totalRevenue: { today: number; thisMonth: number; thisYear: number };
  totalExpenses: { today: number; thisMonth: number; thisYear: number };
  recentSales: any[];
  lowStockCount: number;
}

export function HomePage() {
  const { userId, email, role, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isOwner = role === "owner" || role === "admin";

  if (!userId || !isOwner) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center space-y-10">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Lorencia
            </h1>
            <p className="text-lg text-muted-foreground">Cafe & Gift Shop Manager</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <Link
              to="/pos/$business"
              params={{ business: "cafe" }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-left hover:border-primary hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Coffee className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Lorencia Cafe</h2>
                  <p className="text-sm text-muted-foreground mt-1">Open POS Terminal</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all absolute right-6 top-1/2 -translate-y-1/2" />
              </div>
            </Link>

            <Link
              to="/pos/$business"
              params={{ business: "gift-shop" }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-left hover:border-primary hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Lorencia Gift Shop</h2>
                  <p className="text-sm text-muted-foreground mt-1">Open POS Terminal</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all absolute right-6 top-1/2 -translate-y-1/2" />
              </div>
            </Link>
          </div>

          {!userId && (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Admin Sign In
            </Link>
          )}

          {userId && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
        </div>
      </div>
    );
  }

  return <AdminDashboard email={email} />;
}

function AdminDashboard({ email }: { email: string | null }) {
  const cafeId = BUSINESSES.cafe.id;
  const giftShopId = BUSINESSES["gift-shop"].id;

  const { data: cafeData } = useQuery<DashboardData>({
    queryKey: ["home-dashboard", "cafe"],
    queryFn: () => apiGet(`/reports/dashboard/business/${cafeId}`),
  });

  const { data: giftShopData } = useQuery<DashboardData>({
    queryKey: ["home-dashboard", "gift-shop"],
    queryFn: () => apiGet(`/reports/dashboard/business/${giftShopId}`),
  });

  const totalTodayRevenue = (cafeData?.totalRevenue.today ?? 0) + (giftShopData?.totalRevenue.today ?? 0);
  const totalTodayExpenses = (cafeData?.totalExpenses.today ?? 0) + (giftShopData?.totalExpenses.today ?? 0);
  const totalMonthRevenue = (cafeData?.totalRevenue.thisMonth ?? 0) + (giftShopData?.totalRevenue.thisMonth ?? 0);
  const totalMonthExpenses = (cafeData?.totalExpenses.thisMonth ?? 0) + (giftShopData?.totalExpenses.thisMonth ?? 0);
  const totalYearRevenue = (cafeData?.totalRevenue.thisYear ?? 0) + (giftShopData?.totalRevenue.thisYear ?? 0);
  const totalYearExpenses = (cafeData?.totalExpenses.thisYear ?? 0) + (giftShopData?.totalExpenses.thisYear ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>Lorencia Admin</h1>
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
          <StatCard label="Low Stock Items" value={String((cafeData?.lowStockCount ?? 0) + (giftShopData?.lowStockCount ?? 0))} icon={<BarChart3 className="h-5 w-5 text-amber-600" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BusinessCard slug="cafe" name="Lorencia Cafe" data={cafeData} icon={<Coffee className="h-8 w-8 text-primary" />} subtitle="POS + Catering + Raw Materials" />
          <BusinessCard slug="gift-shop" name="Lorencia Gift Shop" data={giftShopData} icon={<Gift className="h-8 w-8 text-primary" />} subtitle="POS Terminal" />
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
  const revenue = data?.totalRevenue.thisMonth ?? 0;
  const expenses = data?.totalExpenses.thisMonth ?? 0;

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
          <div className="text-sm font-bold">{formatMK(revenue)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Expenses</div>
          <div className="text-sm font-bold">{formatMK(expenses)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Profit</div>
          <div className="text-sm font-bold">{formatMK(revenue - expenses)}</div>
        </div>
      </div>
    </Link>
  );
}
