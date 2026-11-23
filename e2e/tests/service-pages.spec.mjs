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

// Audit 23/11/2026: services Macar does (checked in its quotes) that the pages did not say.
test.describe("contenu des pages de service", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("toiture : sinistres et rapport d'expert", async ({ page }) => {
    await open(page, "/services/toiture");
    const main = page.locator("main");
    await expect(main).toContainText(/sinistre/i);
    await expect(main).toContainText("rapport d'expert");
    await expect(main.locator('a[href="/blog/degats-eaux-toiture-sinistre-assurance"]')).toHaveCount(1);
  });

  test("plomberie : urgences en journée dès le premier écran", async ({ page }) => {
    await open(page, "/services/plomberie");
    const beforeFirstH2 = await page.locator("main").evaluate((main) => {
      const h2 = main.querySelector("h2");
      const range = document.createRange();
      range.setStart(main, 0);
      range.setEndBefore(h2);
      return range.toString();
    });
    expect(beforeFirstH2).toContain("urgences en journée");
  });

  test("rénovation : châssis et fenêtres", async ({ page }) => {
    await open(page, "/services/renovation");
    await expect(page.locator("main h3", { hasText: /^Châssis et fenêtres$/ })).toHaveCount(1);
  });

  test("copropriétés", async ({ page }) => {
    for (const path of ["/services/toiture", "/services/renovation"]) {
      await open(page, path);
      await expect(page.locator("main"), path).toContainText(/copropriété/i);
    }
  });
});

// Phase 2 review: no capability Macar has not confirmed; PVC frames on a street façade need a permit.
test("toiture : pas de bâchage ni de facturation à l'assureur non confirmés", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/services/toiture");
  await expect(page.locator("main")).not.toContainText(/bâchage|facturation directe/i);
});

test("rénovation : le permis pour les châssis à rue est signalé", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/services/renovation");
  const frames = page.locator("main h3", { hasText: /^Châssis et fenêtres$/ }).locator("xpath=..");
  await expect(frames).toContainText(/permis d'urbanisme/);
});

// Macar, 23/11/2026: leaks are found by a specialist detection company or by Macar depending on
// the case; Macar repairs them. "Détection de fuites" is not sold as a Macar service, and no
// detection company is named.
test("plomberie : réparation de fuites, pas de détection vendue comme service", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/services/plomberie");
  const main = page.locator("main");
  await expect(main).not.toContainText(/détection de fuites(?! établi)/i);
  await expect(main).not.toContainText(/NDDetect|Polygon/i);
  await expect(main.locator("h3", { hasText: /^Réparation de fuites et étanchéité$/ })).toHaveCount(1);
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).not.toMatch(/détection/i);
  const llms = await (await page.request.get("/llms.txt")).text();
  expect(llms).not.toMatch(/détection de fuites/i);
});
