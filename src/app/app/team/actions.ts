"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import type { FormState } from "@/lib/form-state";

// The database functions raise these short codes; we show a friendly sentence in the user's language.
const ERROR_KEYS: Record<string, MessageKey> = {
  not_owner: "team.err.notOwner",
  invalid_email: "team.err.email",
  invalid_name: "team.err.name",
  invalid_role: "team.err.role",
  already_staff: "team.err.already",
  already_invited: "team.err.invited",
  not_found: "team.err.notFound",
  cannot_change_owner: "team.err.owner",
};

function errorKeyFor(message: string | undefined): MessageKey {
  const code = Object.keys(ERROR_KEYS).find((c) => message?.includes(c));
  return code ? ERROR_KEYS[code] : "error.generic";
}

export async function inviteStaff(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, staff } = await requireStaff();
  const { t } = await getT();
  if (!staff.isOwner) return { error: t("team.err.notOwner") };

  const { error } = await supabase.rpc("invite_staff", {
    p_email: String(formData.get("email") ?? ""),
    p_full_name: String(formData.get("full_name") ?? ""),
    p_role: String(formData.get("role") ?? ""),
  });
  if (error) return { error: t(errorKeyFor(error.message)) };

  revalidatePath("/app/team");
  return { error: null, saved: true };
}

export async function revokeInvite(formData: FormData): Promise<void> {
  const { supabase, staff } = await requireStaff();
  const { t } = await getT();
  if (!staff.isOwner) throw new Error(t("team.err.notOwner"));

  const { error } = await supabase.rpc("revoke_staff_invite", {
    p_invite_id: String(formData.get("invite_id") ?? ""),
  });
  if (error) throw new Error(t(errorKeyFor(error.message)));

  revalidatePath("/app/team");
}

export async function setStaffActive(formData: FormData): Promise<void> {
  const { supabase, staff } = await requireStaff();
  const { t } = await getT();
  if (!staff.isOwner) throw new Error(t("team.err.notOwner"));

  const { error } = await supabase.rpc("set_staff_active", {
    p_staff_id: String(formData.get("staff_id") ?? ""),
    p_active: formData.get("active") === "true",
  });
  if (error) throw new Error(t(errorKeyFor(error.message)));

  revalidatePath("/app/team");
}
