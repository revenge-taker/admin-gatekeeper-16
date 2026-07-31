import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "worker" | "user";

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin/dashboard",
  worker: "/worker/dashboard",
  user: "/dashboard",
};

export async function getRole(userId: string): Promise<Role> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  const role = data?.role as Role | undefined;
  return role ?? "user";
}

export async function getMyRole(): Promise<Role | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return getRole(data.user.id);
}
