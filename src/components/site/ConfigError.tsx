import { brand } from "@/config/brand";

export function ConfigError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-cream-100 px-6 py-20">
      <div className="mx-auto max-w-xl">
        <p className="font-display text-[30px] tracking-[-0.04em]">{brand.name}</p>
        <h1 className="display mt-10 text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">
          This site needs configuration
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-navy-950/75">{message}</p>
        <div className="card mt-8 p-6 text-[14px] leading-relaxed text-navy-950/75">
          <p className="eyebrow mb-2">What to set</p>
          <p>
            Either add <span className="mono">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
            <span className="mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>, or set{" "}
            <span className="mono">DEMO_MODE=true</span> for a preview with demo data.
          </p>
          <p className="mt-3">
            Contact{" "}
            <a className="link-quiet" href={`mailto:${brand.contactEmail}`}>
              {brand.contactEmail}
            </a>{" "}
            if you expected the live site.
          </p>
        </div>
      </div>
    </div>
  );
}
