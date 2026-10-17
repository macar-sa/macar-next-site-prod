import Cookies from "js-cookie";

// Visitor's cookie choice: stored in one cookie, broadcast to the page through DOM events.
// No UI here: the banner and the Google loader subscribe independently.

export type ConsentCategory = "analytics" | "marketing";
export type ConsentChoice = Record<ConsentCategory, boolean>;
export type StoredConsent = ConsentChoice & { at: string; version: number };
export type ConsentChangeDetail = { current: StoredConsent; previous: StoredConsent | null };

export const CONSENT_COOKIE = "macar_consent";
export const LEGACY_CONSENT_COOKIE = "macar_cookie_consent_is_true";
// Raise it when the banner or its categories change significantly: older choices are then ignored.
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 182;
export const CONSENT_CHANGE_EVENT = "macar:consent-change";
export const CONSENT_OPEN_EVENT = "macar:consent-open";

// null = no valid choice yet (missing, unreadable, tampered with, or from another version).
export function readConsent(): StoredConsent | null {
  try {
    const raw = Cookies.get(CONSENT_COOKIE);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (
      !value ||
      typeof value !== "object" ||
      value.version !== CONSENT_VERSION ||
      typeof value.analytics !== "boolean" ||
      typeof value.marketing !== "boolean" ||
      typeof value.at !== "string"
    ) {
      return null;
    }
    return { analytics: value.analytics, marketing: value.marketing, at: value.at, version: value.version };
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): StoredConsent {
  const previous = readConsent();
  const current: StoredConsent = {
    analytics: choice.analytics,
    marketing: choice.marketing,
    at: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  Cookies.set(CONSENT_COOKIE, JSON.stringify(current), {
    expires: CONSENT_MAX_AGE_DAYS,
    sameSite: "lax",
    path: "/",
    secure: window.location.protocol === "https:",
  });
  window.dispatchEvent(new CustomEvent<ConsentChangeDetail>(CONSENT_CHANGE_EVENT, { detail: { current, previous } }));
  return current;
}

export function onConsentChange(cb: (detail: ConsentChangeDetail) => void): () => void {
  const listener = (event: Event) => cb((event as CustomEvent<ConsentChangeDetail>).detail);
  window.addEventListener(CONSENT_CHANGE_EVENT, listener);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, listener);
}

// Asks the banner to reopen on its preferences level (footer and cookie policy buttons).
export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export function onConsentPreferencesRequest(cb: () => void): () => void {
  window.addEventListener(CONSENT_OPEN_EVENT, cb);
  return () => window.removeEventListener(CONSENT_OPEN_EVENT, cb);
}

// The former cookie recorded no real choice: it is deleted and never read.
export function clearLegacyConsent(): void {
  Cookies.remove(LEGACY_CONSENT_COOKIE, { path: "/" });
}
