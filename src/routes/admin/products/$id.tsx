import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listAllProducts, productName, setProductStatus } from "@/lib/fields";
import { notifyUser } from "@/lib/notify.functions";
import { logActivity } from "@/lib/notifications";

export const Route = createFileRoute("/admin/products/$id")({
  head: () => ({
    meta: [
      { title: "Product Review | ALPHA GRID" },
      {
        name: "description",
        content: "Review a submitted product and verify or cancel it inside ALPHA GRID.",
      },
      { property: "og:title", content: "Product Review | ALPHA GRID" },
      { property: "og:description", content: "Verify or cancel a submitted product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProductDetailPage,
});

function AdminProductDetailPage() {
  const { id } = Route.useParams();
  const { ready, user } = useProtectedRoute("admin");
  const queryClient = useQueryClient();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: listAllProducts,
    enabled: ready,
  });
  const product = products?.find((p) => p.id === id);

  const mutate = useMutation({
    mutationFn: async ({ status, why }: { status: "verified" | "rejected"; why?: string }) => {
      await setProductStatus(id, status, why ?? "");
      if (product) {
        await notifyUser({
          data: {
            userId: product.added_by,
            title: status === "verified" ? "Product verified" : "Product rejected",
            message:
              status === "verified"
                ? `${productName(product)} is now live on the grid.`
                : `${productName(product)} was rejected: ${why || "no reason given"}`,
            type: status === "verified" ? "success" : "error",
            link: `/products/${id}`,
          },
        }).catch(() => undefined);
        await logActivity({
          userId: user?.id ?? null,
          actorEmail: user?.email ?? "",
          action: status === "verified" ? "product.verified" : "product.rejected",
          entity: "product",
          entityId: id,
          details: why ?? "",
        }).catch(() => undefined);
      }
      return status;
    },
    onSuccess: (status) => {
      setReasonOpen(false);
      setReason("");
      setToast(
        status === "verified"
          ? "Verified — the member has been emailed and notified."
          : "Rejected — the member has been notified with your reason.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      {toast && (
        <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          {toast}
        </p>
      )}

      {!product ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading product…</p>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <section className="panel p-6 lg:col-span-2">
            <h1 className="font-display text-2xl font-bold">{productName(product)}</h1>
            <dl className="mt-6 divide-y divide-border">
              {Object.entries(product.data).map(([k, v]) => (
                <div key={k} className="flex flex-wrap gap-2 py-3">
                  <dt className="w-56 shrink-0 text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-medium">{String(v) || "—"}</dd>
                </div>
              ))}
              {Object.keys(product.data).length === 0 && (
                <p className="py-3 text-sm text-muted-foreground">No data submitted.</p>
              )}
            </dl>
          </section>

          <aside className="panel h-fit p-6">
            <h2 className="font-display text-lg font-semibold">Admin actions</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Added by</p>
                <p className="font-medium">{product.user_name}</p>
                <p className="text-muted-foreground">{product.user_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Added on</p>
                <p className="font-medium">
                  {new Date(product.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-muted-foreground">Status</p>
                <StatusBadge status={product.status} />
              </div>
              {product.status === "rejected" && product.rejection_reason && (
                <p className="rounded-lg bg-primary/10 px-3 py-2 text-primary">
                  {product.rejection_reason}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => mutate.mutate({ status: "verified" })}
                disabled={mutate.isPending}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                <Check className="mr-1.5 inline h-4 w-4" />
                Verify
              </button>
              <button
                onClick={() => setReasonOpen(true)}
                className="btn-primary w-full"
              >
                <X className="mr-1.5 inline h-4 w-4" />
                Cancel by Admin
              </button>
            </div>
          </aside>
        </div>
      )}

      {reasonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="panel w-full max-w-sm p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Cancel product</h2>
              <button onClick={() => setReasonOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                mutate.mutate({ status: "rejected", why: reason });
              }}
            >
              <div>
                <label htmlFor="reason" className="mb-1.5 block text-sm font-medium">
                  Rejection reason
                </label>
                <textarea
                  id="reason"
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="field field-focus"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReasonOpen(false)} className="btn-ghost">
                  Back
                </button>
                <button type="submit" disabled={mutate.isPending} className="btn-primary">
                  {mutate.isPending ? "Saving…" : "Cancel product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
