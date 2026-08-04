import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_COLS, type ProductRow } from "@/lib/fields";

export type UserInsights = {
  totalProducts: number;
  verified: number;
  underReview: number;
  rejected: number;
  totalViews: number;
  totalWishlistOnMyProducts: number;
  wishlistProducts: { id: string; title: string }[];
};

/** Admin-only insight bundle for a single member. */
export async function getUserInsights(userId: string): Promise<UserInsights> {
  const [{ data: mine }, { data: saved }] = await Promise.all([
    supabase.from("products").select(PRODUCT_COLS).eq("added_by", userId),
    supabase.from("wishlist").select("product_id").eq("user_id", userId),
  ]);

  const rows = (mine ?? []) as unknown as ProductRow[];
  const ids = (saved ?? []).map((r) => r.product_id);

  let wishlistProducts: { id: string; title: string }[] = [];
  if (ids.length) {
    const { data } = await supabase.from("products").select("id, title, data").in("id", ids);
    wishlistProducts = (data ?? []).map((p) => ({
      id: p.id,
      title:
        p.title ||
        ((p.data as Record<string, unknown> | null)?.["name"] as string) ||
        "Untitled product",
    }));
  }

  return {
    totalProducts: rows.length,
    verified: rows.filter((r) => r.status === "verified").length,
    underReview: rows.filter((r) => r.status === "under_review").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    totalViews: rows.reduce((n, r) => n + (r.views ?? 0), 0),
    totalWishlistOnMyProducts: rows.reduce((n, r) => n + (r.wishlist_count ?? 0), 0),
    wishlistProducts,
  };
}
