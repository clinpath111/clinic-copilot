import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { InviteForm } from "./invite-form";
import { revokeInvite, setStaffActive } from "./actions";

export const instant = false;

type Member = { id: string; full_name: string; role: string; is_owner: boolean; active: boolean };
type Invite = { id: string; email: string; full_name: string; role: string; expires_at: string };

export default async function TeamPage() {
  const { supabase, staff, clinic } = await requireStaff();
  if (!staff.isOwner) redirect("/app?denied=1");

  const { locale, t } = await getT();
  const dateFormat = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  });
  const roleLabel = (role: string) => (role === "doctor" ? t("role.doctor") : t("role.receptionist"));

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
    <AppShell
      clinicName={clinic.name}
      fullName={staff.fullName}
      role={staff.role}
      isOwner={staff.isOwner}
    >
      <PageHeader title={t("team.title")} subtitle={t("team.subtitle", { clinic: clinic.name })} />

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">{t("team.people")}</h2>
          <Card padded={false}>
            <ul className="divide-y divide-line">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={m.full_name} />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{m.full_name}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge>{roleLabel(m.role)}</Badge>
                        {m.is_owner && <Badge tone="info">{t("role.owner")}</Badge>}
                        {!m.active && <Badge tone="warning">{t("team.off")}</Badge>}
                      </div>
                    </div>
                  </div>
                  {!m.is_owner && m.id !== staff.id && (
                    <form action={setStaffActive}>
                      <input type="hidden" name="staff_id" value={m.id} />
                      <input type="hidden" name="active" value={m.active ? "false" : "true"} />
                      <Button type="submit" variant="secondary">
                        {m.active ? t("team.turnOff") : t("team.turnOn")}
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">{t("team.pending")}</h2>
          {invites.length === 0 ? (
            <p className="text-base text-ink-soft">{t("team.noPending")}</p>
          ) : (
            <Card padded={false}>
              <ul className="divide-y divide-line">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{inv.full_name}</p>
                      <p className="truncate text-sm text-ink-soft">{inv.email}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge>{roleLabel(inv.role)}</Badge>
                        <Badge tone="warning">
                          {t("team.expires", { date: dateFormat.format(new Date(inv.expires_at)) })}
                        </Badge>
                      </div>
                    </div>
                    <form action={revokeInvite}>
                      <input type="hidden" name="invite_id" value={inv.id} />
                      <Button type="submit" variant="secondary">
                        {t("team.cancel")}
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section>
          <Card>
            <h2 className="text-xl font-semibold tracking-tight">{t("team.invite.title")}</h2>
            <p className="mt-1 text-base text-ink-soft">{t("team.invite.desc")}</p>
            <div className="mt-5">
              <InviteForm />
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
