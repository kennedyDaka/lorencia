import { Link, Outlet, redirect, useMatch, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { LogOut, ArrowLeft, Package, Receipt, Users, ChefHat, Boxes } from "lucide-react";

export function AuthenticatedLayout() {
  const { userId, isLoading } = useAuthStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    router.navigate({ to: "/auth" });
    return null;
  }

  return <Outlet />;
}

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { userId, email } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-bold text-lg text-gradient-brand">
              Lorencia
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function BusinessLayout() {
  const { business } = useMatch({ from: "/_authenticated/$business" });
  const { userId } = useAuthStore();

  const navItems = [
    { label: "POS", to: `/pos/${business}`, icon: null },
    { label: "Inventory", to: `/${business}/inventory`, icon: Package },
    { label: "Expenses", to: `/${business}/expenses`, icon: Receipt },
    { label: "Customers", to: `/${business}/customers`, icon: Users },
    { label: "Catering", to: `/${business}/catering`, icon: ChefHat },
    { label: "Raw Materials", to: `/${business}/raw-materials`, icon: Boxes },
    { label: "Reports", to: `/${business}/reports`, icon: null },
  ];

  return (
    <AuthenticatedShell>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold capitalize">{business?.replace("-", " ")}</h1>
        </div>

        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Outlet />
      </div>
    </AuthenticatedShell>
  );
}
