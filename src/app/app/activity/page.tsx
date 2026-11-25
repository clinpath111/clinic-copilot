import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";

export const instant = false;

type Entry = {
  id: number;
  actor_staff_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const LABELS: Record<string, string> = {
  "clinic.created": "Clinic created",
  "clinic.updated": "Clinic details changed",
  "staff.added": "Team member added",
  "staff.access_changed": "Access changed",
  "staff.profile_updated": "Profile changed",
  "signature.updated": "Signature updated",
  "staff.invited": "Invitation created",
  "staff.invite_revoked": "Invitation cancelled",
  "staff.invite_accepted": "Invitation accepted",
  "patient.created": "Patient added",
  "patient.updated": "Patient details changed",
  "contact.created": "Phone contact added",
  "contact.updated": "Phone contact changed",
  "consent.recorded": "Consent recorded",
};

function describe(details: Record<string, unknown>): string {
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join(" | ");
}

export default async function ActivityPage() {
  const { supabase, staff } = await requireStaff();
  if (!staff.isOwner) redirect("/app?denied=1");

  const { data: people, error: peopleError } = await supabase.from("staff").select("id, full_name");
  if (peopleError) throw new Error("Unable to load clinic team members.");

  const names = new Map<string, string>(
    (people ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name] as [string, string])
  );

  const { data: rows, error: rowsError } = await supabase
    .from("audit_log")
    .select("id, actor_staff_id, action, details, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (rowsError) throw new Error("Unable to load the activity log.");

  const entries = (rows ?? []) as Entry[];

  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/app" className="text-base underline">Back</Link>
      <h1 className="mt-4 text-2xl font-semibold">Activity log</h1>
      <p className="mt-2 text-base text-gray-600">
        The latest 100 changes. It records who did what and when, never patient details.
        Entries cannot be edited or deleted.
      </p>

      {entries.length === 0 ? (
        <p className="mt-6 text-base">Nothing recorded yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg border border-gray-400 p-3">
              <p className="text-base font-medium">{LABELS[e.action] ?? e.action}</p>
              <p className="text-sm text-gray-600">
                {timeFormat.format(new Date(e.created_at))} -{" "}
                {e.actor_staff_id ? (names.get(e.actor_staff_id) ?? "Former team member") : "System"}
              </p>
              {Object.keys(e.details).length > 0 && (
                <p className="mt-1 text-sm text-gray-600">{describe(e.details)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
