# HeroUI v3 natif : plan d'implémentation

> **Pour les agents :** sous-compétence REQUISE : superpowers:subagent-driven-development (recommandée) ou superpowers:executing-plans pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`) pour le suivi.

**Objectif :** reconstruire le site Macar avec les composants HeroUI v3 tels qu'ils sont conçus, aux couleurs Macar, sans classe qui annule leur style, et retirer les imitations de Tailwind 3 et de HeroUI v2.

**Architecture :** le thème passe par les variables officielles de HeroUI v3 dans un `globals.css` réduit ; les noms de couleurs maison sont réécrits en noms v3 par un script ; puis chaque zone de la spec (section 6) remplace ses éléments faits main ou neutralisés par les composants v3 natifs, un commit par zone. Les liens gardent le lien Next.js (navigation côté client) et prennent le style v3 par `linkVariants` et `buttonVariants`, comme la doc HeroUI le recommande avec un routeur.

**Stack :** Next.js 15.5 (App Router), React 19, Tailwind 4.3, `@heroui/react` et `@heroui/styles` 3.2.6, ESLint 9 (config plate), framer-motion 11, zod 3, Playwright 1.63 et Lighthouse 13 (dépôt d'outils local).

**Spec :** `superpowers/specs/2026-10-04-heroui-v3-native-design.md` (autorité de référence ; ce plan en découle).

---

## Contraintes globales

- Branche `heroui-v3-native` (partie de `dev`, commit `6728cd3`) ; une seule PR vers `dev` ; fusion par **commit de fusion** (« Create a merge commit »), jamais squash ni rebase.
- **Demander l'accord du propriétaire avant chaque `git push`.** Le dépôt d'outils `D:\Repos\macar-migration-tools` n'est jamais poussé.
- Message de commit : titre en anglais à l'impératif dans le style du dépôt (ex. `Render the contact form as a component`), explication facultative, ligne vide, puis `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, passé par heredoc (`git commit -F - <<'EOF'`).
- Fichiers ajoutés un par un (`git add <chemin>` ; `git rm <chemin>` pour une suppression), jamais `git add -A` ni `git add .`.
- Après `npx tsc --noEmit`, toujours `git restore tsconfig.tsbuildinfo` (tsc réécrit ce fichier suivi).
- À chaque commit, `npm run lint` (0 erreur ; le seul avertissement attendu est celui, déjà présent, de `src/lib/blog.ts` 64:13 `'body' is defined but never used`), `npx tsc --noEmit` et `npm run build` passent.
- Thème (spec 3), valeurs exactes dans `:root` : `--accent: #124FAA`, `--accent-foreground: #FFFFFF`, `--background: #F6F8FF`, `--foreground: #0E1435`, `--muted: #474B64`, `--surface: #FFFFFF`, `--border: #D8DBE9`, `--focus: var(--accent)`, `--link: var(--accent)`. Rayons, ombres, espacements et durées : ceux de HeroUI v3. Mode sombre non activé.
- Polices inchangées : Open Sans pour le texte (variable `--font-open-sans`, utilitaire `font-sans`), Raptor pour les titres (variable `--font-raptor`, utilitaire `font-heading`).
- Aucun composant v3 ne reçoit de classe qui modifie son style. Classes permises sur un composant v3 : mise en page autour (grille, flex, alignement, marges, padding d'un `Surface`, largeur, hauteur, affichage, position), comme dans les exemples de la doc v3. Les props de variante (`variant`, `size`, `color`, `fullWidth`) ne sont pas des surcharges.
- Vocabulaire v3 seulement : `text-foreground`, `text-muted`, `bg-accent`, `text-accent`, `bg-surface`, `border-border`, `bg-separator`, `bg-default`, `bg-accent-soft`, `text-danger`… Aucune couleur maison (`headings`, `text`, `accent1`, `cardbackground`, `bordercard`), aucune couleur v2 (`primary`, `secondary`, `default-*`, `--v2-*`), aucune opacité arbitraire (`bg-[rgb(...)]`, `hsl(var(--v2-*))`).
- Composant serveur : importer HeroUI par son sous-chemin (`@heroui/react/card`, `@heroui/react/chip`, `@heroui/react/separator`) et les fonctions de style depuis `@heroui/styles`. L'import `@heroui/react` complet dans un composant serveur casse le build (« 'client-only' cannot be imported from a Server Component module »), mesuré sur le prototype.
- Avant d'écrire du code d'interface, consulter la doc v3 par le serveur MCP `heroui-react` (`get_component_docs`) pour chaque composant touché ; ne jamais se fier à HeroUI v2.
- Contrôle de chaque zone avec Playwright (CLAUDE.md) : tests fonctionnels de la suite native et captures 375 px et 1440 px, rangées hors du dépôt dans `D:\macar-migration\native-shots`. Si `NEXT_PUBLIC_FORMSPREE_ENDPOINT` est défini en local, ne jamais envoyer le formulaire : la suite bloque toute requête qui sort de `localhost`.
- Aucun tiret long ni demi-cadratin dans le code, les textes, les commits, la PR et ce plan.
- Rien de lourd sur `C:` : clones et captures dans `D:\macar-migration`. Builds servis sur le port 3100 (branche) et 3101 (référence `dev`) ; arrêter un serveur par son port.

## Procédures communes

**Procédure A (contrôles et build de la branche)**, dans `D:\Repos\macar-next-site-prod`, serveur 3100 arrêté au préalable (Procédure C), car `next build` ne peut pas réécrire `.next` pendant que `next start` le lit :

```bash
npm run lint
npx tsc --noEmit
git restore tsconfig.tsbuildinfo
npm run build
```

Attendu : lint `✖ 1 problem (0 errors, 1 warning)` (avertissement de `src/lib/blog.ts`), tsc sans sortie, build avec `✓ Compiled successfully` et `✓ Generating static pages (33/33)`.

**Procédure B (servir la branche sur 3100)**, en PowerShell :

```powershell
New-Item -ItemType Directory -Force D:\macar-migration\native-out | Out-Null
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx next start -p 3100 > D:\macar-migration\native-out\server-3100.log 2>&1" -WorkingDirectory "D:\Repos\macar-next-site-prod" -WindowStyle Hidden
Start-Sleep -Seconds 6
(Invoke-WebRequest -UseBasicParsing http://localhost:3100/).StatusCode
```

Attendu : `200`.

**Procédure C (arrêter un serveur)**, en PowerShell (port 3100 ou 3101) :

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Procédure T (suite native)**, dans `D:\Repos\macar-migration-tools`, contre le serveur 3100 :

```bash
npx playwright test -c native/playwright.config.mjs
```

Une partie seulement : ajouter le nom du fichier, ex. `npx playwright test -c native/playwright.config.mjs faq reviews`.

## Points d'attention de la revue

1. **Lien vers une ancre de la page courante choisi dans le Drawer** (« FAQ » sur l'accueil) : le Drawer doit se fermer, la FAQ apparaître à l'écran et la page redevenir défilable (le verrou de défilement du Drawer levé). Test : `menu.spec.mjs`, « FAQ depuis le Drawer sur l'accueil », vérifié dans la tâche 7.
2. **Petit téléphone (320 px)** : les `Button` v3 ne passent jamais à la ligne (`whitespace-nowrap`), une rangée de boutons peut faire déborder la page. Aucune page ne doit défiler horizontalement. Test : `layout.spec.mjs`, « 320 px », vérifié dans la tâche 3 puis à chaque zone.
3. **Email mal saisi** : le visiteur doit lire le message du site en français, jamais la bulle du navigateur, et le message doit disparaître une fois le champ corrigé et quitté. Test : `form.spec.mjs`, « email invalide », vérifié dans la tâche 5.
4. **Envoi valide mais Formspree injoignable** (pas d'endpoint en local, réseau coupé) : le visiteur doit voir le message d'erreur avec l'adresse email, jamais un échec silencieux ; aucune requête Formspree ne doit aboutir pendant les tests. Test : `form.spec.mjs`, « formulaire valide sans accès à Formspree », vérifié dans la tâche 5.
5. **Clavier et navigation** : chaque lien de la barre doit être un seul arrêt Tab avec un focus visible, et suivre un lien ne doit pas recharger la page. Test : `layout.spec.mjs`, « 1440 px », vérifié dans la tâche 7.

## Ajustements par rapport à la spec (mesurés sur le prototype)

- `globals.css` garde `@import "tailwindcss" source(none);` : sans `source(none)`, Tailwind scannerait tout le projet, dont `content/`, alors que la spec veut des sources déclarées explicitement.
- `globals.css` garde le petit bloc `.carousel .slider` : le carrousel de logos (inchangé) nomme sa piste `slider`, comme le `Slider` v3 ; sans ce bloc la bande de logos se met en grille.
- « `Link` v3 » prend la forme recommandée par la doc HeroUI pour un routeur : le lien Next.js avec `linkVariants` (texte) ou `buttonVariants` (action), dans deux petits composants `TextLink` et `ButtonLink`. Le `Link` React Aria brut ferait des rechargements complets.
- Les messages d'erreur du formulaire passent par `validationErrors` de `Form` v3 : React Aria efface le message d'un champ quand on le quitte après correction, pas à chaque frappe.
- Les intitulés de section (« Nos domaines », « Nos autres services »…) deviennent des `h2` : `Card.Title` est un `h3`, et un `h1` suivi directement de `h3` ferait perdre des points d'accessibilité.
- Les titres du blog passent réellement en Raptor : `font-(--font-raptor)` ne marchait pas (la variable n'était posée sur aucun élément) et devient `font-heading`.
- `react-aria` (dépendance pair de `@heroui/react`) et `tailwind-merge` (utilisé par `tailwind-variants` pour fusionner les classes HeroUI) restent ; `clsx`, qui ne servait qu'à `src/lib/utils.ts`, part avec les trois dépendances shadcn. `src/components/trusted.tsx`, importé nulle part, est supprimé.
- Le bouton « Voir plus » des avis passe au `Button` v3 dans la zone 2, avec le reste du fichier des avis.
- `Separator` v3 remplace les traits autonomes (les `<hr>` de la FAQ, les deux lignes du pied de page, les bordures hautes des sections des pages service, Services et zones, le trait du menu). Les bordures qui font partie d'un bloc de mise en page restent des bordures, aux couleurs v3 : bas des sections des pages légales (`border-separator`), soulignement des `CheckMark` et bas de la barre de navigation.
- Section 9 de la spec (suppression de l'aperçu jetable `D:\macar-migration\v3-preview`) : déjà faite, seulement vérifiée à la tâche 0.

## Structure des fichiers

Dépôt d'outils `D:\Repos\macar-migration-tools` (local, jamais poussé) :

| Fichier | Rôle |
|---|---|
| Créer `native/playwright.config.mjs` | Config de la suite native (BASE_URL, 3100 par défaut) |
| Créer `native/tests/faq.spec.mjs` | FAQ : une réponse par colonne, flèches, Début, Fin, Accordion natif |
| Créer `native/tests/menu.spec.mjs` | Menu mobile : Drawer, fermetures, verrou, 320 px, ancre FAQ |
| Créer `native/tests/cookies.spec.mjs` | Bandeau cookies : apparition, Accepter tout, interrupteurs |
| Créer `native/tests/reviews.spec.mjs` | Avis : défilement automatique, boucle, Card et Avatar natifs, Voir plus |
| Créer `native/tests/form.spec.mjs` | Formulaire : saisie, erreurs, message français, retour visible, aucun envoi |
| Créer `native/tests/layout.spec.mjs` | 320 px sur toutes les pages, clavier et navigation de la barre |
| Créer `native/shots.mjs` | Captures 375 et 1440 px de toutes les pages et des états de l'accueil |
| Créer `native/compare-page.mjs` | Page HTML de comparaison avant et après |
| Créer `native/console.mjs` | Erreurs console ajoutées par la branche par rapport à `dev` |
| Créer `native/vocabulary.mjs` | Réécriture des noms de couleurs en noms v3 (zone 1) |

Dépôt du site `D:\Repos\macar-next-site-prod` :

| Fichier | Zone | Rôle |
|---|---|---|
| Modifier `src/app/globals.css` | 1 | Réduit aux imports, sources, polices, variables v3, bloc carrousel |
| Modifier `src/app/layout.tsx` | 1 | Variables de police sur `<html>`, `body` en `bg-background text-muted` |
| Modifier `src/app/_components/textStyles.tsx` | 1 | Titres en `font-heading`, plus de second chargement de Raptor |
| Modifier 25 fichiers `.ts`/`.tsx` sous `src/` | 1 | Noms de couleurs v3 (script `vocabulary.mjs`) |
| Modifier `src/app/blog/[slug]/page.tsx`, `src/app/blog/_components/MdxComponents.tsx` | 1 | `font-(--font-raptor)` devient `font-heading` |
| Modifier `src/app/_components/HomeView.tsx` | 2, 3, 4 | FAQ native ; liens et boutons v3 ; cartes de services |
| Modifier `src/app/_components/CookieConsent.tsx` | 2, 6 | Switch sans surcharge ; bandeau Surface, Switch, Button |
| Modifier `src/app/_components/ServiceSection.tsx` | 2, 3 | Chip `soft` `accent` ; lien de devis v3 |
| Modifier `src/components/GoogleReviews.tsx` | 2 | Card, Avatar et Button v3 natifs |
| Créer `src/app/_components/links.tsx` | 3 | `TextLink` et `ButtonLink` (styles Link et Button v3 sur le lien Next.js) |
| Modifier `src/app/_components/ServiceDetailBody.tsx`, `src/app/services/page.tsx`, `src/app/zones/[slug]/page.tsx` | 3, 4 | Boutons et liens v3 ; cartes et `Separator` |
| Modifier `src/app/blog/[slug]/page.tsx`, `src/app/not-found.tsx`, `src/app/politique-confidentialite/page.tsx`, `src/app/politique-cookies/page.tsx`, `src/components/jobs.tsx` | 3 | Liens v3 |
| Créer `src/app/_components/ServiceCard.tsx` | 4 | Card v3 qui mène à une page |
| Modifier `src/app/about/page.tsx` | 4 | Valeurs en Card v3 |
| Supprimer `src/app/_components/cards.tsx` | 4 | Remplacé par Card v3 |
| Modifier `src/components/contact_form.tsx` | 5 | Form, TextField, Label, Input, TextArea, FieldError, Button v3 |
| Modifier `src/app/_components/navbar.tsx` | 7 | Barre HTML, liens v3, Button icône et Drawer à gauche |
| Modifier `src/app/_components/footer.tsx` | 7 | Liens v3 et Separator, composant serveur |
| Supprimer `src/app/_components/buttons.tsx` | 7 | Remplacé par `links.tsx` |
| Supprimer `src/components/ui/` (5 fichiers), `src/lib/utils.ts`, `components.json`, `src/components/trusted.tsx` | 8 | shadcn et fichiers inutiles |
| Modifier `package.json`, `package-lock.json` | 8 | Retrait de `class-variance-authority`, `@radix-ui/react-label`, `@radix-ui/react-slot`, `clsx` |
| Modifier `CLAUDE.md` | 8 | Description des styles et des composants à jour |

---

## Tâche 0 : suite de comportement native, outils et captures « avant »

**Fichiers :**
- Créer : les 11 fichiers `native/...` du dépôt d'outils (tableau ci-dessus).
- Hors dépôt : clone de référence `D:\macar-migration\native-ref` (branche `dev`), captures `D:\macar-migration\native-shots\before`.

**Interfaces :**
- Consomme : `lib/common.mjs` du dépôt d'outils (`PAGES`, `FREEZE_SCRIPT`, `CONSENT_COOKIE`, `routeNetwork`, `stabilize`, `settle`, `parkMouse`, `parseArgs`) et `tests/helpers.mjs` (`prepare(context, baseURL, { consent })`, `open(page, url)`, `keyboardFocus(page, locator)`).
- Produit : la suite native (43 tests) lancée par la Procédure T ; `node native/shots.mjs --base <url> --out <dir>` ; `node native/compare-page.mjs --dir <dir>` ; `node native/console.mjs --base <url> --ref <url>` ; `node native/vocabulary.mjs <dépôt du site>`. Marqueurs du site sur lesquels la suite s'appuie : `#faq`, `[data-faq-column]`, `[data-faq-trigger]`, `#reviews`, `#contact`, bouton « Ouvrir le menu », dialogue « Menu », bouton « Fermer le menu », bouton « Envoyer », libellés de champs « Nom et Prénom », « Email », « Téléphone », « Message », interrupteurs « Essentiels », « Analytique », « Les fonctionnalités ».

- [ ] **Étape 1 : config de la suite.** Créer `D:\Repos\macar-migration-tools\native\playwright.config.mjs` :

```js
// Behaviour suite of the native HeroUI v3 site (spec 2026-10-04, section 7).
// npx playwright test -c native/playwright.config.mjs   (BASE_URL defaults to http://localhost:3100)
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.mjs",
  timeout: 60000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [["list"]],
  outputDir: "../test-results/native",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3100",
    browserName: "chromium",
    deviceScaleFactor: 1,
    locale: "fr-BE",
    timezoneId: "Europe/Brussels",
    trace: "retain-on-failure",
  },
});
```

- [ ] **Étape 2 : tests FAQ.** Créer `native/tests/faq.spec.mjs` :

```js
// Spec 7: FAQ, one open answer per column, arrows, Home and End. Native v3 Accordion (spec 4).
import { test, expect } from "@playwright/test";
import { prepare, open, keyboardFocus } from "../../tests/helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });
test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

const triggers = (page) => page.locator("#faq [data-faq-trigger]");
const expanded = (page) => triggers(page).evaluateAll((els) => els.map((e) => e.getAttribute("aria-expanded")));
const activeIndex = (page) => page.evaluate(() => [...document.querySelectorAll("#faq [data-faq-trigger]")].indexOf(document.activeElement));

test("7 questions en 2 colonnes (4 et 3), titres h2, toutes fermées", async ({ page }) => {
  await open(page, "/");
  const perColumn = await page.locator("#faq [data-faq-column]").evaluateAll((cols) => cols.map((c) => c.querySelectorAll("[data-faq-trigger]").length));
  expect(perColumn).toEqual([4, 3]);
  await expect(page.locator("#faq h2 [data-faq-trigger]")).toHaveCount(7);
  expect(await expanded(page)).toEqual(Array(7).fill("false"));
});

test("une seule réponse ouverte par colonne, colonnes indépendantes", async ({ page }) => {
  await open(page, "/");
  await triggers(page).nth(0).click();
  await triggers(page).nth(1).click();
  await triggers(page).nth(4).click();
  await expect.poll(() => expanded(page)).toEqual(["false", "true", "false", "false", "true", "false", "false"]);
  await expect(page.getByText("Macar est située au 43, avenue Prudent Bols")).toBeVisible();
  await triggers(page).nth(1).click();
  await expect.poll(() => expanded(page)).toEqual(["false", "false", "false", "false", "true", "false", "false"]);
});

test("flèches, Début et Fin déplacent le focus dans la colonne, sans boucler ni ouvrir", async ({ page }) => {
  await open(page, "/");
  await keyboardFocus(page, triggers(page).nth(0));
  for (const [key, index] of [["ArrowDown", 1], ["ArrowDown", 2], ["ArrowDown", 3], ["ArrowDown", 3], ["Home", 0], ["ArrowUp", 0], ["End", 3], ["ArrowUp", 2]]) {
    await page.keyboard.press(key);
    expect(await activeIndex(page), `après ${key}`).toBe(index);
  }
  await keyboardFocus(page, triggers(page).nth(4));
  for (const [key, index] of [["ArrowUp", 4], ["End", 6], ["ArrowDown", 6], ["Home", 4]]) {
    await page.keyboard.press(key);
    expect(await activeIndex(page), `après ${key}`).toBe(index);
  }
  expect(await expanded(page)).toEqual(Array(7).fill("false"));
});

test("style natif : séparateurs et indicateur de l'Accordion v3, ni <hr> ni flèche v2", async ({ page }) => {
  await open(page, "/");
  await expect(page.locator("#faq hr")).toHaveCount(0);
  await expect(page.locator('#faq path[d="M15.5 19l-7-7 7-7"]')).toHaveCount(0);
  await expect(page.locator('#faq [data-slot="accordion-indicator"]')).toHaveCount(7);
});
```

- [ ] **Étape 3 : tests du menu mobile.** Créer `native/tests/menu.spec.mjs` :

```js
// Spec 5 and 7: mobile menu, a v3 Button (icon only) opening a v3 Drawer from the left.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

test.use({ viewport: { width: 375, height: 812 } });
test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

const LINKS = ["Accueil", "Découvrez Macar", "Services", "Blog", "FAQ", "Nous recrutons", "Demander un devis"];
const menuButton = (page) => page.getByRole("button", { name: "Ouvrir le menu" });
const drawer = (page) => page.getByRole("dialog", { name: "Menu" });

async function openMenu(page, url = "/") {
  await open(page, url);
  await menuButton(page).click();
  await expect(drawer(page)).toBeVisible();
}

test("le bouton ouvre un Drawer à gauche avec les 6 liens, un séparateur et le devis", async ({ page }) => {
  await openMenu(page);
  for (const name of LINKS) await expect(drawer(page).getByRole("link", { name, exact: true })).toHaveCount(1);
  await expect(drawer(page).getByRole("separator")).toHaveCount(1);
  const box = await drawer(page).boundingBox();
  expect(box.x).toBeLessThanOrEqual(1);
});

test("choisir un lien navigue et ferme le Drawer", async ({ page }) => {
  await openMenu(page);
  await drawer(page).getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(drawer(page)).toHaveCount(0);
});

test("Échap ferme le Drawer et rend le focus au bouton", async ({ page }) => {
  await openMenu(page);
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toHaveCount(0);
  await expect(menuButton(page)).toBeFocused();
});

test("la croix ferme le Drawer", async ({ page }) => {
  await openMenu(page);
  await drawer(page).getByRole("button", { name: "Fermer le menu" }).click();
  await expect(drawer(page)).toHaveCount(0);
});

test("un clic sur le fond ferme le Drawer", async ({ page }) => {
  await openMenu(page);
  const box = await drawer(page).boundingBox();
  await page.mouse.click(Math.min(370, box.x + box.width + 20), 400);
  await expect(drawer(page)).toHaveCount(0);
});

test("page bloquée derrière le Drawer, le focus reste dans le panneau", async ({ page }) => {
  await openMenu(page);
  const y0 = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBe(y0);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await drawer(page).evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
});

test("à 320 px, menu ouvert : aucun défilement horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openMenu(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

// Review focus 1: an in-page anchor chosen from the Drawer on the page it points to.
test("FAQ depuis le Drawer sur l'accueil : Drawer fermé, FAQ à l'écran, page de nouveau défilable", async ({ page }) => {
  await openMenu(page);
  await drawer(page).getByRole("link", { name: "FAQ", exact: true }).click();
  await expect(drawer(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const b = document.getElementById("faq").getBoundingClientRect();
    return b.top < window.innerHeight && b.bottom > 0;
  })).toBe(true);
  const y = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(y);
});
```

- [ ] **Étape 4 : tests du bandeau cookies.** Créer `native/tests/cookies.spec.mjs` :

```js
// Spec 4 and 7: cookie banner with native v3 Surface, Switch and Button. Behaviour unchanged.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

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

test("le bandeau est une Surface v3 et ses actions des Button v3", async ({ page }) => {
  await open(page, "/");
  const banner = page.locator(".surface").filter({ hasText: BANNER_TEXT });
  await expect(banner).toHaveCount(1);
  await expect(banner.locator("button.button")).toHaveCount(3);
});
```

- [ ] **Étape 5 : tests des avis.** Créer `native/tests/reviews.spec.mjs` :

```js
// Spec 7: the reviews auto-scroll moves on and loops back to the start. Native v3 Card and Avatar.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

const carousel = (page) => page.locator("#reviews div.overflow-x-auto");
const left = (page) => carousel(page).evaluate((el) => el.scrollLeft);

for (const width of [1440, 375]) {
  test.describe(`avis, largeur ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });

    test.beforeEach(async ({ page, context, baseURL }) => {
      await prepare(context, baseURL);
      await open(page, "/");
      await carousel(page).scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);
    });

    test("défile tout seul d'au moins 30 px en 2,5 s", async ({ page }) => {
      const start = await left(page);
      await expect.poll(async () => (await left(page)) - start, { timeout: 2500, intervals: [100] }).toBeGreaterThanOrEqual(30);
    });

    test("repart au début après la fin de la liste", async ({ page }) => {
      const jump = await carousel(page).evaluate((el) => {
        const max = el.scrollWidth - el.clientWidth;
        el.scrollLeft = max - 2;
        return { max, after: el.scrollLeft };
      });
      expect(jump.after).toBeGreaterThan(jump.max - 50);
      await expect.poll(() => left(page), { timeout: 1000, intervals: [50] }).toBeLessThan(100);
    });
  });
}

