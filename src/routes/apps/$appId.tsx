import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { AppLogo } from "@/components/AppCard";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { getApp } from "@/lib/apps";

export const Route = createFileRoute("/apps/$appId")({
  head: () => ({
    meta: [
      { title: "App Details | Nexus Portal" },
      {
        name: "description",
        content: "View details for this app inside Nexus Portal.",
      },
      { property: "og:title", content: "App Details | Nexus Portal" },
      { property: "og:description", content: "View details for this app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UserAppDetailPage,
});

function UserAppDetailPage() {
  const { appId } = Route.useParams();
  const { ready } = useProtectedRoute("user");

  const { data: app } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => getApp(appId),
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
      <Link
        to="/apps"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to apps
      </Link>

      <header className="panel mt-4 flex flex-wrap items-center gap-5 p-6">
        <AppLogo logoPath={app?.logo_url} name={app?.name ?? "App"} className="h-16 w-16" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold">{app?.name ?? "Loading…"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {app?.description || "No description"}
          </p>
        </div>
      </header>

      <div className="panel mt-6 flex flex-col items-center gap-3 p-12 text-center">
        <Sparkles className="h-8 w-8 text-primary" />
        <p className="text-base font-medium">Your products will show here in next phase</p>
      </div>
    </UserLayout>
  );
}
