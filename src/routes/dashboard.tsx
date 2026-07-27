import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Mail, Phone, BadgeCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/admin.functions";
import { useProtectedRoute } from "@/lib/use-protected-route";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard | Nexus Portal" },
      {
        name: "description",
        content: "View your Nexus Portal account details including name, email, role and phone number.",
      },
      { property: "og:title", content: "Your Dashboard | Nexus Portal" },
      {
        property: "og:description",
        content: "View your Nexus Portal account details in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { ready } = useProtectedRoute("user");
  const fetchProfile = useServerFn(getMyProfile);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile({ data: undefined }),
    enabled: ready,
  });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const rows = [
    { icon: User, label: "Name", value: profile?.name || "—" },
    { icon: Mail, label: "Email", value: profile?.email || "—" },
    { icon: BadgeCheck, label: "Role", value: profile?.role || "—" },
    { icon: Phone, label: "Phone", value: profile?.phone || "—" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <span className="font-display text-lg font-semibold">Nexus Portal</span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.name || profile?.email || "there"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here is the information we have on file for your account.
        </p>

        <section className="panel mt-8 p-6">
          <h2 className="text-lg font-semibold">Your details</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-secondary/60 p-4">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </dt>
                <dd className="mt-1.5 truncate text-base font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
