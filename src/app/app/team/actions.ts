"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";

const ERRORS: Record<string, string> = {
  not_owner: "Only the clinic owner can do this.",
  invalid_email: "Please enter a valid email address.",
  invalid_name: "Please enter the person's full name (2 to 100 characters).",
  invalid_role: "Please choose a role.",
  already_staff: "That person already has access to this clinic.",
  already_invited: "That email already has a pending invitation.",
  not_found: "We could not find that item. Reload the page and try again.",
  cannot_change_owner: "You cannot change the owner's access.",
};

function friendly(message: string | undefined): string {
  const key = Object.keys(ERRORS).find((candidate) => message?.includes(candidate));
  return key ? ERRORS[key] : "Something went wrong. Please try again.";
}

export async function inviteStaff(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase, staff } = await requireStaff();
  if (!staff.isOwner) return { error: ERRORS.not_owner };

  const { error } = await supabase.rpc("invite_staff", {
    p_email: String(formData.get("email") ?? ""),
    p_full_name: String(formData.get("full_name") ?? ""),
    p_role: String(formData.get("role") ?? ""),
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath("/app/team");
  return { error: null, saved: true };
}

export async function revokeInvite(formData: FormData): Promise<void> {
  const { supabase, staff } = await requireStaff();
  if (!staff.isOwner) throw new Error(ERRORS.not_owner);

  const { error } = await supabase.rpc("revoke_staff_invite", {
    p_invite_id: String(formData.get("invite_id") ?? ""),
  });
  if (error) throw new Error(friendly(error.message));

  revalidatePath("/app/team");
}

export async function setStaffActive(formData: FormData): Promise<void> {
  const { supabase, staff } = await requireStaff();
  if (!staff.isOwner) throw new Error(ERRORS.not_owner);

  const { error } = await supabase.rpc("set_staff_active", {
    p_staff_id: String(formData.get("staff_id") ?? ""),
    p_active: formData.get("active") === "true",
  });
  if (error) throw new Error(friendly(error.message));

  revalidatePath("/app/team");
}
