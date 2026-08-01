import { supabase } from "@/integrations/supabase/client";

export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "image"
  | "video";

export const FIELD_TYPES: { value: FieldType; label: string; hint: string }[] = [
  { value: "text", label: "Text", hint: "Single line input" },
  { value: "number", label: "Number", hint: "Numeric input" },
  { value: "textarea", label: "Long text", hint: "Multi-line textarea" },
  { value: "select", label: "Dropdown", hint: "Choose from options" },
  { value: "checkbox", label: "Checkbox", hint: "Yes / no toggle" },
  { value: "image", label: "Image URL", hint: "Link to an image" },
  { value: "video", label: "Video URL", hint: "Link to a video" },
];

export type FieldRow = {
  id: string;
  label: string;
  field_type: FieldType;
  options: string[];
  required: boolean;
};

export type ProductStatus = "under_review" | "verified" | "rejected";

export type ProductRow = {
  id: string;
  app_id: string;
  category_id: string;
  title: string;
  price: number;
  images: string[];
  views: number;
  wishlist_count: number;
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

/** Legacy rows stored "input"/"dropdown"; map them onto the new type set. */
function normalizeType(raw: string): FieldType {
  if (raw === "input") return "text";
  if (raw === "dropdown") return "select";
  const known = FIELD_TYPES.find((t) => t.value === raw);
  return known ? known.value : "text";
}

function toField(r: Raw): FieldRow {
  return {
    id: r.id,
    label: r.label,
    field_type: normalizeType(r.field_type),
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

export type NewField = {
  label: string;
  field_type: FieldType;
  options: string[];
  required: boolean;
};

/* ---------------- global fields ---------------- */

export async function listGlobalFields(): Promise<FieldRow[]> {
  const { data, error } = await supabase
    .from("global_fields")
    .select("id, label, field_type, options, required")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toField(r as Raw));
}

export async function addGlobalField(f: NewField) {
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

export async function addCustomAppField(appId: string, f: NewField) {
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

export async function addCategoryField(appId: string, categoryId: string, f: NewField) {
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
    categoryId ? listCategoryFields(categoryId) : Promise.resolve([]),
  ]);
  return [...g, ...a, ...c];
}

/* ---------------- products ---------------- */

function toProduct(r: Record<string, unknown>): ProductRow {
  return {
    id: r.id as string,
    app_id: r.app_id as string,
    category_id: r.category_id as string,
    title: (r.title as string) ?? "",
    price: Number(r.price ?? 0),
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    views: Number(r.views ?? 0),
    wishlist_count: Number(r.wishlist_count ?? 0),
    data: (r.data ?? {}) as Record<string, string>,
    added_by: r.added_by as string,
    status: (r.status as ProductStatus) ?? "under_review",
    rejection_reason: (r.rejection_reason as string) ?? "",
    created_at: r.created_at as string,
  };
}

export const PRODUCT_COLS =
  "id, app_id, category_id, title, price, images, views, wishlist_count, data, added_by, status, rejection_reason, created_at";

export async function listMyProducts(appId: string | null, userId: string): Promise<ProductRow[]> {
  let q = supabase.from("products").select(PRODUCT_COLS).eq("added_by", userId);
  if (appId) q = q.eq("app_id", appId);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toProduct);
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toProduct(data) : null;
}

export async function createProduct(input: {
  app_id: string;
  category_id: string;
  title: string;
  price: number;
  images: string[];
  data: Record<string, string>;
  added_by: string;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, status: "under_review" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Editing a product always sends it back to review. */
export async function updateProduct(
  id: string,
  patch: {
    title?: string;
    price?: number;
    images?: string[];
    data?: Record<string, string>;
  },
) {
  const { error } = await supabase
    .from("products")
    .update({ ...patch, status: "under_review", rejection_reason: "" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Back-compat alias used by older screens. */
export async function updateProductData(id: string, data: Record<string, string>) {
  return updateProduct(id, { data });
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

const STATUS_ORDER: Record<ProductStatus, number> = {
  under_review: 0,
  verified: 1,
  rejected: 2,
};

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

export function productName(product: { title?: string; data?: Record<string, string> }): string {
  if (product.title) return product.title;
  const data = product.data ?? {};
  const key = Object.keys(data).find((k) => k.toLowerCase() === "name" || k.toLowerCase() === "title");
  if (key) return data[key];
  const first = Object.values(data).find(Boolean);
  return first ?? "Untitled product";
}
