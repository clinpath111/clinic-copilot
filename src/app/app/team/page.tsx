import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { InviteForm } from "./invite-form";
import { revokeInvite, setStaffActive } from "./actions";

export const instant = false;

type Member = {
  id: string;
  full_name: string;
  role: string;
  is_owner: boolean;
  active: boolean;
};
type Invite = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  expires_at: string;
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});
const roleLabel = (role: string) => (role === "doctor" ? "Doctor" : "Receptionist");

export default async function TeamPage() {
  const { supabase, staff } = await requireStaff();
  if (!staff.isOwner) redirect("/app?denied=1");

  const { data: memberRows, error: membersError } = await supabase
    .from("staff")
    .select("id, full_name, role, is_owner, active")
    .order("created_at");
  if (membersError) throw new Error("Unable to load clinic team members.");

  const { data: inviteRows, error: invitesError } = await supabase
    .from("staff_invites")
    .select("id, email, full_name, role, expires_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (invitesError) throw new Error("Unable to load pending invitations.");

  const members = (memberRows ?? []) as Member[];
  const invites = (inviteRows ?? []) as Invite[];

  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/app" className="text-base underline">Back</Link>
      <h1 className="mt-4 text-2xl font-semibold">Team</h1>

      <h2 className="mt-8 text-xl font-semibold">People with access</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {members.map((member) => (
          <li key={member.id} className="rounded-lg border border-gray-400 p-3">
            <p className="text-base font-medium">{member.full_name}</p>
            <p className="text-sm text-gray-600">
              {roleLabel(member.role)}
              {member.is_owner ? " (owner)" : ""}
              {member.active ? "" : " - access turned off"}
            </p>
            {!member.is_owner && member.id !== staff.id && (
              <form action={setStaffActive} className="mt-2">
                <input type="hidden" name="staff_id" value={member.id} />
                <input type="hidden" name="active" value={member.active ? "false" : "true"} />
                <button type="submit" className="h-12 rounded-lg border border-gray-400 px-4 text-base">
                  {member.active ? "Turn off access" : "Turn on access"}
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Pending invitations</h2>
      {invites.length === 0 ? (
        <p className="mt-2 text-base text-gray-600">No pending invitations.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {invites.map((invite) => (
            <li key={invite.id} className="rounded-lg border border-gray-400 p-3">
              <p className="text-base font-medium">{invite.full_name}</p>
              <p className="text-sm text-gray-600">
                {invite.email} - {roleLabel(invite.role)} - expires{" "}
                {dateFormat.format(new Date(invite.expires_at))}
              </p>
              <form action={revokeInvite} className="mt-2">
                <input type="hidden" name="invite_id" value={invite.id} />
                <button type="submit" className="h-12 rounded-lg border border-gray-400 px-4 text-base">
                  Cancel invitation
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-xl font-semibold">Invite someone</h2>
      <InviteForm />
    </main>
  );
}
