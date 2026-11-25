"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/messages";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिन्दी" },
];

function setLanguageCookie(locale: Locale) {
  document.cookie = `lang=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const locale = useLocale();

  function choose(next: Locale) {
    setLanguageCookie(next);
    window.dispatchEvent(new Event("langchange"));
    router.refresh();
  }

  return (
    <div role="group" aria-label="Language" className="inline-flex rounded-full border border-line-strong bg-surface p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => choose(option.code)}
          aria-pressed={locale === option.code}
          className={`rounded-full font-semibold transition-colors ${
            compact ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm"
          } ${locale === option.code ? "bg-primary text-white" : "text-ink-soft hover:text-ink"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
