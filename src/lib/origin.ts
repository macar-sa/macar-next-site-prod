import { readConsent } from "@/lib/consent";

// Where the visitor came from, joined to each contact request so the quote can be tagged in
// Dolibarr. Read once at arrival (memory, no consent needed: nothing is written on the device),
// kept in sessionStorage only with the Advertising consent. The gclid value is never kept.

export const ORIGIN_KEY = "macar_origine";

export type Arrival = {
  // true for a Google click id (gclid, gbraid, wbraid) or utm_medium=cpc; the label then names
  // utm_source, so a paid Meta campaign is not reported as Google.
  ad: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing: string;
  referrer: string;
};

let arrival: Arrival | null = null;

// Reads the landing URL and referrer once per page load. Client-side navigation strips the
// query from the URL later, so this must run at first mount.
export function rememberArrival(): void {
  if (arrival || typeof window === "undefined") return;
  const query = new URLSearchParams(window.location.search);
  const utm = (key: string) => query.get(key)?.trim() || undefined;
  arrival = {
    ad: ["gclid", "gbraid", "wbraid"].some((key) => query.has(key)) || utm("utm_medium") === "cpc",
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
    landing: window.location.pathname,
    referrer: document.referrer,
  };
}

export function readStoredArrival(): Arrival | null {
  try {
    const raw = window.sessionStorage.getItem(ORIGIN_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    if (typeof value.ad !== "boolean" || typeof value.landing !== "string" || typeof value.referrer !== "string") return null;
    return value as Arrival;
  } catch {
    return null;
  }
}

// Keeps an ad or campaign arrival for the rest of the tab, only while Advertising is granted;
// drops it as soon as that consent is missing or withdrawn.
export function persistArrival(): void {
  try {
    if (!readConsent()?.marketing) {
      window.sessionStorage.removeItem(ORIGIN_KEY);
      return;
    }
    if (!arrival || !(arrival.ad || arrival.utm_source)) return;
    if (readStoredArrival()) return;
    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(arrival));
  } catch {
    // Storage unavailable (private mode, blocked): the memory copy still serves this page.
  }
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function describeReferrer(referrer: string): string {
  if (!referrer) return "Accès direct ou favori";
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return "Accès direct ou favori";
  }
  if (host.includes("google.")) return "Recherche Google";
  if (host.includes("bing.")) return "Recherche Bing";
  if (host.includes("facebook.") || host.includes("instagram.") || host.includes("fb.")) return "Facebook ou Instagram";
  return `Site référent : ${host}`;
}

// The two fields added to the Formspree payload, built at submit time. Never throws.
export function describeOrigin(): { origine: string; page: string } {
  try {
    return describe();
  } catch {
    return { origine: "", page: "" };
  }
}

function describe(): { origine: string; page: string } {
  const page = window.location.pathname;
  const source: Arrival = readStoredArrival() ??
    arrival ?? { ad: false, landing: page, referrer: document.referrer };
  if (source.ad) {
    const network = source.utm_source ? capitalize(source.utm_source) : "Google";
    return { origine: `Pub ${network}, arrivée sur ${source.landing}`, page };
  }
  if (source.utm_source) {
    const campaign = [source.utm_source, source.utm_medium, source.utm_campaign].filter(Boolean).join(" / ");
    return { origine: `Campagne ${campaign}, arrivée sur ${source.landing}`, page };
  }
  return { origine: describeReferrer(source.referrer), page };
}
