import { readConsent } from "@/lib/consent";

// Where the visitor came from, joined to each contact request so the quote can be tagged in
// Dolibarr. Read once at arrival into memory (no consent needed: nothing is written on the
// device). Kept in sessionStorage, and the ad click id joined to the request, only with the
// Advertising consent.

export const ORIGIN_KEY = "macar_origine";

const CLICK_ID_TYPES = ["gclid", "gbraid", "wbraid"] as const;
export type ClickIdType = (typeof CLICK_ID_TYPES)[number];
export type ClickId = { type: ClickIdType; value: string };

export type Arrival = {
  // true for a Google click id (gclid, gbraid, wbraid) or utm_medium=cpc; the label then names
  // utm_source, so a paid Meta campaign is not reported as Google.
  ad: boolean;
  // Google click id, for offline conversions (signed quotes imported into Google Ads).
  click?: ClickId;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing: string;
  referrer_host: string;
};

// The original query string stays in memory only (GoogleTag rebuilds page_location from it).
let arrival: (Arrival & { search: string }) | null = null;

const CLICK_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;
const LABEL_MAX = 100;

// Campaign labels come from the URL, so anyone can craft them: no control characters, bounded.
function cleanLabel(value: string | null): string | undefined {
  if (!value) return undefined;
  const isControl = (char: string) => {
    const code = char.charCodeAt(0);
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
  };
  const cleaned = Array.from(value).filter((char) => !isControl(char)).join("").trim().slice(0, LABEL_MAX);
  return cleaned || undefined;
}

function hostOf(url: string): string {
  try {
    return url ? new URL(url).hostname : "";
  } catch {
    return "";
  }
}

// Reads the landing URL and referrer once per page load. Client-side navigation strips the
// query from the URL later, so this must run at first mount (it is idempotent).
export function rememberArrival(): void {
  if (arrival || typeof window === "undefined") return;
  const query = new URLSearchParams(window.location.search);
  const type = CLICK_ID_TYPES.find((key) => query.has(key));
  const value = type ? query.get(type) ?? "" : "";
  const utmMedium = cleanLabel(query.get("utm_medium"));
  arrival = {
    ad: type !== undefined || utmMedium === "cpc",
    click: type && CLICK_ID_PATTERN.test(value) ? { type, value } : undefined,
    utm_source: cleanLabel(query.get("utm_source")),
    utm_medium: utmMedium,
    utm_campaign: cleanLabel(query.get("utm_campaign")),
    landing: window.location.pathname,
    referrer_host: hostOf(document.referrer),
    search: window.location.search,
  };
}

function isClickId(value: unknown): value is ClickId {
  if (!value || typeof value !== "object") return false;
  const { type, value: id } = value as Record<string, unknown>;
  return CLICK_ID_TYPES.includes(type as ClickIdType) && typeof id === "string" && CLICK_ID_PATTERN.test(id);
}

export function readStoredArrival(): Arrival | null {
  try {
    const raw = window.sessionStorage.getItem(ORIGIN_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    if (typeof value.ad !== "boolean" || typeof value.landing !== "string" || typeof value.referrer_host !== "string") return null;
    if (value.click !== undefined && !isClickId(value.click)) return null;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { search, ...stored } = arrival;
    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable (private mode, blocked): the memory copy still serves this page.
  }
}

// The landing URL with its campaign parameters, for GoogleTag's page_location when the visitor
// grants Analytics after leaving the landing page. Click ids only with the Advertising consent.
// undefined when there is nothing to recover (no campaign, or still on the landing URL).
export function arrivalPageLocation(includeClickId: boolean): string | undefined {
  try {
    rememberArrival();
    if (!arrival || !(arrival.ad || arrival.utm_source)) return undefined;
    if (window.location.pathname === arrival.landing && window.location.search === arrival.search) return undefined;
    const url = new URL(arrival.landing + arrival.search, window.location.origin);
    if (!includeClickId) for (const key of CLICK_ID_TYPES) url.searchParams.delete(key);
    return url.search ? url.href : undefined;
  } catch {
    return undefined;
  }
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const withoutWww = (host: string) => host.replace(/^www\./, "");

function describeReferrer(host: string): string {
  if (!host) return "Accès direct ou favori";
  if (withoutWww(host) === withoutWww(window.location.hostname)) return "Origine inconnue (navigation interne)";
  if (host.includes("google.")) return "Recherche Google";
  if (host.includes("bing.")) return "Recherche Bing";
  if (host.includes("facebook.") || host.includes("instagram.") || host.includes("fb.")) return "Facebook ou Instagram";
  return `Site référent : ${host}`;
}

export type OriginFields = { origine: string; page: string } & Partial<Record<ClickIdType, string>>;

// The fields added to the Formspree payload, built at submit time. Never throws.
export function describeOrigin(): OriginFields {
  try {
    return describe();
  } catch {
    return { origine: "", page: "" };
  }
}

function describe(): OriginFields {
  const page = window.location.pathname;
  const source: Arrival = readStoredArrival() ??
    arrival ?? { ad: false, landing: page, referrer_host: hostOf(document.referrer) };
  const fields: OriginFields = { origine: describeReferrer(source.referrer_host), page };
  if (source.ad) {
    const network = source.utm_source ? capitalize(source.utm_source) : "Google";
    fields.origine = `Pub ${network}, arrivée sur ${source.landing}`;
  } else if (source.utm_source) {
    const campaign = [source.utm_source, source.utm_medium, source.utm_campaign].filter(Boolean).join(" / ");
    fields.origine = `Campagne ${campaign}, arrivée sur ${source.landing}`;
  }
  if (source.click && readConsent()?.marketing) fields[source.click.type] = source.click.value;
  return fields;
}
