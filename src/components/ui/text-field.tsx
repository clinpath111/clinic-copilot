import type { InputHTMLAttributes } from "react";

export function TextField({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={error ? true : undefined}
        className={`h-14 w-full rounded-control border bg-surface px-4 text-lg text-ink transition-colors placeholder:text-ink-faint ${
          error ? "border-danger" : "border-line-strong hover:border-ink-faint"
        } ${className}`}
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-sm text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
