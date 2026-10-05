// Spec 2026-10-05, section 3 (legal pages): cookie Table in a horizontal ScrollShadow,
// Separator between sections instead of bottom borders.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

const COLUMNS = ["Cookie", "Émetteur", "Finalité", "Durée"];
const ROWS = ["_ga", "_ga_*", "Vercel Analytics", "macar_cookie_consent_is_true"];
const cookieTable = (page) =>
  page.getByRole("grid", { name: "Cookies utilisés" }).or(page.getByRole("table", { name: "Cookies utilisés" }));

for (const width of [1440, 375]) {
  test.describe(`politique cookies, ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

    test("Table v3 : en-têtes et lignes attendus", async ({ page }) => {
      await open(page, "/politique-cookies");
      const table = cookieTable(page);
      await expect(table).toBeVisible();
      await expect(table.getByRole("columnheader")).toHaveText(COLUMNS);
      const rows = table.getByRole("row");
      await expect(rows).toHaveCount(ROWS.length + 1);
      for (const [i, name] of ROWS.entries()) await expect(rows.nth(i + 1)).toContainText(name);
    });
  });
}

test.describe("politique cookies, 375 px, défilement", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  // Review focus 3: on a phone the ScrollShadow scrolls, inside the screen.
  test("le tableau défile dans le ScrollShadow, pas la page", async ({ page }) => {
    await open(page, "/politique-cookies");
    const shadow = page.locator('[data-slot="table"] [data-slot="scroll-shadow"]');
    await expect(shadow).toHaveAttribute("data-orientation", "horizontal");
    await expect(shadow.locator("table")).toHaveCount(1);
    const box = await shadow.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth, right: el.getBoundingClientRect().right }));
    expect(box.scroll).toBeGreaterThan(box.client);
    expect(box.right).toBeLessThanOrEqual(375);
  });
});

test.describe("pages légales, Separator entre les sections", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  for (const [path, count] of [["/mentions-legales", 7], ["/politique-confidentialite", 7], ["/politique-cookies", 3]]) {
    test(`${path} : ${count} Separator v3, plus de bordure basse`, async ({ page }) => {
      await open(page, path);
      await expect(page.locator("main").getByRole("separator")).toHaveCount(count);
      const bordered = await page.locator("main section section").evaluateAll((els) =>
        els.filter((el) => parseFloat(getComputedStyle(el).borderBottomWidth) > 0).length);
      expect(bordered).toBe(0);
    });
  }
});
