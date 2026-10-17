// Conversions (spec 2026-10-17-conversions): events only with Analytics granted, read in dataLayer.
import { test, expect } from "@playwright/test";
import { prepare, open, events, CONSENT } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

// tel: links: keep the click in the page (headless Chromium has no dialer).
const keepTelClicks = (page) =>
  page.addInitScript(() => {
    document.addEventListener(
      "click",
      (e) => {
        const a = e.target instanceof Element && e.target.closest('a[href^="tel:"]');
        if (a) e.preventDefault();
      },
      true,
    );
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
