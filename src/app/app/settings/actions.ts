"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import type { FormState } from "@/lib/form-state";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, staff } = await requireStaff();
  const { t } = await getT();

  const fullName = text(formData, "full_name");
  if (fullName.length < 2 || fullName.length > 100) return { error: t("error.name") };

  const changes: Record<string, string | null> = { full_name: fullName };

  if (staff.role === "doctor") {
    const qualifications = text(formData, "qualifications");
    const registrationNumber = text(formData, "registration_number");
    const registrationCouncil = text(formData, "registration_council");
    if (qualifications.length > 200 || registrationNumber.length > 50 || registrationCouncil.length > 100) {
      return { error: t("error.tooLong") };
    }
    changes.qualifications = qualifications || null;
    changes.registration_number = registrationNumber || null;
    changes.registration_council = registrationCouncil || null;
  }

  const { data, error } = await supabase.from("staff").update(changes).eq("id", staff.id).select("id");
  if (error || !data || data.length !== 1) return { error: t("settings.errorProfile") };

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null, saved: true };
}

export async function updateClinic(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, staff, clinic } = await requireStaff();
  const { t } = await getT();
  if (!staff.isOwner) return { error: t("settings.clinic.ownerOnly") };

  const name = text(formData, "name");
  const address = text(formData, "address");
  const city = text(formData, "city");
  const phone = text(formData, "phone");

  if (name.length < 2 || name.length > 120) return { error: t("error.clinicName") };
  if (address.length > 300 || city.length > 80 || phone.length > 20) return { error: t("error.tooLong") };

  const { data, error } = await supabase
    .from("clinics")
    .update({ name, address: address || null, city: city || null, phone: phone || null })
    .eq("id", clinic.id)
    .select("id");
  if (error || !data || data.length !== 1) return { error: t("settings.errorClinic") };

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null, saved: true };
}
