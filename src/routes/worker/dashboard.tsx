import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Eye, Heart, PackageSearch, XCircle } from "lucide-react";
import { WorkerLayout } from "@/components/WorkerLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listMyProducts, productName } from "@/lib/fields";
import { listApps } from "@/lib/apps";

export const Route = createFileRoute("/worker/dashboard")({
  head: () => ({
    meta: [
      { title: "Worker Dashboard | ALPHA GRID" },
      {
        name: "description",
        content: "Track your submissions, views and wishlist performance across ALPHA GRID apps.",
      },
      { property: "og:title", content: "Worker Dashboard | ALPHA GRID" },
      { property: "og:description", content: "Track your submissions and performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WorkerDashboard,
});

function WorkerDashboard() {
  const { ready, user } = useProtectedRoute("worker");

  const { data: products } = useQuery({
    queryKey: ["worker-products", user?.id],
    queryFn: () => listMyProducts(null, user!.id),
    enabled: ready && !!user,
  });

  const { data: apps } = useQuery({ queryKey: ["apps"], queryFn: listApps, enabled: ready });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const rows = products ?? [];
  const appName = (id: string) => apps?.find((a) => a.id === id)?.name ?? "—";
  const totalViews = rows.reduce((n, p) => n + p.views, 0);
  const totalWishlist = rows.reduce((n, p) => n + p.wishlist_count, 0);
  const top = [...rows].sort((a, b) => b.views - a.views)[0];

  const stats = [
    { label: "My Products", value: rows.length, icon: PackageSearch },
    { label: "Verified", value: rows.filter((p) => p.status === "verified").length, icon: CheckCircle2 },
    { label: "Under review", value: rows.filter((p) => p.status === "under_review").length, icon: Clock },
    { label: "Rejected", value: rows.filter((p) => p.status === "rejected").length, icon: XCircle },
    { label: "Total views", value: totalViews, icon: Eye },
    { label: "Total wishlist", value: totalWishlist, icon: Heart },
  ];

  const perApp = Object.entries(
    rows.reduce<Record<string, number>>((acc, p) => {
      const key = appName(p.app_id);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...perApp.map(([, n]) => n));

  return (
    <WorkerLayout>
      <h1 className="font-display text-3xl font-bold">Worker control</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything you have submitted to the grid, at a glance.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="panel glow-hover flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="font-display text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Products per app</h2>
          {perApp.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {perApp.map(([name, n]) => (
                <li key={name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">{n}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(n / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="panel h-fit p-6">
          <h2 className="font-display text-lg font-semibold">My top product</h2>
          {!top ? (
            <p className="mt-4 text-sm text-muted-foreground">Nothing to show yet.</p>
          ) : (
            <div className="mt-4 space-y-2 text-sm">
              <Link
                to="/products/$id"
                params={{ id: top.id }}
                className="font-display text-base font-semibold hover:text-primary"
              >
                {productName(top)}
              </Link>
              <p className="text-muted-foreground">{appName(top.app_id)}</p>
              <StatusBadge status={top.status} />
              <p className="text-muted-foreground">
                {top.views} views · {top.wishlist_count} wishlisted
              </p>
            </div>
          )}
        </aside>
      </div>
    </WorkerLayout>
  );
}
