import type { SupabaseClient } from "@supabase/supabase-js";

export type OwnProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
};

/** Reads the caller's own profile + role using their RLS-scoped client. */
export async function getOwnProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<OwnProfile> {
  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("id, name, email, phone").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
  ]);

  return {
    id: userId,
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    role: (roleRow?.role ?? "user") as "user" | "admin",
  };
}
