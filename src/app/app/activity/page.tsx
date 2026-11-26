import { redirect } from "next/navigation";
import {
  Building2,
  Phone,
  PenLine,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const instant = false;

type Entry = {
  id: number;
  actor_staff_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

type T = (key: MessageKey, vars?: Record<string, string | number>) => string;

const ACTION_KEYS: Record<string, MessageKey> = {
  "clinic.created": "activity.action.clinicCreated",
  "clinic.updated": "activity.action.clinicUpdated",
  "staff.added": "activity.action.staffAdded",
  "staff.access_changed": "activity.action.accessChanged",
  "staff.profile_updated": "activity.action.profileUpdated",
  "signature.updated": "activity.action.signatureUpdated",
  "staff.invited": "activity.action.staffInvited",
  "staff.invite_revoked": "activity.action.inviteRevoked",
  "staff.invite_accepted": "activity.action.inviteAccepted",
  "patient.created": "activity.action.patientCreated",
  "patient.updated": "activity.action.patientUpdated",
  "contact.created": "activity.action.contactCreated",
  "contact.updated": "activity.action.contactUpdated",
  "consent.recorded": "activity.action.consentRecorded",
};

const FIELD_KEYS: Record<string, MessageKey> = {
  name: "activity.field.name",
  address: "activity.field.address",
  city: "activity.field.city",
  phone: "activity.field.phone",
  full_name: "activity.field.fullName",
  qualifications: "activity.field.qualifications",
  registration_number: "activity.field.registrationNumber",
  registration_council: "activity.field.registrationCouncil",
};

const ICONS: Record<string, LucideIcon> = {
  clinic: Building2,
  staff: Users,
  signature: PenLine,
  patient: UserRound,
  contact: Phone,
  consent: ShieldCheck,
};

function describe(details: Record<string, unknown>, t: T): string {
  const parts: string[] = [];

  if (Array.isArray(details.fields)) {
    const names = (details.fields as string[]).map((field) =>
      FIELD_KEYS[field] ? t(FIELD_KEYS[field]) : field.replace(/_/g, " ")
    );
    parts.push(t("activity.changed", { fields: names.join(", ") }));
  }
  if (typeof details.role === "string") {
    parts.push(details.role === "doctor" ? t("role.doctor") : t("role.receptionist"));
  }
  if (typeof details.active === "boolean") {
    parts.push(details.active ? t("activity.accessOn") : t("activity.accessOff"));
  }
  return parts.join(" · ");
}

export default async function ActivityPage() {
  const { supabase, staff, clinic } = await requireStaff();
  if (!staff.isOwner) redirect("/app?denied=1");

  const { locale, t } = await getT();
  const timeFormat = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

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
    <AppShell
      clinicName={clinic.name}
      fullName={staff.fullName}
      role={staff.role}
      isOwner={staff.isOwner}
    >
      <PageHeader title={t("activity.title")} subtitle={t("activity.desc")} />

      {entries.length === 0 ? (
        <Card>
          <p className="text-base text-ink-soft">{t("activity.empty")}</p>
        </Card>
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-line">
            {entries.map((e) => {
              const Icon = ICONS[e.action.split(".")[0]] ?? ShieldCheck;
              const label = ACTION_KEYS[e.action] ? t(ACTION_KEYS[e.action]) : e.action;
              const detail = describe(e.details, t);
              const who = e.actor_staff_id
                ? (names.get(e.actor_staff_id) ?? t("activity.former"))
                : t("activity.system");

              return (
                <li key={e.id} className="flex gap-3 p-4">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
                  >
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold">{label}</p>
                    <p className="text-sm text-ink-soft">
                      {who} · {timeFormat.format(new Date(e.created_at))}
                    </p>
                    {detail && <p className="mt-0.5 text-sm text-ink-faint">{detail}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </AppShell>
  );
}
