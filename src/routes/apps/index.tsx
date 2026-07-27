import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserLayout } from "@/components/UserLayout";
import { AppCard, AppLogo } from "@/components/AppCard";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listApps } from "@/lib/apps";

export const Route = createFileRoute("/apps/")({
  head: () => ({
    meta: [
      { title: "My Apps | Nexus Portal" },
      {
        name: "description",
        content: "Browse the apps available to you inside Nexus Portal.",
      },
      { property: "og:title", content: "My Apps | Nexus Portal" },
      { property: "og:description", content: "Browse the apps available to your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UserAppsPage,
});

function UserAppsPage() {
  const { ready } = useProtectedRoute("user");
  const navigate = useNavigate();

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
    <UserLayout>
      <h1 className="text-3xl font-bold">My Apps</h1>
      <p className="mt-2 text-muted-foreground">Everything available to you in one place.</p>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading apps…</p>
      ) : apps && apps.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onClick={() => navigate({ to: "/apps/$appId", params: { appId: app.id } })}
            />
          ))}
        </div>
      ) : (
        <div className="panel mt-8 flex flex-col items-center gap-3 p-12 text-center">
          <AppLogo name="No apps" className="h-16 w-16" />
          <h2 className="font-display text-lg font-semibold">No apps yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Once an administrator publishes apps, they will appear here.
          </p>
        </div>
      )}
    </UserLayout>
  );
}
