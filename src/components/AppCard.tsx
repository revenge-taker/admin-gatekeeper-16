import { LayoutGrid } from "lucide-react";
import type { ReactNode } from "react";
import { useLogoUrl, type AppRow } from "@/lib/apps";

export function AppLogo({
  logoPath,
  name,
  className = "h-14 w-14",
}: {
  logoPath?: string | null;
  name: string;
  className?: string;
}) {
  const url = useLogoUrl(logoPath);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary ring-1 ring-border ${className}`}
    >
      {url ? (
        <img src={url} alt={`${name} logo`} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <LayoutGrid className="h-1/2 w-1/2 text-muted-foreground" />
      )}
    </div>
  );
}

export function AppCard({
  app,
  onClick,
  actions,
}: {
  app: AppRow;
  onClick?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="panel group relative flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <button
        onClick={onClick}
        className="flex flex-1 flex-col items-start gap-4 text-left"
        aria-label={`Open ${app.name}`}
      >
        <AppLogo logoPath={app.logo_url} name={app.name} />
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold">{app.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {app.description || "No description"}
          </p>
        </div>
      </button>
      {actions && <div className="flex items-center gap-2 border-t border-border pt-3">{actions}</div>}
    </div>
  );
}
