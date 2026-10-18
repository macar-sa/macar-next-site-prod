// Service pages as Google Ads landing pages: a call button at the top, the contact form on the
// page itself (same tracking and origin fields as on the home page), deliberate commune links.
import { test, expect } from "@playwright/test";
import { prepare, open, events, keepTelClicks, fulfillFormspree, FORMSPREE_ENDPOINT } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

const SERVICE_PATHS = ["/services/toiture", "/services/renovation", "/services/electricite", "/services/plomberie"];
const callButton = (page) => page.locator("main").getByRole("link", { name: "Appeler le 0478 23 50 08" });

for (const path of SERVICE_PATHS) {
  test(`${path} : bouton d'appel en haut et formulaire sur la page`, async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, path);
    await expect(callButton(page)).toHaveAttribute("href", "tel:+32478235008");
    await expect(callButton(page)).toBeInViewport();
    await expect(page.locator("#contact form")).toHaveCount(1);
    // The quote links of the page stay on the page.
    await expect(page.locator('main a[href="/#contact"]')).toHaveCount(0);
    await page.locator("main").getByRole("link", { name: "Demander un devis gratuit" }).click();
    await expect(page).toHaveURL(new RegExp(`${path}#contact$`));
    await expect(page.locator("#contact form")).toBeInViewport();
  });
}

test("bouton d'appel : phone_click compté comme sur l'accueil", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await keepTelClicks(page);
  await open(page, "/services/toiture");
  await callButton(page).click();
  expect(await events(page)).toEqual([["phone_click", { phone_number: "+32478235008", link_location: "page" }]]);
});

const SENT = "Merci pour votre confiance";

test("formulaire de la page toiture : generate_lead, origine, page et gclid", async ({ page, context, baseURL }) => {
  test.skip(!FORMSPREE_ENDPOINT, "build sans NEXT_PUBLIC_FORMSPREE_ENDPOINT");
  await prepare(context, baseURL);
  const bodies = await fulfillFormspree(context);
  await open(page, "/services/toiture?gclid=test123");
  const form = page.locator("#contact form");
  await form.getByLabel("Nom et Prénom", { exact: true }).fill("Jeanne Test");
  await form.getByLabel("Email", { exact: true }).fill("jeanne@example.com");
  await form.getByLabel("Téléphone", { exact: true }).fill("0470000000");
  await form.getByLabel("Message", { exact: true }).fill("Bonjour");
  await form.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText(SENT)).toBeVisible();
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toMatchObject({
    origine: "Pub Google, arrivée sur /services/toiture",
    page: "/services/toiture",
    gclid: "test123",
  });
  expect(await events(page)).toEqual([["generate_lead", { lead_source: "formulaire_contact" }]]);
});

test("toiture : Bruxelles-Ville en tête des communes liées", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/services/toiture");
  const zones = page.locator('main a[href^="/zones/"]');
  await expect(zones.first()).toHaveText("Bruxelles-Ville");
  await expect(zones.first()).toHaveAttribute("href", "/zones/bruxelles-ville");
  expect(await zones.count()).toBeGreaterThan(3);
  await expect(page.locator("main")).toContainText("échafaudage chiffré dans le devis");
});

test("autres services : Bruxelles-Ville aussi en tête", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/services/plomberie");
  await expect(page.locator('main a[href^="/zones/"]').first()).toHaveAttribute("href", "/zones/bruxelles-ville");
});

test("pages des nouvelles communes et sitemap", async ({ page, context, baseURL, request }) => {
  await prepare(context, baseURL);
  await open(page, "/zones/bruxelles-ville");
  await expect(page.locator("h1")).toHaveText("Rénovation, plomberie, électricité et toiture à Bruxelles-Ville");
  await expect(page.locator("main")).toContainText("Laeken (1020)");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const slug of ["bruxelles-ville", "ganshoren", "koekelberg", "berchem-sainte-agathe"]) {
    expect((await request.get(`/zones/${slug}`)).status()).toBe(200);
    expect(sitemap).toContain(`https://www.macar.be/zones/${slug}</loc>`);
  }
});
