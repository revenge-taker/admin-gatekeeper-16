import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Mail,
  Phone,
  BadgeCheck,
  User,
  LayoutGrid,
  PackageSearch,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  UserCog,
} from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { getMyProfile } from "@/lib/admin.functions";
import { listApps } from "@/lib/apps";
import { productName, type ProductRow, type ProductStatus } from "@/lib/fields";
import { supabase } from "@/integrations/supabase/client";
import { useProtectedRoute } from "@/lib/use-protected-route";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard | ALPHA GRID" },
      {
        name: "description",
        content:
          "Track your ALPHA GRID submissions, review account details and jump straight into your apps.",
      },
      { property: "og:title", content: "Your Dashboard | ALPHA GRID" },
      {
        property: "og:description",
        content: "Track your ALPHA GRID submissions and account details in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

type MyProduct = Pick<ProductRow, "id" | "status" | "data" | "created_at" | "app_id">;

function DashboardPage() {
  const { ready, user } = useProtectedRoute("user");
  const fetchProfile = useServerFn(getMyProfile);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile({ data: undefined }),
    enabled: ready,
  });

  const { data: apps } = useQuery({
    queryKey: ["apps"],
    queryFn: listApps,
    enabled: ready,
  });

  const { data: myProducts } = useQuery({
    queryKey: ["my-products", user?.id],
    enabled: ready && !!user,
    queryFn: async (): Promise<MyProduct[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, status, data, created_at, app_id")
        .eq("added_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => ({
        id: r.id,
        status: r.status as ProductStatus,
        data: (r.data ?? {}) as Record<string, string>,
        created_at: r.created_at,
        app_id: r.app_id,
      }));
    },
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const products = myProducts ?? [];
  const pending = products.filter((p) => p.status === "pending").length;
  const verified = products.filter((p) => p.status === "verified").length;
  const cancelled = products.filter((p) => p.status === "cancelled").length;

  const stats = [
    { label: "My Products", value: products.length, icon: PackageSearch, tone: "text-primary", ring: "bg-primary/10" },
    { label: "Under review", value: pending, icon: Clock, tone: "text-amber-400", ring: "bg-amber-400/10" },
    { label: "Verified", value: verified, icon: CheckCircle2, tone: "text-emerald-400", ring: "bg-emerald-400/10" },
    { label: "Cancelled", value: cancelled, icon: XCircle, tone: "text-destructive", ring: "bg-destructive/10" },
  ];

  const rows = [
    { icon: User, label: "Name", value: profile?.name || "—" },
    { icon: Mail, label: "Email", value: profile?.email || "—" },
    { icon: BadgeCheck, label: "Role", value: profile?.role || "—" },
    { icon: Phone, label: "Phone", value: profile?.phone || "—" },
  ];

  const appName = (id: string) => apps?.find((a) => a.id === id)?.name ?? "—";
  const recent = products.slice(0, 5);

  return (
    <UserLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Your workspace</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Welcome back, {profile?.name || profile?.email || "there"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your submissions and keep your account details current.
          </p>
        </div>
        <Link to="/apps" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
          Browse apps
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone, ring }) => (
          <div key={label} className="panel glow-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${ring}`}>
                <Icon className={`h-4 w-4 ${tone}`} />
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your details</h2>
            <Link to="/profile" className="text-sm font-medium text-primary hover:underline">
              Edit
            </Link>
          </div>
          <dl className="mt-5 grid gap-3">
            {rows.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="truncate text-sm font-semibold">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <Link to="/profile" className="btn-ghost mt-5 flex w-full items-center justify-center gap-2 text-sm">
            <UserCog className="h-4 w-4" />
            Update profile
          </Link>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent submissions</h2>
            <Link to="/apps" className="text-sm font-medium text-primary hover:underline">
              My apps
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border/70 p-8 text-center">
              <LayoutGrid className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                You have not added any products yet. Pick an app to get started.
              </p>
              <Link to="/apps" className="btn-primary mt-4 inline-flex px-4 py-2 text-sm">
                Browse apps
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="block truncate text-sm font-semibold hover:text-primary"
                    >
                      {productName(p.data)}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{appName(p.app_id)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </UserLayout>
  );
}
