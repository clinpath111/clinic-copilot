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
      <form action={signOut}>
        <button type="submit" className="mt-6 h-12 rounded-lg border border-gray-400 px-4 text-base">
          Sign out
        </button>
      </form>
    </main>
  );
}
