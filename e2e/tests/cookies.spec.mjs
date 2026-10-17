// Cookie banner: real per-category choice, two levels, keyboard, legacy and invalid cookies.
import { test, expect } from "@playwright/test";
import { prepare, open, consentCookie, CONSENT } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });
test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL, { consent: false }));

const banner = (page) => page.getByRole("region", { name: "Consentement aux cookies" });

async function storedConsent(context) {
  const cookie = (await context.cookies()).find((c) => c.name === "macar_consent");
  return cookie ? JSON.parse(decodeURIComponent(cookie.value)) : null;
}

async function openPreferences(page) {
  await open(page, "/");
  await expect(banner(page)).toBeVisible();
  await banner(page).getByRole("button", { name: "Personnaliser" }).click();
  await expect(page.getByRole("switch")).toHaveCount(3);
}

test("premier niveau : Tout refuser, Personnaliser, Tout accepter, lien vers la politique cookies", async ({ page }) => {
  await open(page, "/");
  const b = banner(page);
  for (const name of ["Tout refuser", "Personnaliser", "Tout accepter"]) {
    await expect(b.getByRole("button", { name })).toBeVisible();
  }
  await expect(b.locator('a[href="/politique-cookies"]')).toHaveCount(1);
});

test("Tout refuser et Tout accepter ont la même apparence", async ({ page }) => {
  await open(page, "/");
  const b = banner(page);
  const refuse = await b.getByRole("button", { name: "Tout refuser" }).getAttribute("class");
  const accept = await b.getByRole("button", { name: "Tout accepter" }).getAttribute("class");
  expect(refuse).toBe(accept);
});

test("Tout refuser enregistre deux non et ferme le bandeau", async ({ page, context }) => {
  await open(page, "/");
  await banner(page).getByRole("button", { name: "Tout refuser" }).click();
  await expect(banner(page)).toHaveCount(0);
  const c = await storedConsent(context);
  expect(c).toMatchObject({ analytics: false, marketing: false, version: 1 });
  expect(Number.isNaN(Date.parse(c.at))).toBe(false);
});

test("Tout accepter enregistre deux oui et ferme le bandeau", async ({ page, context }) => {
  await open(page, "/");
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  await expect(banner(page)).toHaveCount(0);
  expect(await storedConsent(context)).toMatchObject({ analytics: true, marketing: true, version: 1 });
});

test("second niveau : Essentiels coché et verrouillé, Analytique et Publicité décochés", async ({ page }) => {
  await openPreferences(page);
  const essentials = page.getByRole("switch", { name: "Essentiels" });
  await expect(essentials).toBeChecked();
  await expect(essentials).toBeDisabled();
  await expect(page.getByRole("switch", { name: "Analytique" })).not.toBeChecked();
  await expect(page.getByRole("switch", { name: "Publicité" })).not.toBeChecked();
});

test("Enregistrer mes choix avec Analytique seul", async ({ page, context }) => {
  await openPreferences(page);
  await page.getByText("Analytique", { exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer mes choix" }).click();
  await expect(banner(page)).toHaveCount(0);
  expect(await storedConsent(context)).toMatchObject({ analytics: true, marketing: false });
});

test("les interrupteurs basculent au clavier", async ({ page }) => {
  await openPreferences(page);
  const sw = page.getByRole("switch", { name: "Publicité" });
  await sw.focus();
  await page.keyboard.press(" ");
  await expect(sw).toBeChecked();
});

test("Échap ne ferme pas le bandeau à la première visite", async ({ page }) => {
  await openPreferences(page);
  await page.keyboard.press("Escape");
  await expect(banner(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Annuler" })).toHaveCount(0);
});

test("visiteur qui revient avec un choix valide : pas de bandeau", async ({ page, context, baseURL }) => {
  await context.addCookies([{ ...consentCookie(CONSENT.all), url: baseURL }]);
  await open(page, "/");
  await expect(banner(page)).toHaveCount(0);
});

test("ancien cookie seul : bandeau affiché et ancien cookie supprimé", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "macar_cookie_consent_is_true", value: "true", url: baseURL }]);
  await open(page, "/");
  await expect(banner(page)).toBeVisible();
  expect((await context.cookies()).find((c) => c.name === "macar_cookie_consent_is_true")).toBeUndefined();
});

test("cookie d'une autre version : bandeau affiché", async ({ page, context, baseURL }) => {
  await context.addCookies([{ ...consentCookie(CONSENT.all, { version: 0 }), url: baseURL }]);
  await open(page, "/");
  await expect(banner(page)).toBeVisible();
});

test("cookie illisible : bandeau affiché, pas d'erreur console", async ({ page, context, baseURL }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Vercel Analytics script does not exist outside Vercel: unrelated 404.
  page.on("console", (m) => m.type() === "error" && !m.location().url.includes("/_vercel/") && errors.push(m.text()));
  await context.addCookies([{ name: "macar_consent", value: "pas-du-json", url: baseURL }]);
  await open(page, "/");
  await expect(banner(page)).toBeVisible();
  expect(errors).toEqual([]);
});

test("le bandeau ne bloque pas la page", async ({ page }) => {
  await open(page, "/");
  await expect(banner(page)).toBeVisible();
  await page.getByRole("link", { name: "Blog" }).first().click();
  await expect(page).toHaveURL(/\/blog$/);
});

test("320 px : pas de défilement horizontal, premier et second niveau", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await open(page, "/");
  await expect(banner(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await banner(page).getByRole("button", { name: "Personnaliser" }).click();
  await expect(page.getByRole("switch")).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("le bandeau est une Card v3 et ses actions des Button v3", async ({ page }) => {
  await open(page, "/");
  await expect(banner(page).locator(".card")).toHaveCount(1);
  await expect(banner(page).locator("button.button")).toHaveCount(3);
});
