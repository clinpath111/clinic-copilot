import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { signOut } from "./actions";

export const instant = false;

export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  const { staff, clinic } = await requireStaff();

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">{clinic.name}</h1>
      <p className="mt-2 text-base">
        Signed in as {staff.fullName} ({staff.role}
        {staff.isOwner ? ", owner" : ""})
      </p>

      {denied && (
        <p role="alert" className="mt-4 text-base text-red-700">
          You do not have permission to open that page.
        </p>
      )}

      {!staff.profileComplete && (
        <p role="status" className="mt-4 rounded-lg border border-amber-600 bg-amber-50 p-3 text-base">
          Action needed: add your qualifications, registration number, council and signature in{" "}
          <Link href="/app/settings" className="underline">Settings</Link>. You cannot issue
          prescriptions until this is done.
        </p>
      )}

      <nav className="mt-6 flex flex-col gap-3">
        <Link href="/app/settings" className="flex h-12 items-center rounded-lg border border-gray-400 px-4 text-base">
          Settings
        </Link>
        {staff.isOwner && (
          <Link href="/app/team" className="flex h-12 items-center rounded-lg border border-gray-400 px-4 text-base">
            Team
          </Link>
        )}
      </nav>

      <form action={signOut}>
        <button type="submit" className="mt-6 h-12 rounded-lg border border-gray-400 px-4 text-base">
          Sign out
        </button>
      </form>
    </main>
  );
}
