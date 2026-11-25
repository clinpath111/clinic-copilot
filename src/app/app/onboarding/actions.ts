"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";

export async function createClinic(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await requireSession();

  const clinicName = String(formData.get("clinic_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (clinicName.length < 2 || clinicName.length > 120) {
    return { error: "Please enter the clinic name (2 to 120 characters)." };
  }
  if (fullName.length < 2 || fullName.length > 100) {
    return { error: "Please enter your full name (2 to 100 characters)." };
  }

  const { error } = await supabase.rpc("create_my_clinic", {
    p_clinic_name: clinicName,
    p_full_name: fullName,
  });
  if (error) return { error: "We could not create the clinic. Please try again." };

  redirect("/app");
}
