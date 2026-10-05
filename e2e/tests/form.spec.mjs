// Spec 4 and 7: contact form with v3 Form, TextField, Label, Input, TextArea, FieldError, Button.
// Never sends anything: routeNetwork (lib/common.mjs) aborts every request that leaves localhost,
// Formspree included. Aborted requests never "finish", so afterEach checks the `request` events
// instead: it fails if the page ever issued a request to Formspree, even one that was aborted.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

const FORMSPREE_HOSTS = new Set(["formspree.io"]);
try {
  if (process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT) FORMSPREE_HOSTS.add(new URL(process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT).hostname);
} catch {}
const isFormspree = (url) => {
  try {
    const host = new URL(url).hostname;
    return [...FORMSPREE_HOSTS].some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
};

let formspree;
test.beforeEach(async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  formspree = [];
  page.on("request", (r) => { if (isFormspree(r.url())) formspree.push(r.url()); });
  await open(page, "/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
});
test.afterEach(() => expect(formspree, "requêtes émises vers Formspree").toEqual([]));

const form = (page) => page.locator("#contact form");
const field = (page, label) => form(page).getByLabel(label, { exact: true });
const submit = (page) => form(page).getByRole("button", { name: "Envoyer" });

test("saisie dans chaque champ", async ({ page }) => {
  const values = { "Nom et Prénom": "Jeanne Test", Email: "jeanne@example.com", "Téléphone": "0470000000", Message: "Bonjour" };
  for (const [label, value] of Object.entries(values)) {
    await field(page, label).fill(value);
    await expect(field(page, label)).toHaveValue(value);
  }
});

test("envoi vide : messages d'erreur sous les champs requis, champs marqués invalides", async ({ page }) => {
  await submit(page).click();
  await expect(form(page).getByRole("alert").filter({ hasText: "Le formulaire contient des erreurs" })).toBeVisible();
  await expect(form(page).getByText("Email est requis")).toBeVisible();
  await expect(form(page).getByText("Numéro de téléphone requis")).toBeVisible();
  await expect(form(page).getByText("Un message expliquant la demande est requis")).toBeVisible();
  for (const label of ["Email", "Téléphone", "Message"]) await expect(field(page, label)).toHaveAttribute("aria-invalid", "true");
  await expect(field(page, "Nom et Prénom")).not.toHaveAttribute("aria-invalid", "true");
});

// Review focus 3: the site's French message, never the browser's own bubble; the error goes once
// the field is fixed and left (React Aria clears a form error when the field is committed).
test("email invalide : message français du site, effacé quand on quitte le champ corrigé", async ({ page }) => {
  await field(page, "Email").fill("jeanne");
  await field(page, "Téléphone").fill("0470000000");
  await field(page, "Message").fill("Bonjour");
  await submit(page).click();
  await expect(form(page).getByText("Adresse email doit contenir un @")).toBeVisible();
  await field(page, "Email").fill("jeanne@example.com");
  await page.keyboard.press("Tab");
  await expect(form(page).getByText("Adresse email doit contenir un @")).toHaveCount(0);
  await expect(field(page, "Email")).not.toHaveAttribute("aria-invalid", "true");
});

// Review focus 4: a valid form always gives feedback. Here the request cannot reach Formspree
// (no endpoint locally, or aborted by routeNetwork), so the error message with the email shows.
test("formulaire valide sans accès à Formspree : message d'erreur visible avec l'adresse email", async ({ page }) => {
  await field(page, "Nom et Prénom").fill("Jeanne Test");
  await field(page, "Email").fill("jeanne@example.com");
  await field(page, "Téléphone").fill("0470000000");
  await field(page, "Message").fill("Bonjour");
  await submit(page).click();
  const error = form(page).getByRole("alert").filter({ hasText: "Oups" });
  await expect(error).toBeVisible();
  await expect(error.getByRole("link", { name: "info@macar.be" })).toBeVisible();
});

// Spec 2026-10-05: the summary and the sending error are HeroUI v3 Alerts, status danger.
const alerts = (page) => form(page).locator('[data-slot="alert-root"]');

test("envoi vide : récapitulatif dans une Alert v3 danger (indicateur, titre, description)", async ({ page }) => {
  await submit(page).click();
  const alert = alerts(page).filter({ hasText: "Le formulaire contient des erreurs" });
  await expect(alert).toBeVisible();
  await expect(alert).toHaveAttribute("role", "alert");
  await expect(alert).toHaveClass(/alert--danger/);
  await expect(alert.locator(".alert__indicator")).toHaveCount(1);
  await expect(alert.locator(".alert__title")).toHaveText("Le formulaire contient des erreurs.");
  await expect(alert.locator(".alert__description")).toHaveText("Veuillez corriger les champs indiqués.");
});

// Review focus 4: once the fields are fixed, the summary goes and only the sending error stays.
test("champs corrigés puis renvoi : le récapitulatif disparaît, seule l'Alert d'erreur d'envoi reste", async ({ page }) => {
  await submit(page).click();
  await expect(alerts(page).filter({ hasText: "Le formulaire contient des erreurs" })).toBeVisible();
  await field(page, "Nom et Prénom").fill("Jeanne Test");
  await field(page, "Email").fill("jeanne@example.com");
  await field(page, "Téléphone").fill("0470000000");
  await field(page, "Message").fill("Bonjour");
  await submit(page).click();
  await expect(alerts(page)).toHaveCount(1);
  await expect(alerts(page)).toContainText("Oups");
  await expect(alerts(page)).toHaveClass(/alert--danger/);
  await expect(alerts(page).getByRole("link", { name: "info@macar.be" })).toBeVisible();
});

// Review minor 1: the summary stays while the visitor fixes the fields (no jump above the field
// being typed in), and goes on the next submit.
test("champs corrigés : le récapitulatif reste en place jusqu'au prochain envoi", async ({ page }) => {
  await submit(page).click();
  const summary = alerts(page).filter({ hasText: "Le formulaire contient des erreurs" });
  await expect(summary).toBeVisible();
  for (const [label, value] of [["Email", "jeanne@example.com"], ["Téléphone", "0470000000"], ["Message", "Bonjour"]]) {
    const before = (await field(page, label).boundingBox()).y;
    await field(page, label).fill(value);
    expect((await field(page, label).boundingBox()).y, `${label} ne bouge pas pendant la saisie`).toBe(before);
  }
  await expect(summary).toBeVisible();
});
