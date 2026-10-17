import { readConsent } from "@/lib/consent";

// Macar's own numbers, as dialled (tel: href without separators). The job page number is not here:
// a call to apply is not a quote request.
export const MACAR_PHONES = ["+32478235008", "+3224665304"] as const;

// Pushes a GA4 event, only when Analytics is granted. The consent check lives here on purpose,
// not only in GoogleTag: window.gtag always exists (basic Consent Mode keeps a queue), so an
// event pushed before the choice would sit in dataLayer and be sent the moment Google loads.
// Never throws: a gtag replaced by a privacy extension must not turn a sent form into an error.
export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  try {
    if (typeof window === "undefined") return;
    if (!readConsent()?.analytics) return;
    if (!window.gtag) return;
    window.gtag("event", name, params);
  } catch {
    // Measurement is best effort.
  }
}

// "tel:+32 478 23 50 08" -> "+32478235008"
export function normalizePhone(href: string): string {
  return href.replace(/^tel:/i, "").replace(/[^\d+]/g, "");
}
