import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listAllProducts, productName, type ProductStatus } from "@/lib/fields";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({
    meta: [
      { title: "Products Queue | ALPHA GRID" },
      {
        name: "description",
        content: "Review, verify or cancel every product submitted by ALPHA GRID members.",
      },
      { property: "og:title", content: "Products Queue | ALPHA GRID" },
      { property: "og:description", content: "Review every submitted product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProductsPage,
});

const FILTERS = ["all", "pending", "verified", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

function AdminProductsPage() {
  const { ready } = useProtectedRoute("admin");
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: listAllProducts,
    enabled: ready,
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const rows = (products ?? []).filter((p) => filter === "all" || p.status === filter);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">All Products</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every product submitted across all apps, pending items first.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_var(--color-primary)]"
                : "border border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel mt-6 overflow-x-auto">
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading products…</p>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No products found.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">App</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Added By</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-primary/5">
                  <td className="px-5 py-4 font-medium">{productName(p.data)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.app_name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.category_name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.user_email}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status as ProductStatus} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/admin/products/$id", params: { id: p.id } })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/60 hover:text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
