# Compter les demandes de devis et les clics téléphone (M.2), avec l'origine de la demande

Date : 17 octobre 2026. Tâche M.2 du planning pub (`# Sales / 01 Publicité / Macar - Planning publicité.xlsx`), construite par-dessus M.1 (bannière cookies et Consent Mode v2, fusionnée dans `dev` par la PR #23, spec `2026-10-17-cookie-consent-design.md`). Contexte d'ensemble : `2026-10-17-cookies-m1-contexte-pour-m2.md`.

## 1. Intention

Macar va payer des Annonces Local Services puis Google Ads. Pour juger chaque euro, il faut savoir combien de visiteurs du site demandent un devis (formulaire) ou cliquent sur le téléphone, et d'où ils venaient. Aujourd'hui le site ne compte rien. À la fin de M.2 :

- chaque envoi réussi du formulaire et chaque clic sur un numéro Macar devient un événement GA4, que le propriétaire marque comme événement clé puis importe dans Google Ads (tâche G.2) ;
- chaque mail de demande reçu sur info@macar.be indique l'origine du visiteur (pub Google, recherche, accès direct) et la page d'où il a écrit, pour la recopier dans le futur champ « origine » de Dolibarr (tâche M.3) ;
- tout cela respecte le consentement de M.1 : rien n'est mesuré ni mémorisé sans l'accord correspondant.

**Réussite** : un visiteur qui a accepté Analytique produit `generate_lead` et `phone_click` dans `dataLayer` ; un visiteur qui a refusé n'en produit aucun ; l'origine n'est gardée en session qu'avec l'accord Publicité ; le mail Formspree porte la ligne d'origine ; les contrôles du dépôt (lint, types, build, Playwright) passent.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**

- Événement `generate_lead` au succès du formulaire de contact.
- Événement `phone_click` au clic sur un lien `tel:` vers un numéro Macar.
- Ligne « origine » et « page » dans l'envoi Formspree.
- Tests Playwright des trois comportements, avec et sans consentement.
- Pages légales à jour sur la mémorisation de l'origine.
- Marche à suivre côté GA4 et Google Ads, pour le propriétaire.

**Non-objectifs (plus tard ou ailleurs)**

- Balise Google Ads (`AW-…`) sur le site : les conversions seront les événements clés GA4 importés dans Google Ads (G.2).
- Pixel Meta : il se branchera sur la catégorie Publicité de M.1 quand Meta sera lancé.
- Comptage des appels Local Services et des appels depuis les annonces Google Ads : Google les compte lui-même.
- Champ « origine » dans Dolibarr (M.3) : hors du site.
- Toute modification de la bannière ou du module de consentement.

**Anti-objectifs**

- Un événement envoyé à Google sans accord Analytique, y compris un événement mis en file avant le consentement et expédié après.
- Un identifiant publicitaire (`gclid`) écrit sur l'appareil (cookie ou stockage) sans accord Publicité. Le garder en mémoire JavaScript le temps de la page n'est pas un stockage sur l'appareil : c'est admis.
- La valeur du `gclid` dans un mail ou dans Dolibarr : seul le fait « venu d'une pub » est transmis.
- Le formulaire qui échoue ou se bloque à cause de la mesure : la mesure ne doit jamais empêcher l'envoi.
- Un compteur qui compte le clic sur Envoyer plutôt que l'envoi réussi.

## 3. Contraintes

- Site statique Next.js 15, pas de backend. Formspree reçoit le formulaire et envoie le mail.
- Zéro coût supplémentaire : GA4 et gtag déjà en place, pas de Google Tag Manager, pas d'outil tiers.
- Interface de M.1 à utiliser telle quelle : `readConsent()`, `onConsentChange()` de `src/lib/consent.ts` ; `window.gtag` et `window.dataLayer` existent dès le montage de `GoogleTag`, que Google soit chargé ou non.
- Les tests bloquent toute requête externe (`e2e/helpers.mjs`). Ils doivent lire `dataLayer` et intercepter Formspree, jamais l'appeler.
- Conventions du dépôt : HeroUI v3 natif, pas de tiret long dans les textes visibles, branche depuis `dev`, PR vers `dev`.

## 4. Ce qui est décidé

### 4.1 Utilitaire d'événements : `src/lib/analytics.ts`

```ts
export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void
```

- Ne fait rien côté serveur, si `readConsent()?.analytics` n'est pas vrai, ou si `window.gtag` n'existe pas.
- Sinon appelle `window.gtag("event", name, params)`.
- Le test sur le consentement est volontaire et distinct de celui de `GoogleTag` : sans lui, un événement poussé avant le choix resterait dans `dataLayer` et partirait chez Google dès que le visiteur accepterait. Aucun événement ne doit être poussé tant qu'Analytique n'est pas accordé.
- Pas de dépendance à l'identifiant GA : sans `NEXT_PUBLIC_GOOGLE_ANALYTICS`, l'événement est poussé dans `dataLayer` mais rien ne le lit, ce qui permet aux tests de l'observer.

### 4.2 Formulaire : `generate_lead`

Dans `src/components/contact_form.tsx`, dans le `then` de la requête Formspree (réponse OK), juste avant d'afficher le message de succès :

```ts
trackEvent("generate_lead", { lead_source: "formulaire_contact" });
```

`generate_lead` est le nom recommandé par GA4 pour une demande de contact. Rien n'est envoyé si la validation échoue, si l'adresse Formspree manque ou si la requête échoue.

### 4.3 Téléphone : `phone_click`

Un composant client `src/app/_components/ConversionTracking.tsx`, monté une fois dans `layout.tsx` (à côté de `GoogleTag`), sans rendu. Il pose un écouteur de clic sur `document` qui :

- cherche l'ancre la plus proche avec `href` commençant par `tel:` (`closest('a[href^="tel:"]')`) ;
- normalise le numéro (chiffres et `+` seulement) et ne continue que s'il figure dans la liste des numéros Macar : `+32478235008` (GSM) et `+3224665304` (fixe). Le numéro de la page Emploi n'est pas compté ;
- envoie `trackEvent("phone_click", { phone_number, link_location })` où `link_location` vaut `pied_de_page` si le lien est dans un `footer`, sinon `page`.

Choix de la délégation plutôt qu'un composant `PhoneLink` : pas de nouveau composant dans `footer.tsx` et `HomeView.tsx`, et tout futur lien `tel:` vers un numéro Macar est compté d'office. L'écouteur n'empêche jamais la navigation vers le composeur.

Le pied de page est aujourd'hui une `<div>` : sa racine devient `<footer>` (élément de repère correct pour les lecteurs d'écran, et cible de `closest("footer")`). Rien d'autre ne change dans son balisage.

