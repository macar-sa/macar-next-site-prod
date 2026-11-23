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
    // Final review: the layout's twitter title was inherited by every page.
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", ogTitle);
  });
}

// Audit 2026-11-23: every static page carried the build date as lastmod, which tells search
// engines nothing. Only dated content (articles) keeps one.
test("sitemap : lastmod seulement sur les articles", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const entry = (loc) => xml.split("<url>").find((u) => u.includes(`<loc>${loc}</loc>`)) || "";
  expect(entry("https://www.macar.be/about")).not.toContain("<lastmod>");
  expect(entry("https://www.macar.be/zones/ixelles")).not.toContain("<lastmod>");
  expect(entry("https://www.macar.be/blog/isolation-facade")).toMatch(/<lastmod>2026-11-23/);
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

test("avis : 20 dans le JSON-LD", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/");
  const business = (await jsonLd(page)).find((n) => n["@id"] === BUSINESS_ID);
  expect(business.aggregateRating.reviewCount).toBe("20");
});

test("WebSite relié à l'entreprise", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/");
  const site = (await jsonLd(page)).find((n) => n["@type"] === "WebSite");
  expect(site["@id"]).toBe("https://www.macar.be/#website");
  expect(site.inLanguage).toBe("fr-BE");
  expect(site.publisher["@id"]).toBe(BUSINESS_ID);
});

test("JobPosting sur /job", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/job");
  const job = (await jsonLd(page)).find((n) => n["@type"] === "JobPosting");
  expect(job.title).toBe("Ouvrier polyvalent (Indépendant)");
  expect(job.employmentType).toBe("CONTRACTOR");
  expect(job.hiringOrganization["@id"]).toBe(BUSINESS_ID);
  expect(job.hiringOrganization["@type"]).toBe("Organization");
  expect(job.jobLocation.address.postalCode).toBe("1020");
  expect(job.datePosted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(job.validThrough).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(new Date(job.validThrough).getTime()).toBeGreaterThan(Date.now());
});

test("BlogPosting signé par le gérant", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/blog/isolation-facade");
  const post = (await jsonLd(page)).find((n) => n["@type"] === "BlogPosting");
  expect(post.author["@type"]).toBe("Person");
  expect(post.author.name).toBe("Shkelzen Shalaj");
  expect(post.datePublished).toMatch(/(Z|[+-]\d{2}:\d{2})$/);
});

test("Service relié au catalogue de l'entreprise", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/services/toiture");
  const nodes = await jsonLd(page);
  const service = nodes.find((n) => n["@type"] === "Service" && n.url === "https://www.macar.be/services/toiture");
  expect(service["@id"]).toBe("https://www.macar.be/services/toiture#service");
  const business = nodes.find((n) => n["@id"] === BUSINESS_ID);
  const ids = business.hasOfferCatalog.itemListElement.map((o) => o.itemOffered["@id"]);
  expect(ids).toContain("https://www.macar.be/services/toiture#service");
});

test("article : l'auteur du JSON-LD est visible sur la page", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/blog/isolation-facade");
  await expect(page.locator("main")).toContainText("Par Shkelzen Shalaj, gérant");
});

// Task 12: the about page says who runs Macar and how it works, with facts Macar confirmed
// (23/11/2026): business liability insurance, no decennial guarantee, no "on time" promise.
test("À propos : gérant, assurance et page reliée à l'entreprise", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/about");
  const main = page.locator("main");
  for (const text of ["Shkelzen Shalaj", "responsabilité civile", "2002", "2010", "valable 30 jours", "5 %", "40 %", "45 %", "10 %"]) {
    await expect(main).toContainText(text);
  }
  await expect(main).not.toContainText("décennale");
  await expect(main).not.toContainText("dans les temps");
  await expect(main).toContainText("Macar est couverte");
  const about = (await jsonLd(page)).find((n) => n["@type"] === "AboutPage");
  expect(about?.url).toBe("https://www.macar.be/about");
  expect(about?.about?.["@id"]).toBe("https://www.macar.be/#localbusiness");
});
