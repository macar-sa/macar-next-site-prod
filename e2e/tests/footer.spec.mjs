// On a computer, the first row of the footer (logo, "Pour des informations supplémentaires",
// info@macar.be button) ends up exactly behind the sticky navigation bar when the page is
// scrolled to the very bottom, so its logo and blue button do not show twice.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

const row = (page) => page.locator("[data-footer-top]");

for (const height of [768, 900, 1200]) {
  for (const path of ["/", "/politique-cookies", "/page-introuvable-harness"]) {
    test(`1440 x ${height}, ${path} : tout en bas, la première ligne du pied de page est derrière la barre`, async ({ page, context, baseURL }) => {
      await page.setViewportSize({ width: 1440, height });
      await prepare(context, baseURL);
      await open(page, path);
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await page.waitForTimeout(300);
      const nav = await page.locator("nav").first().boundingBox();
      const box = await row(page).boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(nav.y - 1);
      expect(box.y + box.height).toBeLessThanOrEqual(nav.y + nav.height + 1);
      await expect(row(page).getByRole("link", { name: "info@macar.be" })).toBeAttached();
    });
  }
}

// On a phone the bar has no logo nor blue button: the footer keeps its natural height, no empty
// space added under the copyright.
test("375 px : pas d'espace ajouté sous le pied de page", async ({ page, context, baseURL }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await prepare(context, baseURL);
  await open(page, "/");
  const gap = await page.evaluate(() => {
    const copyright = [...document.querySelectorAll("p")].find((p) => p.textContent.startsWith("Copyright"));
    const list = copyright.parentElement;
    return document.documentElement.scrollHeight - (list.getBoundingClientRect().bottom + window.scrollY);
  });
  expect(gap).toBe(56);
});
