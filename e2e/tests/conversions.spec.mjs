// Conversions (spec 2026-10-17-conversions): events only with Analytics granted, read in dataLayer.
import { test, expect } from "@playwright/test";
import { prepare, open, events, CONSENT, fulfillFormspree, FORMSPREE_ENDPOINT } from "../helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

// tel: links: keep the click in the page (headless Chromium has no dialer).
const keepTelClicks = (page) =>
  page.addInitScript(() => {
    document.addEventListener(
      "click",
      (e) => {
        const a = e.target instanceof Element && e.target.closest('a[href^="tel:"]');
        if (a) e.preventDefault();
      },
      true,
    );
  });
const footerGsm = (page) => page.locator("footer").getByRole("link", { name: "+32 478 23 50 08" });

test.describe("clic téléphone", () => {
  test("pied de page, tout accepté : phone_click avec numéro et emplacement", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await keepTelClicks(page);
    await open(page, "/");
    await footerGsm(page).click();
    expect(await events(page)).toEqual([["phone_click", { phone_number: "+32478235008", link_location: "pied_de_page" }]]);
  });

  test("accueil : link_location vaut page ; le fixe est compté", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await keepTelClicks(page);
    await open(page, "/");
    await page.locator("main").getByRole("link", { name: "+32 478 23 50 08" }).click();
    await page.locator("footer").getByRole("link", { name: "+32 246 653 04" }).click();
    expect(await events(page)).toEqual([
      ["phone_click", { phone_number: "+32478235008", link_location: "page" }],
      ["phone_click", { phone_number: "+3224665304", link_location: "pied_de_page" }],
    ]);
  });

  test("Analytique refusé : aucun événement", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL, { consent: CONSENT.none });
    await keepTelClicks(page);
    await open(page, "/");
    await footerGsm(page).click();
    expect(await events(page)).toEqual([]);
  });

  test("sans choix (bandeau ouvert) : aucun événement", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL, { consent: false });
    await keepTelClicks(page);
    await open(page, "/");
    await footerGsm(page).click();
    expect(await events(page)).toEqual([]);
  });

  test("numéro au format national : compté au format international", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await keepTelClicks(page);
    await open(page, "/");
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.href = "tel:0478 23 50 08";
      a.textContent = "0478 23 50 08";
      a.id = "national-test";
      // Outside the React tree and above the sticky bar, so the click lands on it.
      a.style.cssText = "position:fixed;top:50%;left:50%;z-index:99999;background:white;padding:8px";
      document.body.append(a);
    });
    await page.locator("#national-test").click();
    expect(await events(page)).toEqual([["phone_click", { phone_number: "+32478235008", link_location: "page" }]]);
  });

  test("numéro de la page Emploi : pas compté", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await keepTelClicks(page);
    await open(page, "/job");
    await page.locator("main").locator('a[href^="tel:"]').first().click();
    expect(await events(page)).toEqual([]);
  });
});

// Contact form: generate_lead only once Formspree has answered OK.
const SKIP_FORM = "build sans NEXT_PUBLIC_FORMSPREE_ENDPOINT";
const SENT = "Merci pour votre confiance";

async function fillAndSend(page) {
  const form = page.locator("#contact form");
  await form.getByLabel("Nom et Prénom", { exact: true }).fill("Jeanne Test");
  await form.getByLabel("Email", { exact: true }).fill("jeanne@example.com");
  await form.getByLabel("Téléphone", { exact: true }).fill("0470000000");
  await form.getByLabel("Message", { exact: true }).fill("Bonjour");
  await form.getByRole("button", { name: "Envoyer" }).click();
}

test.describe("formulaire", () => {
  test("envoi réussi, tout accepté : generate_lead une fois", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies).toHaveLength(1);
    expect(await events(page)).toEqual([["generate_lead", { lead_source: "formulaire_contact" }]]);
  });

  test("envoi réussi, Analytique refusé : aucun événement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: CONSENT.none });
    await fulfillFormspree(context);
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(await events(page)).toEqual([]);
  });

  test("Formspree en erreur : pas de generate_lead", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    await fulfillFormspree(context, { status: 500 });
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.locator("#contact form").getByRole("alert").filter({ hasText: "Oups" })).toBeVisible();
    expect(await events(page)).toEqual([]);
  });
});

// Measurement must never break the form: a gtag replaced by a throwing stub (privacy extension)
// still lets the visitor see the success message once Formspree has accepted the request.
test("gtag qui plante : l'envoi réussit quand même", async ({ page, context, baseURL }) => {
  test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
  await prepare(context, baseURL);
  const bodies = await fulfillFormspree(context);
  await open(page, "/");
  await page.evaluate(() => {
    window.gtag = () => {
      throw new Error("blocked by extension");
    };
  });
  await fillAndSend(page);
  await expect(page.getByText(SENT)).toBeVisible();
  expect(bodies).toHaveLength(1);
});

// Origin of the request: read at arrival (memory), kept in sessionStorage only with Publicité,
// joined to every submission as "origine" and "page". The gclid value itself never travels.
const readStored = (page) => page.evaluate(() => sessionStorage.getItem("macar_origine"));
const goHomeByMenu = async (page) => {
  await page.getByRole("link", { name: "Accueil" }).first().click();
  await expect(page).toHaveURL(/\/$/);
};
const banner = (page) => page.getByRole("region", { name: "Consentement aux cookies" });

