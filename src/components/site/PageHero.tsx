import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-cream-300 bg-cream-100 surface-texture">
      <div className="wrap relative py-12 md:py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-4 max-w-4xl text-[clamp(2.3rem,1.7rem+3.4vw,4.3rem)]">
          {title}
        </h1>
        {intro ? (
          <div className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-navy-950/75">
            {intro}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
