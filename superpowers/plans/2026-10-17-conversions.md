# Conversions (M.2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Count successful contact-form submissions and clicks on Macar's phone numbers as GA4 events, gated by the M.1 consent, and add the visitor's origin to each Formspree submission.

**Architecture:** One `trackEvent()` helper that refuses to push anything unless Analytics is granted; one invisible client component mounted in the root layout that delegates `tel:` clicks and captures the visit's origin; the contact form calls the helper on Formspree success and appends `origine` and `page` to its payload. All verified with Playwright by reading `window.dataLayer` and intercepting Formspree.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, gtag (loaded by M.1's `GoogleTag`), js-cookie (through `src/lib/consent.ts`), Playwright 1.63 (`e2e/`).

**Spec:** `superpowers/specs/2026-10-17-conversions-design.md`

## Global Constraints

- No event may be pushed to `dataLayer` unless `readConsent()?.analytics === true` (spec 4.1): a queued pre-consent event would be sent when Google loads later.
- The arrival (ad flag, UTM labels, landing path, referrer) is read once at first mount into module memory, with no consent (spec 4.4). It is written to `sessionStorage` under key `macar_origine` only when `readConsent()?.marketing === true`, and the key is removed when that consent is absent or withdrawn. The `gclid` value itself is never kept nor sent.
- Measurement must never block or break the form: every storage access is in `try/catch`, `trackEvent` is called after the Formspree success is known.
- Phone numbers counted: exactly `+32478235008` and `+3224665304`. The job page number `+32499523079` is not counted.
- Event names and params, verbatim: `generate_lead` with `{ lead_source: "formulaire_contact" }`; `phone_click` with `{ phone_number, link_location }` where `link_location` is `"pied_de_page"` inside a `<footer>` and `"page"` elsewhere.
- Origin strings, verbatim (spec 4.4): `Pub Google, arrivée sur <landing>`; `Campagne <utm_source> / <utm_medium> / <utm_campaign>, arrivée sur <landing>` (absent parts omitted, separators too); `Recherche Google`; `Recherche Bing`; `Facebook ou Instagram`; `Accès direct ou favori`; `Site référent : <hôte>`.
- Visitor-facing copy: no em dash or en dash. Code comments and commits in English like the rest of the repo.
- Tests never let a request reach Google or Formspree (`routeNetwork` aborts; Formspree is fulfilled by the test).
- Do not modify `CookieConsent.tsx`, `consent.ts`, `GoogleTag.tsx`. `footer.tsx` changes only its root element (`<div className="pt-28">` → `<footer className="pt-28">`).
- Branch `feat/conversions` from `dev`; PR targets `dev`.

## Review Focus

1. A click on a phone link made with no consent choice yet (banner still open) must push nothing, even though `window.gtag` exists. Test in Task 1.
2. Consent withdrawn through "Gérer mes cookies" after an ad arrival was stored: the stored origin must disappear without a reload. Test in Task 3.
3. Arrival with `?gclid=…` and no cookie choice, navigation to the home page through the menu, then Publicité accepted: the arrival kept in memory must be persisted at acceptance even though the URL no longer carries the parameter. Test in Task 3.
4. `sessionStorage` throwing (private mode, blocked storage): the form must still submit and the origin still comes from memory. Test in Task 3 (stub `sessionStorage` getter to throw).
5. Formspree returning an error: no `generate_lead`, and the payload still carried `origine`/`page` (it was built before the request). Test in Task 2.

---

### Task 1: `trackEvent` helper and phone-click delegation

**Files:**
- Create: `src/lib/analytics.ts`
- Create: `src/app/_components/ConversionTracking.tsx`
- Modify: `src/app/layout.tsx` (mount next to `<GoogleTag gaId={gaId} />`)
- Modify: `src/app/_components/footer.tsx` (root `<div className="pt-28">` becomes `<footer className="pt-28">`, closing tag too)
- Modify: `e2e/playwright.config.mjs` (load `.env.local` so local runs see the GA id and Formspree endpoint)
- Modify: `e2e/helpers.mjs` (add `events()` helper)
- Create: `e2e/tests/conversions.spec.mjs`

