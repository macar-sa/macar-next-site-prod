// Review focus 2 and 5: no horizontal scroll at 320 px on any page, keyboard access of the v3 links.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";
import { PAGES } from "../helpers.mjs";

test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

// Review focus 2: v3 buttons never wrap their label, so a row of them can overflow a small phone.
test.describe("320 px", () => {
  test.use({ viewport: { width: 320, height: 568 } });
  for (const p of PAGES) {
    test(`${p.path} : aucun défilement horizontal`, async ({ page }) => {
      await open(page, p.path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    });
  }
});

test.describe("1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // Review focus 5: one Tab stop per navbar link, each with a visible focus style.
  test("barre de navigation : un arrêt Tab par lien, focus visible", async ({ page }) => {
    await open(page, "/about");
    const names = ["Accueil", "Découvrez Macar", "Services", "Blog", "FAQ", "Nous recrutons", "Demander un devis"];
    await page.locator('nav a[href="/"]:visible').first().focus();
    const seen = [];
    for (let i = 0; i < names.length; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const s = getComputedStyle(el);
        return { text: el.textContent.trim(), ring: s.outlineStyle !== "none" || s.boxShadow !== "none" };
      });
      expect(info.ring, `focus visible sur ${info.text}`).toBe(true);
      seen.push(info.text);
    }
    expect(seen).toEqual(names);
  });

  test("un lien de la barre navigue sans recharger la page", async ({ page }) => {
    await open(page, "/");
    await page.evaluate(() => { window.__macarAlive = true; });
    await page.locator("nav").getByRole("link", { name: "Services", exact: true }).click();
    await expect(page).toHaveURL(/\/services$/);
    expect(await page.evaluate(() => window.__macarAlive === true)).toBe(true);
  });
});
