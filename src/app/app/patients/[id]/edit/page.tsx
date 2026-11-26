import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { attachContactInfo, currentYearIST } from "@/lib/patients";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ChangePhoneForm, EditForm } from "./edit-forms";

export const instant = false;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { supabase, staff, clinic } = await requireStaff();
  const { t } = await getT();

  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, full_name, sex, birth_year, language, contact_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Unable to load patient details.");
  if (!patient) notFound();

  const [row] = await attachContactInfo(supabase, [patient]);
  const currentYear = currentYearIST();

  return (
    <AppShell
      clinicName={clinic.name}
      fullName={staff.fullName}
      role={staff.role}
      isOwner={staff.isOwner}
    >
      <Link
        href={`/app/patients/${id}`}
        className="mb-4 inline-flex items-center gap-2 text-base font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        {t("edit.back")}
      </Link>
      <PageHeader title={t("edit.title")} subtitle={t("edit.subtitle")} />

      <div className="flex flex-col gap-5">
        <Card>
          <EditForm
            patientId={id}
            currentYear={currentYear}
            defaults={{
              fullName: row.fullName,
              birthYear: String(row.birthYear),
              sex: row.sex ?? "",
              language: row.language,
            }}
          />
        </Card>

        <Card>
          <h2 className="text-xl font-semibold tracking-tight">{t("edit.phone.title")}</h2>
          <p className="mt-1 text-base font-medium">{t("edit.phone.current", { phone: row.phone })}</p>
          <p className="mt-2 text-base text-ink-soft">{t("edit.phone.warning")}</p>
          <ChangePhoneForm patientId={id} currentYear={currentYear} />
        </Card>
      </div>
    </AppShell>
  );
}
