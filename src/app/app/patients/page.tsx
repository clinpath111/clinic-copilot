import Link from "next/link";
import { UserPlus } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { attachContactInfo, currentYearIST } from "@/lib/patients";
import { AppShell } from "@/components/app-shell";
import { buttonClasses } from "@/components/ui/button";
import { PatientSearch } from "./patient-search";

export const instant = false;

export default async function PatientsPage() {
  const { supabase, staff, clinic } = await requireStaff();
  const { t } = await getT();

  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name, sex, birth_year, language, contact_id")
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) throw new Error("Unable to load patients.");
  const rows = await attachContactInfo(supabase, data ?? []);

  return (
    <AppShell
      clinicName={clinic.name}
      fullName={staff.fullName}
      role={staff.role}
      isOwner={staff.isOwner}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("patients.title")}</h1>
          <p className="mt-2 text-lg text-ink-soft">{t("patients.subtitle", { clinic: clinic.name })}</p>
        </div>
        <Link href="/app/patients/new" className={buttonClasses("primary", "lg")}>
          <UserPlus size={20} aria-hidden="true" />
          {t("patients.add")}
        </Link>
      </div>

      <PatientSearch initialRows={rows} currentYear={currentYearIST()} />
    </AppShell>
  );
}
