import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listMyWishlist, listProductsByIds } from "@/lib/marketplace";
import { productName } from "@/lib/fields";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist | ALPHA GRID" },
      {
        name: "description",
        content: "Every ALPHA GRID product you have saved to your wishlist, in one list.",
      },
      { property: "og:title", content: "My Wishlist | ALPHA GRID" },
      { property: "og:description", content: "Products you saved on ALPHA GRID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ready, user } = useProtectedRoute("user");

  const { data: ids } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: () => listMyWishlist(user!.id),
    enabled: ready && !!user,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["wishlist-products", ids],
    queryFn: () => listProductsByIds(ids ?? []),
    enabled: !!ids,
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <UserLayout>
      <header className="panel glow-hover p-6">
        <h1 className="font-display text-3xl font-bold">My wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {(products ?? []).length} saved product{(products ?? []).length === 1 ? "" : "s"}.
        </p>
      </header>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : (products ?? []).length === 0 ? (
        <div className="panel mt-6 p-12 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 font-display text-lg font-bold">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any listing to keep it here.
          </p>
          <Link to="/browse" className="btn-primary mt-5 inline-flex">
            Browse the grid
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(products ?? []).map((p) => (
            <Link
              key={p.id}
              to="/browse/$id"
              params={{ id: p.id }}
              className="panel glow-hover overflow-hidden"
            >
              <div className="aspect-[16/10] w-full bg-muted">
                {p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={productName(p)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold">{productName(p)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.app_name} · {p.category_name}
                </p>
                <p className="mt-2 text-sm font-bold text-primary">
                  {p.price ? `$${p.price}` : "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
