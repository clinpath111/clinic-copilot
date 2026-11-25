import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "info";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-canvas text-ink-soft",
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  info: "border-info/20 bg-info-soft text-info",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
