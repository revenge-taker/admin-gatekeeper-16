import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users as UsersIcon, ShieldCheck, UserCircle } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { getUsers } from "@/lib/admin.functions";
import { useProtectedRoute } from "@/lib/use-protected-route";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | DEVILLEDGER" },
      {
        name: "description",
        content: "Administrator overview of DEVILLEDGER accounts, including total registered users.",
      },
      { property: "og:title", content: "Admin Dashboard | DEVILLEDGER" },
      {
        property: "og:description",
        content: "Administrator overview of DEVILLEDGER accounts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { ready } = useProtectedRoute("admin");
  const fetchUsers = useServerFn(getUsers);

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({ data: undefined }),
    enabled: ready,
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const total = users?.length ?? 0;
  const admins = users?.filter((u) => u.role === "admin").length ?? 0;

  const stats = [
    { label: "Total Users", value: total, icon: UsersIcon },
    { label: "Administrators", value: admins, icon: ShieldCheck },
    { label: "Standard Users", value: total - admins, icon: UserCircle },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Welcome to Admin Panel</h1>
      <p className="mt-2 text-muted-foreground">
        Overview of everyone with access to the portal.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="panel p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
