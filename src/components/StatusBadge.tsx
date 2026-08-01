import type { ProductStatus } from "@/lib/fields";

const STYLES: Record<ProductStatus, string> = {
  under_review: "bg-amber-500/15 text-amber-500 ring-amber-500/30",
  verified: "bg-emerald-500/15 text-emerald-500 ring-emerald-500/30",
  rejected: "bg-destructive/15 text-destructive ring-destructive/40",
};

const LABELS: Record<ProductStatus, string> = {
  under_review: "Under Review",
  verified: "✔ Verified",
  rejected: "✖ Rejected",
};

export function StatusBadge({ status, label }: { status: ProductStatus; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STYLES[status]}`}
    >
      {label ?? LABELS[status]}
    </span>
  );
}
