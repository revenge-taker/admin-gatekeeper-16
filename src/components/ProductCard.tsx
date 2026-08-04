import { Link } from "@tanstack/react-router";
import { Eye, Heart, Star } from "lucide-react";
import { PawBadge } from "@/components/WolfLogo";
import { productName } from "@/lib/fields";
import type { MarketProduct } from "@/lib/marketplace";

export function AlphaVerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent ${className}`}
    >
      <PawBadge className="h-3 w-3" />
      Alpha Verified
    </span>
  );
}

export function ProductCard({
  product,
  wishlisted,
  onToggleWishlist,
}: {
  product: MarketProduct;
  wishlisted?: boolean;
  onToggleWishlist?: (id: string, next: boolean) => void;
}) {
  const p = product;
  return (
    <article className="panel glow-hover group relative overflow-hidden transition-transform hover:-translate-y-0.5">
      {onToggleWishlist && (
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => onToggleWishlist(p.id, !wishlisted)}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-foreground backdrop-blur transition-colors hover:border-primary/60 hover:text-primary"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} />
        </button>
      )}

      <Link to="/browse/$id" params={{ id: p.id }} className="block">
        <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
          {p.images[0] ? (
            <img
              src={p.images[0]}
              alt={productName(p)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="p-4">
          {p.status === "verified" && <AlphaVerifiedBadge />}
          <div className="mt-2 flex items-start justify-between gap-3">
            <h3 className="font-display font-semibold">{productName(p)}</h3>
            <span className="shrink-0 text-sm font-bold text-primary">
              {p.price ? `$${p.price}` : "—"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {p.app_name} · {p.category_name}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {p.views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {p.wishlist_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" /> {p.avg_rating || "—"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
