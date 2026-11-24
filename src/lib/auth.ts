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

  const { data: staff } = await supabase
    .from("staff")
    .select("id, clinic_id, full_name, role, is_owner")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!staff) redirect("/app/no-clinic");

  const role = staff.role as Role;
  if (allowedRoles && !allowedRoles.includes(role)) redirect("/app?denied=1");

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("id", staff.clinic_id)
    .maybeSingle();

  if (!clinic) redirect("/app/no-clinic");

  return {
    supabase,
    userId: user.id,
    staff: {
      id: staff.id as string,
      fullName: staff.full_name as string,
      role,
      isOwner: Boolean(staff.is_owner),
      clinicId: staff.clinic_id as string,
    },
    clinic: { id: clinic.id as string, name: clinic.name as string },
  };
}
