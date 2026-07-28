import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { getApp, listCategories } from "@/lib/apps";
import { buildFormFields, createProduct } from "@/lib/fields";

export const Route = createFileRoute("/apps/$appId/add-product")({
  head: () => ({
    meta: [
      { title: "Add Product | DEVILLEDGER" },
      {
        name: "description",
        content: "Submit a new product for review inside DEVILLEDGER.",
      },
      { property: "og:title", content: "Add Product | DEVILLEDGER" },
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
      return createProduct({ app_id: appId, category_id: categoryId, data, added_by: user!.id });
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

      <h1 className="mt-4 text-3xl font-bold">Add New Product</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick a category, then fill in the generated form. Submissions go to review.
      </p>

      <form
        className="panel mt-6 max-w-2xl space-y-5 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
      >
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
            Category
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
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {categoryId && fieldsLoading && (
          <p className="text-sm text-muted-foreground">Building form…</p>
        )}

        {categoryId &&
          !fieldsLoading &&
          (fields?.length ? (
            fields.map((f) => (
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
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No fields configured yet for this category.
            </p>
          ))}

        {error && <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{error}</p>}

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
