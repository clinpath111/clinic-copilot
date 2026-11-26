import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Phone } from "lucide-react";
import { isPossiblyMinor } from "@/lib/age";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { messages, type MessageKey } from "@/lib/i18n/messages";
import { attachContactInfo, currentYearIST } from "@/lib/patients";
import { AppShell } from "@/components/app-shell";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { recordConsent } from "../actions";

export const instant = false;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SEX_LABEL: Record<string, MessageKey> = {
  female: "patients.sex.female",
  male: "patients.sex.male",
  other: "patients.sex.other",
};
const METHOD_LABEL: Record<string, MessageKey> = {
  staff_entry: "detail.consent.method.staff_entry",
  in_clinic_form: "detail.consent.method.in_clinic_form",
  whatsapp_reply: "detail.consent.method.whatsapp_reply",
};

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { supabase, staff, clinic } = await requireStaff();
  const { locale, t } = await getT();

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, full_name, sex, birth_year, language, contact_id")
    .eq("id", id)
    .maybeSingle();
  if (patientError) throw new Error("Unable to load patient details.");
  if (!patient) notFound();

  const [row] = await attachContactInfo(supabase, [patient]);
  const contactId = patient.contact_id as string | null;
  const landline = row.landline;

  let family: { id: string; full_name: string; birth_year: number }[] = [];
  let history: { status: string; method: string; created_at: string }[] = [];
  if (contactId) {
    const { data: others, error: othersError } = await supabase
      .from("patients")
      .select("id, full_name, birth_year")
      .eq("contact_id", contactId)
      .neq("id", id)
      .order("created_at");
    if (othersError) throw new Error("Unable to load family members.");
    family = (others ?? []) as typeof family;

    const { data: events, error: eventsError } = await supabase
      .from("consents")
      .select("status, method, created_at")
      .eq("contact_id", contactId)
      .eq("purpose", "whatsapp_messages")
      .order("created_at", { ascending: false })
      .limit(5);
    if (eventsError) throw new Error("Unable to load consent history.");
    history = (events ?? []) as typeof history;
  }

  const currentYear = currentYearIST();
  const minor = isPossiblyMinor(row.birthYear, currentYear);
  const dateFormat = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const meta = [
    t("patients.age", { age: currentYear - row.birthYear }),
    row.sex && SEX_LABEL[row.sex] ? t(SEX_LABEL[row.sex]) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const consentBody: Record<typeof row.consent, MessageKey> = {
    granted: "detail.consent.grantedBody",
    withdrawn: "detail.consent.withdrawnBody",
    none: "detail.consent.noneBody",
  };
  const consentTone = row.consent === "granted" ? "success" : row.consent === "withdrawn" ? "warning" : "neutral";
  const consentTextKey = minor ? "register.consent.textMinor" : "register.consent.text";

  return (
    <AppShell
      clinicName={clinic.name}
      fullName={staff.fullName}
      role={staff.role}
      isOwner={staff.isOwner}
    >
      <Link href="/app/patients" className="mb-4 inline-flex items-center gap-2 text-base font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={18} aria-hidden="true" />
        {t("detail.back")}
      </Link>

      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={row.fullName} size={64} />
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold tracking-tight">{row.fullName}</h1>
            <p className="mt-1 text-lg text-ink-soft">{meta}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge>{t(row.language === "hi" ? "patients.lang.hi" : "patients.lang.en")}</Badge>
              {!landline && (
                <Badge tone={consentTone}>
                  {t(row.consent === "granted" ? "consent.granted" : row.consent === "withdrawn" ? "consent.withdrawn" : "consent.none")}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Link href={`/app/patients/${id}/edit`} className={buttonClasses("secondary")}>
          <Pencil size={18} aria-hidden="true" />
          {t("detail.edit")}
        </Link>
      </header>

      <div className="flex flex-col gap-5">
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-ink-faint">{t("detail.phone")}</dt>
              <dd className="mt-1 flex items-center gap-2 text-lg font-medium">
                <Phone size={18} aria-hidden="true" className="text-ink-faint" />
                {row.phone}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink-faint">{t("detail.language")}</dt>
              <dd className="mt-1 text-lg font-medium">
                {t(row.language === "hi" ? "patients.lang.hi" : "patients.lang.en")}
              </dd>
            </div>
          </dl>
        </Card>

        {family.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold tracking-tight">{t("detail.family")}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {family.map((p) => (
                <li key={p.id}>
                  <Link href={`/app/patients/${p.id}`} className="text-base font-semibold underline">
                    {p.full_name}
                  </Link>{" "}
                  <span className="text-ink-soft">
                    ({t("patients.age", { age: currentYear - p.birth_year })})
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <h2 className="text-xl font-semibold tracking-tight">{t("detail.consent.title")}</h2>

          {landline ? (
            <div className="mt-3">
              <Alert tone="info">{t("detail.consent.landline")}</Alert>
            </div>
          ) : (
            <>
              <div className="mt-3">
                <Alert tone={row.consent === "granted" ? "success" : row.consent === "withdrawn" ? "warning" : "info"}>
                  {t(consentBody[row.consent])}
                </Alert>
              </div>

              {contactId && (
                <form action={recordConsent} className="mt-4">
                  <input type="hidden" name="patient_id" value={id} />
                  <input type="hidden" name="contact_id" value={contactId} />
                  {row.consent === "granted" ? (
                    <>
                      <input type="hidden" name="status" value="withdrawn" />
                      <Button type="submit" variant="secondary" full>
                        {t("detail.consent.stop")}
                      </Button>
                    </>
                  ) : (
                    <>
                      {minor && (
                        <div className="mb-4">
                          <Alert tone="info">{t("register.consent.minorNote")}</Alert>
                        </div>
                      )}
                      <p lang={row.language} className="mb-4 rounded-control bg-canvas p-4 text-base text-ink-soft">
                        {messages[row.language][consentTextKey]}
                      </p>
                      <input type="hidden" name="status" value="granted" />
                      <Button type="submit" full>
                        {minor ? t("detail.consent.recordMinor") : t("detail.consent.record")}
                      </Button>
                    </>
                  )}
                </form>
              )}
            </>
          )}

          {history.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-ink-faint">{t("detail.consent.history")}</h3>
              <ul className="mt-2 divide-y divide-line">
                {history.map((h) => (
                  <li key={`${h.created_at}-${h.status}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-base">
                    <span className="font-medium">
                      {t(h.status === "granted" ? "detail.consent.event.granted" : "detail.consent.event.withdrawn")}
                      <span className="font-normal text-ink-soft">
                        {" · "}
                        {METHOD_LABEL[h.method] ? t(METHOD_LABEL[h.method]) : h.method}
                      </span>
                    </span>
                    <span className="text-sm text-ink-faint">{dateFormat.format(new Date(h.created_at))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="rounded-card border border-dashed border-line-strong p-5">
          <p className="text-base text-ink-soft">{t("detail.soon")}</p>
        </div>
      </div>
    </AppShell>
  );
}
