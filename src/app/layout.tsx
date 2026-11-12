import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

import { CookieBanner } from "@/components/site/CookieBanner";
import { ConfigError } from "@/components/site/ConfigError";
import { DemoBanner } from "@/components/site/DemoBanner";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { buildNav } from "@/config/nav";
import { brand } from "@/config/brand";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { configurationError, isDemoMode } from "@/lib/env";
import { getSessionUser } from "@/lib/session";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const fonts = `${fraunces.variable} ${instrument.variable} ${plex.variable}`;

/**
 * Every route is server rendered. The shell reads admin editable settings and
 * the signed in user, and prices must never be frozen into a static build.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: "Udalla: business registration in Nigeria, the UK and the US",
    template: `%s | ${brand.name}`,
  },
  description:
    "Guided business registration and compliance in Nigeria, the United Kingdom and the United States. Prices shown up front, filings tracked in your dashboard.",
  applicationName: brand.name,
  authors: [{ name: brand.legalName }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: brand.name,
    url: brand.siteUrl,
    title: "Udalla: business registration in Nigeria, the UK and the US",
    description:
      "Register a business name, a limited company or an LLC. Stay compliant with reminders and filings handled by licensed partner lawyers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Udalla: business registration and compliance",
    description:
      "Guided filing in three countries, with fixed prices and a dashboard that tracks every stage.",
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const problem = configurationError();

  if (problem) {
    return (
      <html lang="en">
        <body className={fonts}>
          <ConfigError message={problem} />
        </body>
      </html>
    );
  }

  const [catalog, user] = await Promise.all([getCatalog(), getSessionUser()]);
  const contact = contactFrom(catalog.settings);
  const groups = buildNav(catalog);

  return (
    <html lang="en">
      <body className={`${fonts} font-sans`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to content
        </a>
        {isDemoMode() ? <DemoBanner /> : null}
        <Header groups={groups} contact={contact} user={user} />
        <main id="main">{children}</main>
        <Footer services={catalog.services} contact={contact} />
        <CookieBanner />
      </body>
    </html>
  );
}
