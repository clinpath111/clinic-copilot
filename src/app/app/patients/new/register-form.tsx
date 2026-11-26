"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { interpretAge } from "@/lib/age";
import type { FormState } from "@/lib/form-state";
import { useLocale, useT } from "@/lib/i18n/client";
import { messages } from "@/lib/i18n/messages";
import type { PhoneCheck } from "@/lib/patient-types";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { TextField } from "@/components/ui/text-field";
import { checkPhone, registerPatient } from "../actions";

const initial: FormState = { error: null };

export function RegisterForm({ currentYear }: { currentYear: number }) {
  const t = useT();
  const locale = useLocale();
  const [state, action, pending] = useActionState(registerPatient, initial);

  const [phone, setPhone] = useState("");
  const [phoneCheck, setPhoneCheck] = useState<PhoneCheck>({ status: "empty" });
  const [fullName, setFullName] = useState("");
  const [ageText, setAgeText] = useState("");
  const [sex, setSex] = useState("");
  const [patientLang, setPatientLang] = useState<"en" | "hi">("en");
  const [consent, setConsent] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(0);

  const dateFormat = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  });

  function onPhoneChange(value: string) {
    setPhone(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.replace(/\D/g, "").length < 10) {
      setPhoneCheck({ status: "empty" });
      return;
    }
    timer.current = setTimeout(async () => {
      const ticket = ++latest.current;
      const result = await checkPhone(value);
      if (ticket === latest.current) setPhoneCheck(result);
    }, 300);
  }

  function onPhoneBlur() {
    if (phone.trim() !== "" && phoneCheck.status === "empty") setPhoneCheck({ status: "invalid" });
  }

  const age = interpretAge(ageText, currentYear);
  const ageError = ageText.trim() !== "" && !age;

  const consentGranted = phoneCheck.status === "ok" && phoneCheck.consent === "granted";
  const consentStopped = phoneCheck.status === "ok" && phoneCheck.consent === "withdrawn";
  const consentDate =
    phoneCheck.status === "ok" && phoneCheck.consentDate
      ? dateFormat.format(new Date(phoneCheck.consentDate))
      : "";

  return (
    <form action={action} className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-col gap-5">
          <div>
            <TextField
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              required
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              onBlur={onPhoneBlur}
              label={t("register.phone.label")}
              hint={t("register.phone.hint")}
              error={phoneCheck.status === "invalid" ? t("register.phone.invalid") : undefined}
            />

            {phoneCheck.status === "ok" && (
              <div className="mt-3">
                {phoneCheck.existing.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {t("register.phone.new")}
                  </p>
                ) : (
                  <Alert tone="info" title={t("register.phone.existing")}>
                    <ul className="mt-1 flex flex-col gap-1">
                      {phoneCheck.existing.map((p) => (
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
                    <p className="mt-2 text-ink-soft">{t("register.phone.family")}</p>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <TextField
            id="full_name"
            name="full_name"
            required
            maxLength={100}
            autoComplete="off"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            label={t("register.name.label")}
          />

          <TextField
            id="age_or_year"
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
            value={patientLang}
            onChange={(value) => setPatientLang(value === "hi" ? "hi" : "en")}
            options={[
              { value: "en", label: t("patients.lang.en") },
              { value: "hi", label: t("patients.lang.hi") },
            ]}
          />
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{t("register.consent.title")}</h2>
          <Badge tone="warning">{t("register.consent.draft")}</Badge>
        </div>

        {consentGranted ? (
          <div className="mt-4">
            <Alert tone="success">{t("register.consent.already", { date: consentDate })}</Alert>
          </div>
        ) : (
          <>
            {consentStopped && (
              <div className="mt-4">
                <Alert tone="warning">{t("register.consent.stopped", { date: consentDate })}</Alert>
              </div>
            )}
            <p lang={patientLang} className="mt-4 rounded-control bg-canvas p-4 text-base text-ink-soft">
              {messages[patientLang]["register.consent.text"]}
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-control border border-line-strong p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input
                type="checkbox"
                name="consent"
                value="yes"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-6 shrink-0 accent-primary"
              />
              <span className="text-base font-medium">
                {consentStopped ? t("register.consent.checkAgain") : t("register.consent.check")}
              </span>
            </label>
            <p className="mt-2 text-sm text-ink-faint">{t("register.consent.hint")}</p>
          </>
        )}
      </Card>

      {state.error && <Alert tone="danger">{state.error}</Alert>}

      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? t("register.saving") : t("register.save")}
      </Button>
    </form>
  );
}
