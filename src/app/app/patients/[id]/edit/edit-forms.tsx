"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { interpretAge } from "@/lib/age";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { TextField } from "@/components/ui/text-field";
import { changePhone, updatePatient } from "../../actions";
import { usePhoneCheck } from "../../use-phone-check";

const initial: FormState = { error: null };

export function EditForm({
  patientId,
  currentYear,
  defaults,
}: {
  patientId: string;
  currentYear: number;
  defaults: { fullName: string; birthYear: string; sex: string; language: "en" | "hi" };
}) {
  const t = useT();
  const [state, action, pending] = useActionState(updatePatient, initial);
  const [fullName, setFullName] = useState(defaults.fullName);
  const [ageText, setAgeText] = useState(defaults.birthYear);
  const [sex, setSex] = useState(defaults.sex);
  const [language, setLanguage] = useState<"en" | "hi">(defaults.language);

  const age = interpretAge(ageText, currentYear);
  const ageError = ageText.trim() !== "" && !age;

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="patient_id" value={patientId} />
      <TextField
        id="edit_full_name"
        name="full_name"
        required
        maxLength={100}
        autoComplete="off"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        label={t("register.name.label")}
      />
      <TextField
        id="edit_age_or_year"
        name="age_or_year"
        required
        inputMode="numeric"
        maxLength={4}
        autoComplete="off"
        value={ageText}
        onChange={(e) => setAgeText(e.target.value)}
        label={t("register.age.label")}
        hint={age ? t("register.age.result", { year: age.year, age: age.age }) : t("register.age.hint")}
        error={ageError ? t("patients.err.age") : undefined}
      />
      <ChoiceChips
        name="sex"
        legend={t("register.sex.label")}
        value={sex}
        onChange={setSex}
        options={[
          { value: "female", label: t("patients.sex.female") },
          { value: "male", label: t("patients.sex.male") },
          { value: "other", label: t("patients.sex.other") },
        ]}
      />
      <ChoiceChips
        name="language"
        legend={t("register.lang.label")}
        value={language}
        onChange={(value) => setLanguage(value === "hi" ? "hi" : "en")}
        options={[
          { value: "en", label: t("patients.lang.en") },
          { value: "hi", label: t("patients.lang.hi") },
        ]}
      />
      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? t("common.saving") : t("edit.save")}
      </Button>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
    </form>
  );
}

export function ChangePhoneForm({
  patientId,
  currentYear,
}: {
  patientId: string;
  currentYear: number;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(changePhone, initial);
  const { phone, check, onChange, onBlur } = usePhoneCheck();
  const ok = check.status === "ok" ? check : null;

  return (
    <form action={action} className="mt-5 flex flex-col gap-4">
      <input type="hidden" name="patient_id" value={patientId} />
      <TextField
        id="new_phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="off"
        required
        value={phone}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        label={t("edit.phone.new")}
        hint={t("register.phone.hint")}
        error={check.status === "invalid" ? t("register.phone.invalid") : undefined}
      />

      {ok && ok.existing.length > 0 && (
        <Alert tone="info" title={t("register.phone.existing")}>
          <ul className="mt-1 flex flex-col gap-1">
            {ok.existing.map((p) => (
              <li key={p.id}>
                <Link href={`/app/patients/${p.id}`} className="font-semibold underline">
                  {p.fullName}
                </Link>{" "}
                <span className="text-ink-soft">
                  ({t("patients.age", { age: currentYear - p.birthYear })})
                </span>
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {ok?.landline && <Alert tone="warning">{t("register.phone.landline")}</Alert>}

      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? t("edit.phone.saving") : t("edit.phone.save")}
      </Button>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
    </form>
  );
}
