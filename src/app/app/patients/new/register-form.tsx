"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { interpretAge, isPossiblyMinor } from "@/lib/age";
import type { FormState } from "@/lib/form-state";
import { useLocale, useT } from "@/lib/i18n/client";
import { messages } from "@/lib/i18n/messages";
import type { SimilarPatient } from "@/lib/patient-types";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { TextField } from "@/components/ui/text-field";
import { checkSimilar, registerPatient } from "../actions";
import { usePhoneCheck } from "../use-phone-check";

const initial: FormState = { error: null };

export function RegisterForm({ currentYear }: { currentYear: number }) {
  const t = useT();
  const locale = useLocale();
  const [state, action, pending] = useActionState(registerPatient, initial);
  const { phone, check, onChange: onPhoneChange, onBlur: onPhoneBlur } = usePhoneCheck();

  const [fullName, setFullName] = useState("");
  const [ageText, setAgeText] = useState("");
  const [sex, setSex] = useState("");
  const [patientLang, setPatientLang] = useState<"en" | "hi">("en");
  const [consent, setConsent] = useState(false);
  const [similar, setSimilar] = useState<SimilarPatient[]>([]);
  const similarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const similarLatest = useRef(0);

  const dateFormat = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  });

  function refreshSimilar(name: string, ageValue: string) {
    if (similarTimer.current) clearTimeout(similarTimer.current);
    if (name.trim().length < 2 || !interpretAge(ageValue, currentYear)) {
      similarLatest.current += 1;
      setSimilar([]);
      return;
    }
    const ticket = ++similarLatest.current;
    similarTimer.current = setTimeout(async () => {
      const result = await checkSimilar(name, ageValue);
      if (ticket === similarLatest.current) setSimilar(result);
    }, 400);
  }

  const age = interpretAge(ageText, currentYear);
  const ageError = ageText.trim() !== "" && !age;
  const isMinor = age ? isPossiblyMinor(age.year, currentYear) : false;

  const ok = check.status === "ok" ? check : null;
  const landline = ok?.landline ?? false;
  const consentGranted = ok?.consent === "granted";
  const consentStopped = ok?.consent === "withdrawn";
  const consentDate = ok?.consentDate ? dateFormat.format(new Date(ok.consentDate)) : "";
  const similarElsewhere = similar.filter((s) => !ok || s.phone !== ok.display);

  const consentTextKey = isMinor ? "register.consent.textMinor" : "register.consent.text";
  const consentCheckLabel = consentStopped
    ? t("register.consent.checkAgain")
    : isMinor
      ? t("register.consent.checkMinor")
      : t("register.consent.check");

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
              error={check.status === "invalid" ? t("register.phone.invalid") : undefined}
            />

            {ok && (
              <div className="mt-3 flex flex-col gap-3">
                {ok.existing.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {t("register.phone.new")}
                  </p>
                ) : (
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
                    <p className="mt-2 text-ink-soft">{t("register.phone.family")}</p>
                  </Alert>
                )}
                {landline && <Alert tone="warning">{t("register.phone.landline")}</Alert>}
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
            onChange={(e) => {
              setFullName(e.target.value);
              refreshSimilar(e.target.value, ageText);
            }}
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
            onChange={(e) => {
              setAgeText(e.target.value);
              refreshSimilar(fullName, e.target.value);
            }}
            label={t("register.age.label")}
            hint={age ? t("register.age.result", { year: age.year, age: age.age }) : t("register.age.hint")}
            error={ageError ? t("patients.err.age") : undefined}
          />

          {similarElsewhere.length > 0 && (
            <Alert tone="warning" title={t("register.similar.title")}>
              <ul className="mt-1 flex flex-col gap-1">
                {similarElsewhere.map((s) => (
                  <li key={s.id}>
                    <Link href={`/app/patients/${s.id}`} className="font-semibold underline">
                      {s.fullName}
                    </Link>{" "}
                    <span className="text-ink-soft">
                      ({t("patients.age", { age: currentYear - s.birthYear })} · {s.phone})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-ink-soft">{t("register.similar.body")}</p>
            </Alert>
          )}

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

      {!landline && (
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
              {isMinor && (
                <div className="mt-4">
                  <Alert tone="info">{t("register.consent.minorNote")}</Alert>
                </div>
              )}
              <p lang={patientLang} className="mt-4 rounded-control bg-canvas p-4 text-base text-ink-soft">
                {messages[patientLang][consentTextKey]}
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
                <span className="text-base font-medium">{consentCheckLabel}</span>
              </label>
              <p className="mt-2 text-sm text-ink-faint">{t("register.consent.hint")}</p>
            </>
          )}
        </Card>
      )}

      {state.error && <Alert tone="danger">{state.error}</Alert>}

      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? t("register.saving") : t("register.save")}
      </Button>
    </form>
  );
}
