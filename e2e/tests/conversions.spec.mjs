// Conversions (spec 2026-10-17-conversions): events only with Analytics granted, read in dataLayer.
import { test, expect } from "@playwright/test";
import { prepare, open, events, CONSENT, fulfillFormspree, FORMSPREE_ENDPOINT } from "../helpers.mjs";

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

// Contact form: generate_lead only once Formspree has answered OK.
const SKIP_FORM = "build sans NEXT_PUBLIC_FORMSPREE_ENDPOINT";
const SENT = "Merci pour votre confiance";

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
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies).toHaveLength(1);
    expect(await events(page)).toEqual([["generate_lead", { lead_source: "formulaire_contact" }]]);
  });

  test("envoi réussi, Analytique refusé : aucun événement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: CONSENT.none });
    await fulfillFormspree(context);
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
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