### 4.4 Origine de la demande : `src/lib/origin.ts`

Le cas qui compte est le visiteur qui clique sur une pub : c'est presque toujours une première visite, il arrive avec `?gclid=…` sur une page service ou commune, et il n'a pas encore répondu à la bannière. S'il navigue vers l'accueil avant de répondre, la navigation côté client a déjà retiré le paramètre de l'URL. L'origine doit donc être lue **à l'arrivée**, avant tout consentement, et gardée en mémoire ; l'accord Publicité ne sert qu'à la conserver au-delà de la page.

**Lecture à l'arrivée (mémoire, sans consentement).** Au premier montage de `ConversionTracking`, `rememberArrival()` lit l'URL courante et `document.referrer` une seule fois et garde dans une variable de module `{ ad: boolean; utm_source?; utm_medium?; utm_campaign?; landing: pathname; referrer }`. `ad` est vrai si l'URL porte `gclid`, `gbraid` ou `wbraid`, ou `utm_medium=cpc`. **La valeur du `gclid` n'est pas conservée**, seulement le fait. Rien n'est écrit sur l'appareil à ce stade.

**Conservation (sessionStorage, avec Publicité).** `persistArrival()` est appelée au montage et à chaque changement de consentement : si `readConsent()?.marketing` est vrai et que l'arrivée porte une pub ou une campagne, elle écrit l'objet ci-dessus sous la clé `macar_origine` de `sessionStorage` (s'il n'y a pas déjà une entrée) ; si Publicité n'est pas accordé ou est retiré, elle supprime la clé. `sessionStorage` meurt avec l'onglet : la donnée ne survit pas à la visite, mais survit à un rechargement. Toute lecture ou écriture est dans un `try/catch` et un échec ne change rien au reste.

**Lecture à l'envoi.** `describeOrigin(): { origine: string; page: string }` :

