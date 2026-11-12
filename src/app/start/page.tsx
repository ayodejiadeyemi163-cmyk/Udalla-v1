import { redirect } from "next/navigation";
import { isCountrySlug } from "@/config/countries";
import { services } from "@/config/pricing";

/** Plain form target for the hero form. Works with JavaScript off. */
export default async function StartRedirect({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; service?: string; package?: string }>;
}) {
  const params = await searchParams;
  const service = services.find((entry) => entry.slug === params.service);
  const country = service?.country ?? (isCountrySlug(params.country) ? params.country : "nigeria");

  if (service) {
    const query = params.package ? `?package=${params.package}` : "";
    redirect(`/start/${country}/${service.slug}${query}`);
  }

  redirect(`/services/${country}`);
}
