export function WolfLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* wolf head silhouette */}
      <path
        d="M6 4.5 9.6 10h12.8L26 4.5l1 8.4c0 7.8-4.2 12.4-11 15.1-6.8-2.7-11-7.3-11-15.1L6 4.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* eyes */}
      <path
        d="M11.5 15.2h3.2M17.3 15.2h3.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* snout */}
      <path
        d="M16 18.4v2.3m-2.6 2.1c1.6 1.3 3.6 1.3 5.2 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PawBadge({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <ellipse cx="7" cy="8" rx="2.1" ry="2.8" />
      <ellipse cx="12" cy="6.2" rx="2.1" ry="2.9" />
      <ellipse cx="17" cy="8" rx="2.1" ry="2.8" />
      <path d="M12 11c2.9 0 5.4 2.2 5.4 4.7 0 2-1.7 3.3-3.6 3.3-.7 0-1.2-.2-1.8-.2s-1.1.2-1.8.2c-1.9 0-3.6-1.3-3.6-3.3C6.6 13.2 9.1 11 12 11Z" />
    </svg>
  );
}

export function BrandMark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const logo = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  const text = size === "sm" ? "text-base" : "text-lg";
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <WolfLogo className={`${logo} text-primary`} />
      <span className={`font-display ${text} font-bold tracking-tight`}>
        ALPHA<span className="text-primary"> GRID</span>
      </span>
    </span>
  );
}
