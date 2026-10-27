export const CONSENT_KEY = "sdt-consent";
export type ConsentChoice = "accepted" | "declined";

export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // storage unavailable; choice applies for this page view only
  }
}

/** True only when the visitor explicitly accepted. No analytics is loaded by the site today. */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return readConsent() === "accepted";
}
