import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users as UsersIcon,
  ShieldCheck,
  UserCircle,
  LayoutGrid,
  PackageSearch,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { getUsers } from "@/lib/admin.functions";
import { listApps } from "@/lib/apps";
import { listAllProducts, productName } from "@/lib/fields";
import { useProtectedRoute } from "@/lib/use-protected-route";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | ALPHA GRID" },
      {
        name: "description",
        content:
          "Administrator overview of ALPHA GRID accounts, apps and the product verification queue.",
      },
      { property: "og:title", content: "Admin Dashboard | ALPHA GRID" },
      {
        property: "og:description",
        content: "Administrator overview of ALPHA GRID accounts, apps and products.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { ready } = useProtectedRoute("admin");
  const fetchUsers = useServerFn(getUsers);

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({ data: undefined }),
    enabled: ready,
  });

  const { data: apps } = useQuery({
    queryKey: ["apps"],
    queryFn: listApps,
    enabled: ready,
  });

  const { data: products } = useQuery({
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

  const total = users?.length ?? 0;
  const admins = users?.filter((u) => u.role === "admin").length ?? 0;
  const rows = products ?? [];
  const pending = rows.filter((p) => p.status === "under_review").length;
  const verified = rows.filter((p) => p.status === "verified").length;
  const rejected = rows.filter((p) => p.status === "rejected").length;

  const primaryStats = [
    { label: "Total Users", value: total, icon: UsersIcon, hint: `${admins} admin${admins === 1 ? "" : "s"}` },
    { label: "Standard Users", value: total - admins, icon: UserCircle, hint: "Portal members" },
    { label: "Apps", value: apps?.length ?? 0, icon: LayoutGrid, hint: "Live catalogue" },
    { label: "Products", value: rows.length, icon: PackageSearch, hint: "All submissions" },
  ];

  const queueStats = [
    { label: "Pending review", value: pending, icon: Clock, tone: "text-amber-400", ring: "bg-amber-400/10" },
    { label: "Verified", value: verified, icon: CheckCircle2, tone: "text-emerald-400", ring: "bg-emerald-400/10" },
    { label: "Rejected", value: rejected, icon: XCircle, tone: "text-destructive", ring: "bg-destructive/10" },
  ];

  const recent = [...rows]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 6);

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Control Room</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Welcome to the Admin Panel</h1>
          <p className="mt-2 text-muted-foreground">
            A live overview of accounts, catalogue and the verification queue.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          Review queue
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="panel glow-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <section className="panel p-6">
          <h2 className="font-display text-lg font-semibold">Verification queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">Status split across every submission.</p>
          <ul className="mt-5 space-y-3">
            {queueStats.map(({ label, value, icon: Icon, tone, ring }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${ring}`}>
                  <Icon className={`h-4 w-4 ${tone}`} />
                </span>
                <span className="text-sm font-medium">{label}</span>
                <span className="ml-auto font-display text-xl font-bold">{value}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/admin/apps"
            className="btn-ghost mt-5 flex w-full items-center justify-center gap-2 text-sm"
          >
            Manage apps
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Latest submissions</h2>
            <Link to="/admin/products" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No products submitted yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Product</th>
                    <th className="pb-3 pr-4 font-medium">App</th>
                    <th className="pb-3 pr-4 font-medium">Added by</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id} className="border-t border-border/60">
                      <td className="py-3 pr-4">
                        <Link
                          to="/admin/products/$id"
                          params={{ id: p.id }}
                          className="font-medium hover:text-primary"
                        >
                          {productName(p)}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.app_name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.user_email}</td>
                      <td className="py-3">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
