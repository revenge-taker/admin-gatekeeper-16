import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { UserLayout } from "@/components/UserLayout";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listMyNotifications, markAllRead, markNotificationRead } from "@/lib/notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | ALPHA GRID" },
      {
        name: "description",
        content: "Review status updates, alerts and announcements from ALPHA GRID.",
      },
      { property: "og:title", content: "Notifications | ALPHA GRID" },
      { property: "og:description", content: "Your ALPHA GRID alerts and updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { ready, user } = useProtectedRoute("user");
  const queryClient = useQueryClient();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => listMyNotifications(user!.id),
    enabled: ready && !!user,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });

  const readAll = useMutation({ mutationFn: () => markAllRead(user!.id), onSuccess: invalidate });
  const readOne = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const unread = (rows ?? []).filter((r) => !r.is_read).length;

  return (
    <UserLayout>
      <header className="panel glow-hover flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={() => readAll.mutate()} className="btn-ghost">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </header>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : (rows ?? []).length === 0 ? (
        <div className="panel mt-6 p-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 font-display text-lg font-bold">Nothing here yet</h2>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {(rows ?? []).map((n) => (
            <li
              key={n.id}
              className={`panel flex flex-wrap items-start justify-between gap-3 p-5 ${
                n.is_read ? "opacity-70" : ""
              }`}
            >
              <div>
                <h3 className="font-semibold">{n.title}</h3>
                {n.message && (
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              {!n.is_read && (
                <button onClick={() => readOne.mutate(n.id)} className="btn-ghost">
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </UserLayout>
  );
}
