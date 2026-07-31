import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { FieldManager } from "@/components/FieldManager";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { addCustomAppField, deleteCustomAppField, listCustomAppFields } from "@/lib/fields";

export const Route = createFileRoute("/admin/apps/$appId/custom-form")({
  head: () => ({
    meta: [
      { title: "Customize App Form | ALPHA GRID" },
      {
        name: "description",
        content: "Define custom product form fields that apply to this app in ALPHA GRID.",
      },
      { property: "og:title", content: "Customize App Form | ALPHA GRID" },
      { property: "og:description", content: "Define custom product form fields for this app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CustomFormPage,
});

function CustomFormPage() {
  const { appId } = Route.useParams();
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
      <Link
        to="/admin/apps/$appId"
        params={{ appId }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to app
      </Link>

      <FieldManager
        title="Customize App Form"
        subtitle="These fields are added to every product submitted under this app."
        queryKey={["custom-app-fields", appId]}
        fetchFields={() => listCustomAppFields(appId)}
        addField={(f) => addCustomAppField(appId, f)}
        deleteField={deleteCustomAppField}
      />
    </AdminLayout>
  );
}
