export function DevilLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* horns */}
      <path
        d="M8.5 9.5C6.6 8 5.4 6 5 3.6c2.6.5 4.7 1.8 6.2 3.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 9.5C25.4 8 26.6 6 27 3.6c-2.6.5-4.7 1.8-6.2 3.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ledger book / shield body */}
      <path
        d="M16 8c4.8 0 8 2.4 8 2.4v9.2c0 4.4-3.6 7-8 8.4-4.4-1.4-8-4-8-8.4v-9.2S11.2 8 16 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12.5 15h7M12.5 19h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <DevilLogo className="h-6 w-6 text-primary" />
      <span className="font-display text-lg font-bold tracking-tight">
        DEVIL<span className="text-primary">LEDGER</span>
      </span>
      {!compact && null}
    </span>
  );
}
