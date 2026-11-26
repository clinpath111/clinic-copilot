"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { inviteStaff } from "./actions";

const initial: FormState = { error: null };

export function InviteForm() {
  const t = useT();
  const [state, action, pending] = useActionState(inviteStaff, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <TextField
        id="email"
        name="email"
        type="email"
        required
        maxLength={254}
        autoComplete="off"
        inputMode="email"
        label={t("team.invite.email")}
      />
      <TextField
        id="full_name"
        name="full_name"
        required
        maxLength={100}
        autoComplete="off"
        label={t("team.invite.name")}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-base font-medium text-ink">
          {t("team.invite.role")}
        </label>
        <select
          id="role"
          name="role"
          defaultValue="receptionist"
          className="h-14 w-full rounded-control border border-line-strong bg-surface px-4 text-lg text-ink hover:border-ink-faint"
        >
          <option value="receptionist">{t("role.receptionist")}</option>
          <option value="doctor">{t("role.doctor")}</option>
        </select>
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full md:w-auto">
        {pending ? t("team.invite.submitting") : t("team.invite.submit")}
      </Button>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.saved && <Alert tone="success">{t("team.invite.done")}</Alert>}
    </form>
  );
}