**Interfaces:**
- Consumes: `readConsent()` from `@/lib/consent` (returns `{ analytics, marketing, at, version } | null`); `window.gtag` and `window.dataLayer` typed in `consent.ts`'s global declaration.
- Produces: `trackEvent(name: string, params?: Record<string, string | number | boolean>): void` in `src/lib/analytics.ts`; `export const MACAR_PHONES = ["+32478235008", "+3224665304"] as const` in the same file; `ConversionTracking` default export (client component, renders `null`); e2e helper `events(page): Promise<Array<[string, string, object?]>>` returning only the `["event", …]` entries of `dataLayer` as plain arrays.

- [ ] **Step 1: Make local Playwright runs read `.env.local`**

In `e2e/playwright.config.mjs`, before `defineConfig`, add:

```js
// Local runs: the GA id and Formspree endpoint baked into the build come from .env.local
// (CI sets them as job env). Missing file: nothing happens.
try { process.loadEnvFile(new URL("../.env.local", import.meta.url).pathname); } catch {}
```

Check: `cd e2e && node -e "try{process.loadEnvFile('../.env.local')}catch{}; console.log(!!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS)"` prints `true` locally.

- [ ] **Step 2: Add the `events()` helper to `e2e/helpers.mjs`**

```js
// Only the gtag("event", …) calls of dataLayer, as plain arrays: [name, params].
export async function events(page) {
  const layer = await readDataLayer(page);
  return layer.filter((e) => e[0] === "event").map((e) => e.slice(1));
}
```

- [ ] **Step 3: Write the failing phone tests in `e2e/tests/conversions.spec.mjs`**

```js
// Conversions (spec 2026-10-17-conversions): events only with Analytics granted, read in dataLayer.
import { test, expect } from "@playwright/test";
import { prepare, open, events, CONSENT } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

// tel: links: keep the click in the page (headless Chromium has no dialer).
const keepTelClicks = (page) =>
  page.addInitScript(() => {
    document.addEventListener("click", (e) => {
      const a = e.target instanceof Element && e.target.closest('a[href^="tel:"]');
      if (a) e.preventDefault();
    }, true);
  });
const footerGsm = (page) => page.locator("footer").getByRole("link", { name: "+32 478 23 50 08" });

test.describe("clic téléphone", () => {
  test("pied de page, tout accepté : phone_click avec numéro et emplacement", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await keepTelClicks(page);
    await open(page, "/");
    await footerGsm(page).click();
    expect(await events(page)).toEqual([["phone_click", { phone_number: "+32478235008", link_location: "pied_de_page" }]]);
  });

  test("accueil : link_location vaut page ; le fixe est compté", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await keepTelClicks(page);
    await open(page, "/");
    await page.locator("main").getByRole("link", { name: "+32 478 23 50 08" }).click();
    await page.locator("footer").getByRole("link", { name: "+32 246 653 04" }).click();
    expect(await events(page)).toEqual([
      ["phone_click", { phone_number: "+32478235008", link_location: "page" }],
      ["phone_click", { phone_number: "+3224665304", link_location: "pied_de_page" }],
    ]);
  });

  test("Analytique refusé : aucun événement", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL, { consent: CONSENT.none });
    await keepTelClicks(page);
    await open(page, "/");
    await footerGsm(page).click();
    expect(await events(page)).toEqual([]);
  });

  test("sans choix (bandeau ouvert) : aucun événement", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL, { consent: false });
    await keepTelClicks(page);
    await open(page, "/");
    await footerGsm(page).click();
    expect(await events(page)).toEqual([]);
  });

  test("numéro de la page Emploi : pas compté", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await keepTelClicks(page);
    await open(page, "/job");
    await page.locator("main").locator('a[href^="tel:"]').first().click();
    expect(await events(page)).toEqual([]);
  });
});
```

- [ ] **Step 4: Run the file to verify it fails**

Run: `npm run build && npx playwright test -c e2e/playwright.config.mjs tests/conversions.spec.mjs`
Expected: the three positive assertions FAIL (`events` is `[]`), the negative ones pass.

- [ ] **Step 5: Implement `src/lib/analytics.ts`**

`export const MACAR_PHONES = ["+32478235008", "+3224665304"] as const;`

