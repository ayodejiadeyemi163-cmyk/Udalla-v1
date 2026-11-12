import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(2, "Enter a name with at least 2 characters.")
  .max(120, "Keep this under 120 characters.");

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");

const optionalText = z.string().trim().max(500).optional().default("");

export const packageSelectionSchema = z.object({
  packageTier: z.enum(["starter", "standard", "premium"]),
  addOns: z.array(z.string().max(60)).max(10).default([]),
});

export const businessDetailsSchema = z.object({
  name1: z.string().trim().min(2, "Enter your first proposed name.").max(120),
  name2: optionalText,
  name3: optionalText,
  activity: z.string().trim().min(3, "Describe the business activity.").max(300),
  address: z.string().trim().min(6, "Enter the business address.").max(400),
  shareCapital: z
    .string()
    .trim()
    .max(40)
    .regex(/^[0-9,]*$/, "Use numbers only for share capital.")
    .optional()
    .default(""),
});

export const personSchema = z.object({
  id: z.string().min(1),
  name,
  email,
  role: z.enum(["director", "shareholder", "member", "trustee"]),
  ownership: z.coerce.number().min(0).max(100),
  address: z.string().trim().min(2).max(300),
});

export const peopleSchema = z
  .array(personSchema)
  .min(1, "Add at least one person.")
  .max(20, "Up to 20 people per order.")
  .superRefine((people, ctx) => {
    const total = people.reduce((sum, person) => sum + person.ownership, 0);
    const needsOwnership = people.some((person) =>
      ["shareholder", "member"].includes(person.role),
    );
    if (needsOwnership && Math.round(total) !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ownership across shareholders or members must total 100 percent.",
      });
    }
  });

export const consentSchema = z.literal(true, {
  message: "You need to accept the terms to continue.",
});

export const leadSchema = z.object({
  name,
  email,
  whatsapp: z.string().trim().min(7, "Enter a WhatsApp number.").max(40),
  business: z.string().trim().min(2, "Enter your business name.").max(160),
  projectType: z.string().trim().min(1, "Choose a project type.").max(80),
  budget: z.string().trim().min(1, "Choose a budget range.").max(80),
  timeline: z.string().trim().min(1, "Choose a timeline.").max(80),
  consent: consentSchema,
});

export const complianceRequestSchema = z.object({
  serviceSlug: z.string().min(1),
  detail: z.string().trim().min(20, "Describe what you need in at least 20 characters.").max(2000),
  consent: consentSchema,
});

export const contactSchema = z.object({
  name,
  email,
  message: z.string().trim().min(10, "Enter a message of at least 10 characters.").max(2000),
  consent: consentSchema,
});

export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;
export type PersonInput = z.infer<typeof personSchema>;
export type LeadInput = z.infer<typeof leadSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
