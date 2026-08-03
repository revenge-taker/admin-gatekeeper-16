import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { DynamicField } from "@/components/DynamicField";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { getApp, listCategories } from "@/lib/apps";
import { buildFormFields, createProduct } from "@/lib/fields";

export const Route = createFileRoute("/apps/$appId/add-product")({
  head: () => ({
    meta: [
      { title: "Add Product | ALPHA GRID" },
      {
        name: "description",
        content: "Submit a new product for review inside ALPHA GRID.",
      },
      { property: "og:title", content: "Add Product | ALPHA GRID" },
      { property: "og:description", content: "Submit a new product for review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddProductPage,
});

function AddProductPage() {
  const { appId } = Route.useParams();
  const { ready, user } = useProtectedRoute("user");
  const navigate = useNavigate();

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imagesCsv, setImagesCsv] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

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

  const { data: fields, isLoading: fieldsLoading } = useQuery({
    queryKey: ["form-fields", appId, categoryId],
    queryFn: () => buildFormFields(appId, categoryId),
    enabled: ready && !!categoryId,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const data: Record<string, string> = {};
      (fields ?? []).forEach((f) => {
        data[f.label] = values[f.label] ?? "";
      });
      const newId = await createProduct({
        app_id: appId,
        category_id: categoryId,
        title: title.trim(),
        price: Number(price || 0),
        images: imagesCsv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        data,
        added_by: user!.id,
      });

      await notifyAdmins({
        data: {
          title: "New product submitted",
          message: `${title.trim() || "A product"} is waiting for review.`,
          type: "info",
          link: "/admin/products",
        },
      }).catch(() => undefined);

      await logActivity({
        userId: user!.id,
        actorEmail: user!.email,
        action: "product.created",
        entity: "product",
        entityId: newId,
        details: title.trim(),
      }).catch(() => undefined);

      return newId;
    },
    onSuccess: (id) => navigate({ to: "/products/$id", params: { id } }),
    onError: (e: Error) => setError(e.message || "Could not submit product"),
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
      <Link
        to="/apps/$appId"
        params={{ appId }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {app?.name ?? "app"}
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold">Add New Product</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick a category, then fill in the form. Submissions start as Under Review.
      </p>

      <form
        className="panel mt-6 max-w-2xl space-y-5 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          submit.mutate();
        }}
      >
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
            Category <span className="text-primary">*</span>
          </label>
          <select
            id="category"
            required
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setValues({});
            }}
            className="field field-focus"
          >
            <option value="">Select a category…</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {categoryId && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                  Title <span className="text-primary">*</span>
                </label>
                <input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="field field-focus"
                  placeholder="Product title"
                />
              </div>
              <div>
                <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="field field-focus"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="images" className="mb-1.5 block text-sm font-medium">
                Image URLs (comma separated)
              </label>
              <input
                id="images"
                value={imagesCsv}
                onChange={(e) => setImagesCsv(e.target.value)}
                className="field field-focus"
                placeholder="https://…/one.jpg, https://…/two.jpg"
              />
            </div>

            {fieldsLoading && <p className="text-sm text-muted-foreground">Building form…</p>}

            {(fields ?? []).map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium">
                  {f.label}
                  {f.required && <span className="text-primary"> *</span>}
                </label>
                <DynamicField
                  field={f}
                  value={values[f.label] ?? ""}
                  onChange={(v) => setValues((prev) => ({ ...prev, [f.label]: v }))}
                />
              </div>
            ))}
          </>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={!categoryId || submit.isPending}
          className="btn-primary w-full sm:w-auto"
        >
          {submit.isPending ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </UserLayout>
  );
}
