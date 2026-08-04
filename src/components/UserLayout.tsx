import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Store,
  UserCog,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WolfLogo } from "@/components/WolfLogo";
import { useUnreadCount } from "@/lib/use-unread";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/browse", label: "Browse", icon: Store },
  { to: "/apps", label: "My Apps", icon: LayoutGrid },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "My Profile", icon: UserCog },
] as const;

export function UserLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const unread = useUnreadCount();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { q: term } });
    setOpen(false);
  };

  const nav = (
    <>
      <div className="hidden items-center gap-2 px-1 text-sidebar-foreground md:flex">
        <WolfLogo className="h-7 w-7 text-primary" />
        <span className="font-display text-lg font-bold tracking-tight">
          ALPHA<span className="text-primary"> GRID</span>
        </span>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          const badge = to === "/notifications" && unread > 0;
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
              {badge && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {unread}
                </span>
              )}
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
      <aside
        className={`order-2 flex-col border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground md:order-none md:flex md:min-h-screen md:w-64 ${
          open ? "flex" : "hidden"
        }`}
      >
        {nav}
      </aside>

      <div className="order-1 flex flex-1 flex-col md:order-none">
        {/* Navbar: logo left, search center, actions right */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sidebar-border bg-sidebar/95 px-4 py-3 backdrop-blur">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-sidebar-foreground md:hidden">
            <WolfLogo className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">
              ALPHA<span className="text-primary"> GRID</span>
            </span>
          </Link>

          <form onSubmit={search} className="relative mx-auto hidden w-full max-w-md sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search the grid…"
              aria-label="Search products"
              className="field field-focus pl-9"
            />
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-all hover:border-primary/60 hover:text-primary hover:shadow-[var(--glow-ice)]"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              to="/notifications"
              aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-all hover:border-primary/60 hover:text-primary hover:shadow-[var(--glow-ice)]"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unread}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <Link
              to="/profile"
              aria-label="My profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-all hover:border-primary/60 hover:text-primary hover:shadow-[var(--glow-ice)]"
            >
              <UserCog className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}
