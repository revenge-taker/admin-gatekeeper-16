import { supabase } from "@/integrations/supabase/client";

export type FieldType = "input" | "dropdown";

export type FieldRow = {
  id: string;
  label: string;
  field_type: FieldType;
  options: string[];
  required: boolean;
};

export type ProductStatus = "pending" | "verified" | "cancelled";

export type ProductRow = {
  id: string;
  app_id: string;
  category_id: string;
  data: Record<string, string>;
  added_by: string;
  status: ProductStatus;
  rejection_reason: string;
  created_at: string;
};

type Raw = {
  id: string;
  label: string;
  field_type: string;
  options: unknown;
  required: boolean;
};

function toField(r: Raw): FieldRow {
  return {
    id: r.id,
    label: r.label,
    field_type: r.field_type === "dropdown" ? "dropdown" : "input",
    options: Array.isArray(r.options) ? (r.options as string[]) : [],
    required: r.required,
  };
}

export function parseOptions(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ---------------- global fields ---------------- */

export async function listGlobalFields(): Promise<FieldRow[]> {
  const { data, error } = await supabase
    .from("global_fields")
    .select("id, label, field_type, options, required")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toField(r as Raw));
}

export async function addGlobalField(f: {
  label: string;
  field_type: FieldType;
  options: string[];
  required: boolean;
}) {
  const { error } = await supabase.from("global_fields").insert(f);
  if (error) throw new Error(error.message);
}

export async function deleteGlobalField(id: string) {
  const { error } = await supabase.from("global_fields").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------- custom app fields ---------------- */

export async function listCustomAppFields(appId: string): Promise<FieldRow[]> {
  const { data, error } = await supabase
    .from("custom_app_fields")
    .select("id, label, field_type, options, required")
    .eq("app_id", appId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toField(r as Raw));
}

export async function addCustomAppField(
  appId: string,
  f: { label: string; field_type: FieldType; options: string[]; required: boolean },
) {
  const { error } = await supabase.from("custom_app_fields").insert({ ...f, app_id: appId });
  if (error) throw new Error(error.message);
}

export async function deleteCustomAppField(id: string) {
  const { error } = await supabase.from("custom_app_fields").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------- category fields ---------------- */

export async function listCategoryFields(categoryId: string): Promise<FieldRow[]> {
  const { data, error } = await supabase
    .from("category_fields")
    .select("id, label, field_type, options, required")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toField(r as Raw));
}

export async function addCategoryField(
  appId: string,
  categoryId: string,
  f: { label: string; field_type: FieldType; options: string[]; required: boolean },
) {
  const { error } = await supabase
    .from("category_fields")
    .insert({ ...f, app_id: appId, category_id: categoryId });
  if (error) throw new Error(error.message);
}

export async function deleteCategoryField(id: string) {
  const { error } = await supabase.from("category_fields").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Merged form definition for an app + category. */
export async function buildFormFields(appId: string, categoryId: string): Promise<FieldRow[]> {
  const [g, a, c] = await Promise.all([
    listGlobalFields(),
    listCustomAppFields(appId),
    listCategoryFields(categoryId),
  ]);
  return [...g, ...a, ...c];
}

/* ---------------- products ---------------- */

function toProduct(r: Record<string, unknown>): ProductRow {
  return {
    id: r.id as string,
    app_id: r.app_id as string,
    category_id: r.category_id as string,
    data: (r.data ?? {}) as Record<string, string>,
    added_by: r.added_by as string,
    status: (r.status as ProductStatus) ?? "pending",
    rejection_reason: (r.rejection_reason as string) ?? "",
    created_at: r.created_at as string,
  };
}

const PRODUCT_COLS = "id, app_id, category_id, data, added_by, status, rejection_reason, created_at";

export async function listMyProducts(appId: string, userId: string): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("app_id", appId)
    .eq("added_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toProduct);
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabase.from("products").select(PRODUCT_COLS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toProduct(data) : null;
}

export async function createProduct(input: {
  app_id: string;
  category_id: string;
  data: Record<string, string>;
  added_by: string;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, status: "pending" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Editing a product always sends it back to review. */
export async function updateProductData(id: string, data: Record<string, string>) {
  const { error } = await supabase
    .from("products")
    .update({ data, status: "pending", rejection_reason: "" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setProductStatus(id: string, status: ProductStatus, reason = "") {
  const { error } = await supabase
    .from("products")
    .update({ status, rejection_reason: reason })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export type AdminProductRow = ProductRow & {
  app_name: string;
  category_name: string;
  user_email: string;
  user_name: string;
};

const STATUS_ORDER: Record<ProductStatus, number> = { pending: 0, verified: 1, cancelled: 2 };

export async function listAllProducts(): Promise<AdminProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []).map(toProduct);

  const [{ data: apps }, { data: cats }, { data: profiles }] = await Promise.all([
    supabase.from("apps").select("id, name"),
    supabase.from("categories").select("id, name"),
    supabase.from("profiles").select("id, name, email"),
  ]);

  const appMap = new Map((apps ?? []).map((a) => [a.id, a.name]));
  const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));
  const userMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return rows
    .map((r) => ({
      ...r,
      app_name: appMap.get(r.app_id) ?? "—",
      category_name: catMap.get(r.category_id) ?? "—",
      user_email: userMap.get(r.added_by)?.email ?? "—",
      user_name: userMap.get(r.added_by)?.name ?? "—",
    }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export function productName(data: Record<string, string>): string {
  const key = Object.keys(data).find((k) => k.toLowerCase() === "name");
  if (key) return data[key];
  const first = Object.values(data).find(Boolean);
  return first ?? "Untitled product";
}