`export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void` : return if `typeof window === "undefined"`, if `!readConsent()?.analytics`, or if `!window.gtag`; else `window.gtag("event", name, params)`. Comment why the consent check lives here (queued pre-consent events would be flushed on load).

`export function normalizePhone(href: string): string` : strip the `tel:` prefix and every character except digits and `+`.

- [ ] **Step 6: Implement `src/app/_components/ConversionTracking.tsx`**

`"use client"`, default export `ConversionTracking(): null`. One `useEffect` adding a `click` listener on `document` (bubble phase) that: finds `(event.target as Element | null)?.closest?.('a[href^="tel:"]')`; returns if none or if `normalizePhone(href)` is not in `MACAR_PHONES`; calls `trackEvent("phone_click", { phone_number, link_location: anchor.closest("footer") ? "pied_de_page" : "page" })`. Never calls `preventDefault`. Cleanup removes the listener.

- [ ] **Step 7: Mount it in `src/app/layout.tsx`, make the footer a `<footer>`**

Import `ConversionTracking` and render `<ConversionTracking />` right after `<GoogleTag gaId={gaId} />`. In `footer.tsx`, change the root element to `<footer>` (same className), nothing else.

- [ ] **Step 8: Run the file to verify it passes, plus lint and types**

Run: `npm run build && npx playwright test -c e2e/playwright.config.mjs tests/conversions.spec.mjs && npm run lint && npx tsc --noEmit`
Expected: all PASS, no lint or type error.

- [ ] **Step 9: Commit**

```bash
git add src/lib/analytics.ts src/app/_components/ConversionTracking.tsx src/app/layout.tsx src/app/_components/footer.tsx e2e/playwright.config.mjs e2e/helpers.mjs e2e/tests/conversions.spec.mjs
git commit -m "Count clicks on Macar's phone numbers as phone_click events, only with Analytics consent"
```

---

### Task 2: `generate_lead` on Formspree success, Formspree interception in tests

**Files:**
- Modify: `src/components/contact_form.tsx` (`.then` of the axios post)
- Modify: `.github/workflows/e2e.yml` (job env)
- Modify: `e2e/helpers.mjs` (add `FORMSPREE_ENDPOINT`, `fulfillFormspree`)
- Modify: `e2e/tests/form.spec.mjs` (guard on finished requests only)
- Modify: `e2e/tests/conversions.spec.mjs` (form section)

**Interfaces:**
- Consumes: `trackEvent` (Task 1), `events()` (Task 1).
- Produces: e2e helpers `export const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim() || ""` and `export async function fulfillFormspree(context, { status = 200 } = {}): Promise<Array<object>>` which routes every request whose host is `formspree.io` or ends with `.formspree.io`, fulfils it with `status` and body `{"ok":true}` (or `{"error":"test"}` when status ≥ 400), and returns an array that receives each parsed JSON request body. Must be called after `prepare()` so its route wins.

- [ ] **Step 1: CI env**

In `.github/workflows/e2e.yml`, under the job `env:`, add `NEXT_PUBLIC_FORMSPREE_ENDPOINT: https://formspree.io/f/test-e2e`.

- [ ] **Step 2: Relax the guard in `e2e/tests/form.spec.mjs`**

Replace the `page.on("request", …)` collector with `page.on("requestfinished", …)` and update the header comment and the `afterEach` message: the form now attempts the request in CI; `routeNetwork` aborts it, so only a request that *finished* (got a response) is a leak. Keep the test names unchanged. The test "formulaire valide sans accès à Formspree" keeps asserting the "Oups" alert.

- [ ] **Step 3: Add the helpers to `e2e/helpers.mjs`** (signatures in Interfaces). Host check through `new URL(request.url()).hostname`.

- [ ] **Step 4: Write the failing form tests in `conversions.spec.mjs`**

