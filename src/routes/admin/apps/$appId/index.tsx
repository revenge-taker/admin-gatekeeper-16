import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Settings2, SlidersHorizontal, Tag, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AppLogo } from "@/components/AppCard";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { getApp, listCategories } from "@/lib/apps";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/apps/$appId/")({
  head: () => ({
    meta: [
      { title: "App Categories | DEVILLEDGER" },
      {
        name: "description",
        content: "Manage the categories and form fields that belong to this app in DEVILLEDGER.",
      },
      { property: "og:title", content: "App Categories | DEVILLEDGER" },
      { property: "og:description", content: "Manage categories for this app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAppDetailPage,
});

function AdminAppDetailPage() {
  const { appId } = Route.useParams();
  const { ready } = useProtectedRoute("admin");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { data: app } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => getApp(appId),
    enabled: ready,
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", appId],
    queryFn: () => listCategories(appId),
    enabled: ready,
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error: e } = await supabase.from("categories").insert({ name, app_id: appId });
      if (e) throw new Error(e.message);
    },
    onSuccess: () => {
      setName("");
      setOpen(false);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["categories", appId] });
    },
    onError: (e: Error) => setError(e.message || "Could not add category"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await supabase.from("categories").delete().eq("id", id);
      if (e) throw new Error(e.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["categories", appId] }),
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
        to="/admin/apps"
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
          onClick={() =>
            navigate({ to: "/admin/apps/$appId/custom-form", params: { appId } })
          }
          className="btn-ghost"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Customize App Form
        </button>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button onClick={() => setOpen(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="panel mt-4 divide-y divide-border">
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading categories…</p>}
        {!isLoading && categories?.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No categories yet for this app.
          </p>
        )}
        {categories?.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <span className="flex items-center gap-2.5 text-sm font-medium">
              <Tag className="h-4 w-4 text-primary" />
              {c.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  navigate({
                    to: "/admin/apps/$appId/category/$categoryId/fields",
                    params: { appId, categoryId: c.id },
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/60 hover:text-primary"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Add Category Fields
              </button>
              <button
                onClick={() => remove.mutate(c.id)}
                aria-label={`Delete ${c.name}`}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="panel w-full max-w-sm p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add category</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                add.mutate();
              }}
            >
              <div>
                <label htmlFor="cat-name" className="mb-1.5 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="cat-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field field-focus"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{error}</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={add.isPending} className="btn-primary">
                  {add.isPending ? "Adding…" : "Add category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
