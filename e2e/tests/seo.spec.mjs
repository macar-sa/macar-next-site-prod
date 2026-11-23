// Search-engine and AI-crawler facing details: structured data, OpenGraph, sitemap, headers,
// llms.txt (plan 2026-11-23-corrections-audit-seo-geo).
import { test, expect } from "@playwright/test";
import { prepare, open, jsonLd, PAGES } from "../helpers.mjs";

const BUSINESS_ID = "https://www.macar.be/#localbusiness";

test("JSON-LD : deux contactPoint, mobile et fixe", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/");
  const business = (await jsonLd(page)).find((n) => n["@id"] === BUSINESS_ID);
  expect(business.telephone).toBe("+32478235008");
  const phones = (business.contactPoint || []).map((c) => c.telephone);
  expect(phones).toEqual(expect.arrayContaining(["+32478235008", "+3224665304"]));
});

const ZONE_SENTENCE = "Macar intervient partout en Belgique, et avant tout à Bruxelles, où l'entreprise est basée depuis 2002.";

test("llms.txt en Markdown", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.status()).toBe(200);
  const text = await response.text();
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  expect(lines[0]).toMatch(/^# /);
  expect(lines[1]).toMatch(/^> /);
  const linkLines = lines.filter((l) => l.startsWith("- ") && l.includes("https://www.macar.be"));
  expect(linkLines.length).toBeGreaterThan(20);
  for (const line of linkLines) expect(line).toMatch(/^- \[[^\]]+\]\(https:\/\/www\.macar\.be[^)]*\)/);
  expect(text).not.toContain("19 communes");
  expect(text).toContain(ZONE_SENTENCE);
});

test("areaServed : Belgique, Région bruxelloise et communes", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/");
  const business = (await jsonLd(page)).find((n) => n["@id"] === BUSINESS_ID);
  const areas = business.areaServed;
  expect(areas).toContainEqual({ "@type": "Country", name: "Belgique" });
  expect(areas).toContainEqual({ "@type": "AdministrativeArea", name: "Région de Bruxelles-Capitale" });
  expect(areas.filter((a) => a.name === "Bruxelles")).toEqual([]);
  expect(areas.filter((a) => a.name === "Bruxelles-Ville")).toHaveLength(1);
});

// Audit 2026-11-23: 24 pages had no og:image (a page's openGraph replaced the layout's instead of
// extending it) and /about and /job shared the home page's og:url.
const SITE = "https://www.macar.be";
const strip = (url) => url.replace(/\/$/, "");
for (const p of PAGES.filter((p) => p.slug !== "not-found")) {
  test(`${p.path} : OpenGraph et canonique`, async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, p.path);
    const expected = SITE + p.path;
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", /^https:\/\/www\.macar\.be\//);
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(strip(ogUrl)).toBe(strip(expected));
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(strip(canonical)).toBe(strip(expected));
  });
}

// Audit 2026-11-23: every static page carried the build date as lastmod, which tells search
// engines nothing. Only dated content (articles) keeps one.
test("sitemap : lastmod seulement sur les articles", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const entry = (loc) => xml.split("<url>").find((u) => u.includes(`<loc>${loc}</loc>`)) || "";
  expect(entry("https://www.macar.be/about")).not.toContain("<lastmod>");
  expect(entry("https://www.macar.be/zones/ixelles")).not.toContain("<lastmod>");
  expect(entry("https://www.macar.be/blog/isolation-facade")).toMatch(/<lastmod>2026-10-02/);
  expect(xml).not.toContain("<priority>");
  expect(xml).not.toContain("<changefreq>");
});

// Audit 2026-11-23: only HSTS was sent. No Content-Security-Policy yet (Google, Meta, Formspree
// and Vercel Analytics would need an allow-list first).
test("en-têtes de sécurité", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
});

test("icônes du manifeste", async ({ request }) => {
  const manifest = await (await request.get("/favicon/site.webmanifest")).json();
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status(), icon.src).toBe(200);
});
