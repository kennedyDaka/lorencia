import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:3000") + "/api";

async function fetchUserRole(token: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return "owner";
    const data = await res.json();
    const roles = data.roles ?? [];
    if (roles.length === 0) return "owner";
    const highestRole = roles.find((r: any) => r.role === "owner") ?? roles[0];
    return highestRole.role ?? "owner";
  } catch {
    return "owner";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem("supabase-access-token", session.access_token);
        const role = await fetchUserRole(session.access_token);
        setAuth(session.user.id, session.user.email ?? "", role);
      } else {
        clearAuth();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          localStorage.setItem("supabase-access-token", session.access_token);
          const role = await fetchUserRole(session.access_token);
          setAuth(session.user.id, session.user.email ?? "", role);
        } else {
          localStorage.removeItem("supabase-access-token");
          clearAuth();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}