test.describe("cartes d'avis", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
  });

  test("Card et Avatar v3 sans surcharge : coins arrondis, avatar de taille sm", async ({ page }) => {
    const card = page.locator('#reviews [data-slot="card"]').first();
    expect(await card.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(0);
    await expect(card.locator(".avatar")).toHaveClass(/avatar--sm/);
  });

  // "Voir plus" on a long review, now a v3 Button.
  test("Voir plus ouvre le texte, devient Voir moins, sans changer la hauteur de la carte", async ({ page }) => {
    const cards = page.locator('#reviews [data-slot="card"]');
    const index = await cards.evaluateAll((els) => els.findIndex((el) => el.textContent.includes("Voir plus")));
    const card = cards.nth(index);
    const h0 = (await card.boundingBox()).height;
    await card.getByRole("button", { name: "Voir plus" }).click();
    await expect(card.getByRole("button", { name: "Voir moins" })).toBeVisible();
    expect((await card.boundingBox()).height).toBe(h0);
    await card.getByRole("button", { name: "Voir moins" }).click();
    await expect(card.getByRole("button", { name: "Voir plus" })).toBeVisible();
  });
});
```

- [ ] **Étape 6 : tests du formulaire.** Créer `native/tests/form.spec.mjs` :

```js
// Spec 4 and 7: contact form with v3 Form, TextField, Label, Input, TextArea, FieldError, Button.
// Never sends anything: routeNetwork (lib/common.mjs) aborts every request that leaves localhost,
// Formspree included, and afterEach checks that no request to Formspree went through.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

let formspree;
test.beforeEach(async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  formspree = [];
  page.on("requestfinished", (r) => { if (r.url().includes("formspree")) formspree.push(r.url()); });
  await open(page, "/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
});
test.afterEach(() => expect(formspree).toEqual([]));

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
```

- [ ] **Étape 7 : tests de mise en page et de clavier.** Créer `native/tests/layout.spec.mjs` :

```js
// Review focus 2 and 5: no horizontal scroll at 320 px on any page, keyboard access of the v3 links.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";
import { PAGES } from "../../lib/common.mjs";

test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

// Review focus 2: v3 buttons never wrap their label, so a row of them can overflow a small phone.
test.describe("320 px", () => {
  test.use({ viewport: { width: 320, height: 568 } });
  for (const p of PAGES) {
    test(`${p.path} : aucun défilement horizontal`, async ({ page }) => {
      await open(page, p.path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    });
  }
});

test.describe("1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // Review focus 5: one Tab stop per navbar link, each with a visible focus style.
  test("barre de navigation : un arrêt Tab par lien, focus visible", async ({ page }) => {
    await open(page, "/about");
    const names = ["Accueil", "Découvrez Macar", "Services", "Blog", "FAQ", "Nous recrutons", "Demander un devis"];
    await page.locator('nav a[href="/"]:visible').first().focus();
    const seen = [];
    for (let i = 0; i < names.length; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const s = getComputedStyle(el);
        return { text: el.textContent.trim(), ring: s.outlineStyle !== "none" || s.boxShadow !== "none" };
      });
      expect(info.ring, `focus visible sur ${info.text}`).toBe(true);
      seen.push(info.text);
    }
    expect(seen).toEqual(names);
  });

  test("un lien de la barre navigue sans recharger la page", async ({ page }) => {
    await open(page, "/");
    await page.evaluate(() => { window.__macarAlive = true; });
    await page.locator("nav").getByRole("link", { name: "Services", exact: true }).click();
    await expect(page).toHaveURL(/\/services$/);
    expect(await page.evaluate(() => window.__macarAlive === true)).toBe(true);
  });
});
```

- [ ] **Étape 8 : script de captures.** Créer `native/shots.mjs` :

```js
// node native/shots.mjs --base <url> --out <dir>
// Full-page screenshots of every page of lib/common.mjs PAGES at 375 and 1440 px (CLAUDE.md
// widths), plus the interactive states of the home page. Timers of the reviews auto-scroll and
// of the logo carousel are frozen (FREEZE_SCRIPT) so that two runs give the same pictures.
// Files: <slug>__<width>__<state>.png. Never submits a valid contact form.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { PAGES, FREEZE_SCRIPT, CONSENT_COOKIE, routeNetwork, stabilize, settle, parkMouse, parseArgs } from "../lib/common.mjs";

const args = parseArgs();
if (!args.base || !args.out) {
  console.error("usage: node native/shots.mjs --base <url> --out <dir>");
  process.exit(2);
}
const BASE = args.base.replace(/\/$/, "");
const OUT = path.resolve(args.out);
fs.mkdirSync(OUT, { recursive: true });
const WIDTHS = [375, 1440];
const HEIGHTS = { 375: 812, 1440: 900 };

async function context(browser, width, consent) {
  const ctx = await browser.newContext({
    viewport: { width, height: HEIGHTS[width] },
    deviceScaleFactor: 1,
    locale: "fr-BE",
    timezoneId: "Europe/Brussels",
    colorScheme: "light",
  });
  await ctx.addInitScript(FREEZE_SCRIPT);
  if (consent) await ctx.addCookies([{ ...CONSENT_COOKIE, url: BASE }]);
  await routeNetwork(ctx, BASE);
  return ctx;
}

const shot = async (page, name, opts) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log(name);
};

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    const ctx = await context(browser, width, true);
    const page = await ctx.newPage();
    for (const p of PAGES) {
      await page.goto(BASE + p.path, { waitUntil: "load" });
      await stabilize(page);
      await parkMouse(page);
      await shot(page, `${p.slug}__${width}__default`, { fullPage: true });
    }

    // FAQ: first question open.
    await page.goto(BASE + "/", { waitUntil: "load" });
    await stabilize(page);
    await page.locator("#faq button[aria-expanded]").first().click();
    await settle(page);
    await parkMouse(page);
    await page.locator("#faq").screenshot({ path: path.join(OUT, `home__${width}__faq-open.png`) });
    console.log(`home__${width}__faq-open`);

    // Contact form: empty submission, so validation stops it before any network request.
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator("#contact").getByRole("button", { name: "Envoyer" }).click();
    await settle(page);
    await parkMouse(page);
    await page.locator("#contact").screenshot({ path: path.join(OUT, `home__${width}__form-errors.png`) });
    console.log(`home__${width}__form-errors`);

    if (width === 375) {
      await page.goto(BASE + "/", { waitUntil: "load" });
      await stabilize(page, { scrollThrough: false });
      await page.getByRole("button", { name: "Ouvrir le menu" }).click();
      await settle(page);
      await shot(page, `home__${width}__menu-open`);
    }
    await ctx.close();

    // Cookie banner, then its preferences, without the consent cookie.
    const noConsent = await context(browser, width, false);
    const p2 = await noConsent.newPage();
    await p2.goto(BASE + "/", { waitUntil: "load" });
    await stabilize(p2, { scrollThrough: false });
    await shot(p2, `home__${width}__cookie-banner`);
    await p2.getByRole("button", { name: "Préférences", exact: true }).click();
    await settle(p2);
    await parkMouse(p2);
    await shot(p2, `home__${width}__cookie-preferences`);
    await noConsent.close();
  }
} finally {
  await browser.close();
}
```

- [ ] **Étape 9 : page de comparaison.** Créer `native/compare-page.mjs` :

```js
// node native/compare-page.mjs --dir <dir>
// Builds <dir>/index.html from the screenshots of <dir>/before and <dir>/after (native/shots.mjs):
// one section per page and state, before and after side by side, 375 px then 1440 px.
// The owner opens the file in a browser and validates the new look page by page.
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "../lib/common.mjs";