test.describe("origine de la demande", () => {
  test("gclid sans choix de cookies, navigation, envoi : Pub Google, rien en session, aucun événement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: false });
    const bodies = await fulfillFormspree(context);
    await open(page, "/services/toiture?gclid=test123");
    expect(await readStored(page)).toBeNull();
    await goHomeByMenu(page);
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Pub Google, arrivée sur /services/toiture", page: "/" });
    expect(JSON.stringify(bodies[0])).not.toContain("test123");
    expect(await events(page)).toEqual([]);
  });

  test("gclid avec Publicité : mémorisé avec sa valeur, survit au rechargement, joint à l'envoi", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, "/services/toiture?gclid=test123");
    const stored = JSON.parse(await readStored(page));
    expect(stored).toMatchObject({ ad: true, landing: "/services/toiture", click: { type: "gclid", value: "test123" } });
    expect(stored).not.toHaveProperty("search");
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Pub Google, arrivée sur /services/toiture", page: "/", gclid: "test123" });
  });

  test("gclid avec Publicité refusée : rien en session, perdu au rechargement", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: { analytics: true, marketing: false } });
    const bodies = await fulfillFormspree(context);
    await open(page, "/services/toiture?gclid=test123");
    expect(await readStored(page)).toBeNull();
    await open(page, "/");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Accès direct ou favori", page: "/" });
    expect(bodies[0]).not.toHaveProperty("gclid");
  });

  test("utm sans gclid : Campagne source / campaign", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, "/?utm_source=facebook&utm_campaign=toiture");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Campagne facebook / toiture, arrivée sur /");
  });

  test("utm_medium=cpc compte comme une pub", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: false });
    const bodies = await fulfillFormspree(context);
    await open(page, "/zones/uccle?utm_source=google&utm_medium=cpc");
    await goHomeByMenu(page);
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Pub Google, arrivée sur /zones/uccle");
  });

  test("utm_medium=cpc avec une autre source : Pub <source>", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL, { consent: false });
    const bodies = await fulfillFormspree(context);
    await open(page, "/?utm_source=facebook&utm_medium=cpc&utm_campaign=toiture");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Pub Facebook, arrivée sur /");
  });

  test("référent Google sans paramètre : Recherche Google", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await page.goto("/", { referer: "https://www.google.com/" });
    await page.waitForLoadState("networkidle");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Recherche Google");
  });

  for (const [referer, label] of [
    ["https://www.bing.com/", "Recherche Bing"],
    ["https://l.facebook.com/", "Facebook ou Instagram"],
    ["https://www.example.org/page?x=1", "Site référent : www.example.org"],
  ]) {
    test(`référent ${new URL(referer).hostname} : ${label}`, async ({ page, context, baseURL }) => {
      test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
      await prepare(context, baseURL);
      const bodies = await fulfillFormspree(context);
      await page.goto("/", { referer });
      await page.waitForLoadState("networkidle");
      await fillAndSend(page);
      await expect(page.getByText(SENT)).toBeVisible();
      expect(bodies[0].origine).toBe(label);
    });
  }

  test("référent du site lui-même : Origine inconnue (navigation interne)", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await page.goto("/", { referer: `${baseURL}/about` });
    await page.waitForLoadState("networkidle");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe("Origine inconnue (navigation interne)");
  });

  test("libellés utm nettoyés et coupés à 100 caractères", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, `/?utm_source=face%0Abook&utm_campaign=${"x".repeat(300)}`);
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0].origine).toBe(`Campagne facebook / ${"x".repeat(100)}, arrivée sur /`);
  });

  test("gbraid avec Publicité : joint sous son nom", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await open(page, "/?gbraid=0AAAAA-b_1");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Pub Google, arrivée sur /", gbraid: "0AAAAA-b_1" });
    expect(bodies[0]).not.toHaveProperty("gclid");
  });

  for (const [name, value] of [
    ["balise", "<script>alert(1)</script>"],
    ["espaces", "abc def"],
    ["500 caractères", "a".repeat(500)],
  ]) {
    test(`gclid fabriqué (${name}) : ignoré, l'arrivée reste une pub`, async ({ page, context, baseURL }) => {
      test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
      await prepare(context, baseURL);
      const bodies = await fulfillFormspree(context);
      await open(page, `/?gclid=${encodeURIComponent(value)}`);
      await fillAndSend(page);
      await expect(page.getByText(SENT)).toBeVisible();
      expect(bodies[0].origine).toBe("Pub Google, arrivée sur /");
      expect(bodies[0]).not.toHaveProperty("gclid");
    });
  }

  test("Publicité accordée après navigation : l'arrivée gardée en mémoire est conservée", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL, { consent: false });
    await open(page, "/services/toiture?gclid=late");
    await goHomeByMenu(page);
    expect(await readStored(page)).toBeNull();
    await banner(page).getByRole("button", { name: "Tout accepter" }).click();
    await expect.poll(() => readStored(page)).toContain('"landing":"/services/toiture"');
  });

  test("retrait de Publicité : la clé disparaît sans recharger", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/services/toiture?gclid=gone");
    expect(await readStored(page)).not.toBeNull();
    await page.getByRole("button", { name: "Gérer mes cookies" }).click();
    await page.getByText("Publicité", { exact: true }).click();
    await page.getByRole("button", { name: "Enregistrer mes choix" }).click();
    await expect.poll(() => readStored(page)).toBeNull();
  });

  test("sessionStorage indisponible : l'envoi passe, l'origine vient de la mémoire", async ({ page, context, baseURL }) => {
    test.skip(!FORMSPREE_ENDPOINT, SKIP_FORM);
    await prepare(context, baseURL);
    const bodies = await fulfillFormspree(context);
    await page.addInitScript(() => {
      Object.defineProperty(window, "sessionStorage", {
        get() {
          throw new Error("blocked");
        },
      });
    });
    await open(page, "/?gclid=blocked");
    await fillAndSend(page);
    await expect(page.getByText(SENT)).toBeVisible();
    expect(bodies[0]).toMatchObject({ origine: "Pub Google, arrivée sur /", page: "/" });
  });
});
