import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  PackageSearch,
  UserCog,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WolfLogo } from "@/components/WolfLogo";
import { useUnreadCount } from "@/lib/use-unread";

const NAV = [
  { to: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/worker/apps", label: "My Apps", icon: LayoutGrid },
  { to: "/worker/products", label: "My Products", icon: PackageSearch },
  { to: "/worker/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "My Profile", icon: UserCog },
] as const;

export function WorkerLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const nav = (
    <>
      <div className="hidden items-center gap-2 px-1 text-sidebar-foreground md:flex">
        <WolfLogo className="h-7 w-7 text-primary" />
        <span className="font-display text-lg font-bold tracking-tight">
          ALPHA<span className="text-primary"> GRID</span>
        </span>
        <ThemeToggle className="ml-auto" />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
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

      <button
        onClick={logout}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-sidebar-primary px-3 py-2 text-sm font-semibold text-sidebar-primary-foreground transition-opacity hover:opacity-90"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
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
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <aside
        className={`flex-col border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground md:flex md:min-h-screen md:w-64 ${
          open ? "flex" : "hidden"
        }`}
      >
        {nav}
      </aside>

      <main className="flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
