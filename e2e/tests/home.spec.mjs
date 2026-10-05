// Spec 2026-10-05, section 3 (home): key figures in three v3 Cards, strengths in five v3 Chips.
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

  test("chiffres clés : trois Card v3, chiffre et libellé", async ({ page }) => {
    await expect(statCards(page).locator("h4")).toHaveText(["+6000", "24 ans", "+95%"]);
    await expect(statCards(page).locator(".card__description")).toHaveText(["Projets de Rénovation", "d'Expérience", "Taux de Réussite des Projets"]);
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
    await expect(statCards(page)).toHaveCount(3);
    const overflowing = await statCards(page).evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth).length);
    expect(overflowing).toBe(0);
  });
});
