// Commune pages and their /zones hub (plan 2026-11-23-corrections-audit-seo-geo).
import { test, expect } from "@playwright/test";
import { prepare, open, jsonLd } from "../helpers.mjs";

const SLUGS = [
  "bruxelles-ville", "uccle", "schaerbeek", "ixelles", "etterbeek", "saint-gilles", "forest",
  "woluwe-saint-lambert", "woluwe-saint-pierre", "anderlecht", "jette", "evere",
  "molenbeek-saint-jean", "ganshoren", "koekelberg", "berchem-sainte-agathe",
  "auderghem", "watermael-boitsfort", "saint-josse-ten-noode",
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

// Final review: 16 of the 19 Brussels communes have a page, the hub must not claim all of them.
test("/zones : pas d'affirmation sur toutes les communes", async ({ page }) => {
  await open(page, "/zones");
  await expect(page.locator("main")).not.toContainText("Chaque commune bruxelloise a sa page");
});

// Task 11: every commune has its own introduction, long enough and not a copy of another one.
const words = (text) => text.trim().split(/\s+/).filter(Boolean);
const vocabulary = (text, name) => {
  const nameWords = new Set((name.toLowerCase().match(/\p{L}+/gu) ?? []));
  return new Set((text.toLowerCase().match(/\p{L}{4,}/gu) ?? []).filter((w) => !nameWords.has(w)));
};

test("chaque commune a son texte, et les textes diffèrent", async ({ page }) => {
  test.setTimeout(120_000);
  const intros = [];
  for (const slug of SLUGS) {
    const response = await page.goto(`/zones/${slug}`);
    expect(response.status(), slug).toBe(200);
    const name = await page.locator("main h1").innerText();
    const text = await page.locator("main p").first().innerText();
    expect(words(text).length, `${slug} : nombre de mots`).toBeGreaterThanOrEqual(120);
    intros.push({ slug, vocab: vocabulary(text, name.replace(/^.* à /, "")) });
  }
  for (let i = 0; i < intros.length; i++) {
    for (let j = i + 1; j < intros.length; j++) {
      const a = intros[i].vocab, b = intros[j].vocab;
      const common = [...a].filter((w) => b.has(w)).length;
      const jaccard = common / (a.size + b.size - common);
      expect(jaccard, `${intros[i].slug} / ${intros[j].slug}`).toBeLessThan(0.5);
    }
  }
});

test("19 communes dans le sitemap et llms.txt", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const inSitemap = new Set(xml.match(/https:\/\/www\.macar\.be\/zones\/[a-z-]+/g));
  expect(inSitemap.size).toBe(19);
  const llms = await (await request.get("/llms.txt")).text();
  const inLlms = new Set(llms.match(/\/zones\/[a-z-]+/g));
  expect(inLlms.size).toBe(19);
  for (const slug of SLUGS) expect(llms).toContain(`/zones/${slug})`);
});
