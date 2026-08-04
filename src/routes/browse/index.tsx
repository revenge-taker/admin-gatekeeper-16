import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { ProductCard } from "@/components/ProductCard";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listMarketProducts } from "@/lib/marketplace";
import { listApps } from "@/lib/apps";

export const Route = createFileRoute("/browse/")({
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
  const { ready } = useProtectedRoute("user");
  const [q, setQ] = useState("");
  const [appId, setAppId] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("recent");

  const { data: products, isLoading } = useQuery({
    queryKey: ["market-products"],
    queryFn: listMarketProducts,
    enabled: ready,
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
            <Link
              key={p.id}
              to="/browse/$id"
              params={{ id: p.id }}
              className="panel glow-hover overflow-hidden transition-transform hover:-translate-y-0.5"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
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
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold">{productName(p)}</h3>
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {p.price ? `$${p.price}` : "—"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.app_name} · {p.category_name}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {p.views}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" /> {p.wishlist_count}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" /> {p.avg_rating || "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
