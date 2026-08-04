import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { ProductCard } from "@/components/ProductCard";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listMarketProducts, listMyWishlist, toggleWishlist } from "@/lib/marketplace";
import { productName } from "@/lib/fields";
import { listApps } from "@/lib/apps";

export const Route = createFileRoute("/browse/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Browse the Grid | ALPHA GRID" },
      {
        name: "description",
        content:
          "Explore every verified product on ALPHA GRID. Filter by app, category, price and popularity.",
      },
      { property: "og:title", content: "Browse the Grid | ALPHA GRID" },
      { property: "og:description", content: "Explore every verified product on ALPHA GRID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrowsePage,
});

const SORTS = [
  { value: "recent", label: "Newest" },
  { value: "views", label: "Most viewed" },
  { value: "wishlist", label: "Most wishlisted" },
  { value: "rating", label: "Top rated" },
] as const;

function BrowsePage() {
  const { ready, user } = useProtectedRoute("user");
  const { q: initialQ } = Route.useSearch();
  const queryClient = useQueryClient();
  const [q, setQ] = useState(initialQ ?? "");
  const [appId, setAppId] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("recent");

  const { data: products, isLoading } = useQuery({
    queryKey: ["market-products"],
    queryFn: listMarketProducts,
    enabled: ready,
  });

  const { data: wishlistIds } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: () => listMyWishlist(user!.id),
    enabled: ready && !!user,
  });
  const saved = wishlistIds ?? [];

  const toggle = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) =>
      toggleWishlist(id, user!.id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["market-products"] });
    },
  });

  const { data: apps } = useQuery({ queryKey: ["apps"], queryFn: listApps, enabled: ready });

  const categories = useMemo(
    () => Array.from(new Set((products ?? []).map((p) => p.category_name))).sort(),
    [products],
  );

  const rows = useMemo(() => {
    let list = products ?? [];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) => productName(p).toLowerCase().includes(needle));
    }
    if (appId) list = list.filter((p) => p.app_id === appId);
    if (category) list = list.filter((p) => p.category_name === category);
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    const sorted = [...list];
    if (sort === "views") sorted.sort((a, b) => b.views - a.views);
    if (sort === "wishlist") sorted.sort((a, b) => b.wishlist_count - a.wishlist_count);
    if (sort === "rating") sorted.sort((a, b) => b.avg_rating - a.avg_rating);
    return sorted;
  }, [products, q, appId, category, maxPrice, sort]);

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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Marketplace</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Browse the Grid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every verified listing from the pack, in one place.
        </p>
      </header>

      <section className="panel mt-6 grid gap-3 p-5 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="field field-focus pl-9"
            aria-label="Search products"
          />
        </div>
        <select
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="field field-focus"
          aria-label="Filter by app"
        >
          <option value="">All apps</option>
          {(apps ?? []).map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="field field-focus"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price"
            className="field field-focus"
            aria-label="Maximum price"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="field field-focus"
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading the grid…</p>
      ) : rows.length === 0 ? (
        <div className="panel mt-6 p-12 text-center">
          <h2 className="font-display text-lg font-bold">No products match</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try widening your filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              wishlisted={saved.includes(p.id)}
              onToggleWishlist={(id, next) => toggle.mutate({ id, next })}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}
