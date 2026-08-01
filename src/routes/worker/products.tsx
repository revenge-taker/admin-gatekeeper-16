import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Heart, Pencil } from "lucide-react";
import { WorkerLayout } from "@/components/WorkerLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listMyProducts, productName } from "@/lib/fields";
import { listApps } from "@/lib/apps";

export const Route = createFileRoute("/worker/products")({
  head: () => ({
    meta: [
      { title: "My Products | ALPHA GRID" },
      {
        name: "description",
        content: "Manage every product you have submitted to ALPHA GRID.",
      },
      { property: "og:title", content: "My Products | ALPHA GRID" },
      { property: "og:description", content: "Manage your submitted products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WorkerProducts,
});

function WorkerProducts() {
  const { ready, user } = useProtectedRoute("worker");

  const { data: products, isLoading } = useQuery({
    queryKey: ["worker-products", user?.id],
    queryFn: () => listMyProducts(null, user!.id),
    enabled: ready && !!user,
  });
  const { data: apps } = useQuery({ queryKey: ["apps"], queryFn: listApps, enabled: ready });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const rows = products ?? [];
  const appName = (id: string) => apps?.find((a) => a.id === id)?.name ?? "—";

  return (
    <WorkerLayout>
      <h1 className="font-display text-3xl font-bold">My Products</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Only products still under review can be edited.
      </p>

      <div className="panel mt-6 overflow-x-auto">
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading products…</p>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No products yet — pick an app and add one.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">App</th>
                <th className="px-5 py-3">Views</th>
                <th className="px-5 py-3">Wishlist</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-primary/5">
                  <td className="px-5 py-4 font-medium">{productName(p)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{appName(p.app_id)}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {p.views}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5" />
                      {p.wishlist_count}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/60 hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </WorkerLayout>
  );
}
