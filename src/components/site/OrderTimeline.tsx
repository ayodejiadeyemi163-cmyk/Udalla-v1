import { ORDER_STATUS_FLOW, type OrderStatus, type TimelineEntry } from "@/lib/store/types";
import { Check } from "@/components/ui/Marks";

export function OrderTimeline({
  status,
  timeline,
  compact = false,
}: {
  status: OrderStatus;
  timeline: TimelineEntry[];
  compact?: boolean;
}) {
  const currentIndex = ORDER_STATUS_FLOW.findIndex((entry) => entry.value === status);
  const byStatus = new Map(timeline.map((entry) => [entry.status, entry]));

  return (
    <ol className={compact ? "space-y-2" : "space-y-3"}>
      {ORDER_STATUS_FLOW.map((step, index) => {
        const done = index <= currentIndex;
        const active = index === currentIndex;
        const entry = byStatus.get(step.value);
        return (
          <li key={step.value} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full border text-[10px] ${
                  done
                    ? "border-navy-900 bg-navy-900 text-cream-100"
                    : "border-cream-300 bg-cream-50 text-slate-muted"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {index < ORDER_STATUS_FLOW.length - 1 ? (
                <span
                  className={`mt-1 w-px flex-1 ${done ? "bg-navy-900/35" : "bg-cream-300"}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className="pb-2">
              <p
                className={`text-[13.5px] ${
                  active ? "font-medium text-navy-950" : done ? "text-navy-950/80" : "text-slate-muted"
                }`}
              >
                {step.label}
              </p>
              {entry ? (
                <p className="mono mt-0.5 text-[11px] text-slate-muted">
                  {new Date(entry.at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
