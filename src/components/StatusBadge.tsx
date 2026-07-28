import type { ProductStatus } from "@/lib/fields";

const STYLES: Record<ProductStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  verified: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  cancelled: "bg-primary/15 text-primary ring-primary/40",
};

const LABELS: Record<ProductStatus, string> = {
  pending: "Pending",
  verified: "✔ Verified",
  cancelled: "✖ Cancelled",
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
