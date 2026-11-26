"use client";

import { useActionState } from "react";
import type { Role } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { updateClinic, updateProfile } from "./actions";

const initial: FormState = { error: null };

export function ProfileForm({
  role,
  defaults,
}: {
  role: Role;
  defaults: {
    fullName: string;
    qualifications: string;
    registrationNumber: string;
    registrationCouncil: string;
  };
}) {
  const t = useT();
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <TextField
        id="full_name"
        name="full_name"
        required
        maxLength={100}
        defaultValue={defaults.fullName}
        label={t("settings.profile.fullName")}
      />
      {role === "doctor" && (
        <>
          <TextField
            id="qualifications"
            name="qualifications"
            maxLength={200}
            defaultValue={defaults.qualifications}
            label={t("settings.profile.qualifications")}
            hint={t("settings.profile.qualificationsHint")}
          />
          <TextField
            id="registration_number"
            name="registration_number"
            maxLength={50}
            defaultValue={defaults.registrationNumber}
            label={t("settings.profile.registration")}
            hint={t("settings.profile.registrationHint")}
          />
          <TextField
            id="registration_council"
            name="registration_council"
            maxLength={100}
            defaultValue={defaults.registrationCouncil}
            label={t("settings.profile.council")}
            hint={t("settings.profile.councilHint")}
          />
        </>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full md:w-auto">
        {pending ? t("common.saving") : t("settings.profile.save")}
      </Button>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.saved && <Alert tone="success">{t("common.saved")}</Alert>}
    </form>
  );
}

export function ClinicForm({
  defaults,
}: {
  defaults: { name: string; address: string; city: string; phone: string };
}) {
  const t = useT();
  const [state, action, pending] = useActionState(updateClinic, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <TextField
        id="name"
        name="name"
        required
        maxLength={120}
        defaultValue={defaults.name}
        label={t("settings.clinic.name")}
      />
      <TextField
        id="address"
        name="address"
        maxLength={300}
        defaultValue={defaults.address}
        label={t("settings.clinic.address")}
      />
      <TextField
        id="city"
        name="city"
        maxLength={80}
        defaultValue={defaults.city}
        label={t("settings.clinic.city")}
      />
      <TextField
        id="phone"
        name="phone"
        type="tel"
        inputMode="tel"
        maxLength={20}
        defaultValue={defaults.phone}
        label={t("settings.clinic.phone")}
      />
      <Button type="submit" size="lg" disabled={pending} className="w-full md:w-auto">
        {pending ? t("common.saving") : t("settings.clinic.save")}
      </Button>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.saved && <Alert tone="success">{t("common.saved")}</Alert>}
    </form>
  );
}
