"use client";

import { useActionState, useEffect, useRef, useSyncExternalStore, type InputHTMLAttributes } from "react";
import { submitEnquiry } from "@/actions/enquiry";
import { CheckIcon } from "@/components/ui/Icons";
import { initialEnquiryState, type EnquiryField, type EnquiryState } from "@/lib/enquiry-schema";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const inputClass =
  "block min-h-12 w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted aria-invalid:border-danger";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: EnquiryField;
  label: string;
  state: EnquiryState;
  inputClassName?: string;
};

function Field({ name, label, state, className = "", inputClassName = "", ...input }: FieldProps) {
  const error = state.fieldErrors?.[name];
  const id = `enquiry-${name}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={state.values?.[name] ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} ${inputClassName}`}
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const noop = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function EnquiryForm({ successMessage }: { successMessage: string | null }) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialEnquiryState);
  const enhanced = useHydrated();
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
      window.dataLayer?.push({ event: "enquiry_submitted" });
    }

    if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      (invalid ?? alertRef.current)?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="flex gap-4 rounded-3xl bg-paper p-6 text-lg font-semibold sm:p-8"
      >
        <CheckIcon className="size-7 shrink-0 text-go" />
        <p>{successMessage ?? "Thanks, we've got your details and will be in touch shortly."}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate={enhanced} className="rounded-3xl bg-paper p-6 sm:p-8">
      {state.status === "error" && state.message && (
        <p ref={alertRef} role="alert" tabIndex={-1} className="mb-6 rounded-xl border-2 border-danger bg-surface p-4 font-semibold text-danger">
          {state.message}
        </p>
      )}

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-xl font-bold">Your car</legend>
        <Field
          name="registration"
          label="Registration"
          state={state}
          placeholder="AB12 CDE"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={10}
          required
          inputClassName="bg-brand! font-display text-xl font-bold tracking-widest uppercase placeholder:text-ink/60"
        />
        <Field name="mileage" label="Mileage" state={state} inputMode="numeric" placeholder="45,000" autoComplete="off" required />
      </fieldset>

      <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-xl font-bold">Your details</legend>
        <Field name="name" label="Full name" state={state} autoComplete="name" className="sm:col-span-2" required />
        <Field name="phone" label="Phone number" state={state} type="tel" autoComplete="tel" required />
        <Field name="email" label="Email address" state={state} type="email" autoComplete="email" required />
      </fieldset>

      {enhanced && <input type="hidden" name="enhanced" value="1" />}

      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-brand px-6 text-lg font-semibold text-ink transition-colors hover:bg-brand-strong disabled:opacity-70"
      >
        {pending ? "Sending..." : "Get my free valuation"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">We only use your details to give you a valuation.</p>
    </form>
  );
}
