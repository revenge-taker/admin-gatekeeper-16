import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { AppLogo } from "@/components/AppCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { getApp, listCategories } from "@/lib/apps";
import { deleteProduct, listMyProducts, productName } from "@/lib/fields";

export const Route = createFileRoute("/apps/$appId/")({
  head: () => ({
    meta: [
      { title: "App Products | DEVILLEDGER" },
      {
        name: "description",
        content: "View and manage the products you submitted for this app in DEVILLEDGER.",
      },
      { property: "og:title", content: "App Products | DEVILLEDGER" },
      { property: "og:description", content: "Manage your products for this app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UserAppDetailPage,
});

function UserAppDetailPage() {
  const { appId } = Route.useParams();
  const { ready, user } = useProtectedRoute("user");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: app } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => getApp(appId),
    enabled: ready,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", appId],
    queryFn: () => listCategories(appId),
    enabled: ready,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["my-products", appId, user?.id],
    queryFn: () => listMyProducts(appId, user!.id),
    enabled: ready && !!user,
  });

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["my-products", appId, user?.id] }),
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const catName = (id: string) => categories?.find((c) => c.id === id)?.name ?? "—";

  return (
    <UserLayout>
      <Link
        to="/apps"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to apps
      </Link>

      <header className="panel glow-hover mt-4 flex flex-wrap items-center gap-5 p-6">
        <AppLogo logoPath={app?.logo_url} name={app?.name ?? "App"} className="h-16 w-16" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold">{app?.name ?? "Loading…"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {app?.description || "No description"}
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/apps/$appId/add-product", params: { appId } })}
          className="btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </header>

      <h2 className="mt-8 text-xl font-semibold">My products</h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading products…</p>
      ) : products && products.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <article key={p.id} className="panel glow-hover flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-semibold">{productName(p.data)}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-muted-foreground">{catName(p.category_id)}</p>
              <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
                <button
                  onClick={() => navigate({ to: "/products/$id", params: { id: p.id } })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary/60 hover:text-primary"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button
                  onClick={() =>
                    navigate({ to: "/products/$id", params: { id: p.id }, search: { edit: true } })
                  }
                  aria-label="Edit product"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => remove.mutate(p.id)}
                  aria-label="Delete product"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel mt-4 flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-base font-medium">No products yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add your first product to this app and it will be sent for review.
          </p>
        </div>
      )}
    </UserLayout>
  );
}
