import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "doctor" | "receptionist";

export async function requireSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return { supabase, user: data.user };
}

export async function requireStaff(allowedRoles?: Role[]) {
  const { supabase, user } = await requireSession();

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select(
      "id, clinic_id, full_name, role, is_owner, qualifications, registration_number, registration_council, signature_updated_at"
    )
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (staffError) throw new Error("Unable to load staff membership.");
  if (!staff) redirect("/app/onboarding");

  const role = staff.role as Role;
  if (allowedRoles && !allowedRoles.includes(role)) redirect("/app?denied=1");

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("id", staff.clinic_id)
    .maybeSingle();

  if (clinicError) throw new Error("Unable to load clinic details.");
  if (!clinic) redirect("/app/onboarding");

  const qualifications = (staff.qualifications ?? "") as string;
  const registrationNumber = (staff.registration_number ?? "") as string;
  const registrationCouncil = (staff.registration_council ?? "") as string;
  const signatureUpdatedAt = (staff.signature_updated_at ?? null) as string | null;

  return {
    supabase,
    userId: user.id,
    staff: {
      id: staff.id as string,
      fullName: staff.full_name as string,
      role,
      isOwner: Boolean(staff.is_owner),
      clinicId: staff.clinic_id as string,
      qualifications,
      registrationNumber,
      registrationCouncil,
      signatureUpdatedAt,
      profileComplete:
        role !== "doctor" ||
        Boolean(qualifications && registrationNumber && registrationCouncil && signatureUpdatedAt),
    },
    clinic: { id: clinic.id as string, name: clinic.name as string },
  };
}