const args = parseArgs();
if (!args.dir) {
  console.error("usage: node native/compare-page.mjs --dir <dir containing before/ and after/>");
  process.exit(2);
}
const DIR = path.resolve(args.dir);
const names = new Set([
  ...fs.readdirSync(path.join(DIR, "before")),
  ...fs.readdirSync(path.join(DIR, "after")),
].filter((f) => f.endsWith(".png")));

// <slug>__<width>__<state>.png, grouped by slug and state, widths in ascending order.
const groups = new Map();
for (const f of [...names].sort()) {
  const [slug, width, state] = f.replace(/\.png$/, "").split("__");
  const key = state === "default" ? slug : `${slug} (${state})`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ f, width: Number(width) });
}

const cell = (side, f) =>
  fs.existsSync(path.join(DIR, side, f))
    ? `<a href="${side}/${f}" target="_blank"><img loading="lazy" src="${side}/${f}" alt="${side} ${f}"></a>`
    : `<p class="missing">absente</p>`;

let body = "";
for (const [key, shots] of groups) {
  body += `<section id="${encodeURIComponent(key)}"><h2>${key}</h2>`;
  for (const { f, width } of shots.sort((a, b) => a.width - b.width)) {
    body += `<h3>${width} px</h3><div class="pair w${width}"><figure><figcaption>Avant</figcaption>${cell("before", f)}</figure><figure><figcaption>Après</figcaption>${cell("after", f)}</figure></div>`;
  }
  body += `</section>`;
}
const toc = [...groups.keys()].map((k) => `<li><a href="#${encodeURIComponent(k)}">${k}</a></li>`).join("");

fs.writeFileSync(path.join(DIR, "index.html"), `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Macar : avant et après HeroUI v3 natif</title>
<style>
body { font-family: system-ui, sans-serif; margin: 0 16px 64px; background: #f4f4f5; color: #18181b; }
h1 { margin: 24px 0 8px; } h2 { margin: 48px 0 8px; border-top: 1px solid #d4d4d8; padding-top: 16px; } h3 { margin: 16px 0 8px; font-weight: 500; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.pair.w375 { grid-template-columns: repeat(2, minmax(0, 400px)); }
figure { margin: 0; } figcaption { font-size: 14px; margin-bottom: 4px; color: #52525b; }
img { width: 100%; height: auto; border: 1px solid #d4d4d8; background: #fff; }
.missing { color: #b91c1c; } ul { columns: 3; }
</style></head><body>
<h1>Avant et après, page par page</h1>
<p>À gauche le site actuel, à droite le site HeroUI v3 natif. Cliquer une image l'ouvre en taille réelle.</p>
<ul>${toc}</ul>
${body}
</body></html>
`);
console.log(`${groups.size} sections, ${names.size} screenshots: ${path.join(DIR, "index.html")}`);
```

- [ ] **Étape 10 : contrôle de la console.** Créer `native/console.mjs` :

```js
// node native/console.mjs --base <url> --ref <url>
// Spec 7 "Console du navigateur sans erreur": opens every page of lib/common.mjs PAGES at 375 and
// 1440 px on both sites, opens the mobile menu and the cookie preferences on the home page, and
// lists the console errors and page errors of --base that --ref does not have (the same message
// on the same page). Requests leaving localhost are aborted by routeNetwork on both sites alike.
// Exit 0 only if --base adds no error.
import { chromium } from "@playwright/test";
import { PAGES, CONSENT_COOKIE, routeNetwork, parseArgs } from "../lib/common.mjs";

const args = parseArgs();
if (!args.base || !args.ref) {
  console.error("usage: node native/console.mjs --base <url> --ref <url>");
  process.exit(2);
}

