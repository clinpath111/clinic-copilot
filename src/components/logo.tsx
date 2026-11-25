export function LogoMark({
  size = 36,
  tone = "brand",
}: {
  size?: number;
  tone?: "brand" | "light";
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="10" className={tone === "brand" ? "fill-primary" : "fill-white"} />
      <path
        d="M18 9v18M9 18h18"
        className={tone === "brand" ? "stroke-white" : "stroke-primary"}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
