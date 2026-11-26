"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { createClinic } from "./actions";

const initial: FormState = { error: null };

export function OnboardingForm() {
  const t = useT();
  const [state, action, pending] = useActionState(createClinic, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <TextField
        id="clinic_name"
        name="clinic_name"
        required
        maxLength={120}
        label={t("onboarding.clinicName")}
      />
      <TextField
        id="full_name"
        name="full_name"
        required
        maxLength={100}
        label={t("onboarding.fullName")}
      />
      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? t("onboarding.creating") : t("onboarding.create")}
      </Button>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
    </form>
  );
}
