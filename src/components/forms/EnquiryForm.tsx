"use client";

import { useActionState } from "react";
import { submitEnquiry } from "@/app/actions/public";
import { Check } from "@/components/ui/Marks";
import { emptyFormState } from "@/lib/form-state";

const projectTypes = [
  "Starter site",
  "Online store",
  "Custom platform",
  "Marketing and apps",
  "General question",
];

const budgets = [
  "Under ₦100,000",
  "₦100,000 to ₦300,000",
  "₦300,000 to ₦1,000,000",
  "Above ₦1,000,000",
  "Not sure yet",
];

const timelines = ["As soon as possible", "Within a month", "One to three months", "Just exploring"];

export function EnquiryForm({ defaultType }: { defaultType?: string }) {
  const [state, action, pending] = useActionState(submitEnquiry, emptyFormState);

  if (state.ok) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy-900 text-cream-100">
          <Check className="h-5 w-5" />
        </span>
        <p className="mt-5 font-display text-[24px] tracking-[-0.02em]">Enquiry received</p>
        <p className="mt-2 text-[14px] text-navy-950/70">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-4 p-6 md:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" className="field" autoComplete="name" required />
          {state.errors.name ? <p className="mt-1 text-[12px] text-danger-600">{state.errors.name}</p> : null}
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" required />
          {state.errors.email ? <p className="mt-1 text-[12px] text-danger-600">{state.errors.email}</p> : null}
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">
            WhatsApp number
          </label>
          <input id="whatsapp" name="whatsapp" className="field" autoComplete="tel" required />
          {state.errors.whatsapp ? (
            <p className="mt-1 text-[12px] text-danger-600">{state.errors.whatsapp}</p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="business">
            Business name
          </label>
          <input id="business" name="business" className="field" required />
          {state.errors.business ? (
            <p className="mt-1 text-[12px] text-danger-600">{state.errors.business}</p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="projectType">
            Project type
          </label>
          <select id="projectType" name="projectType" className="field" defaultValue={defaultType ?? projectTypes[0]}>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="budget">
            Budget
          </label>
          <select id="budget" name="budget" className="field" defaultValue={budgets[0]}>
            {budgets.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="timeline">
            Timeline
          </label>
          <select id="timeline" name="timeline" className="field" defaultValue={timelines[0]}>
            {timelines.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-3 text-[12.5px] leading-relaxed text-navy-950/75">
        <input
          type="checkbox"
          name="consent"
          className="mt-0.5 h-4 w-4 flex-none accent-navy-900"
          required
        />
        <span>
          I agree that Udalla can contact me about this enquiry and store these details as
          described in the privacy policy.
        </span>
      </label>
      {state.errors.consent ? (
        <p className="text-[12px] text-danger-600">{state.errors.consent}</p>
      ) : null}

      {state.message && !state.ok ? (
        <p className="rounded-[10px] bg-danger-100 px-3 py-2 text-[12.5px] text-danger-600">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sending" : "Send enquiry"}
        </button>

      </div>
    </form>
  );
}
