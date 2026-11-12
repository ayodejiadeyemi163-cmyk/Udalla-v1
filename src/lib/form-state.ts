/**
 * Shared form state. Kept out of the "use server" action module because a
 * server action file may only export async functions.
 */
export interface FormState {
  ok: boolean;
  errors: Record<string, string>;
  message: string;
}

export const emptyFormState: FormState = { ok: false, errors: {}, message: "" };
