import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { addUser, getUsers, removeUser } from "@/lib/admin.functions";
import { useProtectedRoute } from "@/lib/use-protected-route";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management | ALPHA GRID" },
      {
        name: "description",
        content: "Create and remove ALPHA GRID accounts from the administrator user management console.",
      },
      { property: "og:title", content: "User Management | ALPHA GRID" },
      {
        property: "og:description",
        content: "Create and remove ALPHA GRID accounts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

const EMPTY = { name: "", email: "", password: "", phone: "" };

function AdminUsersPage() {
  const { ready, user } = useProtectedRoute("admin");
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(getUsers);
  const createUser = useServerFn(addUser);
  const deleteUser = useServerFn(removeUser);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({ data: undefined }),
    enabled: ready,
  });

  const create = useMutation({
    mutationFn: () => createUser({ data: form }),
    onSuccess: () => {
      setForm(EMPTY);
      setOpen(false);
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => setFormError(e.message || "Could not create user"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser({ data: { id } }),
    onSettled: () => {
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="mt-2 text-muted-foreground">Manage who can access the portal.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="panel mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-medium">Name</th>
              <th className="px-5 py-3.5 font-medium">Email</th>
              <th className="px-5 py-3.5 font-medium">Role</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  Loading users…
                </td>
              </tr>
            )}
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4 font-medium">{u.name || "—"}</td>
                <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {u.id === user?.id ? (
                    <span className="text-xs text-muted-foreground">You</span>
                  ) : (
                    <button
                      onClick={() => setConfirmId(u.id)}
                      aria-label={`Delete ${u.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="panel w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add user</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              {(
                [
                  ["name", "Name", "text"],
                  ["email", "Email", "email"],
                  ["password", "Password", "password"],
                  ["phone", "Phone", "tel"],
                ] as const
              ).map(([key, label, type]) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-1.5 block text-sm font-medium">
                    {label}
                  </label>
                  <input
                    id={key}
                    type={type}
                    required={key !== "phone"}
                    minLength={key === "password" ? 6 : undefined}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="field field-focus"
                  />
                </div>
              ))}

              {formError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={create.isPending} className="btn-primary">
                  {create.isPending ? "Creating…" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="panel w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold">Delete this user?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently removes the account and its data. This cannot be undone.
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
