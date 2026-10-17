import Cookies from "js-cookie";

// Visitor's cookie choice: stored in one cookie, broadcast to the page through DOM events.
// No UI here: the banner and the Google loader subscribe independently.

export type ConsentCategory = "analytics" | "marketing";
export type ConsentChoice = Record<ConsentCategory, boolean>;
export type StoredConsent = ConsentChoice & { at: string; version: number };
// Payload of CONSENT_CHANGE_EVENT: `current` is the choice just stored, `previous` the one before it
// (null on the first choice, or when the old one was invalid).
export type ConsentChangeDetail = { current: StoredConsent; previous: StoredConsent | null };

export const CONSENT_COOKIE = "macar_consent";
export const LEGACY_CONSENT_COOKIE = "macar_cookie_consent_is_true";
// Raise it when the banner or its categories change significantly: older choices are then ignored.
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 182;
// Window event carrying a ConsentChangeDetail; also relayed to the other open tabs.
export const CONSENT_CHANGE_EVENT = "macar:consent-change";
export const CONSENT_OPEN_EVENT = "macar:consent-open";
const CONSENT_CHANNEL = "macar-consent";
// Tells a tab's own broadcast apart from the others', since the window event already covered it.
const TAB_ID = Math.random().toString(36).slice(2);

// Google's globals, shared by the consent module and the Google loader.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

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
  const detail: ConsentChangeDetail = { current, previous };
  window.dispatchEvent(new CustomEvent<ConsentChangeDetail>(CONSENT_CHANGE_EVENT, { detail }));
  // Other open tabs do not see the window event: a withdrawal must apply there too.
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CONSENT_CHANNEL);
    channel.postMessage({ from: TAB_ID, detail });
    channel.close();
  }
  return current;
}

export function onConsentChange(cb: (detail: ConsentChangeDetail) => void): () => void {
  const listener = (event: Event) => cb((event as CustomEvent<ConsentChangeDetail>).detail);
  window.addEventListener(CONSENT_CHANGE_EVENT, listener);
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CONSENT_CHANNEL) : null;
  if (channel) channel.onmessage = (event: MessageEvent<{ from: string; detail: ConsentChangeDetail }>) => {
      if (event.data.from !== TAB_ID) cb(event.data.detail);
    };
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, listener);
    channel?.close();
  };
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
