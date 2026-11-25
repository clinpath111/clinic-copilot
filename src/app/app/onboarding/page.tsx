import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { signOut } from "../actions";
import { OnboardingForm } from "./form";

export const instant = false;

export default async function OnboardingPage() {
  const { supabase } = await requireSession();

  const { data: state, error: stateError } = await supabase.rpc("my_access_state");
  if (stateError) throw new Error("Unable to check account access.");
  if (state === "active") redirect("/app");

  if (state === "inactive") {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold">Your access has been turned off</h1>
        <p className="mt-3 text-base">Please ask your clinic owner to turn it back on.</p>
        <form action={signOut}>
          <button type="submit" className="mt-6 h-12 rounded-lg border border-gray-400 px-4 text-base">
            Sign out
          </button>
        </form>
      </main>
    );
  }

  const { data: joinedClinic, error: inviteError } = await supabase.rpc("claim_my_invite");
  if (inviteError) throw new Error("Unable to claim the clinic invitation.");
  if (joinedClinic) redirect("/app");

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Set up your clinic</h1>
      <p className="mt-2 text-base text-gray-600">
        You will be the clinic owner and a doctor on this clinic. You can add your
        qualifications and registration number next. If a clinic invited you, sign in
        with the email address they invited.
      </p>
      <OnboardingForm />
      <form action={signOut}>
        <button type="submit" className="mt-6 h-12 rounded-lg border border-gray-400 px-4 text-base">
          Sign out
        </button>
      </form>
    </main>
  );
}
