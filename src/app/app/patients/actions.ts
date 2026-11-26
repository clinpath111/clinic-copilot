"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { interpretAge } from "@/lib/age";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import type { FormState } from "@/lib/form-state";
import type { ConsentState, PatientRow, PhoneCheck } from "@/lib/patient-types";
import { attachContactInfo, CONSENT_TEXT_VERSION, currentYearIST } from "@/lib/patients";
import { formatForDisplay, toE164 } from "@/lib/phone";

const FIELDS = "id, full_name, sex, birth_year, language, contact_id";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Search runs here (not through the web address) so names and phone numbers never appear in URLs.
export async function searchPatients(query: string): Promise<PatientRow[]> {
  const { supabase } = await requireStaff();
  const text = String(query ?? "").trim().slice(0, 100);

  if (text === "") {
    const { data, error } = await supabase
      .from("patients")
      .select(FIELDS)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw new Error("Unable to load patients.");
    return attachContactInfo(supabase, data ?? []);
  }

  const digits = text.replace(/[\s+\-()]/g, "");
  if (/^\d{4,}$/.test(digits)) {
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("id")
      .ilike("phone_e164", `%${digits}%`)
      .limit(50);
    if (contactsError) throw new Error("Unable to search patient phone numbers.");
    const ids = (contacts ?? []).map((c: { id: string }) => c.id);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from("patients")
      .select(FIELDS)
      .in("contact_id", ids)
      .order("full_name")
      .limit(25);
    if (error) throw new Error("Unable to search patients.");
    return attachContactInfo(supabase, data ?? []);
  }

  const pattern = `%${text.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
  const { data, error } = await supabase
    .from("patients")
    .select(FIELDS)
    .ilike("full_name", pattern)
    .order("full_name")
    .limit(25);
  if (error) throw new Error("Unable to search patients.");
  return attachContactInfo(supabase, data ?? []);
}

// Called while the receptionist types the phone number: is this family already registered?
export async function checkPhone(input: string): Promise<PhoneCheck> {
  const { supabase } = await requireStaff();
  const raw = String(input ?? "").trim();
  if (raw === "") return { status: "empty" };

  const e164 = toE164(raw);
  if (!e164) return { status: "invalid" };

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("id")
    .eq("phone_e164", e164)
    .maybeSingle();
  if (contactError) throw new Error("Unable to check the phone number.");

  let existing: { id: string; fullName: string; birthYear: number }[] = [];
  let consent: ConsentState = "none";
  let consentDate: string | null = null;

  if (contact) {
    const { data: people, error: peopleError } = await supabase
      .from("patients")
      .select("id, full_name, birth_year")
      .eq("contact_id", contact.id)
      .order("created_at");
    if (peopleError) throw new Error("Unable to load family members.");
    existing = (people ?? []).map((p: { id: string; full_name: string; birth_year: number }) => ({
      id: p.id,
      fullName: p.full_name,
      birthYear: p.birth_year,
    }));

    const { data: latest, error: consentError } = await supabase
      .from("consents")
      .select("status, created_at")
      .eq("contact_id", contact.id)
      .eq("purpose", "whatsapp_messages")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (consentError) throw new Error("Unable to load the WhatsApp consent status.");
    if (latest) {
      consent = latest.status as ConsentState;
      consentDate = latest.created_at as string;
    }
  }

  return { status: "ok", display: formatForDisplay(e164), existing, consent, consentDate };
}

const ERROR_KEYS: Record<string, MessageKey> = {
  invalid_phone: "patients.err.phone",
  invalid_birth_year: "patients.err.age",
  invalid_name: "error.name",
  duplicate_patient: "patients.err.duplicate",
};

export async function registerPatient(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireStaff();
  const { t } = await getT();

  const phone = toE164(String(formData.get("phone") ?? ""));
  if (!phone) return { error: t("patients.err.phone") };

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (fullName.length < 2 || fullName.length > 100) return { error: t("error.name") };

  const age = interpretAge(String(formData.get("age_or_year") ?? ""), currentYearIST());
  if (!age) return { error: t("patients.err.age") };

  const sexInput = String(formData.get("sex") ?? "");
  const sex = ["female", "male", "other"].includes(sexInput) ? sexInput : null;
  const language = formData.get("language") === "hi" ? "hi" : "en";
  const consent = formData.get("consent") === "yes";

  const { data, error } = await supabase.rpc("register_patient", {
    p_phone: phone,
    p_full_name: fullName,
    p_sex: sex,
    p_birth_year: age.year,
    p_language: language,
    p_consent: consent,
    p_consent_text_version: CONSENT_TEXT_VERSION,
  });

  if (error) {
    const code = Object.keys(ERROR_KEYS).find((c) => error.message?.includes(c));
    return { error: t(code ? ERROR_KEYS[code] : "error.generic") };
  }

  const patientId = (data as { patient_id?: string } | null)?.patient_id;
  if (!patientId) return { error: t("error.generic") };

  revalidatePath("/app/patients");
  redirect(`/app/patients/${patientId}`);
}

// Consent is only ever ADDED as a new record. Withdrawing is a new record too.
export async function recordConsent(formData: FormData): Promise<void> {
  const { supabase, staff } = await requireStaff();

  const patientId = String(formData.get("patient_id") ?? "");
  const contactId = String(formData.get("contact_id") ?? "");
  const requested = String(formData.get("status") ?? "");
  const status = requested === "granted" || requested === "withdrawn" ? requested : null;
  if (!status || !UUID.test(patientId) || !UUID.test(contactId)) {
    throw new Error("Invalid consent update.");
  }

  const { data: latest, error: latestError } = await supabase
    .from("consents")
    .select("status")
    .eq("contact_id", contactId)
    .eq("purpose", "whatsapp_messages")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw new Error("Unable to load the WhatsApp consent status.");
  if ((latest?.status ?? "none") === status) return;

  const { error } = await supabase.from("consents").insert({
    clinic_id: staff.clinicId,
    contact_id: contactId,
    purpose: "whatsapp_messages",
    status,
    method: "staff_entry",
    text_version: CONSENT_TEXT_VERSION,
    captured_by: staff.id,
  });
  if (error) throw new Error("Unable to record WhatsApp consent.");

  revalidatePath(`/app/patients/${patientId}`);
  revalidatePath("/app/patients");
}
