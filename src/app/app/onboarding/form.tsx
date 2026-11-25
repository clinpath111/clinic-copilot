"use client";

import { useActionState } from "react";
import { createClinic } from "./actions";
import type { FormState } from "@/lib/form-state";

const initial: FormState = { error: null };

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createClinic, initial);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="clinic_name" className="text-base font-medium">Clinic name</label>
        <input
          id="clinic_name"
          name="clinic_name"
          required
          maxLength={120}
          className="h-12 rounded-lg border border-gray-400 px-4 text-base"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-base font-medium">Your full name</label>
        <input
          id="full_name"
          name="full_name"
          required
          maxLength={100}
          className="h-12 rounded-lg border border-gray-400 px-4 text-base"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg bg-black px-4 text-base font-medium text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create my clinic"}
      </button>
      {state.error && <p role="alert" className="text-base text-red-700">{state.error}</p>}
    </form>
  );
}
