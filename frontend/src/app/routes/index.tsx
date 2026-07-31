import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { userId, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-gradient-brand">Lorencia</h1>
        <p className="text-muted-foreground">Cafe & Gift Shop Manager</p>

        {userId ? (
          <div className="space-y-4">
            <Link
              to="/pos/cafe"
              className="block w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Open POS — Cafe
            </Link>
            <Link
              to="/pos/gift-shop"
              className="block w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Open POS — Gift Shop
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
