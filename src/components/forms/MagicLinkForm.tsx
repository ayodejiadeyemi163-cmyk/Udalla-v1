"use client";

import { useActionState } from "react";
import { sendMagicLink } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form-state";

export function MagicLinkForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(sendMagicLink, emptyFormState);

  return (
    <form action={action} className="mt-5 space-y-3">
      <div>
        <label className="label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="field"
          placeholder="you@company.com"
          required
          disabled={disabled}
        />
        {state.errors.email ? (
          <p className="mt-1 text-[12px] text-danger-600">{state.errors.email}</p>
        ) : null}
      </div>
      <button type="submit" className="btn btn-navy w-full" disabled={disabled || pending}>
        {pending ? "Sending link" : "Email me a sign in link"}
      </button>
      {state.message ? (
        <p
          className={`rounded-[10px] px-3 py-2 text-[12.5px] ${
            state.ok ? "bg-navy-900/10 text-navy-900" : "bg-danger-100 text-danger-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      {disabled ? (
        <p className="text-[11.5px] leading-relaxed text-slate-muted">
          Email links need Supabase keys. In this preview, the demo accounts below sign you
          straight in.
        </p>
      ) : null}
    </form>
  );
}
