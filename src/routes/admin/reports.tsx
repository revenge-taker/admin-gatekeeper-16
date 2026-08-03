import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { listReports, resolveReport } from "@/lib/marketplace";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reported Products | ALPHA GRID" },
      {
        name: "description",
        content: "Review products reported by ALPHA GRID members and resolve them.",
      },
      { property: "og:title", content: "Reported Products | ALPHA GRID" },
      { property: "og:description", content: "Handle reported listings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { ready } = useProtectedRoute("admin");
  const queryClient = useQueryClient();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: listReports,
    enabled: ready,
  });

  const resolve = useMutation({
    mutationFn: resolveReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
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
      <h1 className="font-display text-3xl font-bold">Reports</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Listings flagged by members. Resolve once handled.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading reports…</p>
      ) : (rows ?? []).length === 0 ? (
        <div className="panel mt-6 p-12 text-center">
          <Flag className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 font-display text-lg font-bold">No reports</h2>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {(rows ?? []).map((r) => (
            <li key={r.id} className="panel flex flex-wrap items-start justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{r.reason || "No reason given"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </p>
                <Link
                  to="/admin/products/$id"
                  params={{ id: r.product_id }}
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  View product
                </Link>
              </div>
              {r.resolved ? (
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Resolved
                </span>
              ) : (
                <button onClick={() => resolve.mutate(r.id)} className="btn-primary">
                  Mark resolved
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}
