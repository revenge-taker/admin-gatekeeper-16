import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useProtectedRoute } from "@/lib/use-protected-route";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "Admin Profile | DEVILLEDGER" },
      {
        name: "description",
        content: "Administrators can update their DEVILLEDGER name, phone number and password here.",
      },
      { property: "og:title", content: "Admin Profile | DEVILLEDGER" },
      { property: "og:description", content: "Update your administrator account details and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProfilePage,
});

function AdminProfilePage() {
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
      <h1 className="font-display text-3xl font-bold">Profile settings</h1>
      <p className="mt-2 text-muted-foreground">Manage your administrator identity and credentials.</p>
      <div className="mt-8">
        <ProfileSettings />
      </div>
    </AdminLayout>
  );
}
