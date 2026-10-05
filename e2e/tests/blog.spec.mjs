// Spec 2026-10-05, section 3 (blog): Card list, visible Breadcrumbs, Chip and Card on the article.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

const ARTICLE = "/blog/isolation-facade";
const TITLE = "Isolation de façade : techniques, TVA et où en sont les primes";
const LONG_ARTICLE = "/blog/degats-eaux-toiture-sinistre-assurance";
const trail = (page) => page.getByRole("navigation", { name: "Fil d'Ariane" });
const listCards = (page) => page.locator('main a[href^="/blog/"] > [data-slot="card"]');

test.describe("blog, 1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("liste : chaque article est une Card v3 cliquable avec une Chip de catégorie et un titre", async ({ page }) => {
    await open(page, "/blog");
    const n = await page.locator('main a[href^="/blog/"]').count();
    expect(n).toBeGreaterThan(0);
    await expect(listCards(page)).toHaveCount(n);
    await expect(listCards(page).locator(".chip.chip--accent.chip--soft.chip--sm")).toHaveCount(n);
    await expect(listCards(page).locator("h3")).toHaveCount(n);
  });

  test("article : fil d'Ariane Accueil / Blog / titre, le dernier non cliquable", async ({ page }) => {
    await open(page, ARTICLE);
    const items = trail(page).getByRole("listitem");
    await expect(items).toHaveCount(3);
    await expect(items.nth(0).getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/");
    await expect(items.nth(1).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    await expect(items.nth(2)).toHaveText(TITLE);
    await expect(items.nth(2).locator("a[href]")).toHaveCount(0);
    await expect(items.nth(2).locator('[aria-current="page"]')).toHaveText(TITLE);
  });

  // Review focus 2: React Aria links go through the Next.js router (RouterProvider).
  test("article : Blog dans le fil d'Ariane ouvre la liste sans recharger la page", async ({ page }) => {
    await open(page, ARTICLE);
    await page.evaluate(() => { window.__sansRechargement = true; });
    await trail(page).getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1, name: "Le blog Macar" })).toBeVisible();
    expect(await page.evaluate(() => window.__sansRechargement)).toBe(true);
  });

  test("article : catégorie et tags en Chip, encart et À lire ensuite en Card", async ({ page }) => {
    await open(page, ARTICLE);
    const article = page.locator("article");
    await expect(article.locator(".chip.chip--accent.chip--soft").first()).toHaveText("Rénovation");
    await expect(article.locator(".chip.chip--default").filter({ hasText: /^#/ }).first()).toBeVisible();
    const cta = article.locator('[data-slot="card"]').filter({ hasText: "Un projet en tête ?" });
    await expect(cta).toHaveCount(1);
    await expect(cta.getByRole("link", { name: "Demander un devis" })).toBeVisible();
    await expect(cta.getByRole("link", { name: "Voir nos services" })).toBeVisible();
    const related = page.locator("section").filter({ has: page.getByRole("heading", { name: "À lire ensuite" }) });
    await expect(related.locator('a[href^="/blog/"] > [data-slot="card"]')).toHaveCount(2);
  });
});

test.describe("blog, 375 px", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  // Review focus 1: .breadcrumbs__item is shrink-0, a long title must still wrap.
  test("le fil d'Ariane passe à la ligne au lieu de déborder", async ({ page }) => {
    await open(page, LONG_ARTICLE);
    const items = trail(page).getByRole("listitem");
    await expect(items).toHaveCount(3);
    const outside = await items.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().right).filter((right) => right > window.innerWidth));
    expect(outside).toEqual([]);
    await expect(items.nth(2)).toBeVisible();
  });
});

test.describe("contenu MDX", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("liens du texte : style Link v3 souligné, les externes dans un nouvel onglet", async ({ page }) => {
    await open(page, ARTICLE);
    const internal = page.locator('.prose-macar a[href="/services/renovation"]').first();
    await expect(internal).toHaveClass(/(^|\s)link(\s|$)/);
    await expect(internal).toHaveClass(/(^|\s)underline(\s|$)/);
    await expect(internal).not.toHaveAttribute("target", "_blank");
    const external = page.locator('.prose-macar a[href="https://renolution.brussels/fr/les-primes-renolution"]').first();
    await expect(external).toHaveClass(/(^|\s)link(\s|$)/);
    await expect(external).toHaveClass(/(^|\s)underline(\s|$)/);
    await expect(external).toHaveAttribute("target", "_blank");
    await expect(external).toHaveAttribute("rel", "noopener noreferrer");
  });
});

// Review minor 3: a tag is one string, so the Chip wraps it in its Label like the category chip.
test.describe("tags", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("chaque tag est une Chip avec son Chip.Label", async ({ page }) => {
    await open(page, ARTICLE);
    const tags = page.locator("article .chip.chip--default").filter({ hasText: /^#/ });
    const n = await tags.count();
    expect(n).toBeGreaterThan(0);
    await expect(tags.locator(".chip__label")).toHaveCount(n);
  });
});

// Blog rules (CLAUDE.md): no price and no "Bruxelles" in the blog's own presentation.
test.describe("présentation du blog", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("titre, description et introduction sans prix ni Bruxelles", async ({ page }) => {
    await open(page, "/blog");
    const texts = [
      await page.title(),
      await page.locator('meta[name="description"]').getAttribute("content"),
      await page.locator('meta[property="og:title"]').getAttribute("content"),
      await page.locator('meta[property="og:description"]').getAttribute("content"),
      await page.locator("main section").first().innerText(),
    ];
    for (const t of texts) expect(t).not.toMatch(/prix|bruxelles/i);
  });
});

// The article address loses "bruxelles"; the old address redirects permanently.
test("ancienne adresse de l'article dégâts des eaux : redirection permanente", async ({ request }) => {
  const old = await request.get("/blog/degats-eaux-toiture-bruxelles-sinistre-assurance", { maxRedirects: 0 });
  expect(old.status()).toBe(308);
  expect(old.headers()["location"]).toBe("/blog/degats-eaux-toiture-sinistre-assurance");
  expect((await request.get("/blog/degats-eaux-toiture-sinistre-assurance")).status()).toBe(200);
});