- `page` : `window.location.pathname` au moment de l'envoi.
- source : l'entrée `macar_origine` si elle existe et est valide, sinon l'arrivée gardée en mémoire (perdue si la page a été rechargée sans accord Publicité : on retombe alors sur le référent).
- `origine`, dans cet ordre :
  1. `ad` vrai → `Pub Google, arrivée sur <landing>` ;
  2. `utm_source` présent → `Campagne <utm_source> / <utm_medium> / <utm_campaign>, arrivée sur <landing>` (parties absentes omises, séparateurs compris) ;
  3. sinon d'après le référent (celui de l'arrivée gardé en mémoire, à défaut `document.referrer`) : hôte contenant `google.` → `Recherche Google` ; `bing.` → `Recherche Bing` ; `facebook.`, `instagram.` ou `fb.` → `Facebook ou Instagram` ; vide → `Accès direct ou favori` ; autre → `Site référent : <hôte>`.

**Envoi.** `contact_form.tsx` ajoute `origine` et `page` aux valeurs postées à Formspree, construites avant la requête. Formspree reprend tous les champs dans le mail. Le schéma `zod` et l'état du formulaire ne changent pas.

**Limite connue, hors M.2.** Le même problème existe côté Google : si le visiteur accepte après avoir navigué, `gtag.js` se charge sur une URL sans `gclid` et Google Ads ne pourra pas rattacher la conversion importée au clic. Une suite possible, à décider avec le propriétaire : `GoogleTag` passerait `page_location` de l'URL d'arrivée dans son `config`. Cela touche M.1 et ses tests, donc pas ici.

### 4.5 Pages légales

La ligne d'origine part avec **toute** demande, consentement ou non (elle fait partie du message que le visiteur nous envoie) ; seul le stockage de session dépend de Publicité. Les textes disent exactement cela.

- `src/app/politique-confidentialite/page.tsx`, section « Données collectées » : nouvelle puce « Provenance de votre demande, jointe à votre message quand vous utilisez le formulaire : page d'où vous l'envoyez et manière dont vous êtes arrivé sur le site (publicité, moteur de recherche, site référent ou accès direct), sans identifiant publicitaire. » Section « Finalités et bases légales » : la puce « Répondre à vos demandes… » devient « Répondre à vos demandes de devis ou questions et savoir comment vous nous avez trouvés. Base légale : mesures précontractuelles à votre demande (art. 6.1.b RGPD). » Section « Durée de conservation » : nouvelle puce « Provenance de votre visite gardée sur votre appareil (si vous acceptez la catégorie Publicité) : effacée à la fermeture de l'onglet. »
- `src/app/politique-cookies/page.tsx`, tableau : ligne `macar_origine`, émetteur Macar, finalité « Retenir la provenance de votre visite pour la joindre à votre demande de devis (si vous acceptez Publicité), stockage de session, sans cookie », durée « Fin de la visite ». `e2e/tests/legal.spec.mjs` (`ROWS`) suit.
- Pas de nouvelle version de la bannière : les catégories et leur sens ne changent pas.

### 4.6 Tests Playwright : `e2e/tests/conversions.spec.mjs`

Tous lisent `window.dataLayer` (helper `readDataLayer` de M.1) et n'ont pas besoin de l'identifiant GA, puisque `gtag` existe toujours.

- Clic sur le GSM du pied de page avec consentement complet → un `["event", "phone_click", { phone_number: "+32478235008", link_location: "pied_de_page" }]`. Même chose pour le lien de l'accueil avec `link_location: "page"`.
- Même clic avec « tout refusé » ou sans choix → aucun `event` dans `dataLayer`.
- Clic sur le numéro de la page Emploi avec consentement → aucun `phone_click`.
- Formulaire valide, Formspree intercepté avec une réponse 200 → message de succès, un `generate_lead`, et le corps de la requête interceptée contient `origine` et `page`.
- Arrivée sur `/services/toiture?gclid=test` **sans choix de cookies**, navigation vers l'accueil par le menu, envoi (bannière toujours ouverte) → `origine` vaut `Pub Google, arrivée sur /services/toiture`, `sessionStorage` vide, aucun `event`. C'est le cas réel principal.
- Même arrivée avec Publicité acceptée → `macar_origine` présent dans `sessionStorage` (sans valeur de `gclid`), rechargement de l'accueil, envoi → même `origine`.
- Même arrivée avec Publicité refusée, rechargement de l'accueil → `origine` égale à `Accès direct ou favori` (la mémoire est perdue, rien n'était conservé).
- Retrait de Publicité via « Gérer mes cookies » → la clé `macar_origine` disparaît sans recharger.
- Le corps posté ne contient jamais la chaîne du `gclid`.

