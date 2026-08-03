import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listActivity } from "@/lib/notifications";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log | ALPHA GRID" },
      {
        name: "description",
        content: "Audit trail of every action taken across the ALPHA GRID marketplace.",
      },
      { property: "og:title", content: "Activity Log | ALPHA GRID" },
      { property: "og:description", content: "Who did what, and when." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminActivityPage,
});

function AdminActivityPage() {
  const { ready } = useProtectedRoute("admin");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: listActivity,
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
    <AdminLayout>
      <h1 className="font-display text-3xl font-bold">Activity log</h1>
      <p className="mt-2 text-sm text-muted-foreground">The last 200 actions on the grid.</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading activity…</p>
      ) : (rows ?? []).length === 0 ? (
        <div className="panel mt-6 p-12 text-center">
          <History className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 font-display text-lg font-bold">No activity recorded yet</h2>
        </div>
      ) : (
        <div className="panel mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Entity</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(rows ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">{r.actor_email || "system"}</td>
                  <td className="px-5 py-3 font-medium text-primary">{r.action}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.entity || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
