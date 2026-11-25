import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type Tone = "info" | "success" | "warning" | "danger";

const styles: Record<Tone, string> = {
  info: "border-info/30 bg-info-soft text-info",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle } as const;

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
}) {
  const Icon = icons[tone];
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={`flex gap-3 rounded-control border p-4 ${styles[tone]}`}
    >
      <Icon size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="min-w-0 text-base">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="mt-0.5 text-ink">{children}</div>}
      </div>
    </div>
  );
}
