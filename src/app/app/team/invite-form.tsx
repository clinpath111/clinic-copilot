"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form-state";
import { inviteStaff } from "./actions";

const initial: FormState = { error: null };

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteStaff, initial);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-base font-medium">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="off"
          className="h-12 rounded-lg border border-gray-400 px-4 text-base"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-base font-medium">Full name</label>
        <input
          id="full_name"
          name="full_name"
          required
          maxLength={100}
          autoComplete="off"
          className="h-12 rounded-lg border border-gray-400 px-4 text-base"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-base font-medium">Role</label>
        <select
          id="role"
          name="role"
          defaultValue="receptionist"
          className="h-12 rounded-lg border border-gray-400 bg-white px-4 text-base"
        >
          <option value="receptionist">Receptionist</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg bg-black px-4 text-base font-medium text-white disabled:opacity-50"
      >
        {pending ? "Inviting..." : "Create invitation"}
      </button>
      {state.error && <p role="alert" className="text-base text-red-700">{state.error}</p>}
      {state.saved && (
        <p role="status" className="text-base text-green-800">
          Invitation created. We do not email it yet: ask them to open Clinic Copilot and
          sign in with this email address. They will join your clinic automatically.
        </p>
      )}
    </form>
  );
}
