// Spec 2026-10-05, section 3 (legal pages): cookie Table in a horizontal ScrollShadow,
// Separator between sections instead of bottom borders.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

const COLUMNS = ["Cookie", "Émetteur", "Finalité", "Durée"];
const ROWS = ["_ga", "_ga_*", "_gcl_au", "_gcl_aw", "_fbp", "_fbc", "Vercel Analytics", "macar_consent", "macar_origine"];
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

test.describe("pages légales, forme juridique", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  // Plan 2026-10-21-mention-nom-commercial: Macar is the trade name of the SA registered at the BCE,
  // so Google can match the site to the VAT number.
  for (const path of ["/mentions-legales", "/politique-confidentialite"]) {
    test(`${path} : dénomination légale, nom commercial et numéro d'entreprise`, async ({ page }) => {
      await open(page, path);
      const main = page.locator("main");
      for (const text of ["M.A. Construction Assistance Rénovation SA", "nom commercial", "0477.451.024", "Avenue Prudent Bols 43-45"]) {
        await expect(main).toContainText(text);
      }
      for (const text of ["SRL", "Macar SA", "BE0477.45.10.24"]) await expect(main).not.toContainText(text);
    });
  }

  // Court registry stamp on the company's acts in the Moniteur belge (filing of 2 August 2019).
  test("/mentions-legales : RPM et tribunal", async ({ page }) => {
    await open(page, "/mentions-legales");
    await expect(page.locator("main")).toContainText("RPM Bruxelles (tribunal de l'entreprise francophone de Bruxelles)");
  });
});

// Spec 2026-10-17-conversions, 6.2: Google asks the site to name each party that receives data,
// explain its use and say how to withdraw consent.
test.describe("politique de confidentialité, publicités", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("nomme Google Ads, GA4 et Meta, avec leurs liens", async ({ page }) => {
    await open(page, "/politique-confidentialite");
    const main = page.locator("main");
    for (const text of ["Google Ads", "Google Analytics 4", "Meta Platforms Ireland Limited", "identifiant du clic", "numéro de téléphone"]) {
      await expect(main).toContainText(text);
    }
    await expect(main.locator('a[href="https://policies.google.com/technologies/partner-sites"]')).toHaveCount(1);
    await expect(main.locator('a[href="https://www.facebook.com/privacy/policy/"]')).toHaveCount(1);
  });

  test("Gérer mes cookies rouvre les préférences depuis la page", async ({ page }) => {
    await open(page, "/politique-confidentialite");
    await page.locator("main").getByRole("button", { name: "Gérer mes cookies" }).click();
    await expect(page.getByRole("region", { name: "Consentement aux cookies" })).toBeVisible();
    await expect(page.getByRole("switch")).toHaveCount(3);
  });

  for (const path of ["/politique-confidentialite", "/politique-cookies"]) {
    test(`${path} : aucun tiret long`, async ({ page }) => {
      await open(page, path);
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(/[\u2013\u2014]/);
    });
  }
});

// Plan 2026-10-21-mention-nom-commercial: the JSON-LD keeps the brand and the Google listing address,
// and links them to the entity registered at the BCE.
test.describe("données structurées, entité juridique", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("LocalBusiness : nom Macar, dénomination légale et numéros", async ({ page }) => {
    await open(page, "/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const business = blocks.map((b) => JSON.parse(b)).find((d) => d["@id"] === "https://www.macar.be/#localbusiness");
    expect(business).toMatchObject({
      name: "Macar",
      legalName: "M.A. Construction Assistance Rénovation SA",
      alternateName: ["M.A.C.A.R.", "Macar - Construction, Assistance, Rénovation"],
      vatID: "BE0477451024",
      taxID: "0477.451.024",
      address: { streetAddress: "Avenue Prudent Bols, 43", postalCode: "1020" },
    });
  });

  test("llms.txt nomme la société derrière le nom commercial", async ({ request }) => {
    const text = await (await request.get("/llms.txt")).text();
    expect(text).toContain("M.A. Construction Assistance Rénovation SA");
    expect(text).toContain("BE 0477.451.024");
    expect(text).not.toContain("BE0477.45.10.24");
  });
});
