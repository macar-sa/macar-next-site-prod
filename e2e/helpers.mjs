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

export const CONSENT_COOKIE = { name: "macar_cookie_consent_is_true", value: "true" };

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
  if (consent) await context.addCookies([{ ...CONSENT_COOKIE, url: baseURL }]);
  await routeNetwork(context, baseURL, { onAvatarRequest, abortAvatar });
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
