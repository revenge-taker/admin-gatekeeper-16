import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ShieldCheck,
  X,
  Menu,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
] as const;

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
          <span className="font-display font-semibold">Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <aside
        className={`flex flex-col gap-6 border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground transition-all md:min-h-screen md:w-72 ${
          mobileOpen ? "block" : "hidden md:flex"
        }`}
      >
        <div className="hidden items-center gap-2 md:flex">
          <ShieldCheck className="h-6 w-6 text-sidebar-primary" />
          <span className="font-display text-lg font-semibold">Admin Panel</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
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
