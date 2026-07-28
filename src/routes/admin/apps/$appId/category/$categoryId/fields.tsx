import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { FieldManager } from "@/components/FieldManager";
import { useProtectedRoute } from "@/lib/use-protected-route";
import { addCategoryField, deleteCategoryField, listCategoryFields } from "@/lib/fields";
import { listCategories } from "@/lib/apps";

export const Route = createFileRoute("/admin/apps/$appId/category/$categoryId/fields")({
  head: () => ({
    meta: [
      { title: "Category Fields | DEVILLEDGER" },
      {
        name: "description",
        content: "Define product form fields that apply to this category in DEVILLEDGER.",
      },
      { property: "og:title", content: "Category Fields | DEVILLEDGER" },
      { property: "og:description", content: "Define product form fields for this category." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CategoryFieldsPage,
});

function CategoryFieldsPage() {
  const { appId, categoryId } = Route.useParams();
  const { ready } = useProtectedRoute("admin");

  const { data: categories } = useQuery({
    queryKey: ["categories", appId],
    queryFn: () => listCategories(appId),
    enabled: ready,
  });
  const category = categories?.find((c) => c.id === categoryId);

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
        title={category ? `${category.name} Fields` : "Category Fields"}
        subtitle="These fields appear only when a user picks this category."
        queryKey={["category-fields", categoryId]}
        fetchFields={() => listCategoryFields(categoryId)}
        addField={(f) => addCategoryField(appId, categoryId, f)}
        deleteField={deleteCategoryField}
      />
    </AdminLayout>
  );
}
