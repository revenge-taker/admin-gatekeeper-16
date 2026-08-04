import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Flag,
  History,
  LayoutDashboard,
  LayoutGrid,
  Users,
  UserCog,
  LogOut,
  Layers,
  PackageSearch,
  X,
  Menu,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WolfLogo } from "@/components/WolfLogo";
import { useUnreadCount } from "@/lib/use-unread";

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/apps", label: "Apps", icon: LayoutGrid },
  { to: "/admin/global-template", label: "Global Template", icon: Layers },
  { to: "/admin/products", label: "Products", icon: PackageSearch },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/activity", label: "Activity Log", icon: History },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/profile", label: "My Profile", icon: UserCog },
] as const;


export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = useUnreadCount();

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const [{ data: profileRow }, { data: roleRow }] = await Promise.all([
        supabase.from("profiles").select("id, name, email").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
      ]);

      if (!active) return;
      setProfile({
        id: user.id,
        name: profileRow?.name || user.email?.split("@")[0] || "Admin",
        email: profileRow?.email || user.email || "",
        role: roleRow?.role === "admin" ? "admin" : "user",
      });
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  };

  const initials = profile?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "A";

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar p-4 md:hidden">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <WolfLogo className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold">
            ALPHA<span className="text-primary"> GRID</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
      </div>

      <aside
        className={`flex flex-col gap-6 border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground transition-all md:min-h-screen md:w-72 ${
          mobileOpen ? "block" : "hidden md:flex"
        }`}
      >
        <div className="hidden items-center gap-2 md:flex">
          <WolfLogo className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold tracking-tight">
            ALPHA<span className="text-primary"> GRID</span>
          </span>
          <ThemeToggle className="ml-auto" />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {to === "/admin/notifications" && unread > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card + logout */}
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary font-display text-sm font-semibold text-sidebar-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {profile?.name ?? "Loading…"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/70">{profile?.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-sidebar-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-primary">
              {profile?.role ?? "—"}
            </span>
          </div>

          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sidebar-primary px-3 py-2 text-sm font-semibold text-sidebar-primary-foreground transition-opacity hover:opacity-90"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
