// Spec 5 and 7: mobile menu, a v3 Button (icon only) opening a v3 Drawer from the left.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

test.use({ viewport: { width: 375, height: 812 } });
test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

const LINKS = ["Accueil", "Découvrez Macar", "Services", "Blog", "FAQ", "Nous recrutons", "Demander un devis"];
const menuButton = (page) => page.getByRole("button", { name: "Ouvrir le menu" });
const drawer = (page) => page.getByRole("dialog", { name: "Menu" });

async function openMenu(page, url = "/") {
  await open(page, url);
  await menuButton(page).click();
  await expect(drawer(page)).toBeVisible();
}

test("le bouton ouvre un Drawer à gauche avec les 6 liens, un séparateur et le devis", async ({ page }) => {
  await openMenu(page);
  for (const name of LINKS) await expect(drawer(page).getByRole("link", { name, exact: true })).toHaveCount(1);
  await expect(drawer(page).getByRole("separator")).toHaveCount(1);
  const box = await drawer(page).boundingBox();
  expect(box.x).toBeLessThanOrEqual(1);
});

test("choisir un lien navigue et ferme le Drawer", async ({ page }) => {
  await openMenu(page);
  await drawer(page).getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(drawer(page)).toHaveCount(0);
});

test("Échap ferme le Drawer et rend le focus au bouton", async ({ page }) => {
  await openMenu(page);
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toHaveCount(0);
  await expect(menuButton(page)).toBeFocused();
});

test("la croix ferme le Drawer", async ({ page }) => {
  await openMenu(page);
  await drawer(page).getByRole("button", { name: "Fermer le menu" }).click();
  await expect(drawer(page)).toHaveCount(0);
});

test("un clic sur le fond ferme le Drawer", async ({ page }) => {
  await openMenu(page);
  // Time-based animations only: the reviews ScrollShadow fade is a scroll-driven animation,
  // always "running".
  await page.waitForFunction(() => document.getAnimations().every((a) => !(a.timeline instanceof DocumentTimeline) || a.playState !== "running"));
  const box = await drawer(page).boundingBox();
  const viewport = page.viewportSize();
  const x = Math.min(viewport.width - 5, box.x + box.width + 20);
  expect(x).toBeGreaterThan(box.x + box.width);
  await page.mouse.click(x, 400);
  await expect(drawer(page)).toHaveCount(0);
});

test("page bloquée derrière le Drawer, le focus reste dans le panneau", async ({ page }) => {
  await openMenu(page);
  const y0 = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBe(y0);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await drawer(page).evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
});

test("à 320 px, menu ouvert : aucun défilement horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openMenu(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

// Review focus 1: an in-page anchor chosen from the Drawer on the page it points to.
test("FAQ depuis le Drawer sur l'accueil : Drawer fermé, FAQ à l'écran, page de nouveau défilable", async ({ page }) => {
  await openMenu(page);
  await drawer(page).getByRole("link", { name: "FAQ", exact: true }).click();
  await expect(drawer(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const b = document.getElementById("faq").getBoundingClientRect();
    return b.top < window.innerHeight && b.bottom > 0;
  })).toBe(true);
  const y = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(y);
});
