"use client";

import { useActionState } from "react";
import type { Role } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { updateClinic, updateProfile } from "./actions";

const initial: FormState = { error: null };

function Field(props: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
  required?: boolean;
  maxLength: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={props.name} className="text-base font-medium">{props.label}</label>
      <input
        id={props.name}
        name={props.name}
        defaultValue={props.defaultValue}
        required={props.required}
        maxLength={props.maxLength}
        className="h-12 rounded-lg border border-gray-400 px-4 text-base"
      />
      {props.hint && <p className="text-sm text-gray-600">{props.hint}</p>}
    </div>
  );
}

function Status({ state }: { state: FormState }) {
  return (
    <>
      {state.error && <p role="alert" className="text-base text-red-700">{state.error}</p>}
      {state.saved && <p role="status" className="text-base text-green-800">Saved.</p>}
    </>
  );
}

export function ProfileForm(props: {
  role: Role;
  defaults: {
    fullName: string;
    qualifications: string;
    registrationNumber: string;
    registrationCouncil: string;
  };
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <Field
        label="Full name"
        name="full_name"
        defaultValue={props.defaults.fullName}
        required
        maxLength={100}
      />
      {props.role === "doctor" && (
        <>
          <Field
            label="Qualifications"
            name="qualifications"
            defaultValue={props.defaults.qualifications}
            hint="Printed on every prescription. Example: MBBS, MD (General Medicine)"
            maxLength={200}
          />
          <Field
            label="Registration number"
            name="registration_number"
            defaultValue={props.defaults.registrationNumber}
            hint="Printed on every prescription. Check it carefully."
            maxLength={50}
          />
          <Field
            label="Registration council"
            name="registration_council"
            defaultValue={props.defaults.registrationCouncil}
            hint="Example: Delhi Medical Council"
            maxLength={100}
          />
        </>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg bg-black px-4 text-base font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save my profile"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function ClinicForm(props: {
  defaults: { name: string; address: string; city: string; phone: string };
}) {
  const [state, action, pending] = useActionState(updateClinic, initial);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <Field label="Clinic name" name="name" defaultValue={props.defaults.name} required maxLength={120} />
      <Field label="Address" name="address" defaultValue={props.defaults.address}
        hint="Printed on prescriptions" maxLength={300} />
      <Field label="City" name="city" defaultValue={props.defaults.city} maxLength={80} />
      <Field label="Clinic phone" name="phone" defaultValue={props.defaults.phone}
        hint="Printed on prescriptions" maxLength={20} />
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg bg-black px-4 text-base font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save clinic details"}
      </button>
      <Status state={state} />
    </form>
  );
}
