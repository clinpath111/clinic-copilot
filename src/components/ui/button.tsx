import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 select-none disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-canvas",
  danger: "bg-danger text-white hover:opacity-90",
  ghost: "text-ink-soft hover:bg-primary-soft hover:text-primary-ink",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-lg",
};

// Also use this on <Link> so links and buttons look identical.
export function buttonClasses(variant: Variant = "primary", size: Size = "md", full = false) {
  return [base, variants[variant], sizes[size], full ? "w-full" : ""].filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; full?: boolean }) {
  return <button className={`${buttonClasses(variant, size, full)} ${className}`} {...props} />;
}
