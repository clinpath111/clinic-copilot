"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { I18nProvider, useLocale, useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import { LanguageToggle } from "@/components/language-toggle";
import { LogoMark } from "@/components/logo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";

function LoginView() {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorKey(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setErrorKey(error.status === 429 ? "login.error.rate" : "login.error.send");
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorKey(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) {
      setErrorKey("login.error.code");
      return;
    }
    router.replace("/app");
    router.refresh();
  }

  return (
    <div lang={locale} className="min-h-dvh md:grid md:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-primary to-primary-ink p-12 text-white md:flex md:flex-col md:justify-between">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3">
          <LogoMark tone="light" />
          <span className="text-xl font-semibold tracking-tight">{t("app.name")}</span>
        </div>
        <div className="relative">
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">{t("login.hero")}</h2>
          <p className="mt-4 max-w-md text-lg text-white/85">{t("login.heroSub")}</p>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/85">
          <ShieldCheck size={18} aria-hidden="true" />
          {t("login.trust")}
        </p>
      </aside>

      <main className="flex min-h-dvh flex-col px-5 py-6 md:min-h-0 md:px-12">
        <div className="flex items-center justify-between md:justify-end">
          <div className="flex items-center gap-3 md:hidden">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </div>
          <LanguageToggle compact />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t("login.title")}</h1>
          <p className="mt-2 text-lg text-ink-soft">{t("login.subtitle")}</p>

          <Card className="mt-8">
            {step === "email" ? (
              <form onSubmit={sendCode} className="flex flex-col gap-5">
                <TextField
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  label={t("login.email.label")}
                  hint={t("login.email.hint")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" size="lg" full disabled={busy}>
                  {busy ? t("login.sending") : t("login.sendCode")}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="flex flex-col gap-5">
                <p className="text-base text-ink-soft">{t("login.code.sent", { email })}</p>
                <TextField
                  id="code"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  label={t("login.code.label")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-2xl font-semibold tracking-[0.3em]"
                />
                <Button type="submit" size="lg" full disabled={busy}>
                  {busy ? t("login.verifying") : t("login.verify")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  full
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setErrorKey(null);
                  }}
                >
                  {t("login.useOther")}
                </Button>
              </form>
            )}
          </Card>

          {errorKey && (
            <div className="mt-4">
              <Alert tone="danger">{t(errorKey)}</Alert>
            </div>
          )}

          <p className="mt-6 flex items-center gap-2 text-sm text-ink-faint md:hidden">
            <ShieldCheck size={16} aria-hidden="true" />
            {t("login.trust")}
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <I18nProvider>
      <LoginView />
    </I18nProvider>
  );
}
