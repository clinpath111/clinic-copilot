import { cookies } from "next/headers";
import { format, messages, type Locale, type MessageKey } from "./messages";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("lang")?.value === "hi" ? "hi" : "en";
}

export async function getT() {
  const locale = await getLocale();
  const t = (key: MessageKey, vars?: Record<string, string | number>) =>
    format(messages[locale][key], vars);
  return { locale, t };
}
