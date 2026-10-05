// Spec 4 and 7: cookie banner with native v3 Card, Switch and Button. Behaviour unchanged.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });
test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL, { consent: false }));

const BANNER_TEXT = "Macar utilise des cookies";

async function openPreferences(page) {
  await open(page, "/");
  await expect(page.getByText(BANNER_TEXT)).toBeVisible();
  await page.getByRole("button", { name: "Préférences", exact: true }).click();
  await expect(page.getByRole("switch")).toHaveCount(3);
}

test("le bandeau apparaît sans cookie de consentement et se ferme après Accepter tout", async ({ page, context }) => {
  await open(page, "/");
  await expect(page.getByText(BANNER_TEXT)).toBeVisible();
  await page.getByRole("button", { name: /^accepter tout$/i }).click();
  await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);
  const cookie = (await context.cookies()).find((c) => c.name === "macar_cookie_consent_is_true");
  expect(cookie && cookie.value).toBe("true");
});

test("Essentiels est coché et verrouillé", async ({ page }) => {
  await openPreferences(page);
  const essentials = page.getByRole("switch", { name: "Essentiels" });
  await expect(essentials).toBeChecked();
  await expect(essentials).toBeDisabled();
});

test("Analytique et Les fonctionnalités basculent au clic et à la barre d'espace", async ({ page }) => {
  await openPreferences(page);
  for (const name of ["Analytique", "Les fonctionnalités"]) {
    const sw = page.getByRole("switch", { name });
    await expect(sw).toBeChecked();
    await page.getByText(name, { exact: true }).click();
    await expect(sw).not.toBeChecked();
    await sw.focus();
    await page.keyboard.press(" ");
    await expect(sw).toBeChecked();
  }
});

test("le bandeau est une Card v3 et ses actions des Button v3", async ({ page }) => {
  await open(page, "/");
  const banner = page.locator(".card").filter({ hasText: BANNER_TEXT });
  await expect(banner).toHaveCount(1);
  await expect(banner.locator("button.button")).toHaveCount(3);
});
