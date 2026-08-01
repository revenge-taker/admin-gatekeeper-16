import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid } from "lucide-react";
import { WorkerLayout } from "@/components/WorkerLayout";
import { AppCard } from "@/components/AppCard";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listApps } from "@/lib/apps";

export const Route = createFileRoute("/worker/apps")({
  head: () => ({
    meta: [
      { title: "My Apps | ALPHA GRID" },
      {
        name: "description",
        content: "Browse every ALPHA GRID app you can submit products to.",
      },
      { property: "og:title", content: "My Apps | ALPHA GRID" },
      { property: "og:description", content: "Apps you can submit products to." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WorkerApps,
});

function WorkerApps() {
  const { ready } = useProtectedRoute("worker");
  const { data: apps, isLoading } = useQuery({
    queryKey: ["apps"],
    queryFn: listApps,
    enabled: ready,
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <WorkerLayout>
      <h1 className="font-display text-3xl font-bold">My Apps</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick an app to see your products and submit a new one.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading apps…</p>
      ) : (apps ?? []).length === 0 ? (
        <div className="panel mt-6 p-12 text-center">
          <LayoutGrid className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No apps published yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(apps ?? []).map((app) => (
            <Link key={app.id} to="/apps/$appId" params={{ appId: app.id }}>
              <AppCard app={app} />
            </Link>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
}
