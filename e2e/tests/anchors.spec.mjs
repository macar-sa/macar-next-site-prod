// Home page anchors: the sticky navigation bar must not cover the title of the section a link
// scrolls to (#services, #contact, #faq, #reviews).
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

const TARGETS = [
  { link: 'main a[href="/#services"]', id: "services" },
  { link: 'main a[href="/#contact"]', id: "contact" },
  { link: 'a[href="/#faq"]', id: "faq" },
  { link: 'main a[href="/#reviews"]', id: "reviews" },
];

for (const width of [375, 1440]) {
  test.describe(`ancres de l'accueil, ${width} px`, () => {
    test.use({ viewport: { width, height: width < 500 ? 812 : 900 } });
    test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

    for (const { link, id } of TARGETS) {
      test(`#${id} : le titre de la section reste sous la barre de navigation`, async ({ page }) => {
        await open(page, "/");
        await page.locator(link).filter({ visible: true }).last().click();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        // Wait for the smooth scroll to settle.
        let last = -1;
        await expect.poll(async () => {
          const y = await page.evaluate(() => window.scrollY);
          const settled = y === last;
          last = y;
          return settled;
        }, { timeout: 5000, intervals: [200] }).toBe(true);
        const { headingTop, navBottom } = await page.evaluate((sectionId) => ({
          headingTop: document.getElementById(sectionId).querySelector("h1, h2, h3").getBoundingClientRect().top,
          navBottom: document.querySelector("nav").getBoundingClientRect().bottom,
        }), id);
        expect(headingTop).toBeGreaterThanOrEqual(navBottom);
      });
    }
  });
}
