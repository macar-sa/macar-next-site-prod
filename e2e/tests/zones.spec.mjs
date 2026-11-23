// Commune pages and their /zones hub (plan 2026-11-23-corrections-audit-seo-geo).
import { test, expect } from "@playwright/test";
import { prepare, open, jsonLd } from "../helpers.mjs";

const SLUGS = [
  "bruxelles-ville", "uccle", "schaerbeek", "ixelles", "etterbeek", "saint-gilles", "forest",
  "woluwe-saint-lambert", "woluwe-saint-pierre", "anderlecht", "jette", "evere",
  "molenbeek-saint-jean", "ganshoren", "koekelberg", "berchem-sainte-agathe",
];

test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

test("/zones : une page qui liste chaque commune", async ({ page }) => {
  const response = await page.goto("/zones");
  expect(response.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  for (const slug of SLUGS) await expect(page.locator(`main a[href="/zones/${slug}"]`)).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.macar.be/zones");
});

test("fil d'Ariane d'une commune : Accueil, Zones, commune", async ({ page }) => {
  await open(page, "/zones/ixelles");
  const crumbs = (await jsonLd(page)).find((n) => n["@type"] === "BreadcrumbList");
  expect(crumbs.itemListElement.map((i) => i.item)).toEqual([
    "https://www.macar.be/",
    "https://www.macar.be/zones",
    "https://www.macar.be/zones/ixelles",
  ]);
});

test("pied de page : lien vers les zones desservies", async ({ page }) => {
  await open(page, "/");
  await expect(page.locator("footer").getByRole("link", { name: "Zones desservies" })).toHaveAttribute("href", "/zones");
});

test("sitemap : /zones présent", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("<loc>https://www.macar.be/zones</loc>");
});
