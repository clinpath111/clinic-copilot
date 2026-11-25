import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { ClinicForm, ProfileForm } from "./forms";
import { SignatureUploader } from "./signature-uploader";

export const instant = false;

export default async function SettingsPage() {
  const { supabase, userId, staff, clinic } = await requireStaff();

  const { data: clinicRow, error: clinicError } = await supabase
    .from("clinics")
    .select("name, address, city, phone")
    .eq("id", clinic.id)
    .maybeSingle();
  if (clinicError) throw new Error("Unable to load clinic settings.");

  let signatureUrl: string | null = null;
  if (staff.role === "doctor" && staff.signatureUpdatedAt) {
    const { data, error: signatureError } = await supabase.storage
      .from("signatures")
      .createSignedUrl(`${staff.clinicId}/${userId}`, 300);
    if (signatureError || !data?.signedUrl) {
      throw new Error("Unable to load the saved signature.");
    }
    signatureUrl = data.signedUrl;
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/app" className="text-base underline">Back</Link>
      <h1 className="mt-4 text-2xl font-semibold">Settings</h1>

      <h2 className="mt-8 text-xl font-semibold">My profile</h2>
      <ProfileForm
        role={staff.role}
        defaults={{
          fullName: staff.fullName,
          qualifications: staff.qualifications,
          registrationNumber: staff.registrationNumber,
          registrationCouncil: staff.registrationCouncil,
        }}
      />

      {staff.role === "doctor" && (
        <>
          <h2 className="mt-10 text-xl font-semibold">My signature</h2>
          <SignatureUploader
            clinicId={staff.clinicId}
            userId={userId}
            currentUrl={signatureUrl}
          />
        </>
      )}

      <h2 className="mt-10 text-xl font-semibold">Clinic details</h2>
      {staff.isOwner ? (
        <ClinicForm
          defaults={{
            name: clinicRow?.name ?? clinic.name,
            address: clinicRow?.address ?? "",
            city: clinicRow?.city ?? "",
            phone: clinicRow?.phone ?? "",
          }}
        />
      ) : (
        <p className="mt-2 text-base text-gray-600">
          Only the clinic owner can change these details.
        </p>
      )}
    </main>
  );
}
