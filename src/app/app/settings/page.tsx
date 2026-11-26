import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ClinicForm, ProfileForm } from "./forms";
import { SignatureUploader } from "./signature-uploader";

export const instant = false;

export default async function SettingsPage() {
  const { supabase, userId, staff, clinic } = await requireStaff();
  const { t } = await getT();

  const { data: clinicRow, error: clinicError } = await supabase
    .from("clinics")
    .select("name, address, city, phone")
    .eq("id", clinic.id)
    .maybeSingle();
  if (clinicError) throw new Error("Unable to load clinic settings.");

  let signatureUrl: string | null = null;
  if (staff.role === "doctor" && staff.signatureUpdatedAt) {
    const { data, error } = await supabase.storage
      .from("signatures")
      .createSignedUrl(`${staff.clinicId}/${userId}`, 300);
    if (error || !data?.signedUrl) throw new Error("Unable to load the saved signature.");
    signatureUrl = data.signedUrl;
  }

  return (
    <AppShell
      clinicName={clinic.name}
      fullName={staff.fullName}
      role={staff.role}
      isOwner={staff.isOwner}
    >
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="flex flex-col gap-5">
        <Card>
          <h2 className="text-xl font-semibold tracking-tight">{t("settings.profile.title")}</h2>
          <p className="mt-1 text-base text-ink-soft">
            {staff.role === "doctor" ? t("settings.profile.descDoctor") : t("settings.profile.descOther")}
          </p>
          <div className="mt-5">
            <ProfileForm
              role={staff.role}
              defaults={{
                fullName: staff.fullName,
                qualifications: staff.qualifications,
                registrationNumber: staff.registrationNumber,
                registrationCouncil: staff.registrationCouncil,
              }}
            />
          </div>
        </Card>

        {staff.role === "doctor" && (
          <Card>
            <h2 className="text-xl font-semibold tracking-tight">{t("settings.signature.title")}</h2>
            <p className="mt-1 text-base text-ink-soft">{t("settings.signature.desc")}</p>
            <div className="mt-5">
              <SignatureUploader clinicId={staff.clinicId} userId={userId} currentUrl={signatureUrl} />
            </div>
          </Card>
        )}

        <Card>
          <h2 className="text-xl font-semibold tracking-tight">{t("settings.clinic.title")}</h2>
          <p className="mt-1 text-base text-ink-soft">{t("settings.clinic.desc")}</p>
          <div className="mt-5">
            {staff.isOwner ? (
              <ClinicForm
                defaults={{
                  name: (clinicRow?.name ?? clinic.name) as string,
                  address: (clinicRow?.address ?? "") as string,
                  city: (clinicRow?.city ?? "") as string,
                  phone: (clinicRow?.phone ?? "") as string,
                }}
              />
            ) : (
              <p className="text-base text-ink-soft">{t("settings.clinic.ownerOnly")}</p>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
