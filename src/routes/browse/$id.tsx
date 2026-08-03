import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Eye, Facebook, Flag, Heart, MessageCircle, Star } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { productName } from "@/lib/fields";
import {
  getMarketProduct,
  listMyWishlist,
  listRatings,
  recordView,
  reportProduct,
  toggleWishlist,
  upsertRating,
} from "@/lib/marketplace";
import { notifyAdmins } from "@/lib/notify.functions";

export const Route = createFileRoute("/browse/$id")({
  head: () => ({
    meta: [
      { title: "Product | ALPHA GRID" },
      {
        name: "description",
        content: "Product details, reviews and ratings from the ALPHA GRID marketplace.",
      },
      { property: "og:title", content: "Product | ALPHA GRID" },
      { property: "og:description", content: "Product details and reviews on ALPHA GRID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketProductPage,
});

function MarketProductPage() {
  const { id } = Route.useParams();
  const { ready, user } = useProtectedRoute("user");
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["market-product", id],
    queryFn: () => getMarketProduct(id),
    enabled: ready,
  });

  const { data: reviews } = useQuery({
    queryKey: ["ratings", id],
    queryFn: () => listRatings(id),
    enabled: ready,
  });

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: () => listMyWishlist(user!.id),
    enabled: ready && !!user,
  });

  useEffect(() => {
    if (ready && user) recordView(id, user.id).catch(() => undefined);
  }, [ready, user, id]);

  const wished = (wishlist ?? []).includes(id);

  const heart = useMutation({
    mutationFn: () => toggleWishlist(id, user!.id, !wished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["market-product", id] });
    },
  });

  const review = useMutation({
    mutationFn: () => upsertRating({ productId: id, userId: user!.id, rating, comment }),
    onSuccess: () => {
      setComment("");
      setToast("Review saved");
      queryClient.invalidateQueries({ queryKey: ["ratings", id] });
      queryClient.invalidateQueries({ queryKey: ["market-product", id] });
    },
  });

  const report = useMutation({
    mutationFn: async () => {
      await reportProduct(id, user!.id, reason);
      await notifyAdmins({
        data: {
          title: "Product reported",
          message: `${productName(product ?? {})} was reported: ${reason}`,
          type: "warning",
          link: "/admin/reports",
        },
      }).catch(() => undefined);
    },
    onSuccess: () => {
      setReportOpen(false);
      setReason("");
      setToast("Report sent to the admins");
    },
  });

  const share = (kind: "whatsapp" | "facebook" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (kind === "copy") {
      navigator.clipboard?.writeText(url);
      setToast("Link copied");
      return;
    }
    const target =
      kind === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(url)}`
        : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(target, "_blank", "noopener");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <UserLayout>
      <Link
        to="/browse"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to browse
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading product…</p>
      ) : !product ? (
        <div className="panel mt-6 p-12 text-center">
          <h1 className="font-display text-xl font-bold">Product not available</h1>
        </div>
      ) : (
        <>
          {toast && (
            <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              {toast}
            </p>
          )}

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="panel overflow-hidden">
                <div className="aspect-[16/9] w-full bg-muted">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={productName(product)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {product.images.slice(1).map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt={productName(product)}
                        loading="lazy"
                        className="h-20 w-28 shrink-0 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              <section className="panel p-6">
                <h2 className="font-display text-lg font-bold">Details</h2>
                <dl className="mt-4 divide-y divide-border">
                  {Object.entries(product.data ?? {}).map(([k, v]) => (
                    <div key={k} className="flex flex-wrap gap-2 py-3">
                      <dt className="w-56 shrink-0 text-sm text-muted-foreground">{k}</dt>
                      <dd className="text-sm font-medium">{String(v) || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="panel p-6">
                <h2 className="font-display text-lg font-bold">Ratings & reviews</h2>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    review.mutate();
                  }}
                >
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        aria-label={`Rate ${n} stars`}
                        className="p-1"
                      >
                        <Star
                          className={`h-5 w-5 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience…"
                    className="field field-focus"
                    aria-label="Review comment"
                  />
                  <button type="submit" disabled={review.isPending} className="btn-primary">
                    {review.isPending ? "Saving…" : "Post review"}
                  </button>
                </form>

                <ul className="mt-6 space-y-4">
                  {(reviews ?? []).map((r) => (
                    <li key={r.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{r.author}</span>
                        <span className="inline-flex items-center gap-1 text-sm text-primary">
                          <Star className="h-3.5 w-3.5 fill-primary" /> {r.rating}
                        </span>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                    </li>
                  ))}
                  {(reviews ?? []).length === 0 && (
                    <li className="text-sm text-muted-foreground">No reviews yet.</li>
                  )}
                </ul>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="panel glow-hover p-6">
                <h1 className="font-display text-2xl font-bold">{productName(product)}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.app_name} · {product.category_name}
                </p>
                <p className="mt-4 text-3xl font-bold text-primary">
                  {product.price ? `$${product.price}` : "—"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Listed by {product.seller_name}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border p-2">
                    <Eye className="mx-auto h-4 w-4 text-muted-foreground" />
                    <span className="mt-1 block font-semibold">{product.views}</span>
                  </div>
                  <div className="rounded-lg border border-border p-2">
                    <Heart className="mx-auto h-4 w-4 text-muted-foreground" />
                    <span className="mt-1 block font-semibold">{product.wishlist_count}</span>
                  </div>
                  <div className="rounded-lg border border-border p-2">
                    <Star className="mx-auto h-4 w-4 text-muted-foreground" />
                    <span className="mt-1 block font-semibold">
                      {product.avg_rating || "—"} ({product.rating_count})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => heart.mutate()}
                  className={`mt-4 w-full ${wished ? "btn-ghost" : "btn-primary"}`}
                >
                  <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} />
                  {wished ? "In wishlist" : "Add to wishlist"}
                </button>
              </div>

              <div className="panel p-6">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide">Share</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => share("whatsapp")} className="btn-ghost">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </button>
                  <button onClick={() => share("facebook")} className="btn-ghost">
                    <Facebook className="h-4 w-4" /> Facebook
                  </button>
                  <button onClick={() => share("copy")} className="btn-ghost">
                    <Copy className="h-4 w-4" /> Copy link
                  </button>
                </div>
              </div>

              <div className="panel p-6">
                <button onClick={() => setReportOpen(true)} className="btn-ghost w-full">
                  <Flag className="h-4 w-4" /> Report this product
                </button>
              </div>
            </aside>
          </div>

          {reportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="panel w-full max-w-md p-6">
                <h2 className="font-display text-lg font-bold">Report product</h2>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="What is wrong with this listing?"
                  className="field field-focus mt-4"
                  aria-label="Report reason"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setReportOpen(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button
                    onClick={() => report.mutate()}
                    disabled={!reason.trim() || report.isPending}
                    className="btn-primary"
                  >
                    {report.isPending ? "Sending…" : "Send report"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </UserLayout>
  );
}
