import Link from "next/link";
import { Circle, CheckCircle2, LogOut, Search, Sparkles, UserPlus } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { AppShell } from "@/components/app-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { signOut } from "./actions";

export const instant = false;

function greetingPart(): "morning" | "afternoon" | "evening" {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  const { staff, clinic } = await requireStaff();
  const { t } = await getT();

  const setupItems: { key: MessageKey; done: boolean }[] =
    staff.role === "doctor"
      ? [
          { key: "setup.item.qualifications", done: Boolean(staff.qualifications) },
          { key: "setup.item.registration", done: Boolean(staff.registrationNumber) },
          { key: "setup.item.council", done: Boolean(staff.registrationCouncil) },
          { key: "setup.item.signature", done: Boolean(staff.signatureUpdatedAt) },
        ]
      : [];
  const doneCount = setupItems.filter((item) => item.done).length;

  return (
    <AppShell
      clinicName={clinic.name}
      fullName={staff.fullName}
      role={staff.role}
      isOwner={staff.isOwner}
    >
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t(`home.greeting.${greetingPart()}`, { name: staff.fullName })}
          </h1>
          <p className="mt-2 text-lg text-ink-soft">{t("home.subtitle", { clinic: clinic.name })}</p>
        </header>

        {denied && <Alert tone="danger">{t("home.denied")}</Alert>}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/app/patients/new" className={buttonClasses("primary", "lg", true)}>
            <UserPlus size={20} aria-hidden="true" />
            {t("home.addPatient")}
          </Link>
          <Link href="/app/patients" className={buttonClasses("secondary", "lg", true)}>
            <Search size={20} aria-hidden="true" />
            {t("home.findPatient")}
          </Link>
        </div>

        {staff.role === "doctor" &&
          (staff.profileComplete ? (
            <Alert tone="success" title={t("setup.done.title")}>
              {t("setup.done.body")}
            </Alert>
          ) : (
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{t("setup.title")}</h2>
                  <p className="mt-1 text-base text-ink-soft">{t("setup.subtitle")}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-ink-soft">
                  {t("setup.progress", { done: doneCount, total: setupItems.length })}
                </p>
              </div>

              <div className="mt-4">
                <ProgressBar value={doneCount} max={setupItems.length} label={t("setup.title")} />
              </div>

              <ul className="mt-5 flex flex-col gap-3">
                {setupItems.map((item) => (
                  <li key={item.key} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 size={22} aria-hidden="true" className="shrink-0 text-success" />
                    ) : (
                      <Circle size={22} aria-hidden="true" className="shrink-0 text-line-strong" />
                    )}
                    <span className={`flex-1 text-base ${item.done ? "text-ink-soft" : "font-medium"}`}>
                      {t(item.key)}
                    </span>
                    <Badge tone={item.done ? "success" : "neutral"}>
                      {item.done ? t("status.done") : t("status.todo")}
                    </Badge>
                  </li>
                ))}
              </ul>

              <Link href="/app/settings" className={`${buttonClasses("primary", "lg", true)} mt-6`}>
                {t("setup.cta")}
              </Link>
            </Card>
          ))}

        {staff.role === "receptionist" && (
          <Card>
            <h2 className="text-xl font-semibold tracking-tight">
              {t("reception.title", { clinic: clinic.name })}
            </h2>
            <p className="mt-1 text-base text-ink-soft">{t("reception.body")}</p>
          </Card>
        )}

        <div className="rounded-card border border-dashed border-line-strong p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} aria-hidden="true" className="text-primary" />
            <h2 className="text-base font-semibold">{t("soon.title")}</h2>
          </div>
          <p className="mt-1 text-base text-ink-soft">{t("soon.body")}</p>
        </div>

        {/* Account card: phones only (desktop has this in the sidebar) */}
        <Card className="md:hidden">
          <h2 className="text-base font-semibold">{t("account.title")}</h2>
          <p className="mt-1 text-base text-ink-soft">{staff.fullName}</p>
          <form action={signOut} className="mt-4">
            <Button type="submit" variant="secondary" full>
              <LogOut size={18} aria-hidden="true" />
              {t("account.signOut")}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
