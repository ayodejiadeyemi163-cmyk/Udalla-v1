import { getStore } from "@/lib/store";
import type { Lawyer } from "@/lib/store/types";

function initials(lawyer: Lawyer): string {
  if (!lawyer.showName) return lawyer.jurisdiction.slice(0, 2).toUpperCase();
  return lawyer.displayName.slice(0, 2).toUpperCase();
}

export async function LawyerCards({ limit = 3 }: { limit?: number }) {
  const store = getStore();
  const lawyers = (await store.listLawyers(true)).slice(0, limit);
  if (lawyers.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {lawyers.map((lawyer) => {
        const label = lawyer.showName
          ? lawyer.displayName
          : `Partner lawyer, ${lawyer.jurisdiction}`;
        return (
          <article key={lawyer.id} className="card flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-ivory">
                {lawyer.showPhoto && lawyer.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lawyer.photoUrl}
                    alt={label}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="mono text-[12px] tracking-[0.08em] text-forest">
                    {initials(lawyer)}
                  </span>
                )}
              </div>
              <span className="pill pill-forest">{lawyer.jurisdiction}</span>
            </div>
            <h3 className="mt-5 font-display text-[19px] leading-tight tracking-[-0.02em]">
              {label}
            </h3>
            <ul className="mt-3 flex-1 space-y-1.5">
              {lawyer.practiceAreas.map((area) => (
                <li key={area} className="text-[13px] text-ink/75">
                  {area}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-[11.5px] uppercase tracking-[0.12em] text-muted">
              {lawyer.years} years in practice
            </p>
          </article>
        );
      })}
    </div>
  );
}
