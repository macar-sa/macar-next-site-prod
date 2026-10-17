// Google Consent Mode v2 (basic): nothing is sent to Google until Analytics is granted.
import { test, expect } from "@playwright/test";
import { prepare, open, readDataLayer, trackGoogleRequests, GA_ID } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

const SKIP = "build sans NEXT_PUBLIC_GOOGLE_ANALYTICS";
const banner = (page) => page.getByRole("region", { name: "Consentement aux cookies" });
const consentDefault = (layer) => layer.filter((e) => e[0] === "consent" && e[1] === "default");
const consentUpdate = (layer) => layer.filter((e) => e[0] === "consent" && e[1] === "update");
const configs = (layer) => layer.filter((e) => e[0] === "config");
const signals = (value) => ({
  ad_storage: value,
  ad_user_data: value,
  ad_personalization: value,
  analytics_storage: value,
});

async function acceptAll(page) {
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  await expect(banner(page)).toHaveCount(0);
}

test("sans choix : consent default à denied et aucune requête Google", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL, { consent: false });
  const google = trackGoogleRequests(page);
  await open(page, "/");
  const layer = await readDataLayer(page);
  const defaults = consentDefault(layer);
  expect(defaults).toHaveLength(1);
  expect(defaults[0][2]).toEqual(signals("denied"));
  expect(layer).toContainEqual(["set", "ads_data_redaction", true]);
  expect(configs(layer)).toHaveLength(0);
  expect(google).toHaveLength(0);
  expect((await context.cookies()).filter((c) => c.name.startsWith("_ga"))).toHaveLength(0);
});

test("Tout refuser : aucune requête Google", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: false });
  const google = trackGoogleRequests(page);
  await open(page, "/");
  await banner(page).getByRole("button", { name: "Tout refuser" }).click();
  await expect(banner(page)).toHaveCount(0);
  const updates = consentUpdate(await readDataLayer(page));
  expect(updates).toHaveLength(1);
  expect(updates[0][2]).toEqual(signals("denied"));
  expect(google).toHaveLength(0);
});

test("Tout accepter : default, puis update granted, puis config, puis gtag.js", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: false });
  const google = trackGoogleRequests(page);
  await open(page, "/");
  await acceptAll(page);
  await expect.poll(() => google.length).toBeGreaterThan(0);
  const layer = await readDataLayer(page);
  const iDefault = layer.findIndex((e) => e[0] === "consent" && e[1] === "default");
  const iUpdate = layer.findIndex((e) => e[0] === "consent" && e[1] === "update");
  const iConfig = layer.findIndex((e) => e[0] === "config");
  expect(iDefault).toBeGreaterThanOrEqual(0);
  expect(iDefault).toBeLessThan(iUpdate);
  expect(iUpdate).toBeLessThan(iConfig);
  expect(layer[iUpdate][2]).toEqual(signals("granted"));
  expect(layer[iConfig]).toEqual(["config", GA_ID, { cookie_expires: 33696000 }]);
  expect(google.filter((u) => u === `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)).toHaveLength(1);
});

test("Analytique seul : analytics granted, publicité denied", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: false });
  const google = trackGoogleRequests(page);
  await open(page, "/");
  await banner(page).getByRole("button", { name: "Personnaliser" }).click();
  await page.getByRole("switch", { name: "Analytique" }).focus();
  await page.keyboard.press(" ");
  await page.getByRole("button", { name: "Enregistrer mes choix" }).click();
  await expect(banner(page)).toHaveCount(0);
  await expect.poll(() => google.length).toBeGreaterThan(0);
  const updates = consentUpdate(await readDataLayer(page));
  expect(updates.at(-1)[2]).toEqual({
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  expect(google.some((u) => u.startsWith("https://www.googletagmanager.com/gtag/js"))).toBe(true);
});

test("Publicité seule : ad_* granted et aucune requête Google", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: false });
  const google = trackGoogleRequests(page);
  await open(page, "/");
  await banner(page).getByRole("button", { name: "Personnaliser" }).click();
  await page.getByRole("switch", { name: "Publicité" }).focus();
  await page.keyboard.press(" ");
  await page.getByRole("button", { name: "Enregistrer mes choix" }).click();
  await expect(banner(page)).toHaveCount(0);
  const layer = await readDataLayer(page);
  expect(consentUpdate(layer).at(-1)[2]).toEqual({
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "denied",
  });
  expect(configs(layer)).toHaveLength(0);
  expect(google).toHaveLength(0);
});

test("visite suivante avec tout accepté : update granted et gtag.js sans bandeau", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: true });
  const google = trackGoogleRequests(page);
  await open(page, "/");
  await expect(banner(page)).toHaveCount(0);
  await expect.poll(() => google.length).toBeGreaterThan(0);
  const layer = await readDataLayer(page);
  expect(consentUpdate(layer).at(-1)[2]).toEqual(signals("granted"));
  expect(google.some((u) => u === `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)).toBe(true);
});

