"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { format, messages, type Locale, type MessageKey } from "./messages";

function subscribe(onChange: () => void) {
  window.addEventListener("langchange", onChange);
  return () => window.removeEventListener("langchange", onChange);
}

const readCookie = (): Locale => (document.cookie.split("; ").includes("lang=hi") ? "hi" : "en");
const serverLocale = (): Locale => "en";

const LocaleContext = createContext<Locale>("en");

// Pass `locale` from a server page, or leave it out to read the language cookie in the browser.
export function I18nProvider({ locale, children }: { locale?: Locale; children: ReactNode }) {
  const fromCookie = useSyncExternalStore(subscribe, readCookie, serverLocale);
  return <LocaleContext.Provider value={locale ?? fromCookie}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT() {
  const locale = useLocale();
  return useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      format(messages[locale][key], vars),
    [locale]
  );
}
