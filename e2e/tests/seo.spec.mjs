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
