// Search-engine and AI-crawler facing details: structured data, OpenGraph, sitemap, headers,
// llms.txt (plan 2026-11-23-corrections-audit-seo-geo).
import { test, expect } from "@playwright/test";
import { prepare, open, jsonLd } from "../helpers.mjs";

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