async function collect(base) {
  base = base.replace(/\/$/, "");
  const browser = await chromium.launch();
  const errors = new Set();
  try {
    for (const width of [375, 1440]) {
      for (const consent of [true, false]) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: "fr-BE" });
        if (consent) await ctx.addCookies([{ ...CONSENT_COOKIE, url: base }]);
        await routeNetwork(ctx, base);
        const page = await ctx.newPage();
        let where = "";
        page.on("console", (m) => { if (m.type() === "error") errors.add(`${where}  ${m.text().replace(base, "")}`); });
        page.on("pageerror", (e) => errors.add(`${where}  pageerror ${e.message}`));
        for (const p of consent ? PAGES : PAGES.slice(0, 1)) {
          where = `${p.path} @${width}${consent ? "" : " sans consentement"}`;
          await page.goto(base + p.path, { waitUntil: "load" });
          await page.waitForLoadState("networkidle");
          if (p.path === "/" && consent && width === 375) {
            await page.getByRole("button", { name: "Ouvrir le menu" }).click();
            await page.waitForTimeout(500);
            await page.keyboard.press("Escape");
            await page.waitForTimeout(500);
          }
          if (!consent) {
            await page.getByRole("button", { name: "Préférences", exact: true }).click();
            await page.waitForTimeout(500);
          }
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  return errors;
}

const ref = await collect(args.ref);
const cur = await collect(args.base);
const added = [...cur].filter((e) => !ref.has(e)).sort();
console.log(`ref: ${ref.size} error(s), base: ${cur.size} error(s), added by base: ${added.length}`);
for (const e of added) console.log("ADDED " + e);
process.exit(added.length ? 1 : 0);
```

- [ ] **Étape 11 : script du vocabulaire v3.** Créer `native/vocabulary.mjs` :

```js
// node native/vocabulary.mjs <site repo dir>
// Spec section 3 "Vocabulaire": rewrites the site's colour classes to the HeroUI v3 names in every
// .ts/.tsx file under src/. Prints each file it changed and every replacement count.
// Idempotent: a second run changes nothing.
import fs from "node:fs";
import path from "node:path";

const repo = process.argv[2];
if (!repo) {
  console.error("usage: node native/vocabulary.mjs <site repo dir>");
  process.exit(2);
}

// [pattern, replacement]. Order matters: specific arbitrary values first, then names.
const RULES = [
  // Tailwind 3 imitations removed from globals.css.
  [/\bsibling:mt-([\d.]+) sibling:mb-0\b/g, "space-y-$1"],
  [/\bsibling:ml-([\d.]+) sibling:mr-0\b/g, "space-x-$1"],
  [/\bsibling:border-t sibling:border-b-0\b/g, "divide-y"],
  [/\bsibling:border-l sibling:border-r-0\b/g, "divide-x"],
  [/\bw-two-thirds\b/g, "w-2/3"],
  [/\bw-third\b/g, "w-1/3"],
  [/\bw-review-card\b/g, "w-[calc((100%-2rem)/3)]"],
  [/\bbg-fade-left\b/g, "bg-linear-to-l from-background to-transparent"],
  // Arbitrary opacities and v2 variables: nearest v3 token.
  [/\b(bg|hover:bg)-\[hsl\(var\(--v2-default-50\)\/0\.5\)\]/g, "$1-surface"],
  [/\b(bg|hover:bg)-\[hsl\(var\(--v2-primary\)\/0\.(05|1)\)\]/g, "$1-accent-soft"],
  [/\bhover:bg-\[hsl\(var\(--v2-primary\)\/0\.9\)\]/g, "hover:bg-accent-hover"],
  [/\bhover:bg-\[hsl\(var\(--v2-secondary\)\/0\.8\)\]/g, "hover:bg-default-hover"],
  [/\bmarker:text-\[hsl\(var\(--v2-primary\)\/0\.7\)\]/g, "marker:text-accent"],
  [/\bborder-\[hsl\(var\(--v2-default-200\)\/0\.5\)\]/g, "border-separator"],
  [/\b(bg|hover:bg)-\[rgb\(18_79_170\/0\.(05|1)\)\]/g, "$1-accent-soft"],
  [/\b(bg|hover:bg)-\[rgb\(18_79_170\/0\.9\)\]/g, "$1-accent-hover"],
  [/\bbg-\[rgb\(229_229_229\/0\.1\)\]/g, "bg-default-soft"],
  [/\bbg-\[rgb\(255_255_255\/0\.8\)\]/g, "bg-surface"],
  [/\btext-\[rgb\(71_75_100\/0\.[789]\)\]/g, "text-muted"],
  [/\bborder-\[rgb\((115_115_115|64_64_64)\/0\.3\)\]/g, "border-separator"],
  // Site colour names.
  [/\b(bg|text|border|fill|decoration)-accent1\b/g, "$1-accent"],
  [/\btext-headings\b/g, "text-foreground"],
  [/\btext-text\b/g, "text-muted"],
  [/\bbg-cardbackground\b/g, "bg-surface"],
  [/\bborder-bordercard\b/g, "border-border"],
  // HeroUI v2 colours.
  [/\btext-default-[5-7]00\b/g, "text-muted"],
  [/\bborder-default-200\b/g, "border-border"],
  [/\bbg-default-100\b/g, "bg-default"],
  [/\btext-primary-foreground\b/g, "text-accent-foreground"],
  [/\b(bg|text)-primary\b/g, "$1-accent"],
  [/\btext-secondary-foreground\b/g, "text-default-foreground"],
  [/\bbg-secondary\b/g, "bg-default"],
  // Tailwind 3 palette shades of globals.css.
  [/\btext-red-[5-7]00\b/g, "text-danger"],
  [/\btext-gray-[56]00\b/g, "text-muted"],
  [/\bbg-gray-100\b/g, "bg-default"],
  [/\bborder-gray-300\b/g, "border-border"],
  [/\bbg-neutral-500\b/g, "bg-separator"],
  [/\bborder-neutral-500\b/g, "border-separator"],
  [/\bborder-neutral-100\b/g, "border-border"],
  [/\btext-neutral-200\b/g, "text-separator"],
  [/\bbg-blue-100\b/g, "bg-accent-soft"],
  [/\bborder-blue-500\b/g, "border-accent"],
  // Class names that never existed in the theme (no effect today): their intent, in v3 names.
  [/\bhover:text-font-lighter-gray\b/g, "hover:text-foreground"],
  [/\btext-font-lighter-?gray\b/g, "text-foreground"],
  [/\btext-font-gray\b/g, "text-muted"],
  [/ ?\b(divide-font-gray|font-ligt|font-regular|border-card-border|bg-light-background\/10)\b/g, ""],
  [/ ?(?<![\w-])cardbackground(?![\w-])/g, ""],
];

const files = fs
  .readdirSync(path.join(repo, "src"), { recursive: true })
  .map((f) => path.join(repo, "src", f))
  .filter((f) => /\.(ts|tsx)$/.test(f));

let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  const counts = [];
  for (const [re, to] of RULES) {
    const n = (after.match(re) || []).length;
    if (n) {
      after = after.replace(re, to);
      counts.push(`${re.source} x${n}`);
    }
  }
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log(path.relative(repo, file).split(path.sep).join("/"));
    for (const c of counts) console.log("  " + c);
  }
}
console.log(`${changed} files changed`);
```

- [ ] **Étape 12 : clone de référence `dev`.** Vérifier d'abord que l'aperçu jetable de la spec (section 9) n'existe plus et que le port 3001 est libre, en PowerShell :

```powershell
Test-Path D:\macar-migration\v3-preview, D:\macar-migration\v3-preview-shots
(Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue | Measure-Object).Count
```

Attendu : `False`, `False`, `0` (sinon, arrêter le serveur 3001 avec la Procédure C sur ce port et supprimer les deux dossiers par robocopy `/MIR` depuis un dossier vide puis `Remove-Item`). Vérifier ensuite que `dev` local suit `origin/dev`, puis cloner et construire (2 à 4 minutes) :

```bash
git -C D:/Repos/macar-next-site-prod fetch origin
git -C D:/Repos/macar-next-site-prod rev-parse --short dev origin/dev
```

Attendu : deux fois le même commit (`6728cd3` au moment de la spec). S'ils diffèrent, demander au propriétaire avant d'aller plus loin.

```bash
git clone -b dev D:/Repos/macar-next-site-prod D:/macar-migration/native-ref
cd D:/macar-migration/native-ref && npm ci && npm run build
```

Attendu : `✓ Generating static pages (33/33)`. Servir sur 3101 (PowerShell) :

```powershell
New-Item -ItemType Directory -Force D:\macar-migration\native-out | Out-Null
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx next start -p 3101 > D:\macar-migration\native-out\server-3101.log 2>&1" -WorkingDirectory "D:\macar-migration\native-ref" -WindowStyle Hidden
Start-Sleep -Seconds 6
(Invoke-WebRequest -UseBasicParsing http://localhost:3101/).StatusCode
```

Attendu : `200`.

- [ ] **Étape 13 : la suite native échoue là où l'ancien design diffère.** Dans `D:\Repos\macar-migration-tools` :

```bash
BASE_URL=http://localhost:3101 npx playwright test -c native/playwright.config.mjs --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu (mesuré sur le prototype) : `15 failed`, `28 passed`. Les 15 échecs : faq « style natif » ; reviews « Card et Avatar v3 sans surcharge » ; form « envoi vide » et « email invalide » ; cookies « Essentiels », « Analytique et Les fonctionnalités », « Surface v3 » ; les 8 tests de `menu.spec.mjs`. Les 28 autres (dont les 17 de `layout.spec.mjs`, « Voir plus », « saisie » et « formulaire valide ») passent déjà : ils protègent un comportement qui ne doit pas régresser.

- [ ] **Étape 14 : captures « avant ».**

```bash
node native/shots.mjs --base http://localhost:3101 --out D:/macar-migration/native-shots/before
```

Attendu : 39 noms affichés (15 pages en 2 largeurs, plus `faq-open`, `form-errors`, `cookie-banner`, `cookie-preferences` en 2 largeurs et `menu-open` en 375), le dernier `home__1440__cookie-preferences`. Laisser le serveur 3101 lancé jusqu'à la tâche 9 ou l'arrêter (Procédure C sur 3101) et le relancer alors avec la commande de l'étape 12.

- [ ] **Étape 15 : commit dans le dépôt d'outils** (local, jamais poussé) :

```bash
cd D:/Repos/macar-migration-tools
git add native/playwright.config.mjs
git add native/tests/faq.spec.mjs
git add native/tests/menu.spec.mjs
git add native/tests/cookies.spec.mjs
git add native/tests/reviews.spec.mjs
git add native/tests/form.spec.mjs
git add native/tests/layout.spec.mjs
git add native/shots.mjs
git add native/compare-page.mjs
git add native/console.mjs
git add native/vocabulary.mjs
git commit -F - <<'EOF'
Add the native HeroUI v3 behaviour suite and screenshot tools

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Étape 16 : versionner ce plan sur la branche du site.** Dans `D:\Repos\macar-next-site-prod`, sur `heroui-v3-native` :

```bash
git add superpowers/plans/2026-10-04-heroui-v3-native.md
git commit -F - <<'EOF'
Add the implementation plan for a native HeroUI v3 site

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 1 : zone 1, thème et `globals.css`

**Fichiers :**
- Modifier : `src/app/globals.css` (fichier entier), `src/app/layout.tsx`, `src/app/_components/textStyles.tsx` (fichier entier), `src/app/blog/[slug]/page.tsx`, `src/app/blog/_components/MdxComponents.tsx`, et les 25 fichiers que liste le script.

**Interfaces :**
- Consomme : `native/vocabulary.mjs` (tâche 0).
- Produit : les utilitaires de couleur v3 (`bg-accent`, `text-muted`, `bg-surface`, `border-border`, `bg-separator`, `bg-accent-soft`, `text-danger`…), l'utilitaire `font-heading` (Raptor) et `font-sans` (Open Sans). Plus aucune classe `--v2-*`, `sibling:`, `w-third`, `faq-panel-transition`, `animate-navbar-*` n'est définie.

- [ ] **Étape 1 : réécrire le vocabulaire.**

```bash
node D:/Repos/macar-migration-tools/native/vocabulary.mjs D:/Repos/macar-next-site-prod | grep -v "^  "
```

Attendu : ces 25 fichiers puis `25 files changed` : `src/app/_components/CookieConsent.tsx`, `HomeView.tsx`, `ServiceDetailBody.tsx`, `ServiceSection.tsx`, `buttons.tsx`, `cards.tsx`, `checkMark.tsx`, `footer.tsx`, `navbar.tsx`, `textStyles.tsx` (tous sous `src/app/_components/`), `src/app/blog/[slug]/page.tsx`, `src/app/blog/_components/MdxComponents.tsx`, `src/app/blog/page.tsx`, `src/app/layout.tsx`, `src/app/mentions-legales/page.tsx`, `src/app/not-found.tsx`, `src/app/politique-confidentialite/page.tsx`, `src/app/politique-cookies/page.tsx`, `src/app/services/page.tsx`, `src/app/zones/[slug]/page.tsx`, `src/components/GoogleReviews.tsx`, `src/components/contact_form.tsx`, `src/components/jobs.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`. Relancer la même commande : `0 files changed`.

- [ ] **Étape 2 : vérifier qu'il ne reste aucun ancien nom.**

```bash
grep -rnoE "v2-[a-z0-9-]+|sibling:[a-z0-9.-]+|accent1|headings|bordercard|cardbackground|text-text\b|default-[0-9]+|\[rgb\([^]]*\]|font-gray|(gray|neutral|red|blue)-[0-9]+|w-third|bg-fade" src --include=*.tsx --include=*.ts | grep -v "icons/logo_specific"
```

Attendu : seulement `src/components/contact_form.tsx:...:accent1` et `src/components/ui/button.tsx:...:accent1` (nom de variante shadcn `variant="accent1"`, retiré aux tâches 5 et 8).

- [ ] **Étape 3 : `globals.css`.** Remplacer tout le fichier `src/app/globals.css` par :

```css
@import "tailwindcss" source(none);
@import "@heroui/styles";

/* Tailwind sources, declared explicitly: content/ (MDX articles) is not scanned. */
@source "../app/**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";

/* Fonts loaded by next/font in layout.tsx: Open Sans for the text, Raptor for the headings (font-heading). */
@theme inline {
  --font-sans: var(--font-open-sans), ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-raptor), var(--font-open-sans), sans-serif;
}

/*
 * Macar colours on the HeroUI v3 theme variables. Outside any layer, so they win over the
 * default theme (declared in a layer). Radius, shadows, spacing and durations stay HeroUI's.
 */
:root {
  --accent: #124FAA;
  --accent-foreground: #FFFFFF;
  --background: #F6F8FF;
  --foreground: #0E1435;
  --muted: #474B64;
  --surface: #FFFFFF;
  --border: #D8DBE9;
  --focus: var(--accent);
  --link: var(--accent);
}

/*
 * react-responsive-carousel (logo strip) names its track "slider", like the HeroUI v3 Slider.
 * Only the .slider declarations that the carousel stylesheet does not set itself are reset.
 */
@layer components {
  .carousel .slider {
    gap: normal;
    grid-template-columns: none;
    grid-template-areas: none;
  }
}
```

- [ ] **Étape 4 : polices dans `layout.tsx`.** Trois remplacements dans `src/app/layout.tsx` :

```tsx
// avant
const open_sans = Open_Sans({ subsets: ['latin'] })
// après
const open_sans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })
```

```tsx
// avant
    <html lang="fr">
// après
    <html lang="fr" className={`${open_sans.variable} ${raptor.variable}`}>
```

```tsx
// avant (après l'étape 1, text-text est déjà devenu text-muted)
      <body className={`${open_sans.className} text-muted bg-background antialiased`}>
// après
      <body className="bg-background text-muted antialiased">
```

- [ ] **Étape 5 : `textStyles.tsx`.** Remplacer tout `src/app/_components/textStyles.tsx` par :

```tsx
// Headings use the Raptor font through the font-heading utility (variable set in layout.tsx).
export const Raptor = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return <div className="font-heading text-foreground">{children}</div>;
};

export const MainHeading = ({
    children,
    customClasses,
}: {
    children?: React.ReactNode;
    customClasses?: string;
}) => {
    return (
        <div
            className={`font-heading leading-loose lg:leading-none text-4xl lg:text-6xl 2xl:text-7xl max-w-[20ch] text-foreground ${customClasses}`}
        >
            {children}
        </div>
    );
};

export const SecondHeading = ({
    children,
    customClasses,
}: {
    children?: React.ReactNode;
    customClasses?: string;
}) => {
    return (
        <div
            className={`font-heading text-3xl max-w-[20ch] lg:text-5xl 2xl:text-6xl lg:max-w-[30ch] text-foreground ${customClasses}`}
        >
            {children}
        </div>
    );
};

export const ThirdHeading = ({
    children,
    customClasses,
}: {
    children?: React.ReactNode;
    customClasses?: string;
}) => {
    return (
        <div
            className={`font-heading text-base max-w-[20ch] lg:text-3xl 2xl:text-4xl lg:max-w-[30ch] text-foreground ${customClasses}`}
        >
            {children}
        </div>
    );
};

export const P = ({
    children,
    content,
    customClasses,
}: {
    children?: React.ReactNode;
    content?: string;
    customClasses?: string;
}) => {
    return (
        <div
            className={`text-sm lg:text-base 2xl:text-lg max-w-prose  ${customClasses}`}
        >
            <p className="leading-loose">{content}</p>
            {children}
        </div>
    );
};
```

- [ ] **Étape 6 : titres du blog.** Dans `src/app/blog/[slug]/page.tsx` (3 occurrences) et `src/app/blog/_components/MdxComponents.tsx` (2 occurrences), remplacer chaque `font-(--font-raptor)` par `font-heading` (Edit avec « remplacer tout »). Contrôle : `grep -rn "font-(--font-raptor)" src` ne renvoie rien et `grep -rc "font-heading" src/app/blog` totalise 5.

- [ ] **Étape 7 : contrôles et build.** Procédure A. Attendu : celui de la Procédure A.

- [ ] **Étape 8 : contrôle visuel.** Procédure B, puis :

```bash
cd D:/Repos/macar-migration-tools && node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/zone-1
```

Ouvrir `home__1440__default.png` et `home__375__default.png` de `zone-1` et de `before` : le rendu doit être presque identique (bordures en `#D8DBE9`, texte toujours en Open Sans, titres en Raptor). Les titres du blog (`blog-isolation-facade__1440__default.png`) passent en Raptor. Puis Procédure T : attendu `15 failed`, `28 passed` (mêmes échecs qu'à la tâche 0).

- [ ] **Étape 9 : commit.**

```bash
git add src/app/globals.css
git add src/app/layout.tsx
git add src/app/_components/textStyles.tsx
git add src/app/_components/CookieConsent.tsx
git add src/app/_components/HomeView.tsx
git add src/app/_components/ServiceDetailBody.tsx
git add src/app/_components/ServiceSection.tsx
git add src/app/_components/buttons.tsx
git add src/app/_components/cards.tsx
git add src/app/_components/checkMark.tsx
git add src/app/_components/footer.tsx
git add src/app/_components/navbar.tsx
git add "src/app/blog/[slug]/page.tsx"
git add src/app/blog/_components/MdxComponents.tsx
git add src/app/blog/page.tsx
git add src/app/mentions-legales/page.tsx
git add src/app/not-found.tsx
git add src/app/politique-confidentialite/page.tsx
git add src/app/politique-cookies/page.tsx
git add src/app/services/page.tsx
git add "src/app/zones/[slug]/page.tsx"
git add src/components/GoogleReviews.tsx
git add src/components/contact_form.tsx
git add src/components/jobs.tsx
git add src/components/ui/button.tsx
git add src/components/ui/card.tsx
git status --short
```

Attendu de `git status --short` : aucune ligne restante (rien d'autre de modifié). Puis :

```bash
git commit -F - <<'EOF'
Apply the Macar theme through the HeroUI v3 variables

globals.css keeps only the imports, the sources, the fonts and the v3
theme variables. Colour classes use the v3 names; the Tailwind 3 and
HeroUI v2 imitations are gone.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Laisser le serveur 3100 lancé : la tâche 2 commence par lui.

---

## Tâche 2 : zone 2, composants v3 déjà en place, sans surcharge

**Fichiers :**
- Modifier : `src/app/_components/HomeView.tsx` (FAQ), `src/app/_components/CookieConsent.tsx` (Switch), `src/app/_components/ServiceSection.tsx` (Chip), `src/components/GoogleReviews.tsx` (fichier entier).

**Interfaces :**
- Consomme : thème de la tâche 1 ; `onFaqTriggerKeyDown` de `src/app/_components/faqKeyboard.ts` (inchangé).
- Produit : `FaqAccordion` natif avec `data-faq-column` sur `Accordion` et `data-faq-trigger` sur `Accordion.Trigger` ; cartes d'avis `[data-slot="card"]` avec `Avatar size="sm"` et un `Button` v3 « Voir plus » ou « Voir moins ».

- [ ] **Étape 1 : constater l'échec.** Serveur 3100 de la tâche 1 lancé :

```bash
cd D:/Repos/macar-migration-tools && npx playwright test -c native/playwright.config.mjs faq reviews --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu : `2 failed` (« style natif » et « Card et Avatar v3 sans surcharge »), `8 passed`.

- [ ] **Étape 2 : relire la doc v3** (MCP `heroui-react`, `get_component_docs`) d'`Accordion`, `Switch`, `Chip`, `Card`, `Avatar` et `Button`.

- [ ] **Étape 3 : FAQ native.** Dans `src/app/_components/HomeView.tsx`, remplacer tout le bloc qui commence à la ligne `// One FAQ column. The HeroUI v3 default styles are overridden by the classes below (utilities` et s'arrête juste avant `export default function HomeView` par :

```tsx
// One FAQ column: the HeroUI v3 Accordion with its own styles. The data-faq-* markers drive
// the arrow, Home and End keys of faqKeyboard.ts.
function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion data-faq-column>
      {items.map((item, i) => (
        <Accordion.Item key={i}>
          <Accordion.Heading level={2}>
            <Accordion.Trigger data-faq-trigger onKeyDown={onFaqTriggerKeyDown}>
              {item.question}
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{item.answer}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

```

Puis supprimer la ligne d'import devenue inutile `import { Fragment } from "react";`.

- [ ] **Étape 4 : Switch sans surcharge.** Dans `src/app/_components/CookieConsent.tsx`, remplacer le commentaire `// HeroUI v3 Switch (structure required since 3.2.0)...` (3 lignes) et la constante `CookieSwitch` qui suit par :

```tsx
// HeroUI v3 Switch with its own styles.
const CookieSwitch = (props: Omit<ComponentProps<typeof Switch>, "children">) => (
  <Switch {...props}>
    <Switch.Content>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Content>
  </Switch>
);
```

- [ ] **Étape 5 : Chip `soft` `accent`.** Dans `src/app/_components/ServiceSection.tsx` (composant serveur : garder l'import `@heroui/react/chip`), remplacer :

```tsx
              <Chip
                key={label}
                className="relative inline-flex items-center justify-between whitespace-nowrap shrink w-auto gap-[normal] px-1 py-0 rounded-full bg-accent-soft text-inherit [font-size:inherit] [line-height:inherit] [font-weight:inherit]"
              >
                <Chip.Label className="flex-1 px-1 text-accent font-medium">{label}</Chip.Label>
              </Chip>
```

par :

```tsx
              <Chip key={label} color="accent" variant="soft">
                {label}
              </Chip>
```

- [ ] **Étape 6 : avis.** Remplacer tout `src/components/GoogleReviews.tsx` par :

```tsx
"use client";

import { Avatar, Button, Card } from "@heroui/react";
import { SecondHeading, P } from "@/app/_components/textStyles";
import { Star, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { reviews, type GoogleReview } from "@/data/reviews";

const CAROUSEL_SCROLL_STEP = 1;
const CAROUSEL_INTERVAL_MS = 30;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} étoiles`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-separator"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

const CARD_BODY_HEIGHT = "10rem"; /* hauteur fixe pour éviter le déplacement au "Voir plus" */

// Initials shown by Avatar.Fallback while the photo loads, or instead of a photo that fails.
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join("");
}

// HeroUI v3 Card and Avatar with their own styles; the classes only size and place the card
// in the scrolling row.
function ReviewCard({ review, expanded, onToggle }: { review: GoogleReview; expanded: boolean; onToggle: () => void }) {
  const needsExpand = review.text.length > 180;
  return (
    <Card className="shrink-0 w-[calc((100%-2rem)/3)] min-w-[260px] max-w-[400px] snap-start">
      <Card.Header>
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <Avatar.Image src={review.authorPhotoUrl} alt={review.authorName} referrerPolicy="no-referrer" />
            <Avatar.Fallback>{getInitials(review.authorName)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{review.authorName}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col" style={{ minHeight: CARD_BODY_HEIGHT, maxHeight: CARD_BODY_HEIGHT }}>
          {expanded ? (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-muted text-sm leading-relaxed whitespace-pre-line">
              {review.text}
            </div>
          ) : (
            <p className="text-muted text-sm leading-relaxed whitespace-pre-line line-clamp-3">
              {review.text}
            </p>
          )}
          {needsExpand && (
            <Button variant="ghost" size="sm" onPress={onToggle} className="mt-2 self-start shrink-0">
              {expanded ? (
                <>
                  <ChevronUp aria-hidden /> Voir moins
                </>
              ) : (
                <>
                  <ChevronDown aria-hidden /> Voir plus
                </>
              )}
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

export default function GoogleReviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleCard = useCallback((index: number) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  useEffect(() => {
    if (isPaused || !scrollRef.current) return;
    const el = scrollRef.current;
    // Scroll-snap would catch each 1 px step and bring it back to the snap point, so snapping
    // and smooth scrolling are off while the carousel runs and restored on pause and unmount.
    el.style.scrollSnapType = "none";
    el.style.scrollBehavior = "auto";
    const id = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      // At the end of the list, loop back to the start.
      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollLeft = 0;
        return;
      }
      el.scrollLeft += CAROUSEL_SCROLL_STEP;
    }, CAROUSEL_INTERVAL_MS);
    return () => {
      clearInterval(id);
      el.style.scrollSnapType = "";
      el.style.scrollBehavior = "smooth";
    };
  }, [isPaused]);

  const pauseCarousel = useCallback(() => setIsPaused(true), []);
  const resumeCarousel = useCallback(() => setIsPaused(false), []);

  return (
    <div className="w-full">
      <SecondHeading>
        <h2>Avis Google</h2>
      </SecondHeading>
      <P customClasses="mt-4 max-w-prose">
        <p>Découvrez ce que nos clients disent de leur expérience avec nous.</p>
      </P>
      <div className="w-full mt-6">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-proximity md:snap-mandatory py-2 px-3 -mx-1 min-h-[180px] scrollbar-none touch-pan-x overscroll-x-contain overscroll-y-none"
            onMouseEnter={pauseCarousel}
            onMouseLeave={resumeCarousel}
            onTouchStart={pauseCarousel}
            onTouchEnd={resumeCarousel}
            style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
          >
            {reviews.map((review, i) => (
              <ReviewCard
                key={i}
                review={review}
                expanded={!!expandedCards[i]}
                onToggle={() => toggleCard(i)}
              />
            ))}
          </div>
          {/* Dégradé uniquement sur le carousel, pas sur le texte en dessous */}
          <div
            className="absolute top-0 right-0 bottom-0 w-20 sm:w-28 pointer-events-none bg-linear-to-l from-background to-transparent z-10"
            aria-hidden
          />
        </div>
        <p className="mt-2 text-right text-sm text-muted flex items-center justify-end gap-1">
          <span>Plus d&apos;avis</span>
          <ChevronRight className="w-4 h-4 text-accent" aria-hidden />
        </p>
      </div>
    </div>
  );
}
```

`scrollbar-none` est l'utilitaire de `@heroui/styles` ; il remplace `[-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`.

- [ ] **Étape 7 : contrôles et build.** Procédure C (3100), puis Procédure A.

- [ ] **Étape 8 : tests.** Procédure B, puis :

```bash
cd D:/Repos/macar-migration-tools && npx playwright test -c native/playwright.config.mjs faq reviews --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu : `10 passed`. Suite complète (Procédure T) : `13 failed`, `30 passed`.

- [ ] **Étape 9 : contrôle visuel.** `node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/zone-2`, puis regarder `home__1440__faq-open.png` (séparateurs fins, chevron v3 vers le bas qui pivote), `home__1440__default.png` et `home__375__default.png` (cartes d'avis arrondies avec ombre, bouton « Voir plus » fantôme), `services-renovation__1440__default.png` (chips bleu doux).

- [ ] **Étape 10 : commit.**

```bash
git add src/app/_components/HomeView.tsx
git add src/app/_components/CookieConsent.tsx
git add src/app/_components/ServiceSection.tsx
git add src/components/GoogleReviews.tsx
git commit -F - <<'EOF'
Use the v3 Accordion, Switch, Chip, Card and Avatar without overrides

The review cards also get a v3 Button for "Voir plus".

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 3 : zone 3, boutons et liens

**Fichiers :**
- Créer : `src/app/_components/links.tsx`.
- Modifier : `src/app/_components/HomeView.tsx`, `src/app/_components/ServiceDetailBody.tsx`, `src/app/_components/ServiceSection.tsx`, `src/app/services/page.tsx`, `src/app/zones/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/not-found.tsx`, `src/app/politique-confidentialite/page.tsx`, `src/app/politique-cookies/page.tsx`, `src/components/jobs.tsx`.

**Interfaces :**
- Consomme : `buttonVariants`, `linkVariants` et le type `ButtonVariants` de `@heroui/styles` ; `next/link`.
- Produit :
  - `TextLink(props: ComponentProps<typeof NextLink>)` : lien Next.js au style Link v3 ; `className` sert seulement à la mise en page.
  - `ButtonLink(props: ComponentProps<typeof NextLink> & { variant?: ButtonVariants["variant"]; size?: ButtonVariants["size"]; fullWidth?: boolean })` : lien Next.js au style Button v3, `variant` `"primary"` par défaut, `"tertiary"` pour l'action secondaire.
  - Les deux sont utilisables dans un composant serveur. La navbar et le pied de page (tâche 7) et le formulaire (tâche 5) s'en servent.

- [ ] **Étape 1 : relire la doc v3** de `Button` (section « Polymorphic Styling ») et de `Link` (section « Using with Routing Libraries »), et la page `/docs/react/getting-started/composition`.

- [ ] **Étape 2 : `links.tsx`.** Créer `src/app/_components/links.tsx` :

```tsx
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants, linkVariants, type ButtonVariants } from "@heroui/styles";

// HeroUI v3 styles on the Next.js link, the way the HeroUI docs pair them with a router: the
// element stays a real <a> with client-side navigation and prefetch. Server-safe (no React Aria).
// className only places the link in its layout (margins, width), never restyles it.
type NextLinkProps = ComponentProps<typeof NextLink>;

// Text link: the v3 Link look (accent colour, underline on hover, focus ring).
export function TextLink({ className, ...props }: NextLinkProps) {
  return <NextLink {...props} className={linkVariants().base({ className })} />;
}

// Action link: the v3 Button look. variant "primary" for the main action, "tertiary" for the second one.
export function ButtonLink({
  variant = "primary",
  size,
  fullWidth,
  className,
  ...props
}: NextLinkProps & Pick<ButtonVariants, "variant" | "size" | "fullWidth">) {
  return <NextLink {...props} className={buttonVariants({ variant, size, fullWidth, className })} />;
}
```

- [ ] **Étape 3 : accueil.** Dans `src/app/_components/HomeView.tsx`, remplacer l'import `import { PrimaryButton, SecondaryButton } from "./buttons";` par `import { ButtonLink, TextLink } from "./links";` (garder `import Link from "next/link";`, encore utilisé par les cartes jusqu'à la tâche 4), puis faire ces cinq remplacements.

Lien de la note Google, avant :

```tsx
            <Link
              href="/#reviews"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
              aria-label={`Note ${RATING.value.replace(".", ",")} sur 5, ${RATING.count} avis Google`}
            >
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </span>
              <span className="font-medium text-foreground">
                {RATING.value.replace(".", ",")}
              </span>
              <span>· {RATING.count} avis Google</span>
            </Link>
```

après (la taille du texte passe sur le paragraphe, le lien en hérite) :

```tsx
            <p className="mt-4 text-sm">
              <TextLink
                href="/#reviews"
                className="gap-2"
                aria-label={`Note ${RATING.value.replace(".", ",")} sur 5, ${RATING.count} avis Google`}
              >
                <span className="flex items-center gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </span>
                <span>{RATING.value.replace(".", ",")}</span>
                <span>· {RATING.count} avis Google</span>
              </TextLink>
            </p>
```

Boutons du haut, avant :

```tsx
            <div className="flex space-x-4">
              <PrimaryButton href="/#contact" content="Commencez votre projet !" />
              <SecondaryButton href="/#services" content="Services" />
            </div>
```

après (`flex-wrap` : à 320 px le second bouton passe à la ligne au lieu de déborder) :

```tsx
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/#contact">Commencez votre projet !</ButtonLink>
              <ButtonLink href="/#services" variant="tertiary">Services</ButtonLink>
            </div>
```

Section « Nos Services », avant :

```tsx
              <Link
                href="/services"
                className="font-medium text-accent hover:underline"
              >
                page Services
              </Link>
              .
            </p>
            <div className="mt-10 flex flex-col gap-3 w-fit">
              <PrimaryButton
                content="Commencez votre projet !"
                href="/#contact"
                customClasses="w-full"
              />
              <SecondaryButton
                href="/services"
                content="Voir le détail des services"
                customClasses="w-full"
              />
            </div>
```

après :

```tsx
              <TextLink href="/services">page Services</TextLink>.
            </p>
            <div className="mt-10 flex flex-col gap-3 w-fit">
              <ButtonLink href="/#contact" fullWidth>
                Commencez votre projet !
              </ButtonLink>
              <ButtonLink href="/services" variant="tertiary" fullWidth>
                Voir le détail des services
              </ButtonLink>
            </div>
```

Téléphone et email du bloc contact, avant :

```tsx
                <Link href="tel:+32478235008">
                  <P customClasses="text-muted hover:text-foreground">
                    {" "}
                    +32 478 23 50 08
                  </P>
                </Link>
              </div>
              <div>
                <P customClasses="font-medium">Email</P>
                <Link href="mailto:info@macar.be">
                  <P customClasses="text-muted hover:text-foreground">
                    {" "}
                    info@macar.be
                  </P>
                </Link>
              </div>
```

après :

```tsx
                <P>
                  <TextLink href="tel:+32478235008">+32 478 23 50 08</TextLink>
                </P>
              </div>
              <div>
                <P customClasses="font-medium">Email</P>
                <P>
                  <TextLink href="mailto:info@macar.be">info@macar.be</TextLink>
                </P>
              </div>
```

Lien Google Maps : remplacer l'élément `<a href="https://www.google.com/maps/place/...` (de `<a` à `</a>`, avec sa classe `mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline`) par le bloc suivant, en gardant l'URL Google Maps exacte du fichier :

```tsx
                <p className="mt-2 text-sm">
                  <TextLink
                    href="https://www.google.com/maps/place/Macar+-+Construction,+Assistance,+R%C3%A9novation/@50.877796,4.3408706,17z/data=!3m1!4b1!4m6!3m5!1s0x47c3c3b79029f705:0xf83dc2c32ee6c273!8m2!3d50.877796!4d4.3408706!16s%2Fg%2F11lcp66xw1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1"
                  >
                    Voir sur Google Maps
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </TextLink>
                </p>
```

- [ ] **Étape 4 : page de service (`ServiceDetailBody.tsx`).** Remplacer `import { PrimaryButton } from "./buttons";` par `import { ButtonLink } from "./links";`. Remplacer :

```tsx
              <PrimaryButton
                href="/#contact"
                content="Demander un devis gratuit"
              />
```

par :

```tsx
              <ButtonLink href="/#contact">Demander un devis gratuit</ButtonLink>
```

et les pastilles des communes :

```tsx
                <Link
                  key={c.slug}
                  href={`/zones/${c.slug}`}
                  className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                >
                  {c.name}
                </Link>
```

par :

```tsx
                <ButtonLink key={c.slug} href={`/zones/${c.slug}`} variant="tertiary" size="sm">
                  {c.name}
                </ButtonLink>
```

- [ ] **Étape 5 : `ServiceSection.tsx`.** Supprimer `import Link from "next/link";`, ajouter `import { TextLink } from "./links";` sous l'import de `./textStyles`, et remplacer :

```tsx
          <Link
            href="/#contact"
            className="text-sm font-medium text-accent hover:underline"
          >
            Demander un devis pour ce service →
          </Link>
```

par :

```tsx
          <p className="text-sm">
            <TextLink href="/#contact">Demander un devis pour ce service →</TextLink>
          </p>
```

- [ ] **Étape 6 : page Services et pages de zones.** Dans `src/app/services/page.tsx`, remplacer `import { PrimaryButton } from "../_components/buttons";` par `import { ButtonLink } from "../_components/links";` et le même bloc `PrimaryButton` « Demander un devis gratuit » qu'à l'étape 4 par la même ligne `ButtonLink`. Dans `src/app/zones/[slug]/page.tsx`, remplacer `import { PrimaryButton } from "@/app/_components/buttons";` par `import { ButtonLink } from "@/app/_components/links";`, le bloc `PrimaryButton` de la même façon, et les pastilles des autres communes :

```tsx
                  <Link
                    key={c.slug}
                    href={`/zones/${c.slug}`}
                    className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                  >
                    {c.name}
                  </Link>
```

par :

```tsx
                  <ButtonLink key={c.slug} href={`/zones/${c.slug}`} variant="tertiary" size="sm">
                    {c.name}
                  </ButtonLink>
```

- [ ] **Étape 7 : article du blog.** Dans `src/app/blog/[slug]/page.tsx`, remplacer `import { PrimaryButton } from "../../_components/buttons";` par `import { ButtonLink, TextLink } from "../../_components/links";`. Remplacer :

```tsx
          <Link
            href="/blog"
            className="inline-block text-sm text-accent hover:opacity-80 mb-6"
          >
            ← Tous les articles
          </Link>
```

par :

```tsx
          <p className="mb-6 text-sm">
            <TextLink href="/blog">← Tous les articles</TextLink>
          </p>
```

et :

```tsx
              <PrimaryButton href="/#contact" content="Demander un devis" />
              <Link
                href="/services"
                className="inline-flex items-center px-5 py-2 text-sm font-medium text-accent border border-accent rounded-sm hover:bg-accent-soft transition-colors"
              >
                Voir nos services
              </Link>
```

par :

```tsx
              <ButtonLink href="/#contact">Demander un devis</ButtonLink>
              <ButtonLink href="/services" variant="tertiary">
                Voir nos services
              </ButtonLink>
```

Les cartes « À lire ensuite », les catégories et les étiquettes du blog ne changent pas (spec 4, « Inchangé »).

- [ ] **Étape 8 : autres liens de texte.**
  - `src/app/not-found.tsx` : remplacer `import Link from "next/link";` par `import { TextLink } from "./_components/links";` et `<Link href="/" className="text-accent underline hover:no-underline">` … `</Link>` (3 lignes) par `<TextLink href="/">Retour à l&apos;accueil</TextLink>`.
  - `src/app/politique-confidentialite/page.tsx` : ajouter `import { TextLink } from "../_components/links";` sous l'import de `../_components/jsonld`, et remplacer l'élément `<a href="/politique-cookies" className="text-accent hover:underline">politique cookies</a>` (6 lignes) par `<TextLink href="/politique-cookies">politique cookies</TextLink>`.
  - `src/app/politique-cookies/page.tsx` : même import, et remplacer `<a href="/politique-confidentialite" className="text-accent hover:underline">politique de confidentialité</a>` (6 lignes) par `<TextLink href="/politique-confidentialite">politique de confidentialité</TextLink>`.
  - `src/components/jobs.tsx` : ajouter `import { TextLink } from "@/app/_components/links"` sous `import Screen from "@/app/_components/screen"` ; remplacer `<a href="tel:+32499523079" className="underline underline-offset-4 text-accent transition-all duration-300">0499.523.079</a>` par `<TextLink href="tel:+32499523079">0499.523.079</TextLink>` et `<a href="mailto:info@macar.be" className="underline underline-offset-4 text-accent transition-all duration-300">info@macar.be</a>` par `<TextLink href="mailto:info@macar.be">info@macar.be</TextLink>`.

Contrôle : `grep -rn "_components/buttons" src` ne renvoie plus que `src/app/_components/navbar.tsx` et `src/app/_components/footer.tsx` (tâche 7).

- [ ] **Étape 9 : contrôles, build, tests.** Procédure C, Procédure A, Procédure B, puis Procédure T avec `layout` :

```bash
cd D:/Repos/macar-migration-tools && npx playwright test -c native/playwright.config.mjs layout --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu : `17 passed` (point d'attention 2 : aucune page ne défile à 320 px). Suite complète : `13 failed`, `30 passed`.

- [ ] **Étape 10 : contrôle visuel.** `node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/zone-3` ; regarder `home__1440__default.png` (boutons pilule bleu et gris, note Google en lien bleu), `home__375__default.png` (« Services » passe sous « Commencez votre projet ! »), `services-renovation__1440__default.png` (bouton de devis, pastilles des communes), `blog-isolation-facade__375__default.png`.

- [ ] **Étape 11 : commit.**

```bash
git add src/app/_components/links.tsx
git add src/app/_components/HomeView.tsx
git add src/app/_components/ServiceDetailBody.tsx
git add src/app/_components/ServiceSection.tsx
git add src/app/services/page.tsx
git add "src/app/zones/[slug]/page.tsx"
git add "src/app/blog/[slug]/page.tsx"
git add src/app/not-found.tsx
git add src/app/politique-confidentialite/page.tsx
git add src/app/politique-cookies/page.tsx
git add src/components/jobs.tsx
git commit -F - <<'EOF'
Style action and text links with the HeroUI v3 Button and Link

TextLink and ButtonLink put the v3 styles on the Next.js link, so the
links keep client-side navigation and prefetch.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 4 : zone 4, cartes de services

**Fichiers :**
- Créer : `src/app/_components/ServiceCard.tsx`.
- Modifier : `src/app/_components/HomeView.tsx`, `src/app/services/page.tsx`, `src/app/zones/[slug]/page.tsx`, `src/app/_components/ServiceDetailBody.tsx`, `src/app/about/page.tsx`.
- Supprimer : `src/app/_components/cards.tsx`.

**Interfaces :**
- Consomme : `Card` de `@heroui/react/card`, `Separator` de `@heroui/react/separator` (composants serveur).
- Produit : `ServiceCard({ href: string; image: string; imageAlt?: string; title: string; description?: string; footer?: string })`, composant serveur : un lien Next.js qui enveloppe une `Card` v3 (image 48 px, `Card.Title` en `h3`, `Card.Description`, pied facultatif).

- [ ] **Étape 1 : relire la doc v3** de `Card` (section « Accessibility », carte interactive) et de `Separator`.

- [ ] **Étape 2 : `ServiceCard.tsx`.** Créer `src/app/_components/ServiceCard.tsx` :

```tsx
import Image from "next/image";
import NextLink from "next/link";
import { Card } from "@heroui/react/card";

// A HeroUI v3 Card, with its own styles, that links to a page as a whole. The <a> only wraps the
// card and stretches it to the height of its grid row. Server-safe (deep import of the Card).
export function ServiceCard({
  href,
  image,
  imageAlt = "",
  title,
  description,
  footer,
}: {
  href: string;
  image: string;
  imageAlt?: string;
  title: string;
  description?: string;
  footer?: string;
}) {
  return (
    <NextLink href={href} className="block h-full">
      <Card className="h-full">
        <Image src={image} alt={imageAlt} width={48} height={48} className="object-contain" />
        <Card.Header>
          <Card.Title>{title}</Card.Title>
          {description && <Card.Description>{description}</Card.Description>}
        </Card.Header>
        {footer && (
          <Card.Footer className="mt-auto">
            <span className="text-sm font-medium text-accent">{footer}</span>
          </Card.Footer>
        )}
      </Card>
    </NextLink>
  );
}
```

- [ ] **Étape 3 : accueil.** Dans `src/app/_components/HomeView.tsx`, remplacer `import { Card } from "./cards";` par `import { ServiceCard } from "./ServiceCard";` et supprimer `import Link from "next/link";`. Dans la grille `grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4`, remplacer les quatre blocs `<Link href="/services/..." className="block group h-full">` … `</Link>` (de la carte « Rénovation intérieure et extérieure » à la carte « Toiture » incluse) par :

```tsx
              <ServiceCard
                href="/services/renovation"
                image="/services/renovation.png"
                imageAlt="Rénovation intérieure et extérieure par Macar"
                title="Rénovation intérieure et extérieure"
                description="Carrelage de salle de bain, isolation intérieure et extérieure, isolation de façade avec crépi, pose de parquet flottant, abattage de murs porteurs."
              />
              <ServiceCard
                href="/services/plomberie"
                image="/services/plomberie.png"
                imageAlt="Plomberie par Macar"
                title="Plomberie"
                description="Installation de robinetterie, remplacement de chauffe-eau et chaudière, installation complète de chauffage central, débouchage de canalisations, réparation de fuites."
              />
              <ServiceCard
                href="/services/electricite"
                image="/services/installation-electrique.png"
                imageAlt="Installation électrique par Macar"
                title="Installation Electrique"
                description="Mise aux normes de tableaux électriques, installation de prises de terre, pose de détecteurs de fumée, installation d'éclairage LED, câblage réseau."
              />
              <ServiceCard
                href="/services/toiture"
                image="/services/toiture.png"
                imageAlt="Toiture par Macar"
                title="Toiture"
                description="Remplacement de tuiles, construction de nouvelle toitures et charpentes, étanchéité de toit-terrasse, isolation, pose de velux, construction/réparation/nettoyage/entretien de corniches et gouttières."
              />
```

- [ ] **Étape 4 : page Services.** Dans `src/app/services/page.tsx`, remplacer les deux premières lignes `import Image from "next/image";` et `import Link from "next/link";` par `import { Separator } from "@heroui/react/separator";`, remplacer `import { MainHeading, P } from "../_components/textStyles";` par `import { MainHeading } from "../_components/textStyles";`, et ajouter `import { ServiceCard } from "../_components/ServiceCard";` sous l'import de `../_components/links`. Remplacer :

```tsx
          <div className="w-full max-w-full border-t border-border pt-8 pb-4">
            <P customClasses="text-sm font-medium text-muted mb-4">
              <p>Nos domaines</p>
            </P>
```

par :

```tsx
          <div className="w-full max-w-full pb-4">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Nos domaines</h2>
```

et la carte faite main de la boucle `services.map` :

```tsx
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  <Image
                    src={s.image}
                    alt=""
                    width={48}
                    height={48}
                    className="shrink-0 object-contain"
                    aria-hidden
                  />
                  <h2 className="text-base font-semibold text-foreground group-hover:text-accent">
                    {s.title}
                  </h2>
                  <p className="text-sm text-muted">{s.summary}</p>
                  <span className="mt-auto text-sm font-medium text-accent">
                    Voir le détail →
                  </span>
                </Link>
```

par :

```tsx
                <ServiceCard
                  key={s.id}
                  href={`/services/${s.id}`}
                  image={s.image}
                  title={s.title}
                  description={s.summary}
                  footer="Voir le détail →"
                />
```

- [ ] **Étape 5 : pages de zones.** Dans `src/app/zones/[slug]/page.tsx`, mêmes changements d'imports qu'à l'étape 4 (chemins `@/app/_components/...` : `import { MainHeading } from "@/app/_components/textStyles";` et `import { ServiceCard } from "@/app/_components/ServiceCard";` sous l'import de `@/app/_components/links`). Remplacer :

```tsx
          <div className="w-full max-w-full border-t border-border pt-8">
            <P customClasses="text-sm font-medium text-muted mb-4">
              <p>Nos services à {commune.name}</p>
            </P>
```

par :

```tsx
          <div className="w-full max-w-full">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Nos services à {commune.name}</h2>
```

la carte faite main (identique à celle de l'étape 4, à `width={40}` et `height={40}` près) par le même bloc `ServiceCard` qu'à l'étape 4, et :

```tsx
          <div className="w-full max-w-full border-t border-border pt-8 pb-8">
            <P customClasses="text-sm font-medium text-muted mb-4">
              <p>Autres zones desservies à Bruxelles</p>
            </P>
```

par :

```tsx
          <div className="w-full max-w-full pb-8">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Autres zones desservies à Bruxelles</h2>
```

- [ ] **Étape 6 : page de service.** Dans `src/app/_components/ServiceDetailBody.tsx`, remplacer `import Image from "next/image";` et `import Link from "next/link";` par `import { Separator } from "@heroui/react/separator";`, `import { MainHeading, P } from "./textStyles";` par `import { MainHeading } from "./textStyles";`, et ajouter `import { ServiceCard } from "./ServiceCard";` sous l'import de `./links`. Remplacer :

```tsx
          <div className="w-full max-w-full border-t border-border pt-8">
            <P customClasses="text-sm font-medium text-muted mb-4">
              <p>Nos autres services</p>
            </P>
```

par :

```tsx
          <div className="w-full max-w-full">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Nos autres services</h2>
```

le lien fait main de `otherServices.map` (de `<Link` avec la classe `inline-flex items-center gap-2 rounded-lg border ...` jusqu'à `</Link>`, image de 24 px comprise) par :

```tsx
                <ServiceCard key={s.id} href={`/services/${s.id}`} image={s.image} title={s.title} />
```

et :

```tsx
          <div className="w-full max-w-full border-t border-border pt-8 pb-8">
            <P customClasses="text-sm font-medium text-muted mb-4">
              <p>Intervention à Bruxelles</p>
            </P>
```

par :

```tsx
          <div className="w-full max-w-full pb-8">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Intervention à Bruxelles</h2>
```

- [ ] **Étape 7 : valeurs de la page À propos.** Dans `src/app/about/page.tsx`, remplacer `import { Card } from '../_components/cards';` par `import { Card } from '@heroui/react/card';`, ajouter juste avant `export default function about() {` :

```tsx
const values = [
    {
        title: 'Confiance',
        description: "Nos engagements sont bien plus qu'un contrat signé. Nous bâtissons des relations durables en tenant nos promesses et en dépassant vos attentes.",
    },
    {
        title: 'Transparence',
        description: "Nous communiquons clairement les coûts, les délais et les méthodologies. Vous serez informés à chaque étape, sans coûts cachés ni surprises.",
    },
    {
        title: 'Professionnalisme',
        description: "Notre équipe fait preuve d'une rigueur et d'une attention au détail, garantissant que chaque projet est réalisé avec une précision exemplaire et dans les temps.",
    },
    {
        title: 'Adaptabilité',
        description: "Nous sommes flexibles et réactifs face aux besoins changeants de nos clients et du marché, garantissant des solutions sur mesure pour chaque projet.",
    },
];

```

et remplacer le bloc `<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">` de la section « valeurs » (ses deux colonnes de deux `Card` faites main, jusqu'à la `</div>` qui précède `</Screen>`) par :

```tsx
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {values.map((value) => (
                        <Card key={value.title}>
                            <Card.Header>
                                <Card.Title>{value.title}</Card.Title>
                                <Card.Description>{value.description}</Card.Description>
                            </Card.Header>
                        </Card>
                    ))}
                </div>
```

L'ordre du tableau garde la disposition sur deux colonnes en bureau (Confiance et Transparence en haut).

- [ ] **Étape 8 : supprimer `cards.tsx`.**

```bash
git rm src/app/_components/cards.tsx
grep -rn "_components/cards\|from \"./cards\"" src
```

Attendu : aucune ligne.

- [ ] **Étape 9 : contrôles, build, tests.** Procédure C, Procédure A, Procédure B, Procédure T : `13 failed`, `30 passed` (la zone 4 n'a pas de test propre ; `layout` garde ses `17 passed`).

- [ ] **Étape 10 : contrôle visuel.** `node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/zone-4` ; regarder `home__1440__default.png` (quatre cartes blanches arrondies, plus de halo), `services__1440__default.png` et `services__375__default.png` (séparateur fin, intitulé « Nos domaines », cartes avec « Voir le détail → »), `zones-uccle__1440__default.png`, `services-renovation__375__default.png` (« Nos autres services » en cartes), `about__1440__default.png` (quatre cartes de valeurs).

- [ ] **Étape 11 : commit.**

```bash
git add src/app/_components/ServiceCard.tsx
git add src/app/_components/HomeView.tsx
git add src/app/services/page.tsx
git add "src/app/zones/[slug]/page.tsx"
git add src/app/_components/ServiceDetailBody.tsx
git add src/app/about/page.tsx
git commit -F - <<'EOF'
Render the service cards with the HeroUI v3 Card

Section borders become a v3 Separator and the section labels become
h2 headings, so the card titles (h3) follow the heading order.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

(La suppression de `cards.tsx` est déjà indexée par `git rm`.)

---

## Tâche 5 : zone 5, formulaire de contact

**Fichiers :**
- Modifier : `src/components/contact_form.tsx` (fichier entier).

**Interfaces :**
- Consomme : `Button`, `Card`, `FieldError`, `Form`, `Input`, `Label`, `TextArea`, `TextField` de `@heroui/react` (composant client) ; `TextLink` (tâche 3) ; `P`, `SecondHeading`.
- Produit : `ContactForm()` (même nom, même usage dans `HomeView`). Champs nommés `name`, `email`, `telephone`, `message`, libellés « Nom et Prénom », « Email », « Téléphone », « Message » ; bouton `type="submit"` « Envoyer » ; schéma zod et envoi à `NEXT_PUBLIC_FORMSPREE_ENDPOINT` inchangés.

- [ ] **Étape 1 : constater l'échec.** Serveur 3100 de la tâche 4 lancé :

```bash
cd D:/Repos/macar-migration-tools && npx playwright test -c native/playwright.config.mjs form --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu : `2 failed` (« envoi vide » et « email invalide »), `2 passed`.

- [ ] **Étape 2 : relire la doc v3** de `Form`, `TextField`, `Input`, `TextArea`, `Label`, `FieldError` et `Button`.

- [ ] **Étape 3 : formulaire.** Remplacer tout `src/components/contact_form.tsx` par :

```tsx
"use client";

import { Button, Card, FieldError, Form, Input, Label, TextArea, TextField } from "@heroui/react";
import { P, SecondHeading } from "@/app/_components/textStyles";
import { TextLink } from "@/app/_components/links";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import axios from "axios";

const contactFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Adresse email doit contenir un @; ").nonempty("Email est requis"),
  telephone: z.string().nonempty("Numéro de téléphone requis"),
  message: z.string().nonempty("Un message expliquant la demande est requis"),
});

type FormValues = { name: string; email: string; telephone: string; message: string };
type ValidationErrors = Partial<Record<keyof FormValues, string[]>>;

const EMPTY_FORM: FormValues = { name: "", email: "", telephone: "", message: "" };

// HeroUI v3 form. zod checks the values on submit; its messages go to Form's validationErrors,
// which shows each one in the FieldError of its field and clears it once the field is edited
// and left. validationBehavior="aria": no browser bubble, only the site's messages.
export function ContactForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [backendError, setBackendError] = useState(false);

  const fieldProps = (name: keyof FormValues) => ({
    name,
    value: values[name],
    onChange: (value: string) => setValues((prev) => ({ ...prev, [name]: value })),
    variant: "secondary" as const,
    fullWidth: true,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBackendError(false);
    const result = contactFormSchema.safeParse(values);
    if (!result.success) {
      setValidationErrors(result.error.flatten().fieldErrors);
      return;
    }
    setValidationErrors({});
    const formEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim();
    if (!formEndpoint) {
      setBackendError(true);
      return;
    }
    axios
      .post(formEndpoint, values, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      })
      .then(() => {
        setValues(EMPTY_FORM);
        setSubmissionSuccess(true);
      })
      .catch(() => setBackendError(true));
  };

  return (
    <Card>
      <Card.Content>
        {submissionSuccess ? (
          <div role="status" aria-live="polite" aria-atomic="true">
            <SecondHeading customClasses="text-xl lg:text-2xl 2xl:text-[30px] mt-2 mb-4">Merci pour votre confiance !</SecondHeading>
            <P content="Merci pour votre demande! Nous allons la traiter dans les plus brefs délais." />
          </div>
        ) : (
          <Form
            onSubmit={handleSubmit}
            validationBehavior="aria"
            validationErrors={validationErrors}
            className="flex flex-col gap-6"
          >
            <div>
              <SecondHeading customClasses="text-xl lg:text-2xl 2xl:text-[30px] mt-2 mb-4">Contactez-nous</SecondHeading>
              <p className="text-muted">Nous sommes à l&apos;écoute de vos besoins pour toute rénovation, plomberie, électricité ou toiture.</p>
            </div>
            {Object.keys(validationErrors).length > 0 && (
              <p className="text-sm text-danger" role="alert" aria-live="polite" aria-atomic="true">
                Le formulaire contient des erreurs. Veuillez corriger les champs indiqués.
              </p>
            )}
            <div className="flex flex-col gap-4">
              <TextField {...fieldProps("name")}>
                <Label>Nom et Prénom</Label>
                <Input placeholder="Entrez votre nom et prénom" />
                <FieldError />
              </TextField>
              <TextField {...fieldProps("email")}>
                <Label>Email</Label>
                <Input placeholder="Entrez votre email" />
                <FieldError />
              </TextField>
              <TextField {...fieldProps("telephone")}>
                <Label>Téléphone</Label>
                <Input placeholder="04XXXXXXXX" />
                <FieldError />
              </TextField>
              <TextField {...fieldProps("message")}>
                <Label>Message</Label>
                <TextArea rows={4} placeholder="Bonjour, je serais intéressé par des services de ..." />
                <FieldError />
              </TextField>
            </div>
            <Button type="submit" fullWidth>
              Envoyer
            </Button>
            <p className="text-sm text-muted italic">
              Nous ne partageons vos informations à <span className="underline underline-offset-4">aucun</span> tiers.
            </p>
            {backendError && (
              <p className="text-sm text-danger" role="alert" aria-live="assertive" aria-atomic="true">
                Oups quelque chose s&apos;est mal passé, contactez-nous par email à{" "}
                <TextLink href="mailto:info@macar.be">info@macar.be</TextLink>
              </p>
            )}
          </Form>
        )}
      </Card.Content>
    </Card>
  );
}
```

Points à ne pas changer : pas de `type="email"` sur le champ email (avec `validationBehavior="aria"`, React Aria afficherait en direct le message natif du navigateur, contraire au point d'attention 3), pas de `isRequired` (la validation reste celle de zod). `variant="secondary"` est la variante que la doc v3 prescrit pour un champ posé sur une `Card` ou une `Surface`.

- [ ] **Étape 4 : contrôles, build, tests.** Procédure C, Procédure A, Procédure B, puis :

```bash
cd D:/Repos/macar-migration-tools && npx playwright test -c native/playwright.config.mjs form --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu : `4 passed` (dont les points d'attention 3 et 4 ; `afterEach` confirme qu'aucune requête Formspree n'a abouti). Suite complète : `11 failed`, `32 passed`.

- [ ] **Étape 5 : contrôle visuel.** `node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/zone-5` ; regarder `home__375__form-errors.png` et `home__1440__form-errors.png` : champs gris arrondis, libellés et bordures en rouge pour les champs en erreur, messages rouges sous les champs, sans troncature, bouton « Envoyer » plein bleu.

- [ ] **Étape 6 : commit.**

```bash
git add src/components/contact_form.tsx
git commit -F - <<'EOF'
Build the contact form with the HeroUI v3 form components

zod still validates on submit and its messages now go through the v3
Form validationErrors. The Formspree submission is unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 6 : zone 6, bandeau cookies

**Fichiers :**
- Modifier : `src/app/_components/CookieConsent.tsx` (fichier entier).

**Interfaces :**
- Consomme : `Button`, `Description`, `Label`, `Separator`, `Surface`, `Switch` de `@heroui/react` ; `js-cookie` ; `framer-motion` (apparition en fondu inchangée).
- Produit : `CookieConsent` (export par défaut, même usage dans `layout.tsx`). Cookie `macar_cookie_consent_is_true` = `"true"` pour 365 jours après « Refuser Tout », « Accepter Tout » ou « Accepter la Sélection » (comportement actuel, RGPD hors périmètre). Interrupteurs nommés « Essentiels » (coché, verrouillé), « Analytique », « Les fonctionnalités ».

- [ ] **Étape 1 : constater l'échec.** Serveur 3100 de la tâche 5 lancé :

```bash
cd D:/Repos/macar-migration-tools && npx playwright test -c native/playwright.config.mjs cookies --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu : `3 failed`, `1 passed`.

- [ ] **Étape 2 : relire la doc v3** de `Surface`, `Switch` (anatomie avec `Label` et `Description`), `Separator`, `Button`.

- [ ] **Étape 3 : bandeau.** Remplacer tout `src/app/_components/CookieConsent.tsx` par :

```tsx
"use client";

import Cookies from "js-cookie";
import { Button, Description, Label, Separator, Surface, Switch } from "@heroui/react";
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";

const USER_CONSENT_COOKIE_KEY = "macar_cookie_consent_is_true";
const USER_CONSENT_COOKIE_EXPIRE_DATE = 365;

const CATEGORIES = [
  {
    label: "Essentiels",
    description: "Éléments essentiels pour le bon fonctionnement des fonctionnalités du site.",
    isLocked: true,
  },
  {
    label: "Analytique",
    description:
      "Permettre d'obtenir des statistiques anonymes afin d'optimiser notre site et, par conséquent, votre expérience.",
    isLocked: false,
  },
  {
    label: "Les fonctionnalités",
    description: "Nécessaires pour le bon fonctionnement de certaines fonctionnalités.",
    isLocked: false,
  },
];

// Cookie banner: HeroUI v3 Surface, Switch and Button with their own styles. Behaviour unchanged:
// any choice records the consent cookie and closes the banner (GDPR handling is out of scope).
const CookieConsent = () => {
  const [cookieConsentIsTrue, setCookieConsentIsTrue] = useState(true);
  const [prefIsTrue, setPrefIsTrue] = useState(false);

  useEffect(() => {
    setCookieConsentIsTrue(Cookies.get(USER_CONSENT_COOKIE_KEY) === "true");
  }, []);

  const recordConsent = () => {
    Cookies.set(USER_CONSENT_COOKIE_KEY, "true", { expires: USER_CONSENT_COOKIE_EXPIRE_DATE });
    setCookieConsentIsTrue(true);
  };

  if (cookieConsentIsTrue) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-4 left-4 right-4 sm:left-auto z-50 max-w-lg"
    >
      <Surface className="flex flex-col gap-4 max-h-[calc(100dvh-2rem)] overflow-auto p-6 rounded-3xl shadow-overlay">
        {prefIsTrue ? (
          <>
            <p className="text-xl font-medium text-foreground">Préférences</p>
            <p className="text-sm text-muted leading-loose max-w-prose">
              Grâce à cette interface, vous avez la possibilité d&apos;autoriser ou de refuser certains cookies.
              Notez que les cookies essentiels ne peuvent pas être refusés.
              Ils sont nécessaires au bon fonctionnement du site.
            </p>
            <p className="text-sm text-muted leading-loose max-w-prose">
              Cliquez sur le nom de la catégorie pour en savoir plus sur les différents cookies utilisés sur notre site.
            </p>
            {CATEGORIES.map((category) => (
              <Fragment key={category.label}>
                <Separator />
                <Switch
                  size="sm"
                  defaultSelected
                  isDisabled={category.isLocked}
                  className="w-full"
                >
                  <Switch.Content className="w-full justify-between">
                    <Label>{category.label}</Label>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                  <Description>{category.description}</Description>
                </Switch>
              </Fragment>
            ))}
          </>
        ) : (
          <>
            <p className="text-xl font-medium text-foreground">Cookies</p>
            <p className="text-sm text-muted leading-loose max-w-prose">
              Macar utilise des cookies pour améliorer votre expérience de navigation.
              Pour certains d&apos;entre eux, votre consentement est nécessaire. Vous pouvez définir vos préférences via le bouton ci-dessous.
            </p>
          </>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="tertiary" onPress={recordConsent}>
            Refuser Tout
          </Button>
          <Button variant="secondary" onPress={() => setPrefIsTrue(!prefIsTrue)}>
            Préférences
          </Button>
          <Button onPress={recordConsent}>
            {prefIsTrue ? "Accepter la Sélection" : "Accepter Tout"}
          </Button>
        </div>
      </Surface>
    </motion.div>
  );
};

export default CookieConsent;
```

`Surface` n'a ni rayon ni marge intérieure : `p-6 rounded-3xl` suit les exemples de la doc v3 de `Surface`, et `shadow-overlay` est le jeton d'ombre v3 des éléments flottants. Les textes du bandeau sont repris tels quels.

- [ ] **Étape 4 : contrôles, build, tests.** Procédure C, Procédure A, Procédure B, puis `npx playwright test -c native/playwright.config.mjs cookies` : `4 passed`. Suite complète : `8 failed` (les 8 de `menu.spec.mjs`), `35 passed`.

- [ ] **Étape 5 : contrôle visuel.** `node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/zone-6` ; regarder `home__375__cookie-banner.png`, `home__375__cookie-preferences.png` (tout tient dans l'écran, boutons qui passent à la ligne, « Essentiels » grisé), `home__1440__cookie-banner.png` (carte flottante en bas à droite).

- [ ] **Étape 6 : commit.**

```bash
git add src/app/_components/CookieConsent.tsx
git commit -F - <<'EOF'
Rebuild the cookie banner with HeroUI v3 Surface, Switch and Button

The switches are now named by their visible label. The consent
behaviour is unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 7 : zone 7, navigation et pied de page

**Fichiers :**
- Modifier : `src/app/_components/navbar.tsx` (fichier entier), `src/app/_components/footer.tsx` (fichier entier).
- Supprimer : `src/app/_components/buttons.tsx`.

**Interfaces :**
- Consomme : `Button`, `Drawer`, `Separator` de `@heroui/react` (navbar, client) ; `Separator` de `@heroui/react/separator` (footer, serveur) ; `TextLink`, `ButtonLink` (tâche 3) ; `Logo`, `Logo_specific` ; icône lucide `Menu`.
- Produit : `NavBar` (client) et `Footer` (devient un composant serveur), mêmes exports. Bouton « Ouvrir le menu », dialogue nommé « Menu » placé à gauche, bouton de fermeture « Fermer le menu ».

- [ ] **Étape 1 : constater l'échec.** Serveur 3100 de la tâche 6 lancé : `npx playwright test -c native/playwright.config.mjs menu --reporter=line` dans le dépôt d'outils. Attendu : `8 failed`.

- [ ] **Étape 2 : relire la doc v3** de `Drawer` (exemples « Controlled State » et « Navigation Drawer », API de `Drawer.Backdrop`, `Drawer.Content`, `Drawer.CloseTrigger`), `Button` (« Icon Only ») et `Separator`.

- [ ] **Étape 3 : navbar.** Remplacer tout `src/app/_components/navbar.tsx` par :

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Drawer, Separator } from "@heroui/react";
import { Menu } from "lucide-react";
import { ButtonLink, TextLink } from "./links";
import { Logo } from "./icons/logo";

const menuItems = [
    { name: "Accueil", href: "/" },
    { name: "Découvrez Macar", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/#faq" },
    { name: "Nous recrutons", href: "/job" },
];

// HeroUI v3 has no Navbar: the bar stays plain HTML, its content is v3. On mobile, an icon-only
// Button opens a Drawer from the left (Escape, the close button and the backdrop close it, focus
// stays inside, the page is locked behind); choosing a link closes it.
export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="sticky top-0 z-100 flex w-full items-center justify-center bg-background border-b border-separator">
            <header className="flex items-center justify-between gap-4 w-full max-w-full md:max-w-[1600px] px-4 md:px-16 2xl:px-4 h-16">
                <Button
                    isIconOnly
                    variant="ghost"
                    aria-label="Ouvrir le menu"
                    className="md:hidden"
                    onPress={() => setIsMenuOpen(true)}
                >
                    <Menu />
                </Button>
                <Link href="/" className="md:hidden">
                    <Logo width={120} />
                </Link>

                <ul className="hidden md:flex items-center gap-6 text-sm">
                    <li>
                        <Link href="/">
                            <Logo customClasses="hidden lg:inline" />
                            <Logo width={120} customClasses="inline lg:hidden" />
                        </Link>
                    </li>
                    {menuItems.map((item) => (
                        <li key={item.href} className="whitespace-nowrap">
                            <TextLink href={item.href}>{item.name}</TextLink>
                        </li>
                    ))}
                </ul>
                <ButtonLink href="/#contact" className="hidden md:inline-flex">
                    Demander un devis
                </ButtonLink>
            </header>

            <Drawer.Backdrop isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <Drawer.Content placement="left">
                    <Drawer.Dialog>
                        <Drawer.CloseTrigger aria-label="Fermer le menu" />
                        <Drawer.Header>
                            <Drawer.Heading>Menu</Drawer.Heading>
                        </Drawer.Header>
                        <Drawer.Body>
                            <ul className="flex flex-col gap-4">
                                {menuItems.map((item) => (
                                    <li key={item.href}>
                                        <TextLink href={item.href} onClick={closeMenu}>
                                            {item.name}
                                        </TextLink>
                                    </li>
                                ))}
                            </ul>
                            <Separator className="my-6" />
                            <ButtonLink href="/#contact" fullWidth onClick={closeMenu}>
                                Demander un devis
                            </ButtonLink>
                        </Drawer.Body>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </nav>
    );
};
```

`Drawer.CloseTrigger` porte par défaut `aria-label="Close"` (anglais) : le libellé français est obligatoire. `Drawer.Heading` nomme le dialogue « Menu ».

- [ ] **Étape 4 : pied de page.** Remplacer tout `src/app/_components/footer.tsx` par :

```tsx
import { Separator } from "@heroui/react/separator";
import { ButtonLink, TextLink } from "./links";
import { Logo_specific } from "./icons/logo_specific";

const menuItems = [
    { name: "Accueil", href: "/" },
    { name: "Découvrez Macar", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/#faq" },
    { name: "Nous recrutons", href: "/job" },
];

const legalLinks = [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Politique de confidentialité", href: "/politique-confidentialite" },
    { name: "Politique cookies", href: "/politique-cookies" },
];

// Footer: HeroUI v3 links (TextLink, ButtonLink) and Separator, same layout as before.
export const Footer = () => {
    return (
        <div className="pt-28 pb-14">
            <div className="mx-auto max-w-[1600px] px-4 md:px-16 2xl:px-4">
                <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:items-center md:justify-between">
                    <Logo_specific logoType="Logo_border_blue"
                        complexity="svg_simple"
                        width='100'
                        customClasses="hidden lg:inline">
                    </Logo_specific>
                    <div className="flex flex-row flex-wrap items-center gap-4">
                        <p className="mr-6 text-sm md:text-base">
                            Pour des informations supplémentaires
                        </p>
                        <ButtonLink href="mailto:info@macar.be">info@macar.be</ButtonLink>
                    </div>
                </div>
                <Separator className="mt-14" />
                <div className="mt-14 flex flex-row items-start justify-between">
                    <div className="flex flex-col items-start">
                        <p className="font-medium text-sm md:text-base">Entreprise</p>
                        <ul className="flex flex-col md:flex-row justify-start gap-8 mt-4 text-sm md:text-base">
                            {menuItems.map((item) => (
                                <li key={item.href}>
                                    <TextLink href={item.href}>{item.name}</TextLink>
                                </li>
                            ))}
                        </ul>
                        <p className="font-medium text-sm md:text-base mt-12">Contact</p>
                        <ul className="flex flex-col justify-start gap-2 mt-4 text-sm">
                            <li>
                                tel: <TextLink href="tel:+32478235008">+32 478 23 50 08</TextLink>
                            </li>
                            <li>
                                email: <TextLink href="mailto:info@macar.be">info@macar.be</TextLink>
                            </li>
                            <li>
                                fixe: <TextLink href="tel:+3224665304">+32 246 653 04</TextLink>
                            </li>
                            <li>
                                Avenue Prudent Bols, 43<br />
                                B-1020 Bruxelles/Brussel
                            </li>
                            <li>TVA: BE0477.45.10.24</li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="font-medium text-sm md:text-base">Rejoignez nos réseaux sociaux</p>
                        <TextLink
                            href="https://www.facebook.com/profile.php?id=61552507283765"
                            aria-label="Macar sur Facebook"
                            className="mt-6"
                        >
                            <Facebook />
                        </TextLink>
                    </div>
                </div>
                <Separator className="mt-14" />
                <div className="mt-14 flex flex-col md:flex-row items-start gap-8 justify-between text-sm md:text-base">
                    <p>Copyright © {new Date().getFullYear()} Macar</p>
                    <ul className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                        {legalLinks.map((item) => (
                            <li key={item.href}>
                                <TextLink href={item.href}>{item.name}</TextLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export const Facebook = () => {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_24)">
                <path d="M48 24C48 10.7453 37.2547 0 24 0C10.7453 0 0 10.7453 0 24C0 35.255 7.74912 44.6995 18.2026 47.2934V31.3344H13.2538V24H18.2026V20.8397C18.2026 12.671 21.8995 8.8848 29.9194 8.8848C31.44 8.8848 34.0637 9.18336 35.137 9.48096V16.129C34.5706 16.0694 33.5866 16.0397 32.3645 16.0397C28.4294 16.0397 26.9088 17.5306 26.9088 21.4061V24H34.7482L33.4013 31.3344H26.9088V47.8243C38.7926 46.3891 48.001 36.2707 48.001 24H48Z" fill="#0866FF" />
                <path d="M33.4003 31.3344L34.7472 24H26.9078V21.4061C26.9078 17.5306 28.4285 16.0397 32.3635 16.0397C33.5856 16.0397 34.5696 16.0694 35.136 16.129V9.48096C34.0627 9.1824 31.439 8.8848 29.9184 8.8848C21.8986 8.8848 18.2016 12.671 18.2016 20.8397V24H13.2528V31.3344H18.2016V47.2934C20.0582 47.7542 22.0003 48 23.999 48C24.983 48 25.9536 47.9395 26.9069 47.8243V31.3344H33.3994H33.4003Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_17_24">
                    <rect width="48" height="48" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};
```

Le lien Facebook gagne `aria-label="Macar sur Facebook"` (il n'avait pas de nom accessible).

- [ ] **Étape 5 : supprimer `buttons.tsx`.**

```bash
git rm src/app/_components/buttons.tsx
grep -rn "_components/buttons\|from \"./buttons\"" src
```

Attendu : aucune ligne.

- [ ] **Étape 6 : contrôles, build, tests.** Procédure C, Procédure A, Procédure B, puis :

```bash
cd D:/Repos/macar-migration-tools && npx playwright test -c native/playwright.config.mjs menu layout --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Attendu : `25 passed` (dont les points d'attention 1 et 5). Suite complète (Procédure T) : `43 passed`.

- [ ] **Étape 7 : contrôle visuel et fonctionnel.** `node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/zone-7` ; regarder `home__375__menu-open.png` (panneau blanc à gauche, titre « Menu », croix, 6 liens bleus, séparateur, bouton plein), `home__1440__default.png` (liens bleus de la barre, bouton « Demander un devis » en pilule), `about__375__default.png` et `about__1440__default.png` (pied de page : liens bleus, séparateurs fins). Avec le serveur Playwright MCP, ouvrir `http://localhost:3100` en 375 px, ouvrir le menu, parcourir les liens au clavier (Tab), fermer par Échap, et vérifier que la console ne montre aucune erreur autre que le 404 local de `/_vercel/insights/script.js` (présent aussi sur `dev`).

- [ ] **Étape 8 : commit.**

```bash
git add src/app/_components/navbar.tsx
git add src/app/_components/footer.tsx
git commit -F - <<'EOF'
Rebuild the navigation with a HeroUI v3 Drawer and v3 links

On mobile an icon-only Button opens a Drawer from the left. The footer
uses the v3 links and Separator and becomes a server component.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 8 : zone 8, ménage

**Fichiers :**
- Supprimer : `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `src/lib/utils.ts`, `components.json`, `src/components/trusted.tsx`.
- Modifier : `package.json`, `package-lock.json`, `CLAUDE.md`.

**Interfaces :**
- Consomme : l'état des tâches 1 à 7 (plus aucun import de `@/components/ui/*` ni de `@/lib/utils`).
- Produit : un dépôt sans shadcn ; documentation à jour pour les prochains changements.

- [ ] **Étape 1 : vérifier que rien n'importe les fichiers à supprimer.**

```bash
grep -rn "components/ui\|lib/utils\|components/trusted\|class-variance-authority\|@radix-ui/react-label\|@radix-ui/react-slot\|from \"clsx\"" src --include=*.ts --include=*.tsx | grep -v "^src/components/ui/\|^src/lib/utils.ts"
```

Attendu : aucune ligne.

- [ ] **Étape 2 : supprimer les fichiers.**

```bash
git rm -r src/components/ui
git rm src/lib/utils.ts
git rm components.json
git rm src/components/trusted.tsx
```

- [ ] **Étape 3 : retirer les dépendances.**

```bash
npm uninstall class-variance-authority @radix-ui/react-label @radix-ui/react-slot clsx
git diff --stat package.json package-lock.json
```

Attendu : `package.json | 4 ----` et `package-lock.json | 38 ----...` (mesuré). `react-aria` (dépendance pair de `@heroui/react`) et `tailwind-merge` (utilisé par `tailwind-variants`) restent.

- [ ] **Étape 4 : `CLAUDE.md`, composants.** Dans la section « Architecture », remplacer la ligne qui commence par `- **Composants** :` par :

```markdown
- **Composants** : `src/app/_components/` contient la mise en page et les briques propres au site (`Screen`, `textStyles`, `links` pour les liens au style HeroUI, `ServiceCard`, navbar, footer). `src/components/` contient les blocs réutilisés (formulaire de contact, avis Google, stats).
```

- [ ] **Étape 5 : `CLAUDE.md`, styles.** Remplacer toute la section `## Styles : HeroUI v3 et Tailwind 4` (du titre jusqu'à la fin du fichier) par :

```markdown
## Styles : HeroUI v3 natif et Tailwind 4

Le site utilise les composants HeroUI v3 tels qu'ils sont conçus, aux couleurs Macar (voir `superpowers/specs/2026-10-04-heroui-v3-native-design.md`). Il n'y a pas de `tailwind.config` : `src/app/globals.css` ne contient que les imports, les sources, les polices et les variables du thème.

- Les sources Tailwind sont déclarées explicitement (`@source` sur `src/app` et `src/components`) ; `content/` n'est pas scanné, donc une classe utilisée seulement dans un article MDX ne sera pas générée.
- Couleurs : les noms v3 (`background`, `foreground`, `muted`, `accent`, `surface`, `border`, `separator`, `default`, `danger`, variantes `-soft` et `-hover`), réglés par les variables `:root` de `globals.css`. Pas de couleur maison ni d'opacité arbitraire.
- Polices : `font-sans` (Open Sans) pour le texte, `font-heading` (Raptor) pour les titres.
- Aucune classe ne modifie le style d'un composant HeroUI : les classes servent seulement à la mise en page autour (grille, espacement, largeur, affichage). Pour changer l'apparence, passer par les props de variante ou par les variables du thème.
- Liens : `TextLink` (style Link v3) et `ButtonLink` (style Button v3, `primary` ou `tertiary`) de `_components/links.tsx` gardent le lien Next.js (navigation côté client, préchargement).
- Composants serveur : importer HeroUI par son sous-chemin (`@heroui/react/card`, `@heroui/react/separator`…) ; l'import `@heroui/react` complet ne compile que dans un composant client. Les fonctions de style (`buttonVariants`, `linkVariants`) viennent de `@heroui/styles`.
- HeroUI v3 s'utilise en composants composés (ex. `Accordion`, `Drawer`). La locale React Aria est fixée à `fr-BE` dans `providers.tsx` ; ne pas la lire depuis les en-têtes, cela rendrait toutes les routes dynamiques. Le serveur MCP `heroui-react` (`.mcp.json`) donne la doc v3.
- L'accordéon v3 n'a pas la navigation clavier de la v2 (flèches, Home, End) : `faqKeyboard.ts` la recrée à partir des marqueurs `data-faq-column` et `data-faq-trigger`, à poser sur toute nouvelle FAQ.
```

- [ ] **Étape 6 : contrôles, build, tests.** Procédure C, Procédure A (attendu en plus : la ligne `○ /` du build indique une « First Load JS » d'environ 239 kB, contre 243 kB avant), Procédure B, Procédure T : `43 passed`.

- [ ] **Étape 7 : commit.**

```bash
git add package.json
git add package-lock.json
git add CLAUDE.md
git commit -F - <<'EOF'
Remove shadcn, its dependencies and the files left unused

CLAUDE.md now describes the native HeroUI v3 styling rules.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

(Les suppressions de l'étape 2 sont déjà indexées par `git rm`.)

---

## Tâche 9 : vérification complète

**Fichiers :** aucun dans le dépôt du site. Sorties dans `D:\macar-migration\native-out` et `D:\macar-migration\native-shots`.

**Interfaces :**
- Consomme : la branche à la tâche 8 (servie sur 3100), le clone `dev` de la tâche 0 (servi sur 3101), tous les outils `native/`, `lighthouse.mjs` et `html-diff.mjs` du dépôt d'outils.
- Produit : rapport chiffré pour la PR et page de comparaison `D:\macar-migration\native-shots\index.html` pour le propriétaire.

- [ ] **Étape 1 : contrôles statiques.** Dans le dépôt du site : Procédure C, Procédure A. Attendu : celui de la Procédure A. Puis :

```bash
git status --short
node -e "const fs=require('fs');const {execSync}=require('child_process');const files=execSync('git ls-files src CLAUDE.md superpowers package.json').toString().trim().split('\n');let n=0;for(const f of files){fs.readFileSync(f,'utf8').split('\n').forEach((l,i)=>{if(/[\u2013\u2014]/.test(l)&&!(f==='CLAUDE.md'&&/Pas de tiret long/.test(l))){console.log(f+':'+(i+1));n++;}});}console.log(n+' dash lines');"
```

Attendu : `git status` vide ; `0 dash lines` (la règle « Pas de tiret long » de `CLAUDE.md` cite les deux caractères et est exclue).

- [ ] **Étape 2 : serveurs.** Procédure B (3100) ; relancer le serveur `dev` sur 3101 s'il a été arrêté (commande de la tâche 0, étape 12). Les deux répondent `200`.

- [ ] **Étape 3 : suite native.** Procédure T. Attendu : `43 passed`.

- [ ] **Étape 4 : console.**

```bash
cd D:/Repos/macar-migration-tools && node native/console.mjs --base http://localhost:3100 --ref http://localhost:3101; echo "exit $?"
```

Attendu (mesuré) : `ref: 36 error(s), base: 36 error(s), added by base: 0` et `exit 0`. Les erreurs communes sont le 404 local de `/_vercel/insights/script.js` et le 404 voulu de la page introuvable.

- [ ] **Étape 5 : HTML prérendu.**

```bash
node html-diff.mjs --ref-site D:/macar-migration/native-ref --cur-site D:/Repos/macar-next-site-prod --out D:/macar-migration/native-out; echo "exit $?"
```

Attendu (mesuré) : `new HTML errors: 0`, `fixed HTML errors: 7` (les `<div>` dans `<button>` de l'ancienne FAQ), `exit 0`.

- [ ] **Étape 6 : Lighthouse, médiane de 5, référence `dev` puis branche.** Rien d'autre ne doit tourner sur la machine pendant les mesures (environ 20 minutes au total) :

```bash
node lighthouse.mjs --base http://localhost:3101 --out D:/macar-migration/native-out/lh-ref
node lighthouse.mjs --base http://localhost:3100 --out D:/macar-migration/native-out/lh-native --ref D:/macar-migration/native-out/lh-ref/lighthouse.json; echo "exit $?"
```

Attendu : 4 lignes (`/` et `/services/renovation`, mobile et desktop) terminées par `OK vs ref (...)` et `exit 0`, c'est-à-dire accessibilité au moins égale, performance à 3 points près au plus, CLS au plus égal (seuils de la spec, section 7). Mesuré sur le prototype (branche contre `dev`) : `/` mobile perf 74 contre 75, a11y 95 contre 95 ; `/` desktop perf 98 contre 98, a11y 95 contre 95 ; `/services/renovation` mobile perf 79 contre 79, a11y 96 contre 92, CLS 0,023 des deux côtés ; desktop perf 99 contre 99, a11y 96 contre 91. Les lignes `LanternError: NO_LCP` du journal sont des avertissements de Lighthouse sur certaines passes et n'arrêtent pas la mesure. Si une ligne est `FAIL`, ne pas continuer : relancer une fois la paire de mesures (bruit de la machine), puis, si l'écart persiste, chercher la cause (superpowers:systematic-debugging) et la corriger dans un commit séparé avant d'aller plus loin.

- [ ] **Étape 7 : captures « après » et page de comparaison.**

```bash
node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/native-shots/after
node native/compare-page.mjs --dir D:/macar-migration/native-shots
```

Attendu : 39 captures, puis `20 sections, 39 screenshots: D:\macar-migration\native-shots\index.html`. Ouvrir la page dans le navigateur et la parcourir entièrement : aucun débordement, chevauchement ni élément coupé en 375 et 1440 px.

- [ ] **Étape 8 : arrêter les serveurs.** Procédure C sur 3100 et sur 3101. Donner au propriétaire le chemin de la page de comparaison et les chiffres des étapes 3 à 6.

---

## Tâche 10 : push, preview Vercel et PR

**Fichiers :** `D:\macar-migration\native-out\pr-body.md` (hors dépôt).

**Interfaces :**
- Consomme : les 8 commits de zone et les chiffres de la tâche 9.
- Produit : la branche poussée, sa preview Vercel, le texte de la PR ; le propriétaire ouvre et fusionne la PR (pas de `gh` sur la machine).

- [ ] **Étape 1 : demander l'accord du propriétaire pour pousser.** Lui montrer `git log --oneline dev..heroui-v3-native` (10 commits : la spec, ce plan, puis les 8 zones) et attendre son « oui ». Sans accord explicite, s'arrêter là.

- [ ] **Étape 2 : pousser.**

```bash
git push -u origin heroui-v3-native
```

- [ ] **Étape 3 : texte de la PR.** Écrire `D:\macar-migration\native-out\pr-body.md`, avec les chiffres Lighthouse mesurés à la tâche 9, étape 6 (ceux ci-dessous sont ceux du prototype ; les corriger s'ils diffèrent) :

```markdown
## HeroUI v3 natif

Le site utilise désormais les composants HeroUI v3 tels qu'ils sont conçus, aux couleurs Macar, au lieu de composants v3 déguisés en v2. Spec : `superpowers/specs/2026-10-04-heroui-v3-native-design.md`. Plan : `superpowers/plans/2026-10-04-heroui-v3-native.md`.

### Ce qui change (un commit par zone)

1. Thème : `globals.css` ne garde que les imports, les sources, les polices et les variables v3 (accent `#124FAA`, fond `#F6F8FF`, texte `#0E1435` et `#474B64`, surface blanche, bordure `#D8DBE9`). Les noms de couleurs maison et v2 sont remplacés par les noms v3.
2. FAQ, interrupteurs, chips, cartes d'avis et avatars : composants v3 sans surcharge.
3. Boutons et liens : style Button et Link v3 sur le lien Next.js (`TextLink`, `ButtonLink`).
4. Cartes de services et valeurs : `Card` v3, séparateurs `Separator` v3.
5. Formulaire de contact : `Form`, `TextField`, `Input`, `TextArea`, `FieldError`, `Button` v3 ; validation zod et envoi Formspree inchangés.
6. Bandeau cookies : `Surface`, `Switch` et `Button` v3 ; comportement inchangé.
7. Navigation : sur mobile, bouton icône qui ouvre un `Drawer` v3 depuis la gauche ; pied de page en liens et séparateurs v3.
8. Ménage : shadcn, `components.json` et 4 dépendances retirés ; `CLAUDE.md` à jour.

### Vérifications

- `npm run lint`, `npx tsc --noEmit`, `npm run build` : OK à chaque commit.
- Tests de comportement (Playwright, 43 tests) : tous verts (FAQ, menu mobile, cookies, avis, formulaire sans aucun envoi réel, 320 px, clavier).
- Lighthouse, médiane de 5, comparé à `dev` (performance et accessibilité, branche contre dev) : `/` mobile 74 contre 75 et 95 contre 95 ; `/` desktop 98 contre 98 et 95 contre 95 ; `/services/renovation` mobile 79 contre 79 et 96 contre 92 ; desktop 99 contre 99 et 96 contre 91. CLS identique partout.
- Console : aucune erreur ajoutée. HTML prérendu : aucune nouvelle erreur de validité, 7 corrigées.
- Captures avant et après de chaque page en 375 et 1440 px, validées page par page.

### À valider sur la preview

Le rendu change volontairement : boutons en pilule, cartes arrondies avec ombre légère, liens bleus, menu mobile en panneau latéral, titres du blog en Raptor.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

- [ ] **Étape 4 : ouverture de la PR par le propriétaire.** Lui donner le lien https://github.com/macar-sa/macar-next-site-prod/compare/dev...heroui-v3-native?expand=1 et le contenu de `pr-body.md` à coller ; base `dev`, titre `Use HeroUI v3 components as designed`.

- [ ] **Étape 5 : preview Vercel.** Le déploiement de preview de la branche apparaît dans les vérifications de la PR (bot Vercel). Le propriétaire valide le rendu page par page sur la preview, avec la page de comparaison locale `D:\macar-migration\native-shots\index.html` en appui. Toute retouche demandée se fait dans un nouveau commit sur la branche (Procédures A, B, T), poussé après un nouvel accord.

- [ ] **Étape 6 : fusion.** Le propriétaire fusionne avec « Create a merge commit » (jamais « Squash » ni « Rebase »). Ensuite, supprimer les dossiers temporaires `D:\macar-migration\native-ref`, `native-shots` et `native-out` (robocopy `/MIR` depuis un dossier vide, puis `Remove-Item`), après avoir vérifié qu'aucun serveur ne tourne sur 3100 ni 3101.
