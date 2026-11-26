import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { currentYearIST } from "@/lib/patients";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { RegisterForm } from "./register-form";

export const instant = false;

export default async function NewPatientPage() {
  const { staff, clinic } = await requireStaff();
  const { t } = await getT();

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
      <PageHeader title={t("register.title")} subtitle={t("register.subtitle")} />
      <RegisterForm currentYear={currentYearIST()} />
    </AppShell>
  );
}
