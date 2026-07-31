import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { Coffee, Gift, LayoutDashboard } from "lucide-react";

export function DashboardPage() {
  const { email } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(BUSINESSES).map(([slug, biz]) => (
          <Link
            key={slug}
            to={`/pos/${slug}`}
            className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                {slug === "cafe" ? (
                  <Coffee className="h-8 w-8 text-primary" />
                ) : (
                  <Gift className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {biz.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {biz.hasCatering ? "POS + Catering" : "POS"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/combined-reports"
          className="rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
        >
          <LayoutDashboard className="h-6 w-6 text-muted-foreground mb-2" />
          <h3 className="font-medium">Combined Reports</h3>
          <p className="text-sm text-muted-foreground">View both businesses</p>
        </Link>
      </div>
    </div>
  );
}
