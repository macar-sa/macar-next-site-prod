// Spec 7: FAQ, one open answer per column, arrows, Home and End. Native v3 Accordion (spec 4).
import { test, expect } from "@playwright/test";
import { prepare, open, keyboardFocus } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });
test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

const triggers = (page) => page.locator("#faq [data-faq-trigger]");
const expanded = (page) => triggers(page).evaluateAll((els) => els.map((e) => e.getAttribute("aria-expanded")));
const activeIndex = (page) => page.evaluate(() => [...document.querySelectorAll("#faq [data-faq-trigger]")].indexOf(document.activeElement));

test("7 questions en 2 colonnes (4 et 3), titres h2, toutes fermées", async ({ page }) => {
  await open(page, "/");
  const perColumn = await page.locator("#faq [data-faq-column]").evaluateAll((cols) => cols.map((c) => c.querySelectorAll("[data-faq-trigger]").length));
  expect(perColumn).toEqual([4, 3]);
  await expect(page.locator("#faq h2 [data-faq-trigger]")).toHaveCount(7);
  expect(await expanded(page)).toEqual(Array(7).fill("false"));
});

test("une seule réponse ouverte par colonne, colonnes indépendantes", async ({ page }) => {
  await open(page, "/");
  await triggers(page).nth(0).click();
  await triggers(page).nth(1).click();
  await triggers(page).nth(4).click();
  await expect.poll(() => expanded(page)).toEqual(["false", "true", "false", "false", "true", "false", "false"]);
  await expect(page.getByText("Macar est située au 43, avenue Prudent Bols")).toBeVisible();
  await triggers(page).nth(1).click();
  await expect.poll(() => expanded(page)).toEqual(["false", "false", "false", "false", "true", "false", "false"]);
});

test("flèches, Début et Fin déplacent le focus dans la colonne, sans boucler ni ouvrir", async ({ page }) => {
  await open(page, "/");
  await keyboardFocus(page, triggers(page).nth(0));
  for (const [key, index] of [["ArrowDown", 1], ["ArrowDown", 2], ["ArrowDown", 3], ["ArrowDown", 3], ["Home", 0], ["ArrowUp", 0], ["End", 3], ["ArrowUp", 2]]) {
    await page.keyboard.press(key);
    expect(await activeIndex(page), `après ${key}`).toBe(index);
  }
  await keyboardFocus(page, triggers(page).nth(4));
  for (const [key, index] of [["ArrowUp", 4], ["End", 6], ["ArrowDown", 6], ["Home", 4]]) {
    await page.keyboard.press(key);
    expect(await activeIndex(page), `après ${key}`).toBe(index);
  }
  expect(await expanded(page)).toEqual(Array(7).fill("false"));
});

test("style natif : séparateurs et indicateur de l'Accordion v3, ni <hr> ni flèche v2", async ({ page }) => {
  await open(page, "/");
  await expect(page.locator("#faq hr")).toHaveCount(0);
  await expect(page.locator('#faq path[d="M15.5 19l-7-7 7-7"]')).toHaveCount(0);
  await expect(page.locator('#faq [data-slot="accordion-indicator"]')).toHaveCount(7);
});
