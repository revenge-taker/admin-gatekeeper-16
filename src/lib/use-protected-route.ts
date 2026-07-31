import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type SessionUser = {
  id: string;
  email: string;
};

export type Guard = "user" | "admin" | "worker";

/**
 * Client-side route protection. Redirects to the matching login page when the
 * visitor has no session, or when a role-restricted page is opened by someone
 * without that role.
 */
export function useProtectedRoute(guard: Guard) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const authUser = data.user;

      if (!authUser) {
        if (active) navigate({ to: guard === "admin" ? "/admin" : "/", replace: true });
        return;
      }

      if (guard === "admin" || guard === "worker") {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authUser.id)
          .eq("role", guard)
          .maybeSingle();

        if (!roleRow) {
          if (active) navigate({ to: "/dashboard", replace: true });
          return;
        }
      }


      if (!active) return;
      setUser({ id: authUser.id, email: authUser.email ?? "" });
      setReady(true);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate({ to: guard === "admin" ? "/admin" : "/", replace: true });
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [guard, navigate]);

  return { ready, user };
}
