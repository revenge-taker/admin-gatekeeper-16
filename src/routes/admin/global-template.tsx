import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { FieldManager } from "@/components/FieldManager";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { addGlobalField, deleteGlobalField, listGlobalFields } from "@/lib/fields";

export const Route = createFileRoute("/admin/global-template")({
  head: () => ({
    meta: [
      { title: "Global Template | DEVILLEDGER" },
      {
        name: "description",
        content: "Define the global product form fields shared across every app in DEVILLEDGER.",
      },
      { property: "og:title", content: "Global Template | DEVILLEDGER" },
      { property: "og:description", content: "Global product form fields for every app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GlobalTemplatePage,
});

function GlobalTemplatePage() {
  const { ready } = useProtectedRoute("admin");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <FieldManager
        title="Global Template"
        subtitle="These fields appear on every product form, in every app."
        queryKey={["global-fields"]}
        fetchFields={listGlobalFields}
        addField={addGlobalField}
        deleteField={deleteGlobalField}
      />
    </AdminLayout>
  );
}