test("deux acceptations dans la même visite : un seul gtag.js et un seul config", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: false });
  await open(page, "/");
  await acceptAll(page);
  await page.evaluate(() => window.dispatchEvent(new Event("macar:consent-open")));
  await expect(banner(page)).toBeVisible();
  await acceptAll(page);
  expect(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count()).toBe(1);
  expect(configs(await readDataLayer(page))).toHaveLength(1);
});

test("navigation côté client après acceptation : un seul consent default", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: false });
  await page.setViewportSize({ width: 375, height: 812 });
  await open(page, "/");
  await acceptAll(page);
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
  expect(consentDefault(await readDataLayer(page))).toHaveLength(1);
});

// Retrait du consentement : les cookies Google déjà posés sont supprimés.
const manageButton = (page) => page.getByRole("button", { name: "Gérer mes cookies" });
const cookieNames = async (context) => (await context.cookies()).map((c) => c.name);

async function withdraw(page, label) {
  await manageButton(page).click();
  await expect(banner(page)).toBeVisible();
  await page.getByText(label, { exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer mes choix" }).click();
  await expect(banner(page)).toHaveCount(0);
}

test("retrait d'Analytique : update denied, ga-disable posé, _ga et _ga_* supprimés", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: true });
  await context.addCookies([
    { name: "_ga", value: "GA1.1.1.1", url: baseURL },
    { name: "_ga_TEST", value: "GS1.1.1", url: baseURL },
    { name: "_gac_TEST", value: "1", url: baseURL },
  ]);
  await open(page, "/");
  await withdraw(page, "Analytique");
  const updates = consentUpdate(await readDataLayer(page));
  expect(updates.at(-1)[2].analytics_storage).toBe("denied");
  expect(await page.evaluate((id) => window["ga-disable-" + id], GA_ID)).toBe(true);
  const names = await cookieNames(context);
  expect(names).not.toContain("_ga");
  expect(names).not.toContain("_ga_TEST");
  expect(names).toContain("_gac_TEST");
});

test("retrait de Publicité : _gcl_au supprimé", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: true });
  await context.addCookies([
    { name: "_ga", value: "GA1.1.1.1", url: baseURL },
    { name: "_gcl_au", value: "1.1.1", url: baseURL },
  ]);
  await open(page, "/");
  await withdraw(page, "Publicité");
  const names = await cookieNames(context);
  expect(names).not.toContain("_gcl_au");
  expect(names).toContain("_ga");
});

test("réacceptation d'Analytique après retrait : ga-disable repasse à false", async ({ page, context, baseURL }) => {
  test.skip(!GA_ID, SKIP);
  await prepare(context, baseURL, { consent: true });
  await open(page, "/");
  await withdraw(page, "Analytique");
  expect(await page.evaluate((id) => window["ga-disable-" + id], GA_ID)).toBe(true);
  await withdraw(page, "Analytique");
  expect(await page.evaluate((id) => window["ga-disable-" + id], GA_ID)).toBe(false);
});
