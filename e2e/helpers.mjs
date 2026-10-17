// Shared helpers of the behaviour suite (e2e/tests).

// Pages checked one by one (no horizontal scroll at 320 px).
export const PAGES = [
  { slug: "home", path: "/" },
  { slug: "about", path: "/about" },
  { slug: "services", path: "/services" },
  { slug: "services-renovation", path: "/services/renovation" },
  { slug: "services-plomberie", path: "/services/plomberie" },
  { slug: "services-electricite", path: "/services/electricite" },
  { slug: "services-toiture", path: "/services/toiture" },
  { slug: "blog", path: "/blog" },
  { slug: "blog-isolation-facade", path: "/blog/isolation-facade" },
  { slug: "blog-degats-eaux", path: "/blog/degats-eaux-toiture-sinistre-assurance" },
  { slug: "job", path: "/job" },
  { slug: "mentions-legales", path: "/mentions-legales" },
  { slug: "politique-confidentialite", path: "/politique-confidentialite" },
  { slug: "politique-cookies", path: "/politique-cookies" },
  { slug: "zones-uccle", path: "/zones/uccle" },
  { slug: "not-found", path: "/page-introuvable-harness" },
];

// Consent presets and cookie builder (the cookie format is defined in src/lib/consent.ts).
export const CONSENT = {
  all: { analytics: true, marketing: true },
  none: { analytics: false, marketing: false },
};

// The default version must match CONSENT_VERSION in src/lib/consent.ts.
export function consentCookie(choice, { version = 1 } = {}) {
  return {
    name: "macar_consent",
    value: encodeURIComponent(JSON.stringify({ ...choice, at: "2026-10-17T00:00:00.000Z", version })),
  };
}

// Google Analytics ID baked into the build; Google-dependent tests skip when it is empty.
export const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS?.trim() || "";
// Formspree endpoint baked into the build; the form-success tests skip when it is empty.
export const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim() || "";

const isFormspreeHost = (hostname) => hostname === "formspree.io" || hostname.endsWith(".formspree.io");

// Answers every Formspree request itself (nothing leaves the machine) and returns the array
// that receives each posted JSON body. Register it after prepare(): the newest route wins.
export async function fulfillFormspree(context, { status = 200 } = {}) {
  const bodies = [];
  await context.route("**/*", async (route) => {
    const request = route.request();
    if (!isFormspreeHost(new URL(request.url()).hostname)) return route.fallback();
    if (request.method() === "POST") {
      try {
        bodies.push(JSON.parse(request.postData() || "{}"));
      } catch {
        bodies.push({});
      }
    }
    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status >= 400 ? { error: "test" } : { ok: true }),
    });
  });
  return bodies;
}

// 1x1 PNG served in place of the Google profile photos.
const AVATAR_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

// Network policy: the site under test is served locally, Google profile photos get the PNG
// above, every other external request (analytics, Formspree) is aborted.
export async function routeNetwork(context, baseUrl, { onAvatarRequest, abortAvatar } = {}) {
  const base = new URL(baseUrl);
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.host === base.host) return route.continue();
    if (url.host === "lh3.googleusercontent.com") {
      if (onAvatarRequest) await onAvatarRequest(route.request());
      if (abortAvatar && abortAvatar(url.href)) return route.abort("failed");
      return route.fulfill({ status: 200, contentType: "image/png", body: AVATAR_PNG });
    }
    if (url.protocol === "data:" || url.protocol === "blob:") return route.continue();
    return route.abort("blockedbyclient");
  });
}

export async function prepare(context, baseURL, { consent = true, onAvatarRequest, abortAvatar } = {}) {
  // consent: true => everything accepted, false => no cookie, object => that choice.
  if (consent) await context.addCookies([{ ...consentCookie(consent === true ? CONSENT.all : consent), url: baseURL }]);
  await routeNetwork(context, baseURL, { onAvatarRequest, abortAvatar });
}

// Every dataLayer entry (an Arguments object for gtag calls) as a plain array.
export async function readDataLayer(page) {
  return page.evaluate(() => (window.dataLayer || []).map((entry) => Array.from(entry)));
}

// Only the gtag("event", …) calls of dataLayer, as plain arrays: [name, params].
export async function events(page) {
  const layer = await readDataLayer(page);
  return layer.filter((e) => e[0] === "event").map((e) => e.slice(1));
}

// Collects the requests sent to Google (even those the network policy then aborts).
export function trackGoogleRequests(page) {
  const requests = [];
  page.on("request", (request) => {
    const host = new URL(request.url()).host;
    if (host.endsWith("googletagmanager.com") || host.endsWith("google-analytics.com")) requests.push(request.url());
  });
  return requests;
}

// Navigates and waits for hydration (network idle after load).
export async function open(page, url) {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
}

// Focuses an element the way a keyboard user does, so :focus-visible applies.
export async function keyboardFocus(page, locator) {
  await locator.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const ok = await locator.evaluate((el) => el === document.activeElement);
  if (!ok) throw new Error("keyboardFocus: focus did not land on the target element");
}
