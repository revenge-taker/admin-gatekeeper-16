import type { ReactNode } from "react";
import { Check } from "lucide-react";

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

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <section className="hidden text-primary-foreground lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            {eyebrow}
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight xl:text-5xl">
            {brandTitle}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-primary-foreground/75">
            {brandCopy}
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-primary-foreground/85">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
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
