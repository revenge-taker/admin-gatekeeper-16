import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { WorkerLayout } from "@/components/WorkerLayout";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listMyNotifications, markAllRead, markNotificationRead } from "@/lib/notifications";

export const Route = createFileRoute("/worker/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | ALPHA GRID" },
      {
        name: "description",
        content: "Review verification results and grid updates for your submissions.",
      },
      { property: "og:title", content: "Notifications | ALPHA GRID" },
      { property: "og:description", content: "Verification results and grid updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WorkerNotifications,
});

function WorkerNotifications() {
  const { ready, user } = useProtectedRoute("worker");
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => listMyNotifications(user!.id),
    enabled: ready && !!user,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });

  const readAll = useMutation({
    mutationFn: () => markAllRead(user!.id),
    onSuccess: invalidate,
  });
  const readOne = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const rows = items ?? [];

  return (
    <WorkerLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.filter((n) => !n.is_read).length} unread
          </p>
        </div>
        <button onClick={() => readAll.mutate()} className="btn-ghost gap-2">
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      <div className="panel mt-6 divide-y divide-border">
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && rows.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nothing here yet.</p>
          </div>
        )}
        {rows.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.is_read && readOne.mutate(n.id)}
            className={`flex w-full flex-col items-start gap-1 px-5 py-4 text-left transition-colors hover:bg-primary/5 ${
              n.is_read ? "" : "bg-primary/5"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
              {n.title}
            </span>
            {n.message && <span className="text-sm text-muted-foreground">{n.message}</span>}
            <span className="text-xs text-muted-foreground">
              {new Date(n.created_at).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </WorkerLayout>
  );
}
