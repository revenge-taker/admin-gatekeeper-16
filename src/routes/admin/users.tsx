import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Eye, Plus, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { addUser, getUsers, removeUser } from "@/lib/admin.functions";
import { getUserInsights } from "@/lib/user-insights";
import { useProtectedRoute } from "@/lib/use-protected-route";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "worker";
  is_verified?: boolean;
};

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
  const [tab, setTab] = useState<"workers" | "users">("workers");
  const [viewUser, setViewUser] = useState<ManagedUser | null>(null);

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

  const rows = (users ?? []).filter((u) =>
    tab === "workers" ? u.role === "worker" : u.role !== "worker",
  );

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="mt-2 text-muted-foreground">Manage who can access the grid.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="mt-6 inline-flex rounded-xl border border-border bg-card p-1">
        {(
          [
            ["workers", "Workers"],
            ["users", "Normal Users"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="panel mt-4 overflow-x-auto">
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
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  No accounts in this tab yet.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4 font-medium">{u.name || "—"}</td>
                <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : u.role === "worker"
                          ? "bg-accent/15 text-accent"
                          : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => setViewUser(u)}
                    className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/60 hover:text-primary"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
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

      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}


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

function UserDetailModal({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-insights", user.id],
    queryFn: () => getUserInsights(user.id),
  });

  const stats = [
    ["Total products", data?.totalProducts ?? 0],
    ["Verified", data?.verified ?? 0],
    ["Under review", data?.underReview ?? 0],
    ["Rejected", data?.rejected ?? 0],
    ["Total views", data?.totalViews ?? 0],
    ["Wishlisted", data?.totalWishlistOnMyProducts ?? 0],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="panel max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">{user.name || "Unnamed member"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                {user.role}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-semibold ${
                  user.is_verified
                    ? "bg-accent/15 text-accent"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {user.is_verified ? "Verified member" : "Not verified"}
              </span>
              {user.phone && <span className="text-muted-foreground">{user.phone}</span>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading member insights…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="font-display text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Wishlist ({data?.wishlistProducts.length ?? 0})
            </h3>
            {(data?.wishlistProducts.length ?? 0) === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nothing saved yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                {data?.wishlistProducts.map((p) => (
                  <li key={p.id} className="px-4 py-3 text-sm">
                    {p.title}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
