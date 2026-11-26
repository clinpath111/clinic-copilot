import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-card border border-line bg-surface shadow-card ${padded ? "p-5 md:p-6" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