```js
import { fulfillFormspree, FORMSPREE_ENDPOINT } from "../helpers.mjs";
const SKIP_FORM = "build sans NEXT_PUBLIC_FORMSPREE_ENDPOINT";

async function fillAndSend(page) {
  const form = page.locator("#contact form");
  await form.getByLabel("Nom et Prénom", { exact: true }).fill("Jeanne Test");
  await form.getByLabel("Email", { exact: true }).fill("jeanne@example.com");
  await form.getByLabel("Téléphone", { exact: true }).fill("0470000000");
  await form.getByLabel("Message", { exact: true }).fill("Bonjour");
  await form.getByRole("button", { name: "Envoyer" }).click();
}

test.describe("formulaire", () => {
  test("envoi réussi, tout accepté : generate_lead une fois", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText("Merci pour votre confiance")).toBeVisible();
    expect(bodies).toHaveLength(1);
    expect(await events(page)).toEqual([["generate_lead", { lead_source: "formulaire_contact" }]]);
  });

  test("envoi réussi, Analytique refusé : aucun événement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: CONSENT.none });
    await fulfillFormspree(context);
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText("Merci pour votre confiance")).toBeVisible();
    expect(await events(page)).toEqual([]);
  });

  test("Formspree en erreur : pas de generate_lead", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    await fulfillFormspree(context, { status: 500 });
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.locator("#contact form").getByRole("alert").filter({ hasText: "Oups" })).toBeVisible();
    expect(await events(page)).toEqual([]);
  });
});
```

- [ ] **Step 5: Run to verify the first test fails** (`events` empty), the other two pass.

Run: `npm run build && npx playwright test -c e2e/playwright.config.mjs tests/conversions.spec.mjs tests/form.spec.mjs`

- [ ] **Step 6: Implement in `contact_form.tsx`**

Import `trackEvent` from `@/lib/analytics`. In `.then(() => { … })`, call `trackEvent("generate_lead", { lead_source: "formulaire_contact" })` before `setSubmissionSuccess(true)`.

- [ ] **Step 7: Run both files, lint, types**

Run: `npm run build && npx playwright test -c e2e/playwright.config.mjs tests/conversions.spec.mjs tests/form.spec.mjs && npm run lint && npx tsc --noEmit`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/contact_form.tsx .github/workflows/e2e.yml e2e/helpers.mjs e2e/tests/form.spec.mjs e2e/tests/conversions.spec.mjs
git commit -m "Send generate_lead when Formspree accepts the contact form"
```

---

### Task 3: Origin of the visit in the Formspree payload

**Files:**
- Create: `src/lib/origin.ts`
- Modify: `src/app/_components/ConversionTracking.tsx` (remember the arrival on mount, persist on mount and on consent change)
- Modify: `src/components/contact_form.tsx` (payload)
- Modify: `e2e/tests/conversions.spec.mjs` (origin section)

**Interfaces:**
- Consumes: `readConsent()`, `onConsentChange(cb)` from `@/lib/consent`; `fulfillFormspree` (Task 2) whose returned array exposes each posted body; `fillAndSend` (Task 2 test helper).
- Produces, in `src/lib/origin.ts`:
  - `export const ORIGIN_KEY = "macar_origine"`
  - `export type Arrival = { ad: boolean; utm_source?: string; utm_medium?: string; utm_campaign?: string; landing: string; referrer: string }`
  - `export function rememberArrival(): void` : runs once per page load (module flag); reads `window.location` and `document.referrer` into a module variable. `ad` is true when the query has `gclid`, `gbraid` or `wbraid`, or `utm_medium=cpc`. Never touches storage.
  - `export function persistArrival(): void` : spec 4.4 "Conservation". `try/catch` around every storage call.
  - `export function readStoredArrival(): Arrival | null` : `try/catch`, JSON parse, shape check (`typeof ad === "boolean"`, `typeof landing === "string"`, `typeof referrer === "string"`).
  - `export function describeOrigin(): { origine: string; page: string }` : spec 4.4 "Lecture à l'envoi", source = stored arrival, else memory, else `{ ad: false, landing: pathname, referrer: document.referrer }`.

- [ ] **Step 1: Write the failing origin tests in `conversions.spec.mjs`**

```js
const readStored = (page) => page.evaluate(() => sessionStorage.getItem("macar_origine"));
const goHomeByMenu = async (page) => {
  await page.getByRole("link", { name: "Accueil" }).first().click();
  await expect(page).toHaveURL(/\/$/);
};
const banner = (page) => page.getByRole("region", { name: "Consentement aux cookies" });
const SENT = "Merci pour votre confiance";

