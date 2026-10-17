// Meta Pixel (spec 2026-10-17-conversions, 6.1.3): loaded only with Publicité, consent grant and
// revoke, cookies removed on withdrawal, Lead and Contact. The script itself is blocked by the
// network policy, so the base code's queue stays readable.
import { test, expect } from "@playwright/test";
import { prepare, open, keepTelClicks, META_PIXEL_ID, fulfillFormspree, FORMSPREE_ENDPOINT } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

const SKIP = "build sans NEXT_PUBLIC_FACEBOOK_PIXEL_ID";
const SKIP_FORM = "build sans NEXT_PUBLIC_FORMSPREE_ENDPOINT";
const SCRIPT = "https://connect.facebook.net/en_US/fbevents.js";
const banner = (page) => page.getByRole("region", { name: "Consentement aux cookies" });
const queue = (page) => page.evaluate(() => (window.fbq ? window.fbq.queue.map((args) => Array.from(args)) : null));
const tracked = async (page) => ((await queue(page)) || []).filter((args) => args[0] === "track").map((args) => args[1]);
const cookieNames = async (context) => (await context.cookies()).map((c) => c.name);

function trackMetaRequests(page) {
  const urls = [];
  page.on("request", (request) => {
    const host = new URL(request.url()).hostname;
    if (host.endsWith("facebook.net") || host.endsWith("facebook.com")) urls.push(request.url());
  });
  return urls;
}

async function togglePublicite(page) {
  await page.getByRole("button", { name: "Gérer mes cookies" }).click();
  await expect(banner(page)).toBeVisible();
  await page.getByText("Publicité", { exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer mes choix" }).click();
  await expect(banner(page)).toHaveCount(0);
}

test("sans choix : pas de fbq, aucune requête Meta", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL, { consent: false });
  const meta = trackMetaRequests(page);
  await open(page, "/");
  expect(await queue(page)).toBeNull();
  expect(meta).toEqual([]);
});

test("Analytique seul : pas de fbq, aucune requête Meta", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL, { consent: { analytics: true, marketing: false } });
  const meta = trackMetaRequests(page);
  await open(page, "/");
  expect(await queue(page)).toBeNull();
  expect(meta).toEqual([]);
});

test("Publicité accordée : grant, init, PageView, puis un seul script", async ({ page, context, baseURL }) => {
  test.skip(!META_PIXEL_ID, SKIP);
  await prepare(context, baseURL);
  const meta = trackMetaRequests(page);
  await open(page, "/");
  expect(await queue(page)).toEqual([["consent", "grant"], ["init", META_PIXEL_ID], ["track", "PageView"]]);
  expect(meta.filter((u) => u === SCRIPT)).toHaveLength(1);
});

test("Tout accepter dans la page : pixel chargé sans recharger", async ({ page, context, baseURL }) => {
  test.skip(!META_PIXEL_ID, SKIP);
  await prepare(context, baseURL, { consent: false });
  await open(page, "/");
  expect(await queue(page)).toBeNull();
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  await expect.poll(() => queue(page)).toContainEqual(["init", META_PIXEL_ID]);
});

test("retrait de Publicité : revoke, _fbp et _fbc supprimés, plus d'événement", async ({ page, context, baseURL }) => {
  test.skip(!META_PIXEL_ID, SKIP);
  await prepare(context, baseURL);
  await keepTelClicks(page);
  await context.addCookies([
    { name: "_fbp", value: "fb.1.1.1", url: baseURL },
    { name: "_fbc", value: "fb.1.1.abc", url: baseURL },
  ]);
  await open(page, "/");
  await togglePublicite(page);
  expect((await queue(page)).at(-1)).toEqual(["consent", "revoke"]);
  const names = await cookieNames(context);
  expect(names).not.toContain("_fbp");
  expect(names).not.toContain("_fbc");
  await page.locator("footer").getByRole("link", { name: "+32 478 23 50 08" }).click();
  expect(await tracked(page)).toEqual(["PageView"]);
});

test("réacceptation dans la même page : grant, un seul init, un seul script", async ({ page, context, baseURL }) => {
  test.skip(!META_PIXEL_ID, SKIP);
  await prepare(context, baseURL);
  await open(page, "/");
  await togglePublicite(page);
  await togglePublicite(page);
  const q = await queue(page);
  expect(q.at(-1)).toEqual(["consent", "grant"]);
  expect(q.filter((args) => args[0] === "init")).toHaveLength(1);
  expect(await page.locator(`script[src="${SCRIPT}"]`).count()).toBe(1);
});

test("refus de Publicité enregistré : _fbp résiduel supprimé au chargement", async ({ page, context, baseURL }) => {
  test.skip(!META_PIXEL_ID, SKIP);
  await prepare(context, baseURL, { consent: { analytics: true, marketing: false } });
  await context.addCookies([{ name: "_fbp", value: "fb.1.1.1", url: baseURL }]);
  await open(page, "/");
  await expect.poll(() => cookieNames(context)).not.toContain("_fbp");
});

test("clic sur un numéro Macar avec Publicité : Contact", async ({ page, context, baseURL }) => {
  test.skip(!META_PIXEL_ID, SKIP);
  await prepare(context, baseURL);
  await keepTelClicks(page);
  await open(page, "/");
  await page.locator("footer").getByRole("link", { name: "+32 478 23 50 08" }).click();
  expect(await tracked(page)).toEqual(["PageView", "Contact"]);
});

test("envoi réussi avec Publicité : Lead", async ({ page, context, baseURL }) => {
  test.skip(!META_PIXEL_ID, SKIP);
  test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
  await prepare(context, baseURL);
  await fulfillFormspree(context);
  await open(page, "/");
  const form = page.locator("#contact form");
  await form.getByLabel("Nom et Prénom", { exact: true }).fill("Jeanne Test");
  await form.getByLabel("Email", { exact: true }).fill("jeanne@example.com");
  await form.getByLabel("Téléphone", { exact: true }).fill("0470000000");
  await form.getByLabel("Message", { exact: true }).fill("Bonjour");
  await form.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText("Merci pour votre confiance")).toBeVisible();
  expect(await tracked(page)).toEqual(["PageView", "Lead"]);
});

test("Analytique seul : le clic téléphone ne crée pas de fbq", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL, { consent: { analytics: true, marketing: false } });
  await keepTelClicks(page);
  await open(page, "/");
  await page.locator("footer").getByRole("link", { name: "+32 478 23 50 08" }).click();
  expect(await queue(page)).toBeNull();
});
