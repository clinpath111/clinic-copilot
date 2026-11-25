import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/app/actions";
import type { Role } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n/client";
import { getT } from "@/lib/i18n/server";
import { LanguageToggle } from "./language-toggle";
import { LogoMark } from "./logo";
import { BottomNav, SideNav, type NavItem } from "./nav";
import { Button } from "./ui/button";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export async function AppShell({
  clinicName,
  fullName,
  role,
  isOwner,
  children,
}: {
  clinicName: string;
  fullName: string;
  role: Role;
  isOwner: boolean;
  children: ReactNode;
}) {
  const { locale, t } = await getT();

  const items: NavItem[] = [
    { href: "/app", label: t("nav.home"), icon: "home" },
    ...(isOwner
      ? ([
          { href: "/app/team", label: t("nav.team"), icon: "team" },
          { href: "/app/activity", label: t("nav.activity"), icon: "activity" },
        ] as NavItem[])
      : []),
    { href: "/app/settings", label: t("nav.settings"), icon: "settings" },
  ];

  const roleText = `${t(`role.${role}`)}${isOwner ? ` · ${t("role.owner")}` : ""}`;

  return (
    <I18nProvider locale={locale}>
      <div lang={locale} className="min-h-dvh md:grid md:grid-cols-[17rem_1fr]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:shadow-pop"
        >
          {t("skip")}
        </a>

        {/* Desktop sidebar */}
        <aside className="hidden border-r border-line bg-surface p-5 md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </div>

          <div className="mt-6 rounded-control bg-canvas p-3">
            <p className="truncate text-sm font-semibold">{clinicName}</p>
            <p className="truncate text-xs text-ink-faint">{roleText}</p>
          </div>

          <SideNav items={items} label={t("nav.main")} />

          <div className="mt-auto flex flex-col gap-3">
            <LanguageToggle />
            <div className="flex items-center gap-3 rounded-control p-2">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-ink"
              >
                {initials(fullName)}
              </span>
              <p className="min-w-0 truncate text-sm font-semibold">{fullName}</p>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="ghost" full>
                <LogOut size={18} aria-hidden="true" />
                {t("account.signOut")}
              </Button>
            </form>
          </div>
        </aside>

        <div className="flex min-h-dvh flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur md:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <LogoMark size={32} />
              <p className="truncate text-base font-semibold">{clinicName}</p>
            </div>
            <LanguageToggle compact />
          </header>

          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6 outline-none md:px-8 md:pb-12 md:pt-10"
          >
            {children}
          </main>

          <BottomNav items={items} label={t("nav.main")} />
        </div>
      </div>
    </I18nProvider>
  );
}
