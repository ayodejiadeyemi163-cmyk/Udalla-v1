import type { CountrySlug } from "@/config/countries";

export interface StartFormCountry {
  slug: CountrySlug;
  name: string;
  services: { slug: string; name: string }[];
}

export function StartForm({
  countries,
  selectedCountry,
}: {
  countries: StartFormCountry[];
  selectedCountry: CountrySlug;
}) {
  return (
    <form action="/start" method="get" className="mt-8">
      <div className="card p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">Country</legend>
            <div className="flex h-full min-h-12 flex-wrap items-center gap-1 rounded-[12px] border border-transparent bg-cream-100/70 px-2 py-1">
              {countries.map((entry) => (
                <label
                  key={entry.slug}
                  className="cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[14px] text-navy-950/75 has-[:checked]:bg-white has-[:checked]:text-navy-950 has-[:checked]:shadow-sm"
                >
                  <input
                    type="radio"
                    name="country"
                    value={entry.slug}
                    defaultChecked={entry.slug === selectedCountry}
                    className="sr-only"
                  />
                  {entry.name}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="block">
            {countries.map((entry) => (
              <label
                key={entry.slug}
                className={entry.slug === selectedCountry ? "block" : "hidden"}
                data-country-services={entry.slug}
              >
                <span className="sr-only">Business type</span>
                <select
                  name="service"
                  className="field border-transparent bg-cream-100/70 focus:bg-white"
                  defaultValue={entry.services[0]?.slug}
                  disabled={entry.slug !== selectedCountry}
                >
                  {entry.services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {/* No-JS: show only selected country's services; with JS we swap on radio change */}
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){var f=document.currentScript&&document.currentScript.parentElement&&document.currentScript.parentElement.closest('form');if(!f)return;function u(){var c=f.querySelector('input[name="country"]:checked');if(!c)return;f.querySelectorAll('[data-country-services]').forEach(function(l){var on=l.getAttribute('data-country-services')===c.value;l.className=on?'block':'hidden';var s=l.querySelector('select');if(s)s.disabled=!on;});}f.addEventListener('change',function(e){if(e.target&&e.target.name==='country')u();});u();})();`,
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Start your business
          </button>
        </div>
      </div>
    </form>
  );
}
