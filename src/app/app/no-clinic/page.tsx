import { requireSession } from "@/lib/auth";
import { signOut } from "../actions";

export const instant = false;

export default async function NoClinicPage() {
  await requireSession();

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Your account is not linked to a clinic yet</h1>
      <p className="mt-3 text-base">
        Ask your clinic owner to add you, or contact Clinic Copilot support.
      </p>
      <form action={signOut}>
        <button type="submit" className="mt-6 h-12 rounded-lg border border-gray-400 px-4 text-base">
          Sign out
        </button>
      </form>
    </main>
  );
}
