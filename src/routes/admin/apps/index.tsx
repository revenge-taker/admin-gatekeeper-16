import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AppCard, AppLogo } from "@/components/AppCard";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listApps, uploadLogo, type AppRow } from "@/lib/apps";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/apps/")({
  head: () => ({
    meta: [
      { title: "Apps Management | ALPHA GRID" },
      {
        name: "description",
        content: "Create, edit and remove apps available to ALPHA GRID members.",
      },
      { property: "og:title", content: "Apps Management | ALPHA GRID" },
      { property: "og:description", content: "Manage the app catalogue of ALPHA GRID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAppsPage,
});

type FormState = { name: string; description: string; file: File | null };
const EMPTY: FormState = { name: "", description: "", file: null };

function AdminAppsPage() {
  const { ready } = useProtectedRoute("admin");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: apps, isLoading } = useQuery({
    queryKey: ["apps"],
    queryFn: listApps,
    enabled: ready,
  });

  const save = useMutation({
    mutationFn: async () => {
      let logo_url = editing?.logo_url ?? "";
      if (form.file) logo_url = await uploadLogo(form.file);

      if (editing) {
        const { error: e } = await supabase
          .from("apps")
          .update({ name: form.name, description: form.description, logo_url })
          .eq("id", editing.id);
        if (e) throw new Error(e.message);
      } else {
        const { error: e } = await supabase
          .from("apps")
          .insert({ name: form.name, description: form.description, logo_url });
        if (e) throw new Error(e.message);
      }
    },
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
    onError: (e: Error) => setError(e.message || "Could not save app"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await supabase.from("apps").delete().eq("id", id);
      if (e) throw new Error(e.message);
    },
    onSettled: () => {
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
    setError("");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Apps</h1>
          <p className="mt-2 text-muted-foreground">Manage the apps available in the portal.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY);
            setOpen(true);
          }}
          className="btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Add App
        </button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading apps…</p>
      ) : apps && apps.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onClick={() => navigate({ to: "/admin/apps/$appId", params: { appId: app.id } })}
              actions={
                <>
                  <button
                    onClick={() => {
                      setEditing(app);
                      setForm({ name: app.name, description: app.description, file: null });
                      setOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(app.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className="panel mt-8 flex flex-col items-center gap-3 p-12 text-center">
          <AppLogo name="No apps" className="h-16 w-16" />
          <h2 className="font-display text-lg font-semibold">No apps yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add your first app to make it available to portal members.
          </p>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="panel w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? "Edit app" : "Add app"}</h2>
              <button onClick={closeModal} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <div>
                <label htmlFor="app-name" className="mb-1.5 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="app-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field field-focus"
                />
              </div>

              <div>
                <label htmlFor="app-desc" className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="app-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="field field-focus resize-none"
                />
              </div>

              <div>
                <label htmlFor="app-logo" className="mb-1.5 block text-sm font-medium">
                  Logo
                </label>
                <input
                  id="app-logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                  className="field field-focus file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-sm file:font-medium"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={save.isPending} className="btn-primary">
                  {save.isPending ? "Saving…" : editing ? "Save changes" : "Create app"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="panel w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold">Delete this app?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This also removes all categories belonging to the app.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => remove.mutate(confirmId)}
                disabled={remove.isPending}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-70"
              >
                {remove.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
