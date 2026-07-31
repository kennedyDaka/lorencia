import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem("supabase-access-token", session.access_token);
        setAuth(session.user.id, session.user.email ?? "");
      } else {
        clearAuth();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          localStorage.setItem("supabase-access-token", session.access_token);
          setAuth(session.user.id, session.user.email ?? "");
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
