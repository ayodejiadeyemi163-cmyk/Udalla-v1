import type { Guide } from "@/lib/store/types";

/**
 * Starter editorial content. Three articles, plain language, no prices typed
 * in copy. Admin edits are stored as overrides in the store.
 */
export const guides: Guide[] = [
  {
    slug: "register-a-business-name-in-nigeria",
    title: "How to register a business name in Nigeria",
    excerpt:
      "The name search, the particulars the CAC asks for, and the mistakes that send applications back.",
    country: "nigeria",
    readingMinutes: 5,
    publishedAt: "2026-01-12",
    body: [
      "A business name is the lightest way to trade under a name in Nigeria. It suits a sole trader, a partnership or a side business that is not ready for a limited company. The Corporate Affairs Commission registers it, and the certificate arrives with a status report.",
      "## Start with three names",
      "The CAC rejects names that are already taken, too close to an existing name, or restricted. Give three options in order of preference. A descriptive name such as a place plus an activity is usually easier to clear than an invented word that sounds like an existing brand.",
      "## The particulars you need",
      "Have these ready before you start: the nature of business, a Nigerian address for the business, and the details of every owner. If you trade under your own name, the owner is you. If two people own it, both appear on the certificate.",
      "## What the filing team does",
      "Your filing is prepared and submitted by Udalla's filing team. They run the name search, prepare the registration particulars, file with the CAC and pay the government fee at cost. Licensed partner lawyers handle regulatory compliance if a question comes up later.",
      "## Common reasons applications stall",
      "Most delays come from a name that cannot be approved, an address that does not match the supporting document, or an owner whose name is spelled differently across documents. Fix those before filing and the application usually moves in one pass.",
      "## After the certificate",
      "A business name must file annual returns, and most owners need a tax identification number to open a bank account. Both are on the compliance page, and both can be added to the same order.",
    ],
  },
  {
    slug: "register-a-uk-limited-company",
    title: "Registering a UK limited company from abroad",
    excerpt:
      "Directors, shareholders, people with significant control and the registered office rule, explained without the jargon.",
    country: "united-kingdom",
    readingMinutes: 4,
    publishedAt: "2026-02-03",
    body: [
      "You do not need to live in the UK to own a UK company. You do need a UK registered office address, at least one director, and a share structure that adds up.",
      "## The registered office",
      "Companies House publishes the registered office. It receives official mail and must be a real UK address where documents can be delivered. A service address is normal, and it can be different from where you actually work.",
      "## Directors and shareholders",
      "A private limited company needs at least one director who is a natural person, and at least one shareholder. The same person can be both. Shareholders hold shares in percentages, and the total must reach 100 percent.",
      "## People with significant control",
      "Anyone who holds more than 25 percent of the shares or voting rights, or who otherwise controls the company, must be recorded as a person with significant control. This is filed at incorporation and updated when ownership changes.",
      "## What happens after incorporation",
      "Companies House issues a certificate of incorporation and the articles. The company then files a confirmation statement every 12 months and accounts each year. Both dates go into your compliance calendar, with reminders 30 and 7 days before.",
      "## What the filing team does",
      "Your filing is prepared and submitted by Udalla's filing team. They prepare the incorporation particulars, file them and pay the government fee at cost. Licensed partner lawyers handle regulatory compliance.",
    ],
  },
  {
    slug: "delaware-or-wyoming-llc",
    title: "Delaware or Wyoming for your LLC",
    excerpt:
      "Two popular states, two different cost profiles. A short guide to picking one on purpose.",
    country: "united-states",
    readingMinutes: 4,
    publishedAt: "2026-03-18",
    body: [
      "Most non-residents forming a US LLC choose Delaware or Wyoming. The right answer depends on what the company is for, not on which state sounds more impressive.",
      "## Delaware is built for investors",
      "Delaware has a deep body of company law and courts that investors understand. If you plan to raise money from funds or add several rounds of shareholders, Delaware is usually the expected structure. The trade off is a higher yearly franchise cost.",
      "## Wyoming is built for lean ownership",
      "Wyoming has lower annual costs, no state corporate income tax, and does not publish a member list. For a single owner running an online business or holding assets, it is often the cheaper structure to maintain.",
      "## Both need a registered agent",
      "A registered agent receives official state mail at a physical address in the state. Both states require one for as long as the company exists. Udalla provides a registered agent, and renewals are invoiced and reminded rather than charged automatically.",
      "## The yearly filings",
      "Wyoming files an annual report in the anniversary month. Delaware charges a yearly franchise tax for an LLC, due by 1 June. Missing either one leads to penalties, so both dates are added to your compliance calendar.",
      "## What the filing team does",
      "Your filing is prepared and submitted by Udalla's filing team. They check the name, prepare the formation documents, file with the state and pay the state fee. Licensed partner lawyers handle regulatory compliance.",
    ],
  },
];

export function getGuideContent(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
