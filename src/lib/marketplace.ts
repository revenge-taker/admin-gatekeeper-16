import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_COLS, type ProductRow } from "@/lib/fields";

export type MarketProduct = ProductRow & {
  app_name: string;
  category_name: string;
  seller_name: string;
  avg_rating: number;
  rating_count: number;
};

/** All verified products, decorated with app/category/seller labels and ratings. */
export async function listMarketProducts(): Promise<MarketProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("status", "verified")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as ProductRow[];

  const [{ data: apps }, { data: cats }, { data: profiles }, { data: ratings }] = await Promise.all([
    supabase.from("apps").select("id, name"),
    supabase.from("categories").select("id, name"),
    supabase.from("profiles").select("id, name"),
    supabase.from("ratings").select("product_id, rating"),
  ]);

  const appMap = new Map((apps ?? []).map((a) => [a.id, a.name]));
  const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));
  const userMap = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  const agg = new Map<string, { sum: number; count: number }>();
  (ratings ?? []).forEach((r) => {
    const cur = agg.get(r.product_id) ?? { sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    agg.set(r.product_id, cur);
  });

  return rows.map((r) => {
    const a = agg.get(r.id);
    return {
      ...r,
      images: Array.isArray(r.images) ? r.images : [],
      app_name: appMap.get(r.app_id) ?? "—",
      category_name: catMap.get(r.category_id) ?? "—",
      seller_name: userMap.get(r.added_by) ?? "Member",
      avg_rating: a && a.count ? Math.round((a.sum / a.count) * 10) / 10 : 0,
      rating_count: a?.count ?? 0,
    };
  });
}

/* ---------------- views ---------------- */

export async function recordView(productId: string, userId: string | null) {
  await supabase.from("product_views").insert({ product_id: productId, user_id: userId });
}

export async function listRecentlyViewed(userId: string, limit = 8): Promise<string[]> {
  const { data } = await supabase
    .from("product_views")
    .select("product_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  const seen: string[] = [];
  (data ?? []).forEach((r) => {
    if (!seen.includes(r.product_id)) seen.push(r.product_id);
  });
  return seen.slice(0, limit);
}

/* ---------------- wishlist ---------------- */

export async function listMyWishlist(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.product_id);
}

export async function toggleWishlist(productId: string, userId: string, on: boolean) {
  if (on) {
    const { error } = await supabase
      .from("wishlist")
      .insert({ product_id: productId, user_id: userId });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  }
}

/* ---------------- ratings ---------------- */

export type RatingRow = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  author: string;
};

export async function listRatings(productId: string): Promise<RatingRow[]> {
  const { data, error } = await supabase
    .from("ratings")
    .select("id, product_id, user_id, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const { data: profiles } = await supabase.from("profiles").select("id, name");
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name]));
  return rows.map((r) => ({ ...r, author: nameMap.get(r.user_id) ?? "Member" }));
}

export async function upsertRating(input: {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  const { data: existing } = await supabase
    .from("ratings")
    .select("id")
    .eq("product_id", input.productId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("ratings")
      .update({ rating: input.rating, comment: input.comment })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("ratings").insert({
    product_id: input.productId,
    user_id: input.userId,
    rating: input.rating,
    comment: input.comment,
  });
  if (error) throw new Error(error.message);
}

/* ---------------- reports ---------------- */

export async function reportProduct(productId: string, userId: string, reason: string) {
  const { error } = await supabase
    .from("reports")
    .insert({ product_id: productId, user_id: userId, reason });
  if (error) throw new Error(error.message);
}

export type ReportRow = {
  id: string;
  product_id: string;
  user_id: string;
  reason: string;
  resolved: boolean;
  created_at: string;
};

export async function listReports(): Promise<ReportRow[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("id, product_id, user_id, reason, resolved, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function resolveReport(id: string) {
  const { error } = await supabase.from("reports").update({ resolved: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------- single marketplace product ---------------- */

export async function getMarketProduct(id: string): Promise<MarketProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as unknown as ProductRow;

  const [{ data: app }, { data: cat }, { data: seller }, { data: ratings }] = await Promise.all([
    supabase.from("apps").select("name").eq("id", row.app_id).maybeSingle(),
    supabase.from("categories").select("name").eq("id", row.category_id).maybeSingle(),
    supabase.from("profiles").select("name").eq("id", row.added_by).maybeSingle(),
    supabase.from("ratings").select("rating").eq("product_id", id),
  ]);

  const list = ratings ?? [];
  const sum = list.reduce((acc, r) => acc + r.rating, 0);

  return {
    ...row,
    images: Array.isArray(row.images) ? row.images : [],
    app_name: app?.name ?? "—",
    category_name: cat?.name ?? "—",
    seller_name: seller?.name ?? "Member",
    avg_rating: list.length ? Math.round((sum / list.length) * 10) / 10 : 0,
    rating_count: list.length,
  };
}

/** Verified products ordered by views, for "popular" sections. */
export async function listPopular(limit = 6): Promise<MarketProduct[]> {
  const all = await listMarketProducts();
  return [...all].sort((a, b) => b.views - a.views).slice(0, limit);
}

export async function listProductsByIds(ids: string[]): Promise<MarketProduct[]> {
  if (!ids.length) return [];
  const all = await listMarketProducts();
  const set = new Set(ids);
  return all.filter((p) => set.has(p.id));
}
