# Bandeau cookies conforme et mode consentement v2 (M.1) : plan de mise en œuvre

> **Pour les agents :** sous-compétence requise : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans, tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**Objectif :** remplacer le bandeau décoratif par un bandeau qui applique vraiment le choix du visiteur, et brancher Google Analytics 4 en mode consentement v2 basique, avec l'interface que M.2 réutilisera.

**Architecture :** un module sans interface, `src/lib/consent.ts`, lit et écrit le cookie de choix et diffuse les changements par événements DOM. Deux composants clients s'y abonnent sans se connaître : le bandeau (`CookieConsent.tsx`) et le chargeur de Google (`GoogleTag.tsx`). Le pied de page et la politique cookies rouvrent le bandeau par un troisième petit composant client.

**Pile :** Next.js 15 App Router, React 19, TypeScript, HeroUI v3 (3.2.6), `js-cookie` (déjà installé), Playwright (`e2e/`).

**Spec :** `superpowers/specs/2026-10-17-cookie-consent-design.md`, avec le contexte imposé par M.2 : `superpowers/specs/2026-10-17-cookies-m1-contexte-pour-m2.md`. Lire les deux avant de commencer.

## Contraintes globales

- Branche `Cookie-consent`, partie de `dev` ; PR vers `dev`.
- Mode consentement **basique** : aucune requête vers `googletagmanager.com` ou `google-analytics.com` tant qu'Analytique n'est pas accordé.
- Cookie de choix : nom `macar_consent`, valeur JSON `{ analytics, marketing, at, version }`, durée 182 jours, `SameSite=Lax`, `path=/`, `Secure` si la page est en HTTPS. `CONSENT_VERSION = 1`.
- Ancien cookie `macar_cookie_consent_is_true` : supprimé au chargement, jamais repris.
- Catégories : `analytics` (libellé « Analytique », signal `analytics_storage`) et `marketing` (libellé « Publicité », signaux `ad_storage`, `ad_user_data`, `ad_personalization`).
- Cookies Analytics : `cookie_expires: 33696000` (13 mois de 30 jours) dans `gtag('config', …)`.
- HeroUI v3 natif : consulter le serveur MCP `heroui-react` (`Card`, `Switch`, `Button`) avant d'écrire le bandeau ; aucune classe ne modifie le style d'un composant HeroUI.
- Textes visibles en français, sans tiret long (ni — ni –).
- Ne pas toucher à `contact_form.tsx`, aux liens `tel:`, ni aux destinataires de la politique de confidentialité : c'est M.2.
- Tests e2e : les tests qui dépendent de Google lisent `GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS` et s'ignorent (`test.skip`) s'il est vide. Pour les lancer en local (PowerShell) : `$env:NEXT_PUBLIC_GOOGLE_ANALYTICS='G-TEST'; npm run build; npm run test:e2e`.

## Points de vigilance de la relecture

1. Cookie `macar_consent` illisible (JSON cassé, valeur modifiée à la main) : traité comme « pas de choix », bandeau affiché, aucune erreur dans la console. Test en tâche 1.
2. Choix répétés dans la même visite (accepter, rouvrir, accepter encore) : `gtag.js` n'est inséré qu'une fois et `config` n'est poussé qu'une fois. Test en tâche 2.
3. Navigation côté client après acceptation (lien du menu) : le `consent default` n'est pas repoussé, ce qui remettrait tout à `denied`. Test en tâche 2.
4. Clic sur « Gérer mes cookies » alors que le premier niveau est encore affiché (pas encore de choix) : passage au second niveau, sans bouton Annuler. Test en tâche 3.
5. Retrait de Publicité : `_gcl_au` est supprimé comme `_ga` l'est pour Analytique. Test en tâche 3.

---

### Tâche 1 : module de consentement, bandeau et préréglages de test

**Fichiers :**
- Créer : `src/lib/consent.ts`
- Réécrire : `src/app/_components/CookieConsent.tsx`
- Modifier : `e2e/helpers.mjs` (remplacer `CONSENT_COOKIE`, lignes 23 et 48-51)
- Réécrire : `e2e/tests/cookies.spec.mjs`

