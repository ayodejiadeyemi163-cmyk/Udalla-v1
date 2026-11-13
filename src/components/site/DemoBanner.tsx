export function DemoBanner() {
  return (
    <div className="border-b border-emerald-600/60 bg-emerald-600/25">
      <div className="wrap flex items-center justify-between gap-3 py-1.5">
        <p className="mono text-[11px] uppercase tracking-[0.16em] text-navy-950/80">
          Preview with demo data
        </p>
        <p className="hidden text-[11.5px] text-navy-950/65 sm:block">
          No real payments and no real documents in this preview.
        </p>
      </div>
    </div>
  );
}
