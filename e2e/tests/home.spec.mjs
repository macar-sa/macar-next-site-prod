// Spec 2026-10-05, section 3 (home): key figures in v3 Cards (two since the unverifiable success rate was removed), strengths in five v3 Chips.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

const STRENGTHS = ["Réponse rapide", "Devis personnalisé et gratuit", "Experts Engagés", "Transparence", "Qualité"];
const statCards = (page) => page.locator('main [data-slot="card"]').filter({ has: page.locator("h4") });

test.describe("accueil, 1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
  });

  test("chiffres clés : deux Card v3, chiffre et libellé", async ({ page }) => {
    await expect(statCards(page).locator("h4")).toHaveText(["+6000", "24 ans"]);
    await expect(statCards(page).locator(".card__description")).toHaveText(["Projets de Rénovation", "d'Expérience"]);
  });

  test("atouts : cinq Chip v3 avec une coche", async ({ page }) => {
    const chips = page.locator("#contact .chip");
    await expect(chips).toHaveText(STRENGTHS);
    for (let i = 0; i < STRENGTHS.length; i++) await expect(chips.nth(i).locator("svg.lucide-check")).toHaveCount(1);
  });
});

test.describe("accueil, 320 px", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("chiffres clés : chaque Card contient son texte", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
    await expect(statCards(page)).toHaveCount(2);
    const overflowing = await statCards(page).evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth).length);
    expect(overflowing).toBe(0);
  });
});

// Audit 23/11/2026: the first screen faded in from opacity 0 with framer-motion, so before
// hydration (slow phone, crawler without JavaScript) the heading was invisible.
test.describe("premier écran sans JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });

  for (const path of ["/", "/services/toiture", "/zones/ixelles", "/zones", "/blog/isolation-facade"]) {
    test(`${path} : le titre est visible avant l'hydratation`, async ({ page }) => {
      await page.goto(path);
      const opacities = await page.locator("main h1").evaluate((h1) => {
        const out = [];
        for (let el = h1; el && el !== document.body; el = el.parentElement) out.push(getComputedStyle(el).opacity);
        return out;
      });
      expect(opacities.every((o) => o === "1"), opacities.join(",")).toBe(true);
    });
  }
});

// Audit 23/11/2026: on a phone the call and quote buttons were below the first screen.
test.describe("premier écran mobile : appeler et demander un devis", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  for (const path of ["/", "/zones/ixelles"]) {
    test(`${path} : bouton d'appel et lien de devis visibles sans défiler`, async ({ page }) => {
      await open(page, path);
      const call = page.locator('main a[href="tel:+32478235008"]').filter({ visible: true }).first();
      await expect(call).toHaveText("Appeler le 0478 23 50 08");
      await expect(call).toBeInViewport({ ratio: 1 });
      const quote = page.locator('main a[href="/#contact"]').filter({ visible: true }).first();
      await expect(quote).toBeInViewport({ ratio: 1 });
    });
  }
});
