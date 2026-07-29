import { createFileRoute } from "@tanstack/react-router";
import { UserLayout } from "@/components/UserLayout";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useProtectedRoute } from "@/lib/use-protected-route";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | DEVILLEDGER" },
      {
        name: "description",
        content: "Update your DEVILLEDGER account name, phone number and password from one secure page.",
      },
      { property: "og:title", content: "My Profile | DEVILLEDGER" },
      { property: "og:description", content: "Update your DEVILLEDGER account details and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { ready } = useProtectedRoute("user");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <UserLayout>
      <h1 className="font-display text-3xl font-bold">Profile settings</h1>
      <p className="mt-2 text-muted-foreground">Keep your contact details and password up to date.</p>
      <div className="mt-8">
        <ProfileSettings />
      </div>
    </UserLayout>
  );
}
