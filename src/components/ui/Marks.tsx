import type { ReactNode } from "react";

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 4.5 6 8.5l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m2.5 7.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Lock({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2.5" y="6" width="9" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.6 6V4.6a2.4 2.4 0 0 1 4.8 0V6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function CountryMark({
  mark,
  className = "",
}: {
  mark: "ng" | "uk" | "us";
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      {mark === "ng" ? (
        <>
          <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 8.5v8.6a5 5 0 0 0 10 0V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : null}
      {mark === "uk" ? (
        <>
          <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.2" />
          <path d="M14 3v22M3 14h22" stroke="currentColor" strokeWidth="1.1" />
          <path d="M6.2 6.2 21.8 21.8M21.8 6.2 6.2 21.8" stroke="currentColor" strokeWidth="0.9" />
        </>
      ) : null}
      {mark === "us" ? (
        <>
          <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5.5 10.5h17M5.5 14h17M5.5 17.5h17" stroke="currentColor" strokeWidth="0.9" />
          <path d="M14 3v22" stroke="currentColor" strokeWidth="0.6" />
        </>
      ) : null}
    </svg>
  );
}

export function Stamp({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <circle cx="60" cy="60" r="43" stroke="currentColor" strokeWidth="0.8" opacity="0.35" strokeDasharray="2 4" />
      <path d="M40 61l14 14 27-30" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="60" y="94" textAnchor="middle" fontFamily="monospace" fontSize="7" letterSpacing="2" fill="currentColor" opacity="0.7">
        REGISTERED
      </text>
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2 className="display text-[clamp(2rem,1.5rem+2.2vw,3.4rem)]">{title}</h2>
        {intro ? <p className="mt-4 text-[17px] leading-relaxed text-ink/75">{intro}</p> : null}
      </div>
      {action ? <div className="flex-none">{action}</div> : null}
    </div>
  );
}
