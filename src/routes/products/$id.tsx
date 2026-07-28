import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listCategories } from "@/lib/apps";
import {
  buildFormFields,
  deleteProduct,
  getProduct,
  productName,
  updateProductData,
} from "@/lib/fields";

export const Route = createFileRoute("/products/$id")({
  validateSearch: (search: Record<string, unknown>) => ({ edit: search.edit === true || search.edit === "true" }),
  head: () => ({
    meta: [
      { title: "Product Details | DEVILLEDGER" },
      {
        name: "description",
        content: "Track the review status of your submitted product in DEVILLEDGER.",
      },
      { property: "og:title", content: "Product Details | DEVILLEDGER" },
      { property: "og:description", content: "Track the review status of your product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UserProductPage,
});

function UserProductPage() {
  const { id } = Route.useParams();
  const { edit } = Route.useSearch();
  const { ready, user } = useProtectedRoute("user");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(edit);
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: ready,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", product?.app_id],
    queryFn: () => listCategories(product!.app_id),
    enabled: !!product,
  });

  const { data: fields } = useQuery({
    queryKey: ["form-fields", product?.app_id, product?.category_id],
    queryFn: () => buildFormFields(product!.app_id, product!.category_id),
    enabled: !!product && editing,
  });

  useEffect(() => {
    if (product) setValues(product.data);
  }, [product]);

  const save = useMutation({
    mutationFn: () => updateProductData(id, values),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      if (product) navigate({ to: "/apps/$appId", params: { appId: product.app_id } });
      else navigate({ to: "/apps" });
    },
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isLoading && (!product || (user && product.added_by !== user.id))) {
    return (
      <UserLayout>
        <div className="panel p-12 text-center">
          <h1 className="font-display text-xl font-bold">Product not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This product does not exist or does not belong to you.
          </p>
        </div>
      </UserLayout>
    );
  }

  const statusLabel =
    product?.status === "pending"
      ? "Under Review"
      : product?.status === "verified"
        ? "✔ Verified - Live"
        : `✖ Cancelled: ${product?.rejection_reason || "no reason given"}`;

  const categoryName = categories?.find((c) => c.id === product?.category_id)?.name;

  return (
    <UserLayout>
      {product && (
        <Link
          to="/apps/$appId"
          params={{ appId: product.app_id }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>
      )}

      {isLoading || !product ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading product…</p>
      ) : (
        <>
          <header className="panel glow-hover mt-4 flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h1 className="font-display text-2xl font-bold">{productName(product.data)}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{categoryName ?? ""}</p>
            </div>
            <StatusBadge status={product.status} label={statusLabel} />
          </header>

          {!editing ? (
            <section className="panel mt-6 p-6">
              <dl className="divide-y divide-border">
                {Object.entries(product.data).map(([k, v]) => (
                  <div key={k} className="flex flex-wrap gap-2 py-3">
                    <dt className="w-56 shrink-0 text-sm text-muted-foreground">{k}</dt>
                    <dd className="text-sm font-medium">{String(v) || "—"}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => setEditing(true)} className="btn-ghost">
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button onClick={() => remove.mutate()} className="btn-primary gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </section>
          ) : (
            <form
              className="panel mt-6 max-w-2xl space-y-5 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                Editing sends this product back for review.
              </p>
              {(fields ?? []).map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium">
                    {f.label}
                    {f.required && <span className="text-primary"> *</span>}
                  </label>
                  {f.field_type === "dropdown" ? (
                    <select
                      id={f.id}
                      required={f.required}
                      value={values[f.label] ?? ""}
                      onChange={(e) => setValues({ ...values, [f.label]: e.target.value })}
                      className="field field-focus"
                    >
                      <option value="">Select…</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={f.id}
                      required={f.required}
                      value={values[f.label] ?? ""}
                      onChange={(e) => setValues({ ...values, [f.label]: e.target.value })}
                      className="field field-focus"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setValues(product.data);
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" disabled={save.isPending} className="btn-primary">
                  {save.isPending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </UserLayout>
  );
}
