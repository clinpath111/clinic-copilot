"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Search, UserPlus, UsersRound } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { ConsentState, PatientRow } from "@/lib/patient-types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { searchPatients } from "./actions";

const CONSENT_LABEL: Record<ConsentState, MessageKey> = {
  granted: "consent.granted",
  withdrawn: "consent.withdrawn",
  none: "consent.none",
};
const CONSENT_TONE = { granted: "success", withdrawn: "warning", none: "neutral" } as const;
const SEX_LABEL: Record<string, MessageKey> = {
  female: "patients.sex.female",
  male: "patients.sex.male",
  other: "patients.sex.other",
};

export function PatientSearch({
  initialRows,
  currentYear,
}: {
  initialRows: PatientRow[];
  currentYear: number;
}) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(initialRows);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(0);

  function onChange(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const ticket = ++latest.current;
      startTransition(async () => {
        const result = await searchPatients(value);
        if (ticket === latest.current) setRows(result);
      });
    }, 250);
  }

  return (
    <div>
      <div className="relative">
        <label htmlFor="patient-search" className="sr-only">
          {t("patients.search.label")}
        </label>
        <Search
          aria-hidden="true"
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          id="patient-search"
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("patients.search.placeholder")}
          autoComplete="off"
          className="h-14 w-full rounded-control border border-line-strong bg-surface pl-12 pr-4 text-lg text-ink placeholder:text-ink-faint hover:border-ink-faint"
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {isPending ? t("patients.loading") : t("patients.count", { count: rows.length })}
      </p>

      <div className="mt-5">
        {rows.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
              <UsersRound size={28} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight">
              {query.trim() === "" ? t("patients.empty.title") : t("patients.noMatch")}
            </h2>
            {query.trim() === "" && (
              <p className="max-w-sm text-base text-ink-soft">{t("patients.empty.body")}</p>
            )}
            <Link href="/app/patients/new" className={`${buttonClasses("primary", "lg")} mt-2`}>
              <UserPlus size={20} aria-hidden="true" />
              {t("patients.add")}
            </Link>
          </Card>
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-line">
              {rows.map((p) => {
                const meta = [
                  t("patients.age", { age: currentYear - p.birthYear }),
                  p.sex && SEX_LABEL[p.sex] ? t(SEX_LABEL[p.sex]) : null,
                  p.phone,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={p.id}>
                    <Link
                      href={`/app/patients/${p.id}`}
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-canvas"
                    >
                      <Avatar name={p.fullName} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold">{p.fullName}</p>
                        <p className="truncate text-sm text-ink-soft">{meta}</p>
                      </div>
                      <span className="hidden shrink-0 sm:block">
                        <Badge tone={CONSENT_TONE[p.consent]}>{t(CONSENT_LABEL[p.consent])}</Badge>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