**Interfaces :**
- Produit (`src/lib/consent.ts`, sans `"use client"`, importable côté serveur pour les constantes) :
  ```ts
  export type ConsentCategory = "analytics" | "marketing";
  export type ConsentChoice = Record<ConsentCategory, boolean>;
  export type StoredConsent = ConsentChoice & { at: string; version: number };
  export type ConsentChangeDetail = { current: StoredConsent; previous: StoredConsent | null };
  export const CONSENT_COOKIE = "macar_consent";
  export const LEGACY_CONSENT_COOKIE = "macar_cookie_consent_is_true";
  export const CONSENT_VERSION = 1;
  export const CONSENT_MAX_AGE_DAYS = 182;
  export const CONSENT_CHANGE_EVENT = "macar:consent-change";   // CustomEvent<ConsentChangeDetail> sur window
  export const CONSENT_OPEN_EVENT = "macar:consent-open";       // Event sur window
  export function readConsent(): StoredConsent | null;
  export function writeConsent(choice: ConsentChoice): StoredConsent;
  export function onConsentChange(cb: (detail: ConsentChangeDetail) => void): () => void;
  export function openConsentPreferences(): void;
  export function onConsentPreferencesRequest(cb: () => void): () => void;
  export function clearLegacyConsent(): void;
  ```
- Produit (`e2e/helpers.mjs`) :
  ```js
  export const CONSENT = { all: { analytics: true, marketing: true }, none: { analytics: false, marketing: false } };
  export function consentCookie(choice, { version = 1 } = {}); // { name: "macar_consent", value: encodeURIComponent(JSON.stringify({ ...choice, at: "2026-10-17T00:00:00.000Z", version })) }
  export async function prepare(context, baseURL, { consent = true, onAvatarRequest, abortAvatar } = {});
  // consent: true => CONSENT.all ; false => aucun cookie ; objet => ce choix
  export async function readDataLayer(page); // tableau de tableaux : chaque entrée de window.dataLayer passée dans Array.from
  export function trackGoogleRequests(page); // tableau rempli au fil des requêtes vers googletagmanager.com et google-analytics.com
  export const GA_ID; // process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS?.trim() || ""
  ```

- [ ] **Étape 1 : adapter `e2e/helpers.mjs`** selon le bloc Interfaces. `prepare` garde sa signature : aucun autre fichier de test ne change son appel.

