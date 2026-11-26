import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/client";
import { getT } from "@/lib/i18n/server";
import { LanguageToggle } from "./language-toggle";
import { LogoMark } from "./logo";

export async function CenteredShell({ children }: { children: ReactNode }) {
  const { locale, t } = await getT();

  return (
    <I18nProvider locale={locale}>
      <div lang={locale} className="min-h-dvh px-5 py-6">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </div>
          <LanguageToggle compact />
        </div>
        <main className="mx-auto mt-10 max-w-md pb-10">{children}</main>
      </div>
    </I18nProvider>
  );
}
