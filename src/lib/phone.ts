import { parsePhoneNumberFromString } from "libphonenumber-js/max";

// Returns the number in international form like +919876543210, or null if it is not a real number.
// Numbers without a country code are treated as Indian.
export function toE164(input: string): string | null {
  const parsed = parsePhoneNumberFromString(input.trim(), "IN");
  return parsed && parsed.isValid() ? parsed.number : null;
}

export function formatForDisplay(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164);
  return parsed ? parsed.formatInternational() : e164;
}