- [ ] **Étape 2 : écrire les tests du bandeau dans `e2e/tests/cookies.spec.mjs`** (viewport 1440 × 900, `prepare(..., { consent: false })` sauf mention). Le bandeau se trouve par `page.getByRole("region", { name: "Consentement aux cookies" })`. Tests et assertions :
  - `premier niveau : Tout refuser, Personnaliser, Tout accepter, lien vers la politique cookies` : les trois boutons visibles ; un lien vers `/politique-cookies` dans le bandeau.
  - `Tout refuser et Tout accepter ont la même apparence` : leurs attributs `class` sont identiques.
  - `Tout refuser enregistre deux non et ferme le bandeau` : bandeau absent ; le cookie `macar_consent` décodé vaut `{ analytics: false, marketing: false, version: 1 }` et `at` est une date ISO.
  - `Tout accepter enregistre deux oui et ferme le bandeau`.
  - `second niveau : Essentiels coché et verrouillé, Analytique et Publicité décochés` : après « Personnaliser », trois `switch` ; `Essentiels` checked et disabled ; les deux autres non cochés.
  - `Enregistrer mes choix avec Analytique seul` : clic sur « Analytique » puis « Enregistrer mes choix » ; cookie `{ analytics: true, marketing: false }`.
  - `les interrupteurs basculent au clavier` : focus sur « Publicité », Espace, coché.
  - `Échap ne ferme pas le bandeau à la première visite`, et aucun bouton « Annuler ».
  - `visiteur qui revient avec un choix valide : pas de bandeau` (`consent: true`).
  - `ancien cookie seul : bandeau affiché et ancien cookie supprimé` : `context.addCookies([{ name: "macar_cookie_consent_is_true", value: "true", url: baseURL }])` ; bandeau visible ; le cookie n'existe plus.
  - `cookie d'une autre version : bandeau affiché` (`consentCookie(CONSENT.all, { version: 0 })`).
  - `cookie illisible : bandeau affiché, pas d'erreur console` (valeur `"pas-du-json"`) ; collecter `page.on("pageerror")` et les messages console de type `error` : aucun.
  - `le bandeau ne bloque pas la page` : sans répondre, cliquer le lien « Blog » du menu ; l'URL devient `/blog`.
  - `320 px : pas de défilement horizontal, premier et second niveau` : `document.documentElement.scrollWidth <= 320` dans les deux états.
  - `le bandeau est une Card v3 et ses actions des Button v3` (repris de l'ancien fichier, trois `button.button` au premier niveau).

- [ ] **Étape 3 : lancer les tests et constater l'échec**
  Run : `npm run build; npm run test:e2e -- cookies.spec.mjs`
  Attendu : échec (pas de région « Consentement aux cookies », cookie `macar_consent` absent).

- [ ] **Étape 4 : écrire `src/lib/consent.ts`** selon le bloc Interfaces, avec `js-cookie`.
  - `readConsent` renvoie `null` si le cookie manque, si le JSON est invalide, si `version !== CONSENT_VERSION`, ou si `analytics`, `marketing` ne sont pas des booléens ou `at` pas une chaîne. Jamais d'exception.
  - `writeConsent` pose le cookie (`expires: CONSENT_MAX_AGE_DAYS`, `sameSite: "lax"`, `path: "/"`, `secure: location.protocol === "https:"`), puis émet `CONSENT_CHANGE_EVENT` avec `{ current, previous }` (`previous` lu avant l'écriture).
  - `openConsentPreferences` émet `CONSENT_OPEN_EVENT` ; les fonctions `on…` ajoutent l'écouteur sur `window` et renvoient la fonction qui le retire.

- [ ] **Étape 5 : réécrire `CookieConsent.tsx`.**
  - État : `view: "hidden" | "first" | "prefs"`, `draft: ConsentChoice`, `canCancel: boolean`. Au montage (dans `useEffect`, pour éviter tout écart d'hydratation) : `clearLegacyConsent()`, puis `view = readConsent() ? "hidden" : "first"`.
  - S'abonne à `onConsentPreferencesRequest` : `draft = readConsent() ?? { analytics: false, marketing: false }`, `canCancel = readConsent() !== null`, `view = "prefs"`.
  - Conteneur : `<section aria-label="Consentement aux cookies">` dans la même `motion.div` fixe qu'aujourd'hui, `Card` v3 avec `max-h-[calc(100dvh-5rem)] overflow-auto` comme aujourd'hui.
  - Premier niveau : boutons « Tout refuser » (`variant="primary"`), « Personnaliser » (`tertiary`), « Tout accepter » (`primary`).
  - Second niveau : `Switch` contrôlés (`isSelected`, `onChange`) pour Analytique et Publicité, Essentiels `isSelected isDisabled` ; boutons « Tout refuser » (`primary`), « Enregistrer mes choix » (`secondary`), « Tout accepter » (`primary`) ; « Annuler » (`tertiary`) seulement si `canCancel`.
  - Chaque bouton de choix appelle `writeConsent(...)` puis `view = "hidden"`. « Annuler » et Échap (écouteur `keydown` actif seulement si `canCancel` et `view === "prefs"`) passent à `"hidden"` sans écrire.
  - Textes (le constructeur peut les retoucher sans changer le sens, jamais de tiret long) :
    - premier niveau : « Nous utilisons des cookies pour mesurer la fréquentation du site et l'efficacité de nos publicités, uniquement avec votre accord. Vous pouvez changer d'avis à tout moment. » suivi du lien « En savoir plus » vers `/politique-cookies` (`TextLink underline`) ;
    - second niveau, titre « Préférences » : « Choisissez les cookies que vous acceptez. Les cookies essentiels ne peuvent pas être refusés : ils mémorisent votre choix. » ;
    - Essentiels : « Mémorisent votre choix concernant les cookies. » ; Analytique : « Statistiques de fréquentation du site, pour l'améliorer (Google Analytics). » ; Publicité : « Mesurer l'efficacité de nos publicités et vous en montrer de plus pertinentes. »

- [ ] **Étape 6 : relancer les tests**
  Run : `npm run build; npm run test:e2e`
  Attendu : `cookies.spec.mjs` passe en entier, et toute la suite reste verte (les autres tests posent le préréglage « tout accepté »).

- [ ] **Étape 7 : commit**
  ```bash
  git add src/lib/consent.ts src/app/_components/CookieConsent.tsx e2e/helpers.mjs e2e/tests/cookies.spec.mjs
  git commit -m "Record the visitor's real cookie choice per category"
  ```

### Tâche 2 : chargement de Google en mode consentement v2

**Fichiers :**
- Créer : `src/app/_components/GoogleTag.tsx`
- Modifier : `src/app/layout.tsx` (supprimer le bloc `{gaId && (...)}` des lignes 105-125 et l'import `Script` ; monter `<GoogleTag gaId={gaId} />` dans `<Providers>`, juste avant `<CookieConsent />`)
- Modifier : `.github/workflows/e2e.yml` (au niveau du job `checks` : `env: NEXT_PUBLIC_GOOGLE_ANALYTICS: G-TEST`, pour le build et les tests)
- Créer : `e2e/tests/consent-mode.spec.mjs`

**Interfaces :**
- Consomme : `readConsent`, `onConsentChange`, `ConsentChangeDetail` (tâche 1).
- Produit : `export default function GoogleTag({ gaId }: { gaId?: string }): null`. Après son montage, `window.dataLayer` et `window.gtag` existent toujours (même sans `gaId`), ce que M.2 utilise via `window.gtag?.("event", …)`. Déclaration globale dans le même fichier : `interface Window { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void; [key: \`ga-disable-${string}\`]: boolean | undefined }`.

- [ ] **Étape 1 : écrire `e2e/tests/consent-mode.spec.mjs`.** Tous les tests sauf le premier commencent par `test.skip(!GA_ID, "build sans NEXT_PUBLIC_GOOGLE_ANALYTICS")`. `trackGoogleRequests(page)` est branché avant `open`. Pour trouver une commande dans `readDataLayer` : `e[0] === "consent" && e[1] === "default"`, `e[0] === "consent" && e[1] === "update"`, `e[0] === "config"`.
  - `sans choix : consent default à denied et aucune requête Google` (sans skip) : une seule entrée `consent default`, avec `{ ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" }` ; entrée `["set", "ads_data_redaction", true]` ; aucune entrée `config` ; requêtes Google : 0 ; aucun cookie `_ga`.
  - `Tout refuser : aucune requête Google` : après le clic, `consent update` avec les quatre `denied`, requêtes Google : 0.
  - `Tout accepter : default, puis update granted, puis config, puis gtag.js` : index(default) < index(update) < index(config) ; l'update vaut les quatre `granted` ; `config` vaut `["config", GA_ID, { cookie_expires: 33696000 }]` ; une requête vers `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`.
  - `Analytique seul : analytics granted, publicité denied` : dernier update `{ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }` ; `gtag.js` demandé.
  - `Publicité seule : ad_* granted et aucune requête Google` : dernier update avec les trois `ad_*` `granted` et `analytics_storage` `denied` ; aucune entrée `config` ; requêtes Google : 0.
  - `visite suivante avec tout accepté : update granted et gtag.js sans bandeau` (`consent: true`).
  - `deux acceptations dans la même visite : un seul gtag.js et un seul config` : accepter, `page.evaluate` qui appelle l'ouverture du bandeau en émettant `new Event("macar:consent-open")` sur `window`, accepter encore ; `document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length === 1` ; une seule entrée `config`.
  - `navigation côté client après acceptation : un seul consent default` : accepter, cliquer « Blog » dans le menu, attendre `/blog` ; toujours une seule entrée `consent default`.

- [ ] **Étape 2 : lancer et constater l'échec**
  Run (PowerShell) : `$env:NEXT_PUBLIC_GOOGLE_ANALYTICS='G-TEST'; npm run build; npm run test:e2e -- consent-mode.spec.mjs`
  Attendu : échec (`gtag.js` demandé dès la première visite, pas de `consent default`).

- [ ] **Étape 3 : écrire `GoogleTag.tsx`** (`"use client"`, ne rend rien).
  - Une fonction `ensureGtag()` idempotente (ne fait rien si `window.gtag` existe déjà) : crée `window.dataLayer`, définit `window.gtag` qui pousse **l'objet `arguments`** (pas un tableau : `gtag.js` ne lit que ce format ; ajouter `// eslint-disable-next-line prefer-rest-params`), puis pousse `consent default` (quatre `denied`) et `set ads_data_redaction true`.
  - `apply({ current, previous })` :
    1. `gtag("consent", "update", …)` avec les quatre signaux tirés de `current` ;
    2. si `current.analytics` et `gaId` : `window["ga-disable-" + gaId] = false` ; si Google n'est pas encore chargé (drapeau au niveau du module) : `gtag("js", new Date())`, `gtag("config", gaId, { cookie_expires: 33696000 })`, puis insertion d'un `<script async src="https://www.googletagmanager.com/gtag/js?id=…">` ;
    3. le retrait est traité en tâche 3.
  - `useEffect` au montage : `ensureGtag()`, `apply` avec `readConsent()` s'il existe (et `previous: null`), abonnement `onConsentChange(apply)` avec désabonnement au démontage.

- [ ] **Étape 4 : modifier `layout.tsx` et le workflow** comme indiqué dans Fichiers. `<Analytics />` de Vercel ne bouge pas.

- [ ] **Étape 5 : relancer**
  Run : `$env:NEXT_PUBLIC_GOOGLE_ANALYTICS='G-TEST'; npm run build; npm run test:e2e`
  Attendu : toute la suite passe, `consent-mode.spec.mjs` compris. Puis `Remove-Item Env:NEXT_PUBLIC_GOOGLE_ANALYTICS; npm run build; npm run test:e2e -- consent-mode.spec.mjs` : le premier test passe, les autres sont ignorés.

- [ ] **Étape 6 : commit**
  ```bash
  git add src/app/_components/GoogleTag.tsx src/app/layout.tsx .github/workflows/e2e.yml e2e/tests/consent-mode.spec.mjs
  git commit -m "Load Google Analytics only after consent, with Consent Mode v2"
  ```

### Tâche 3 : « Gérer mes cookies » et retrait du consentement

**Fichiers :**
- Créer : `src/app/_components/ManageCookiesButton.tsx`
- Modifier : `src/app/_components/links.tsx` (extraire la construction des classes de `TextLink` dans `textLinkClassName`)
- Modifier : `src/app/_components/footer.tsx` (un `<li>` de plus dans la liste des liens légaux, après « Politique cookies »)
- Modifier : `src/app/_components/GoogleTag.tsx` (retrait)
- Modifier : `e2e/tests/cookies.spec.mjs`, `e2e/tests/consent-mode.spec.mjs`

**Interfaces :**
- Consomme : `openConsentPreferences` (tâche 1), `apply` de `GoogleTag` (tâche 2).
- Produit :
  - `export function textLinkClassName(opts: { underline?: boolean; navigation?: boolean; className?: string }): string` dans `links.tsx`, utilisé par `TextLink` (rendu inchangé) ;
  - `export default function ManageCookiesButton({ appearance }: { appearance: "link" | "button" })`, client, libellé « Gérer mes cookies » : `"link"` rend un `<button type="button">` aux classes `textLinkClassName({ navigation: true })` (pied de page) ; `"button"` rend un `Button` HeroUI `variant="secondary"` (politique cookies). Les deux appellent `openConsentPreferences()`.

- [ ] **Étape 1 : ajouter les tests.**
  Dans `cookies.spec.mjs` :
  - `Gérer mes cookies (pied de page) rouvre le second niveau avec le choix enregistré` : `consent: { analytics: true, marketing: false }` ; sur `/`, clic sur `page.getByRole("button", { name: "Gérer mes cookies" })` (le pied de page n'a pas d'élément `<footer>` ; c'est le seul bouton de ce nom sur l'accueil) ; Analytique coché, Publicité décoché.
  - `Annuler et Échap referment sans rien changer` : valeur du cookie identique avant et après, pour chacun des deux.
  - `Gérer mes cookies pendant le premier niveau : second niveau sans Annuler` (`consent: false`).
  - `changement appliqué sans recharger` : poser `window.__marker = 1` avant, passer Publicité à oui, « Enregistrer mes choix » ; `window.__marker` vaut toujours 1 et le cookie est `{ analytics: true, marketing: true }`.
  Dans `consent-mode.spec.mjs` (avec skip si pas de `GA_ID`) :
  - `retrait d'Analytique : update denied, ga-disable posé, _ga et _ga_* supprimés` : `consent: true` plus les cookies `_ga` et `_ga_TEST` (`url: baseURL`) ; rouvrir, décocher Analytique, enregistrer ; dernier update `analytics_storage: "denied"` ; `window["ga-disable-" + GA_ID] === true` ; plus de cookie `_ga` ni `_ga_TEST` ; un cookie `_gac_TEST` posé aussi au départ est **toujours là** (le préfixe `_ga` ne doit pas l'emporter).
  - `retrait de Publicité : _gcl_au supprimé` : même principe avec `_gcl_au`, Analytique laissé à oui ; `_ga` toujours là.
  - `réacceptation d'Analytique après retrait : ga-disable repasse à false`.

- [ ] **Étape 2 : lancer et constater l'échec**
  Run : `$env:NEXT_PUBLIC_GOOGLE_ANALYTICS='G-TEST'; npm run build; npm run test:e2e -- cookies.spec.mjs consent-mode.spec.mjs`
  Attendu : échec (pas de bouton « Gérer mes cookies »).

- [ ] **Étape 3 : écrire `textLinkClassName`, `ManageCookiesButton` et l'ajouter au pied de page.**

- [ ] **Étape 4 : compléter `apply` dans `GoogleTag.tsx`.**
  - Analytique passé de oui à non : `window["ga-disable-" + gaId] = true` (si `gaId`), puis suppression du cookie `_ga` exact et des cookies au préfixe `_ga_`.
  - Publicité passée de oui à non : suppression des cookies aux préfixes `_gcl_` et `_gac_`.
  - Suppression : lire les noms dans `document.cookie` ; pour chaque nom retenu, `Cookies.remove(name, { path: "/" })` puis, pour chaque suffixe du nom d'hôte d'au moins deux libellés (`www.macar.be`, `macar.be`), `Cookies.remove(name, { path: "/", domain })`.

- [ ] **Étape 5 : relancer** la même commande qu'à l'étape 2. Attendu : tout passe.

- [ ] **Étape 6 : commit**
  ```bash
  git add src/app/_components/ManageCookiesButton.tsx src/app/_components/links.tsx src/app/_components/footer.tsx src/app/_components/GoogleTag.tsx e2e/tests/cookies.spec.mjs e2e/tests/consent-mode.spec.mjs
  git commit -m "Let visitors change or withdraw their cookie consent at any time"
  ```

### Tâche 4 : politique cookies et documentation du dépôt

**Fichiers :**
- Modifier : `src/app/politique-cookies/page.tsx`
- Modifier : `e2e/tests/legal.spec.mjs` (ligne 7)
- Modifier : `CLAUDE.md`

**Interfaces :**
- Consomme : `ManageCookiesButton` (tâche 3), `CONSENT_VERSION`, `CONSENT_COOKIE` (tâche 1).

- [ ] **Étape 1 : adapter les tests.** Dans `legal.spec.mjs`, `ROWS = ["_ga", "_ga_*", "Vercel Analytics", "macar_consent"]`. Ajouter dans `cookies.spec.mjs` : `la politique cookies propose Gérer mes cookies, qui rouvre le second niveau` (dans `main`), et `la politique cookies affiche la version 1`. Le décompte de 3 `Separator` sur `/politique-cookies` ne change pas : garder les mêmes sections.

- [ ] **Étape 2 : lancer et constater l'échec**
  Run : `npm run build; npm run test:e2e -- legal.spec.mjs cookies.spec.mjs`
  Attendu : échec sur la ligne `macar_consent` et sur le bouton de la page.

- [ ] **Étape 3 : mettre la page à jour.**
  - Tableau : ligne `macar_consent` (« Macar », « Mémoriser vos choix concernant les cookies », « 6 mois ») à la place de l'ancienne ; `_ga` et `_ga_*` restent à « 13 mois » ; Vercel Analytics inchangé ; la phrase « Aucun cookie publicitaire… » reste.
  - Section « Gestion de votre consentement » : premier passage (aucun cookie de mesure avant votre choix ; Tout refuser, Personnaliser, Tout accepter) ; les deux catégories facultatives, Analytique et Publicité ; le choix est gardé 6 mois puis redemandé ; `ManageCookiesButton appearance="button"` ; au retrait, les cookies concernés sont supprimés et la mesure s'arrête aussitôt. Retirer l'instruction de supprimer le cookie dans le navigateur ; garder la mention des réglages du navigateur.
  - Pied : « Version {CONSENT_VERSION}, dernière mise à jour : 17 octobre 2026. » (date du jour de la fusion si elle diffère).

- [ ] **Étape 4 : `CLAUDE.md`.** Dans Architecture, une ligne : consentement dans `src/lib/consent.ts` (lu par `CookieConsent` et `GoogleTag`, base de M.2), Google chargé seulement après accord d'Analytique, mode consentement v2 basique. Dans Commandes, sous `npm run test:e2e` : les tests de Google demandent un build fait avec `NEXT_PUBLIC_GOOGLE_ANALYTICS=G-TEST`, sinon ils s'ignorent.

- [ ] **Étape 5 : relancer.** Même commande qu'à l'étape 2. Attendu : tout passe.

- [ ] **Étape 6 : commit**
  ```bash
  git add src/app/politique-cookies/page.tsx e2e/tests/legal.spec.mjs e2e/tests/cookies.spec.mjs CLAUDE.md
  git commit -m "Describe the new consent choices in the cookie policy"
  ```

### Tâche 5 : vérification finale

- [ ] **Étape 1 : contrôles complets**
  Run : `npm run lint; npx tsc --noEmit; $env:NEXT_PUBLIC_GOOGLE_ANALYTICS='G-TEST'; npm run build; npm run test:e2e`
  Attendu : aucune erreur, suite entièrement verte, aucun test ignoré.

- [ ] **Étape 2 : au navigateur (MCP Playwright)**, `npm run dev`, sans cookie, en 375 px et 1440 px : premier niveau, second niveau, « Gérer mes cookies » dans le pied de page et sur `/politique-cookies`, parcours au clavier (Tab, Entrée, Espace, Échap au retour). Captures dans le dossier temporaire de la session, jamais dans le dépôt. Vérifier qu'au téléphone le bandeau ne cache ni le bouton d'appel ni le menu, et que la console est vide.

- [ ] **Étape 3 : relire la liste de contrôle de la section 10 de la spec**, point par point, et noter dans la PR les points vérifiés au navigateur plutôt que par un test.

- [ ] **Étape 4 : PR vers `dev`**, en rappelant au propriétaire de vérifier les signaux avec Tag Assistant après la mise en ligne.