**Formspree dans les tests.** Le succès du formulaire exige une adresse Formspree dans le build. `.github/workflows/e2e.yml` reçoit `NEXT_PUBLIC_FORMSPREE_ENDPOINT: https://formspree.io/f/test-e2e` ; en local, `playwright.config.mjs` lit `.env.local` pour connaître les variables du build. Le test de conversions enregistre, après `prepare()`, une route qui répond `200 {"ok":true}` à **toute** adresse dont l'hôte est `formspree.io` (la route la plus récente gagne, rien ne sort de la machine), et s'ignore si le build n'a pas d'adresse. `e2e/tests/form.spec.mjs` garde son principe (jamais d'envoi réel) mais sa garde devient : aucune requête Formspree **aboutie** (`requestfinished`) ; une requête interrompue par `routeNetwork` est tolérée, puisque le formulaire tente désormais l'envoi en CI.

### 4.7 Côté Google, à la main (propriétaire)

Après mise en production :

1. GA4, Administration, Événements clés, « Nouvel événement clé » : saisir `generate_lead` puis `phone_click`. Ils peuvent être créés avant la première occurrence.
2. Vérifier dans Temps réel, sur macar.be, en acceptant la bannière : un clic sur le numéro affiche `phone_click`.
3. Tâche G.2, quand le compte Google Ads existe : Objectifs, Conversions, Importer, « Propriétés Google Analytics 4 », cocher les deux événements clés. Lier au préalable GA4 et Google Ads (Administration GA4, Associations de produits).

Cette marche à suivre est reprise dans la section « Mesure » de `CLAUDE.md` en une phrase et dans la PR.

## 4.8 Décisions prises après relecture (17 octobre 2026)

Un relecteur « constructeur » a lu la première version. Tranché par l'auteur de la spec, sans retour au propriétaire :

1. L'origine est lue à l'arrivée et gardée en mémoire sans consentement ; Publicité ne gouverne que la conservation en `sessionStorage` (section 4.4). Raison : le cas réel principal est l'arrivée sans choix.
2. Le mail dit « Pub Google » même si le visiteur refuse Publicité : c'est un fait sur sa demande, pas un identifiant, et il part avec le message qu'il nous envoie (art. 6.1.b).
3. La valeur du `gclid` n'est ni conservée ni transmise. Si un jour Macar veut importer dans Google Ads les devis signés (conversions hors ligne), il faudra la conserver avec l'accord Publicité : ce sera une autre spec.
4. Les pages légales décrivent la ligne d'origine comme jointe à toute demande, et le stockage de session comme soumis à Publicité (section 4.5).
5. La racine du pied de page devient `<footer>` (section 4.3).

## 5. Laissé au constructeur

- Nom exact des fonctions internes et découpage entre `analytics.ts`, `origin.ts` et le composant, tant que l'interface de la section 4 est respectée.
- Forme du texte de `CLAUDE.md` et de la PR.
- Ordre d'implémentation. Suggestion : utilitaire et téléphone, puis formulaire, puis origine, puis légal, chaque étape avec son test.

## 6. Liste de contrôle de fin

- [ ] Avec « tout accepté » : clic téléphone et envoi réussi produisent les deux événements dans `dataLayer` ; avec « tout refusé » ou sans choix, aucun `event`.
- [ ] Aucune requête vers Google ni Formspree ne sort des tests.
- [ ] Mail de test reçu sur info@macar.be avec les lignes `origine` et `page` (vérification manuelle en production, après fusion).
- [ ] Arrivée avec `gclid` sans choix de cookies, navigation, envoi : la ligne `origine` dit `Pub Google`. `sessionStorage` vide sans accord Publicité, rempli avec l'accord (sans la valeur du `gclid`), vidé au retrait.
- [ ] Pages légales et `legal.spec.mjs` à jour.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e` au vert, en local et en CI.
- [ ] Captures 375 px et 1440 px du formulaire après succès : rien ne bouge visuellement (la mesure est invisible).
