import Link from "next/link";
import { ORDER_STEPS } from "@/lib/checkout";

export function StepIndicator({
  current,
  basePath,
  furthest,
}: {
  current: number;
  basePath: string;
  furthest: number;
}) {
  return (
    <nav aria-label="Order steps" className="border-y border-cream-300">
      <ol className="flex gap-1 overflow-x-auto py-2">
        {ORDER_STEPS.map((step) => {
          const active = step.step === current;
          const done = step.step < current;
          const reachable = step.step <= furthest;
          const content = (
            <>
              <span
                className={`mono grid h-6 w-6 flex-none place-items-center rounded-full border text-[10.5px] ${
                  active
                    ? "border-navy-900 bg-navy-900 text-cream-100"
                    : done
                      ? "border-navy-900/40 bg-navy-900/10 text-navy-900"
                      : "border-cream-300 text-slate-muted"
                }`}
              >
                {step.step}
              </span>
              <span
                className={`whitespace-nowrap text-[12.5px] ${
                  active ? "text-navy-950" : "text-slate-muted"
                }`}
              >
                {step.label}
              </span>
            </>
          );

          return (
            <li key={step.step} className="flex-1">
              {reachable && !active ? (
                <Link
                  href={`${basePath}?step=${step.step}`}
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-cream-100"
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={active ? "step" : undefined}
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
