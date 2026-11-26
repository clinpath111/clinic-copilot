// Used by the browser and the server. Accepts an age (0 to 120) or a birth year.
export function interpretAge(
  input: string,
  currentYear: number
): { year: number; age: number } | null {
  const text = input.trim();
  if (!/^\d{1,4}$/.test(text)) return null;
  const n = Number(text);
  if (n <= 120) return { year: currentYear - n, age: n };
  if (n >= 1900 && n <= currentYear) return { year: n, age: currentYear - n };
  return null;
}
