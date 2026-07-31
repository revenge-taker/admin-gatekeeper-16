import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthShell({
  icon,
  eyebrow,
  title,
  subtitle,
  brandTitle,
  brandCopy,
  highlights,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  brandTitle: string;
  brandCopy: string;
  highlights: string[];
  children: ReactNode;
}) {
  return (
    <main className="auth-canvas relative min-h-screen overflow-hidden">
      <div className="auth-orb auth-orb-a" aria-hidden />
      <div className="auth-orb auth-orb-b" aria-hidden />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <section className="auth-fg hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 auth-fg px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            {eyebrow}
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight xl:text-5xl">
            {brandTitle}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed auth-fg opacity-80">
            {brandCopy}
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm auth-fg opacity-90">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full">
          <div className="panel mx-auto w-full max-w-md p-6 sm:p-8">
            <div className="mb-7 text-center lg:text-left">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary lg:mx-0">
                {icon}
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground/70 lg:hidden">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-card-foreground sm:text-3xl">{title}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
