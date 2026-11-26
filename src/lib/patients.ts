import type { createClient } from "@/lib/supabase/server";
import type { ConsentState, PatientRow } from "./patient-types";
import { formatForDisplay } from "./phone";

type Db = Awaited<ReturnType<typeof createClient>>;

// Stored with every consent record. Change it whenever the consent wording changes.
// The wording is a DRAFT: needs lawyer review before real patients are asked.
export const CONSENT_TEXT_VERSION = "draft-v0";

export function currentYearIST(): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date())
  );
}

type DbPatient = {
  id: string;
  full_name: string;
  sex: string | null;
  birth_year: number;
  language: string;
  contact_id: string | null;
};

// Adds each patient's phone number and current WhatsApp consent state.
export async function attachContactInfo(supabase: Db, rows: DbPatient[]): Promise<PatientRow[]> {
  const contactIds = [
    ...new Set(rows.map((r) => r.contact_id).filter((id): id is string => Boolean(id))),
  ];
  const phones = new Map<string, string>();
  const consent = new Map<string, ConsentState>();

  if (contactIds.length > 0) {
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("id, phone_e164")
      .in("id", contactIds);
    if (contactsError) throw new Error("Unable to load patient contact details.");
    for (const c of contacts ?? []) phones.set(c.id as string, formatForDisplay(c.phone_e164 as string));

    const { data: consents, error: consentsError } = await supabase
      .from("consents")
      .select("contact_id, status, created_at")
      .eq("purpose", "whatsapp_messages")
      .in("contact_id", contactIds)
      .order("created_at", { ascending: false });
    if (consentsError) throw new Error("Unable to load patient consent details.");
    for (const c of consents ?? []) {
      const id = c.contact_id as string;
      if (!consent.has(id)) consent.set(id, c.status as ConsentState);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    sex: r.sex,
    birthYear: r.birth_year,
    language: r.language === "hi" ? "hi" : "en",
    phone: r.contact_id ? (phones.get(r.contact_id) ?? "") : "",
    consent: r.contact_id ? (consent.get(r.contact_id) ?? "none") : "none",
  }));
}
