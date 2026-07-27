// Server-only implementation for auth seeding and admin user management.
import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
};

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Idempotently creates the default admin account on first run. */
export async function seedDefaultAdmin() {
  const admin = await getAdmin();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", DEFAULT_ADMIN_EMAIL)
    .maybeSingle();

  if (existing) return { seeded: false };

  const { data, error } = await admin.auth.admin.createUser({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (error || !data.user) {
    // Auth user may already exist without a profile row — ignore duplicates.
    if (!error?.message?.toLowerCase().includes("already")) {
      throw new Error(error?.message ?? "Could not seed admin");
    }
    return { seeded: false };
  }

  await admin.from("profiles").insert({
    id: data.user.id,
    name: "Administrator",
    email: DEFAULT_ADMIN_EMAIL,
    phone: "",
  });
  await admin.from("user_roles").insert({ user_id: data.user.id, role: "admin" });

  return { seeded: true };
}

/** Throws unless the calling user has the admin role. */
export async function assertAdmin(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!data) throw new Error("Access Denied - Admins Only");
}

export async function listAllUsers(): Promise<ManagedUser[]> {
  const admin = await getAdmin();

  const [{ data: profiles }, { data: roles }] = await Promise.all([
    admin.from("profiles").select("id, name, email, phone, created_at").order("created_at"),
    admin.from("user_roles").select("user_id, role"),
  ]);

  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

  return (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    role: (roleMap.get(p.id) ?? "user") as "user" | "admin",
  }));
}

export async function createManagedUser(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
}) {
  const admin = await getAdmin();

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (error || !data.user) throw new Error(error?.message ?? "Could not create user");

  await admin.from("profiles").insert({
    id: data.user.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
  });
  await admin.from("user_roles").insert({ user_id: data.user.id, role: "user" });

  return { id: data.user.id };
}

export async function deleteManagedUser(targetId: string, callerId: string) {
  if (targetId === callerId) throw new Error("You cannot delete your own account");

  const admin = await getAdmin();
  const { error } = await admin.auth.admin.deleteUser(targetId);
  if (error) throw new Error(error.message);

  return { ok: true };
}