test.describe("origine de la demande", () => {
  test("gclid sans choix de cookies, navigation, envoi : Pub Google, rien en session, aucun événement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: false });
    const bodies = await fulfillFormspree(context);
    await open(page, "/services/toiture?gclid=test123");
    expect(await readStored(page)).toBeNull();
    await goHomeByMenu(page);
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Pub Google, arrivée sur /services/toiture", page: "/" });
    expect(JSON.stringify(bodies[0])).not.toContain("test123");
    expect(await events(page)).toEqual([]);
  });

  test("gclid avec Publicité : mémorisé sans la valeur, survit au rechargement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, "/services/toiture?gclid=test123");
    const stored = JSON.parse(await readStored(page));
    expect(stored).toMatchObject({ ad: true, landing: "/services/toiture" });
    expect(JSON.stringify(stored)).not.toContain("test123");
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Pub Google, arrivée sur /services/toiture", page: "/" });
  });

  test("gclid avec Publicité refusée : rien en session, perdu au rechargement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: { analytics: true, marketing: false } });
    const bodies = await fulfillFormspree(context);
    await open(page, "/services/toiture?gclid=test123");
    expect(await readStored(page)).toBeNull();
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Accès direct ou favori", page: "/" });
  });

  test("utm sans gclid : Campagne source / campaign", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, "/?utm_source=facebook&utm_campaign=toiture");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Campagne facebook / toiture, arrivée sur /");
  });

  test("utm_medium=cpc compte comme une pub", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: false });
    const bodies = await fulfillFormspree(context);
    await open(page, "/zones/uccle?utm_source=google&utm_medium=cpc");
    await goHomeByMenu(page);
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Pub Google, arrivée sur /zones/uccle");
  });

  test("référent Google sans paramètre : Recherche Google", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await page.goto("/", { referer: "https://www.google.com/" });
    await page.waitForLoadState("networkidle");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Recherche Google");
  });

  test("Publicité accordée après navigation : l'arrivée gardée en mémoire est conservée", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL, { consent: false });
    await open(page, "/services/toiture?gclid=late");
    await goHomeByMenu(page);
    expect(await readStored(page)).toBeNull();
    await banner(page).getByRole("button", { name: "Tout accepter" }).click();
    await expect.poll(() => readStored(page)).toContain('"landing":"/services/toiture"');
  });

  test("retrait de Publicité : la clé disparaît sans recharger", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/services/toiture?gclid=gone");
    expect(await readStored(page)).not.toBeNull();
    await page.getByRole("button", { name: "Gérer mes cookies" }).click();
    await page.getByText("Publicité", { exact: true }).click();
    await page.getByRole("button", { name: "Enregistrer mes choix" }).click();
    await expect.poll(() => readStored(page)).toBeNull();
  });

  test("sessionStorage indisponible : l'envoi passe, l'origine vient de la mémoire", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await page.addInitScript(() => {
      Object.defineProperty(window, "sessionStorage", { get() { throw new Error("blocked"); } });
    });
    await open(page, "/?gclid=blocked");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Pub Google, arrivée sur /", page: "/" });
  });
});
```

- [ ] **Step 2: Run to verify they fail** (no `origine` in bodies, no `macar_origine`).

Run: `npm run build && npx playwright test -c e2e/playwright.config.mjs tests/conversions.spec.mjs`

- [ ] **Step 3: Implement `src/lib/origin.ts`** (signatures in Interfaces)

`describeOrigin()` campaign string: join the present parts of `[utm_source, utm_medium, utm_campaign]` with `" / "`. Referrer rule on `new URL(referrer).hostname` in `try/catch`: empty or unparsable → `Accès direct ou favori`.

- [ ] **Step 4: Wire `ConversionTracking`**

In its `useEffect`, before the click listener: `rememberArrival(); persistArrival();` then `const off = onConsentChange(() => persistArrival());`; cleanup calls `off()` and removes the click listener.

- [ ] **Step 5: Add `origine` and `page` to the payload in `contact_form.tsx`**

Import `describeOrigin`. Post `{ ...values, ...describeOrigin() }` instead of `values`. `FormValues`, the schema and the state are unchanged.

- [ ] **Step 6: Run the conversions file, lint, types**

Run: `npm run build && npx playwright test -c e2e/playwright.config.mjs tests/conversions.spec.mjs && npm run lint && npx tsc --noEmit`
Expected: all PASS (Formspree-dependent tests skip only when the build has no endpoint).

- [ ] **Step 7: Commit**

```bash
git add src/lib/origin.ts src/app/_components/ConversionTracking.tsx src/components/contact_form.tsx e2e/tests/conversions.spec.mjs
git commit -m "Add the visit's origin and page to each contact request"
```

---

### Task 4: Legal pages, CLAUDE.md, final checks

**Files:**
- Modify: `src/app/politique-confidentialite/page.tsx` (sections « Données collectées », « Durée de conservation »)
- Modify: `src/app/politique-cookies/page.tsx` (`COOKIES` table)
- Modify: `e2e/tests/legal.spec.mjs` (`ROWS`)
- Modify: `CLAUDE.md` (bullet « Consentement aux cookies » → add measurement sentence)

- [ ] **Step 1: Update `ROWS` in `legal.spec.mjs`** to `["_ga", "_ga_*", "Vercel Analytics", "macar_consent", "macar_origine"]`, run `npx playwright test -c e2e/playwright.config.mjs tests/legal.spec.mjs`, expect FAIL (row missing).

- [ ] **Step 2: Add the table row** in `politique-cookies/page.tsx`:
`{ name: "macar_origine", issuer: "Macar", purpose: "Retenir la provenance de votre visite pour la joindre à votre demande de devis (si vous acceptez Publicité), stockage de session, sans cookie", duration: "Fin de la visite" }`

- [ ] **Step 3: Privacy policy** in `politique-confidentialite/page.tsx` (texts verbatim from spec 4.5):
  - « Données collectées », new `<li>` after the form bullet: « Provenance de votre demande, jointe à votre message quand vous utilisez le formulaire : page d'où vous l'envoyez et manière dont vous êtes arrivé sur le site (publicité, moteur de recherche, site référent ou accès direct), sans identifiant publicitaire. »
  - « Finalités et bases légales », first bullet becomes: « Répondre à vos demandes de devis ou questions et savoir comment vous nous avez trouvés. Base légale : mesures précontractuelles à votre demande (art. 6.1.b RGPD). »
  - « Durée de conservation », new `<li>` before the « Cookies » one: « Provenance de votre visite gardée sur votre appareil (si vous acceptez la catégorie Publicité) : effacée à la fermeture de l'onglet. »

- [ ] **Step 4: `CLAUDE.md`**: extend the « Consentement aux cookies » bullet with: « Mesure : `src/lib/analytics.ts` (`trackEvent`, rien sans accord Analytique) et `src/lib/origin.ts` (origine de la visite, rien sans accord Publicité), branchés par `_components/ConversionTracking.tsx` et le formulaire. Événements `generate_lead` et `phone_click`, à marquer comme événements clés dans GA4 puis à importer dans Google Ads. »

- [ ] **Step 5: Full verification**

Run: `npm run lint && npx tsc --noEmit && npm run build && npm run test:e2e`
Expected: every test PASS or skipped only for a missing build variable.

- [ ] **Step 6: Visual check** with the Playwright MCP on `npm run dev`: accept the banner, submit the form on `/` at 375 px and 1440 px (do NOT submit if `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is set locally: instead fill the form, stop before « Envoyer », and check `/politique-cookies` and `/politique-confidentialite` at both widths). Screenshots in the scratchpad directory, never in the repo. No console error.

- [ ] **Step 7: Commit**

```bash
git add src/app/politique-confidentialite/page.tsx src/app/politique-cookies/page.tsx e2e/tests/legal.spec.mjs CLAUDE.md
git commit -m "Describe the stored visit origin in the legal pages"
```

- [ ] **Step 8: Push and open the PR to `dev`** with: what is measured, consent rules, the owner's GA4 steps (spec 4.7), and the manual production check (a real test submission must arrive on info@macar.be with `origine` and `page`).
