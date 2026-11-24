import { requireStaff } from "@/lib/auth";

export const instant = false;

export default async function DoctorOnlyPage() {
  const { staff } = await requireStaff(["doctor"]);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Doctor-only page</h1>
      <p className="mt-2 text-base">
        You are {staff.fullName}, role: {staff.role}.
      </p>
    </main>
  );
}
