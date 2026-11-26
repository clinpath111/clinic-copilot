"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import type { FormState } from "@/lib/form-state";

export async function createClinic(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireSession();
  const { t } = await getT();

  const clinicName = String(formData.get("clinic_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (clinicName.length < 2 || clinicName.length > 120) return { error: t("error.clinicName") };
  if (fullName.length < 2 || fullName.length > 100) return { error: t("error.name") };

  const { error } = await supabase.rpc("create_my_clinic", {
    p_clinic_name: clinicName,
    p_full_name: fullName,
  });
  if (error) return { error: t("onboarding.error") };

  redirect("/app");
}
