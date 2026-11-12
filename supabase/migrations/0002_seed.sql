-- Seed data.
-- Prices are NOT seeded here. The pricing config in src/config/pricing.ts is the
-- source of truth and admin edits are stored in settings.payload, with every
-- change recorded in price_changes. This file seeds the content that the app
-- reads from the database.

insert into public.settings (id, payload)
values ('site', '{
  "contactEmail": "eoisama@gmail.com",
  "contactPhone": "+1 (713) 887-5886",
  "whatsappNumber": "17138875886",
  "lawyerNote": "Lawyers are independent, licensed practitioners engaged through Udalla.",
  "packagePrices": {},
  "governmentFees": {},
  "governmentFeeWaived": [],
  "compliancePrices": {},
  "websiteRanges": {},
  "serviceCopy": {}
}'::jsonb)
on conflict (id) do nothing;

insert into public.faqs (id, question, answer, sort_order) values
  ('faq_1', 'How long does a registration take?',
   'It depends on the registry. Nigerian business names usually clear in 3 to 7 working days after the name is approved, UK incorporations in 24 to 72 hours, and US state filings in 2 to 5 business days. Your dashboard shows the current stage at every point.', 1),
  ('faq_2', 'What do the packages include?',
   'Every package includes the filing prepared and submitted by our filing team, your certificate and registration documents, dashboard tracking and compliance alerts. Standard adds tax ID help and a company documents pack. Premium adds priority processing, a registered office or agent for year one and a compliance consultation.', 2),
  ('faq_3', 'Are government fees included in the price?',
   'No. Government fees are shown separately at cost, before you pay, so you can see exactly what goes to the registry. If a fee is waived, the waiver is shown in your total.', 3),
  ('faq_4', 'Can I register a business from outside the country?',
   'Yes for the UK and the US. For Nigeria you need a Nigerian address and the required identification for every owner. You can complete the whole order online and upload documents from anywhere.', 4),
  ('faq_5', 'Who prepares and files my registration?',
   'Your filing is prepared and submitted by Udalla''s filing team. Licensed partner lawyers handle regulatory compliance, and they do not prepare or file registrations.', 5),
  ('faq_6', 'Can I change my order after I pay?',
   'Before the filing is submitted, yes. Send a message from your dashboard and the team will update the order. After submission, changes depend on the registry and may attract a new government fee.', 6)
on conflict (id) do nothing;

insert into public.lawyers (id, display_name, jurisdiction, practice_areas, years, photo_url, show_name, show_photo, approved) values
  ('law_seed_ng', 'Partner lawyer, Nigeria', 'Nigeria',
   '["Corporate compliance", "Annual returns", "Beneficial ownership"]'::jsonb, 12, '', false, false, true),
  ('law_seed_uk', 'Partner lawyer, United Kingdom', 'United Kingdom',
   '["Confirmation statements", "Company secretarial", "Regulatory filings"]'::jsonb, 9, '', false, false, true),
  ('law_seed_us', 'Partner lawyer, United States', 'United States',
   '["Annual reports", "State compliance", "Registered agent matters"]'::jsonb, 11, '', false, false, true)
on conflict (id) do nothing;

insert into public.guides (slug, title, excerpt, country, reading_minutes, published_at, body) values
  ('register-a-business-name-in-nigeria', 'How to register a business name in Nigeria',
   'The name search, the particulars the CAC asks for, and the mistakes that send applications back.',
   'nigeria', 5, '2026-01-12',
   '["A business name is the lightest way to trade under a name in Nigeria. It suits a sole trader, a partnership or a side business that is not ready for a limited company.", "## Start with three names", "The CAC rejects names that are already taken, too close to an existing name, or restricted. Give three options in order of preference.", "## The particulars you need", "Have these ready: the nature of business, a Nigerian address, and the details of every owner.", "## What the filing team does", "Your filing is prepared and submitted by Udalla''s filing team. Licensed partner lawyers handle regulatory compliance."]'::jsonb),
  ('register-a-uk-limited-company', 'Registering a UK limited company from abroad',
   'Directors, shareholders, people with significant control and the registered office rule, explained without the jargon.',
   'united-kingdom', 4, '2026-02-03',
   '["You do not need to live in the UK to own a UK company. You do need a UK registered office address, at least one director, and a share structure that adds up.", "## The registered office", "Companies House publishes the registered office. It must be a real UK address where documents can be delivered.", "## Directors and shareholders", "A private limited company needs at least one director and at least one shareholder. The same person can be both.", "## People with significant control", "Anyone who holds more than 25 percent of shares or voting rights must be recorded.", "## After incorporation", "A confirmation statement is filed every 12 months and accounts each year."]'::jsonb),
  ('delaware-or-wyoming-llc', 'Delaware or Wyoming for your LLC',
   'Two popular states, two different cost profiles. A short guide to picking one on purpose.',
   'united-states', 4, '2026-03-18',
   '["Most non residents forming a US LLC choose Delaware or Wyoming. The right answer depends on what the company is for.", "## Delaware is built for investors", "Delaware has a deep body of company law and courts that investors understand.", "## Wyoming is built for lean ownership", "Wyoming has lower annual costs and does not publish a member list.", "## Both need a registered agent", "A registered agent receives official state mail at a physical address in the state."]'::jsonb)
on conflict (slug) do nothing;
