# Corrections issues de l'audit SEO et GEO du 23/11/2026

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**But :** corriger sur macar.be ce que l'audit SEO et GEO a relevé et qui se règle dans le code ou le contenu du dépôt, sur une seule branche `fix/audit-seo-geo` partie de `dev`, PR vers `dev`.

**Approche :** trois phases sur la même branche, un commit par tâche. Phase 1 : corrections sans nouveau contenu (contact, accessibilité, zone, OpenGraph, page `/zones`, sitemap, en-têtes, données structurées). Phase 2 : contenu (blog conforme aux règles, pages de service, textes des communes, page À propos), à faire relire par Macar avant la fusion. Phase 3 : mobile et performance.

**Stack :** Next.js 15 App Router, React 19, HeroUI v3 (3.2.6), Tailwind 4, Playwright (`e2e/`).

**Source :** audit du 23/11/2026, rapport local `docs/macar.be-audit/FULL-AUDIT-REPORT.md` et `ACTION-PLAN.md` (dossier `docs/` ignoré par git : les valeurs utiles sont recopiées ci-dessous). Score de départ 66/100.

## Faits confirmés par Macar (23/11/2026)

| Sujet | Valeur à utiliser |
|---|---|
| Zone d'intervention | Toute la Belgique, avec l'accent sur Bruxelles. Phrase de référence : « Macar intervient partout en Belgique, et avant tout à Bruxelles, où l'entreprise est basée depuis 2002. » |
| Adresse | Garder « Avenue Prudent Bols, 43, 1020 Bruxelles » partout où elle est aujourd'hui (identique à la fiche Google). Le siège social BCE « 43-45 » reste dans les mentions légales et la phrase sur l'entité juridique. |
| Téléphones | Mobile `+32 478 23 50 08` (`tel:+32478235008`), fixe `+32 2 466 53 04` (`tel:+3224665304`). |
| Avis Google | 5,0 sur **20 avis** (fiche validée, vérifiée le 23/11/2026). |
| Auteur du blog | Shkelzen Shalaj, gérant. |
| Assurance | Responsabilité civile entreprise (exploitation, après livraison). **Pas** d'assurance décennale : ne jamais présenter la garantie décennale comme un engagement de Macar. Ne pas nommer l'assureur. |
| Prestations | Celles de `src/lib/services.ts` sont réelles. La pose de châssis et fenêtres PVC (oscillo-battants, fixes, levant-coulissants, double et triple vitrage) est fréquente dans les devis et doit apparaître. |
| Offre d'emploi `/job` | Ouverte : « Ouvrier polyvalent (Indépendant) ». |
| Photos de chantier ou d'équipe | Pas encore validées : n'en ajouter aucune. |

## Global Constraints

- Texte visiteur : aucun tiret long (ni — ni –) ; virgule, deux-points, parenthèses ou deux phrases.
- Blog (`content/blog/`) : aucun prix, montant, fourchette, comparaison de prix ; aucun délai non maîtrisé (durée de chantier, délai d'assureur ou d'expert, versement) ; pas de « Bruxelles » ni d'année dans titres, slugs et texte sauf fait régional ; aucun tiers nommé ; faits Macar tels quels (5 / 40 / 45 / 10 %, devis valable 30 jours, urgences en journée seulement, échafaudage toujours chiffré à part).
- Chaque affirmation nouvelle est vérifiable : pas de prestation, chiffre ou certification inventés ; en cas de doute, la formuler comme question dans la PR.
- HeroUI v3 : aucune classe ne modifie le style d'un composant ; consulter le serveur MCP `heroui-react` avant tout changement d'interface. Imports serveur par sous-chemin (`@heroui/react/<composant>`).
- Pas de nouvelle dépendance npm.
- Toute page statique ajoutée va dans `src/app/sitemap.ts` et dans `PAGES` de `e2e/helpers.mjs` ; `public/llms.txt` suit les changements de services et de zones.
- Chaque tâche se termine par `npx tsc --noEmit`, `npm run lint` et les specs e2e touchées (après `npm run build`).

## Review Focus

1. **Débordement à 320 px** sur la nouvelle page `/zones`, une commune ajoutée et une commune réécrite : ajout à `PAGES` (tâches 5 et 11), couvert par `layout.spec.mjs`.
2. **Canonique conservée** quand l'OpenGraph passe par l'aide commune : chaque page de `PAGES` garde une `<link rel="canonical">` égale à son URL (tâche 4).
3. **Les en-têtes de sécurité ne cassent pas** Google, Meta, Formspree ni Vercel Analytics : pas de CSP dans cette branche, et les specs `consent-mode`, `meta-pixel`, `form` repassent (tâche 7).
4. **Contenu visible sans JavaScript** : le titre de la page d'accueil est à `opacity: 1` dans le HTML serveur (tâche 13).
5. **Nouvelles communes cohérentes** partout : `communes.ts`, sitemap, `llms.txt`, JSON-LD `areaServed` et liste « autres zones » (tâche 11).

---

## Phase 1 : corrections sans nouveau contenu

### Task 1 : téléphone fixe et points de contact

**Files:**
- Modify: `src/app/_components/footer.tsx:63`
- Modify: `src/lib/seo/localBusiness.ts:36` (ajout `contactPoint`)
- Modify: `e2e/helpers.mjs` (aide `jsonLd`)
- Create: `e2e/tests/seo.spec.mjs`
- Test: `e2e/tests/footer.spec.mjs`

**Interfaces :**
- Produit (e2e) : `jsonLd(page): Promise<object[]>` dans `e2e/helpers.mjs`, qui parse tous les `script[type="application/ld+json"]` de la page (en aplatissant `@graph` et tableaux). Utilisée par les tâches 3, 4, 5, 8 et 12.

- [ ] **Step 1 : test** `fixe au bon format dans le pied de page` (1440 et 375 px) : le pied de page contient `+32 2 466 53 04`, ne contient pas `+32 246 653 04`, et un lien `a[href="tel:+3224665304"]` existe.
- [ ] **Step 2 : test** `JSON-LD : deux contactPoint` dans `e2e/tests/seo.spec.mjs` : le bloc dont `@id` vaut `https://www.macar.be/#localbusiness` a `telephone: "+32478235008"` et un `contactPoint` contenant les numéros `+32478235008` et `+3224665304`.
- [ ] **Step 3 : lancer**, attendu FAIL.
- [ ] **Step 4 : implémenter.** Texte du lien fixe `+32 2 466 53 04`. Dans `localBusinessJsonLd`, ajouter `contactPoint` : deux `ContactPoint` (`contactType: "customer service"`, `areaServed: "BE"`, `availableLanguage: "fr"`), `telephone` garde le mobile.
- [ ] **Step 5 : lancer**, attendu PASS.
- [ ] **Step 6 : commit** `fix: format the landline number and add contact points to the JSON-LD`

### Task 2 : accessibilité pour les agents (logo, formulaire, llms.txt)

**Files:**
- Modify: `src/app/_components/navbar.tsx:62` et `:68` (les deux `<Link href="/">`)
- Modify: `src/components/contact_form.tsx:122,127,132`
- Modify: `public/llms.txt`
- Test: `e2e/tests/layout.spec.mjs`, `e2e/tests/form.spec.mjs`, `e2e/tests/seo.spec.mjs`

- [ ] **Step 1 : tests.**
  - `layout.spec.mjs` : `liens du logo : nom accessible` : à 1440 et 375 px, `page.getByRole("link", { name: "Macar, accueil" })` est visible.
  - `form.spec.mjs` : `champs typés pour le remplissage automatique` : le champ Email a `type="email"` et `autocomplete="email"`, Téléphone `type="tel"` et `autocomplete="tel"`, Nom `autocomplete="name"`.
  - `seo.spec.mjs` : `llms.txt en Markdown` : `GET /llms.txt` répond 200 ; la deuxième ligne non vide commence par `> ` ; chaque ligne qui commence par `- ` et contient `https://www.macar.be` correspond à `/^- \[[^\]]+\]\(https:\/\/www\.macar\.be[^)]*\)/` ; le texte ne contient pas `19 communes` ; il contient la phrase de référence de la zone.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter.**
  - `aria-label="Macar, accueil"` sur les deux liens du logo.
  - `Input` : `type` et `autoComplete` comme ci-dessus (vérifier dans la doc `heroui-react` que `TextField`/`Input` transmettent ces attributs).
  - `llms.txt` : titre `# Macar`, puis une ligne `> ` qui résume (activité, Bruxelles et Belgique, depuis 2002), puis les sections existantes réécrites en `- [Nom](url) : description`. Section « Zone d'intervention » : phrase de référence, puis la liste des communes ayant une page. Garder la phrase sur l'entité juridique telle quelle.
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `fix: name the logo links, type the form fields and turn llms.txt into Markdown links`

### Task 3 : une seule description de la zone d'intervention

**Files:**
- Modify: `src/app/page.tsx:24` et `:43` (réponses de la FAQ)
- Modify: `src/lib/seo/localBusiness.ts:68-72` (`areaServed`)
- Test: `e2e/tests/faq.spec.mjs`, `e2e/tests/seo.spec.mjs`

- [ ] **Step 1 : tests.**
  - `faq.spec.mjs` : `zone d'intervention : Belgique, surtout Bruxelles` : la FAQ de l'accueil contient la phrase de référence.
  - `seo.spec.mjs` : `areaServed : Belgique, Région bruxelloise et communes` : `areaServed` contient `{ "@type": "Country", name: "Belgique" }`, `{ "@type": "AdministrativeArea", name: "Région de Bruxelles-Capitale" }`, et aucun `City` nommé `Bruxelles` (seul `Bruxelles-Ville` reste).
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter.** Réponse ligne 24 : adresse puis phrase de référence. Réponse ligne 43 : phrase de référence (supprimer « Notre zone d'intervention couvre la Belgique. »). `areaServed` : Country, AdministrativeArea, puis les communes de `communes.ts`.
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `fix: describe the service area the same way everywhere`

### Task 4 : OpenGraph complet et canonique par page

**Files:**
- Create: `src/lib/seo/openGraph.ts`
- Modify: `src/app/layout.tsx:33-35` (retirer `alternates.canonical: "/"`)
- Modify: les `openGraph` de `src/app/page.tsx`, `about/page.tsx`, `job/page.tsx`, `services/page.tsx`, `services/*/page.tsx`, `zones/[slug]/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, `mentions-legales`, `politique-confidentialite`, `politique-cookies`
- Test: `e2e/tests/seo.spec.mjs`

**Interfaces :**
- Produit : `pageOpenGraph({ title, description, path, type? }: { title: string; description: string; path: string; type?: "website" | "article" }): NonNullable<Metadata["openGraph"]>`. Retourne `title`, `description`, `url: https://www.macar.be${path}`, `siteName: "Macar"`, `locale: "fr_BE"`, `type` (défaut `website`) et les deux images de `layout.tsx:41-52` (constante exportée `DEFAULT_OG_IMAGES`, réutilisée par le layout).

- [ ] **Step 1 : test** `OpenGraph et canonique sur chaque page` : pour chaque entrée de `PAGES` sauf `not-found`, `meta[property="og:image"]` existe, `meta[property="og:url"]` vaut `https://www.macar.be` + `path` (accueil : `https://www.macar.be/`), et `link[rel="canonical"]` pointe vers la même URL.
- [ ] **Step 2 : lancer**, attendu FAIL (24 pages sans `og:image`, `og:url` faux sur `/about` et `/job`).
- [ ] **Step 3 : implémenter** `pageOpenGraph` et l'utiliser dans chaque page ; ajouter `alternates.canonical` là où il manque (l'accueil : `"/"`).
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `fix: give every page its own OpenGraph image, url and canonical`

### Task 5 : page `/zones` et fil d'Ariane des communes

**Files:**
- Create: `src/app/zones/page.tsx`
- Modify: `src/app/zones/[slug]/page.tsx:70`
- Modify: `src/app/_components/footer.tsx` (lien « Zones desservies » dans la colonne Entreprise)
- Modify: `src/app/sitemap.ts`, `e2e/helpers.mjs` (`PAGES` : `{ slug: "zones", path: "/zones" }`), `public/llms.txt`
- Test: `e2e/tests/zones.spec.mjs` (nouveau)

- [ ] **Step 1 : tests** dans `zones.spec.mjs` :
  - `/zones : une page qui liste chaque commune` : statut 200, une seule `h1`, un lien vers `/zones/<slug>` pour chaque commune de `communes.ts` (liste recopiée dans le test), canonique `/zones`.
  - `fil d'Ariane d'une commune` : sur `/zones/ixelles`, le `BreadcrumbList` a 3 éléments, le 2e `item` vaut `https://www.macar.be/zones`.
  - `pied de page : lien vers les zones` : `footer` contient un lien « Zones desservies » vers `/zones`.
  - `sitemap : /zones présent` : `GET /sitemap.xml` contient `https://www.macar.be/zones</loc>`.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter.** Page serveur, `Screen` + `MainHeading` comme les pages de commune ; `h1` « Zones desservies par Macar » ; phrase de référence en introduction ; liste des communes en `ButtonLink variant="tertiary"` (même rendu que « Autres zones desservies ») ; `Breadcrumbs` Accueil / Zones ; métadonnées avec `pageOpenGraph`. Pas de lien dans la barre de navigation (le menu reste tel quel).
- [ ] **Step 4 : lancer** `zones.spec.mjs` et `layout.spec.mjs`, attendu PASS.
- [ ] **Step 5 : commit** `feat: add a /zones hub and fix the commune breadcrumb`

### Task 6 : sitemap sans fausses dates de modification

**Files:**
- Modify: `src/app/sitemap.ts`
- Test: `e2e/tests/seo.spec.mjs`

- [ ] **Step 1 : test** `sitemap : lastmod seulement sur les articles` : dans `/sitemap.xml`, l'entrée de `/about` n'a pas de `<lastmod>`, l'entrée de `/blog/isolation-facade` a un `<lastmod>` égal à son `dateModified`.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter.** Retirer `lastModified: now` des pages statiques et des communes ; retirer `changeFrequency` et `priority` partout (ignorés par Google) ; garder `lastModified` des articles.
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `fix: only date the sitemap entries whose date is known`

### Task 7 : en-têtes de sécurité et manifeste

**Files:**
- Modify: `next.config.js` (fonction `headers()`)
- Modify: `public/favicon/site.webmanifest:6,11` (`/favicon/android-chrome-192x192.png`, `/favicon/android-chrome-512x512.png`)
- Test: `e2e/tests/seo.spec.mjs`

- [ ] **Step 1 : tests.**
  - `en-têtes de sécurité` : la réponse de `/` porte `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `x-frame-options: SAMEORIGIN`, `permissions-policy: camera=(), microphone=(), geolocation=()`.
  - `icônes du manifeste` : chaque `src` de `/favicon/site.webmanifest` répond 200.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter** `headers()` sur `source: "/:path*"` avec ces quatre en-têtes. Pas de Content-Security-Policy dans cette branche.
- [ ] **Step 4 : lancer** ce test puis `consent-mode`, `meta-pixel`, `form`, `conversions`, attendu PASS.
- [ ] **Step 5 : commit** `fix: send security headers and fix the manifest icon paths`

### Task 8 : données structurées (avis, site, offre d'emploi, articles, services)

**Files:**
- Modify: `src/lib/seo/localBusiness.ts:8` (`RATING.count` à `20`), `:107-144` (`@id` des services)
- Modify: `src/data/reviews.ts` et le composant qui affiche `relativeTime` (`src/components/GoogleReviews.tsx`)
- Modify: `src/app/layout.tsx` (bloc `WebSite`)
- Modify: `src/app/job/page.tsx` (bloc `JobPosting`)
- Modify: `src/app/blog/[slug]/page.tsx` (`BlogPosting`, auteur `Person`), `content/blog/*.mdx` (`author: "Shkelzen Shalaj"`)
- Modify: les blocs `Service` des pages `src/app/services/*/page.tsx`
- Test: `e2e/tests/seo.spec.mjs`, `e2e/tests/reviews.spec.mjs`

**Interfaces :**
- Produit : `serviceId(id: string): string` dans `src/lib/seo/localBusiness.ts`, qui retourne `https://www.macar.be/services/${id}#service`, utilisé par l'`OfferCatalog` et par chaque page de service.

- [ ] **Step 1 : tests.**
  - `avis : 20 sur la fiche` : `aggregateRating.reviewCount` vaut `"20"` ; le badge de l'accueil affiche « 20 avis ».
  - `avis : pas de date relative figée` : aucune carte d'avis ne contient `Il y a`.
  - `WebSite` : sur `/`, un bloc `@type: "WebSite"` avec `@id: "https://www.macar.be/#website"`, `inLanguage: "fr-BE"`, `publisher["@id"]` = `LOCAL_BUSINESS_ID`.
  - `JobPosting` : sur `/job`, `title: "Ouvrier polyvalent (Indépendant)"`, `employmentType: "CONTRACTOR"`, `hiringOrganization["@id"]` = `LOCAL_BUSINESS_ID`, `jobLocation.address.postalCode: "1020"`, `datePosted` et `validThrough` au format `YYYY-MM-DD`, `validThrough` postérieur à la date du test.
  - `BlogPosting` : sur `/blog/isolation-facade`, `@type: "BlogPosting"`, `author["@type"]: "Person"`, `author.name: "Shkelzen Shalaj"`, `datePublished` avec fuseau (`+01:00` ou `Z`).
  - `Service relié` : sur `/services/toiture`, le bloc `Service` a `@id` = `serviceId("toiture")`, le même `@id` que dans l'`OfferCatalog`.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter.** `validThrough` = `datePosted` + 6 mois, en constantes datées en tête de `job/page.tsx` avec un commentaire disant de les relever tant que l'offre est ouverte. Auteur `Person` : `name`, `jobTitle: "Gérant"`, `worksFor: { "@id": LOCAL_BUSINESS_ID }`. Avis : retirer `relativeTime` du type et de l'affichage (pas de date inventée).
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `feat: add WebSite, JobPosting and BlogPosting data, link services and update the review count`

### Relecture de fin de phase 1

- [x] Relecture indépendante de toute la phase (agent neuf, modèle le plus capable) sur le diff `dab66f8..9e6f7ed` : 4 points importants corrigés dans `43466db` (chacun avec un test vu en échec puis au vert, suite 231/231), 6 points mineurs reportés et listés dans le registre.

## Phase 2 : contenu (relecture par Macar avant fusion)

Chaque tâche de cette phase liste dans la description de la PR les phrases ajoutées ou retirées, pour relecture.

### Task 9 : blog conforme aux règles éditoriales

**Files:**
- Modify: `content/blog/prix-renovation-toiture.mdx` (lignes 27, 37, 75-84, 88, 96), `content/blog/isolation-facade.mdx` (104-111, 117, 129), `content/blog/degats-eaux-toiture-sinistre-assurance.mdx` (75-77, 86-93) ; `dateModified` des trois à la date du commit
- Test: `e2e/tests/blog.spec.mjs`

- [ ] **Step 1 : test** `articles : aucun délai chiffré, aucun montant, échafaudage à part` : pour chaque article publié, le texte de `article` ne correspond à aucune de `/\d+\s*(à\s*\d+\s*)?(jours?|semaines?|mois)\b/i`, `/€|euros?/i`, `/fourchettes? indicatives?/i`, `/échafaudage\s+compris/i`, `/garantie décennale/i`.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : réécrire.**
  - Durées de chantier et délais d'expert, d'assureur ou de devis : remplacer par « cela dépend du chantier, de la météo » ou « de l'assureur ».
  - « plusieurs centaines d'euros par jour » (grue) : dire que la grue ou le treuil s'ajoute au devis.
  - « l'ardoise naturelle est la plus chère, l'ardoise fibrociment plus accessible » et autres comparaisons de prix : dire que le matériau fait varier le devis.
  - Section « Postes les plus fréquents, et fourchettes indicatives » : supprimer le titre et le paragraphe vide.
  - `isolation-facade.mdx:129` : « échafaudage et évacuation des déchets compris » devient « l'échafaudage, toujours chiffré à part, et l'évacuation des déchets ».
  - Question « Quelle garantie sur les travaux ? » : dire que Macar est assuré en responsabilité civile professionnelle et suit la pose en cas de défaut constaté ; ne plus parler de garantie décennale.
  - Garder la mention « devis valable 30 jours » et l'échéancier 5 / 40 / 45 / 10 %.
- [ ] **Step 4 : lancer** `blog.spec.mjs`, attendu PASS ; relire les trois articles pour vérifier qu'aucune phrase n'a perdu son sens.
- [ ] **Step 5 : commit** `content: bring the blog back in line with the editorial rules`

Le renommage du slug `prix-renovation-toiture` n'est **pas** dans cette branche : à décider après lecture de ses positions dans Search Console.

### Task 10 : pages de service (sinistres, urgences, copropriétés, châssis)

**Files:**
- Modify: `src/lib/services.ts` (`toitureDetailCategories`, `plomberieDetailCategories`, `renovationDetailCategories`, `detailIntro` de plomberie et toiture, `chips`)
- Modify: `public/llms.txt` (description des services)
- Test: `e2e/tests/service-pages.spec.mjs`

- [ ] **Step 1 : tests.**
  - `toiture : sinistres et rapport d'expert` : `/services/toiture` contient « sinistre » et « rapport d'expert » et un lien vers `/blog/degats-eaux-toiture-sinistre-assurance`.
  - `plomberie : urgences en journée` : `/services/plomberie` contient « urgences en journée » dans le premier écran (avant le premier `h2`).
  - `rénovation : châssis et fenêtres` : `/services/renovation` contient une catégorie « Châssis et fenêtres ».
  - `copropriétés` : `/services/toiture` et `/services/renovation` contiennent « copropriété ».
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter.**
  - Toiture : catégorie « Sinistres et dégâts des eaux » (travaux suite à rapport d'expert d'assurance, devis aligné sur les postes du rapport, remise en état après infiltration) et lien vers l'article sinistre ; `detailIntro` : particuliers, propriétaires bailleurs, syndics et copropriétés.
  - Plomberie : `detailIntro` qui dit « urgences en journée, du lundi au vendredi » (horaires du JSON-LD : 8 h à 17 h).
  - Rénovation : catégorie « Châssis et fenêtres » : remplacement de châssis PVC (oscillo-battants, fixes, levant-coulissants), double ou triple vitrage, démontage et évacuation des anciens châssis, finitions intérieures autour du châssis.
  - Aucun prix, aucun délai, aucune marque de fabricant.
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `content: cover insurance claims, daytime emergencies, co-ownerships and window frames`

### Task 11 : textes des communes et trois communes manquantes

**Files:**
- Modify: `src/app/zones/[slug]/intros.ts:14-24` (10 textes à `null`)
- Modify: `src/lib/seo/communes.ts` (ajout `auderghem` 1160, `watermael-boitsfort` 1170, `saint-josse-ten-noode` 1210)
- Modify: `e2e/helpers.mjs` (`PAGES` : `zones-auderghem`), `public/llms.txt`
- Test: `e2e/tests/zones.spec.mjs`

- [ ] **Step 1 : tests.**
  - `chaque commune a son texte` : pour chaque slug de la liste (19 communes), la page répond 200 et le paragraphe d'introduction compte au moins 120 mots.
  - `textes différents` : en comparant les introductions deux à deux (ensembles de mots de 4 lettres et plus, après retrait du nom de commune), la similarité de Jaccard est inférieure à 0,5.
  - `19 communes dans le sitemap et llms.txt` : `/sitemap.xml` contient 19 URL `/zones/<slug>` et `/llms.txt` 19 liens `/zones/<slug>` (sans écrire « 19 communes » en toutes lettres, cf. test de la Task 2).
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : rédiger** un texte de 150 à 220 mots par commune, sur le modèle d'`ixelles` : caractère du bâti et des quartiers (faits vérifiables sur la commune), puis les travaux Macar qui s'y rapportent, pris dans `services.ts`. Interdits : prix, délais, noms de rue, noms de clients, fréquence d'intervention non vérifiée (« très fréquemment », « régulièrement »). Supprimer le texte de repli `placeholder` de `page.tsx` et rendre `intros` de type `Record<string, string>` pour que la compilation échoue si une commune n'a pas de texte.
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `content: write an introduction for every Brussels commune`

### Task 12 : page À propos

**Files:**
- Modify: `src/app/about/page.tsx`
- Test: `e2e/tests/legal.spec.mjs` (ou nouveau test dans `seo.spec.mjs`)

- [ ] **Step 1 : test** `À propos : gérant et assurance` : `/about` contient « Shkelzen Shalaj », « responsabilité civile », « 2002 » et « 2010 », et ne contient pas « décennale » ni « dans les temps ».
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : rédiger.** Fondation en 2002, reprise par l'équipe actuelle en 2010, gérant Shkelzen Shalaj, métiers (les quatre services, plus les châssis), zone (phrase de référence), assurance RC professionnelle, façon de travailler (visite, devis détaillé valable 30 jours, échéancier 5 / 40 / 45 / 10 %, échafaudage chiffré à part). Retirer « dans les temps ». Ajouter un bloc `AboutPage` relié à `LOCAL_BUSINESS_ID`.
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `content: tell who runs Macar and how it works on the about page`

### Relecture de fin de phase 2

- [x] Relecture indépendante du diff de la phase (agent neuf, modèle le plus capable), en plus de la relecture du texte par Macar : affirmations vérifiables, règles éditoriales de `CLAUDE.md`, faits confirmés ci-dessus. Points critiques et importants corrigés avec un test vu en échec puis au vert ; mineurs listés.

## Phase 3 : mobile et performance

### Task 13 : contenu visible sans attendre le JavaScript

**Files:**
- Modify: `src/app/_components/screen.tsx:29-31`
- Test: `e2e/tests/home.spec.mjs`

**Interfaces :**
- Produit : prop `animate?: boolean` de `Screen` (défaut `true`) ; à `false`, rendu sans `motion.div` (simple `div`). Utilisée par le premier `Screen` de l'accueil, des pages de service, des communes, de `/zones` et des articles.

- [ ] **Step 1 : test** `premier écran visible sans JavaScript` : contexte `javaScriptEnabled: false`, sur `/`, `/services/toiture`, `/zones/ixelles` : `getComputedStyle(h1).opacity` vaut `"1"` pour le `h1` et tous ses ancêtres.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter** la prop et la passer à `false` sur les premiers écrans listés.
- [ ] **Step 4 : lancer**, attendu PASS.
- [ ] **Step 5 : commit** `perf: render the first screen visible before hydration`

### Task 14 : bouton d'appel au premier écran sur mobile

**Files:**
- Modify: `src/app/_components/HomeView.tsx` (premier écran), `src/app/zones/[slug]/page.tsx:89-91`
- Test: `e2e/tests/home.spec.mjs`, `e2e/tests/zones.spec.mjs`

- [ ] **Step 1 : tests** à 375 × 812 sur `/` et `/zones/ixelles` : un lien `a[href="tel:+32478235008"]` est entièrement visible sans défiler (cookie déjà refusé avec `prepare`), et le lien de devis aussi.
- [ ] **Step 2 : lancer**, attendu FAIL.
- [ ] **Step 3 : implémenter** en reprenant le bouton « Appeler le 0478 23 50 08 » de `ServiceDetailBody.tsx` (`PHONE_HREF`) ; le clic reste compté par `ConversionTracking`. Sur les communes, l'introduction passe sous les deux boutons si nécessaire.
- [ ] **Step 4 : lancer**, plus `conversions.spec.mjs`, attendu PASS.
- [ ] **Step 5 : commit** `feat: show the call button in the first screen on mobile`

### Task 15 : poids de la page

**Files:**
- Modify: `public/fonts/raptor/` (ajout `Semibold.woff2`), `src/app/layout.tsx:19`
- Modify: `src/components/GoogleReviews.tsx:109`
- Modify: `src/app/_components/ServiceSection.tsx:45`, `src/app/services/page.tsx:112`, `src/app/zones/[slug]/page.tsx:110` (flèche « → »)
- Modify: `src/app/_components/logocarousel.tsx:64,95`
- Modify: `src/components/contact_form.tsx` (retirer `axios`) et `package.json`
- Modify: `next.config.js` (`images.formats: ["image/avif", "image/webp"]`, `images.minimumCacheTTL: 2678400`)
- Test: `e2e/tests/home.spec.mjs`, `e2e/tests/form.spec.mjs`

- [ ] **Step 1 : tests.**
  - `police des titres en woff2` : sur `/`, aucune requête vers un fichier `.otf`.
  - `logos partenaires` : chaque `img` du défilement a un `alt` qui commence par « Logo » et un attribut `sizes` différent de `100vw`.
  - Les tests existants du formulaire (`form.spec.mjs`, succès Formspree intercepté) repassent après le retrait d'`axios`.
- [ ] **Step 2 : lancer**, attendu FAIL sur les deux nouveaux tests.
- [ ] **Step 3 : implémenter.**
  - `pyftsubset Semibold.otf --flavor=woff2 --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122" --output-file=Semibold.woff2` (installer `fonttools` et `brotli` dans un environnement Python si besoin), puis pointer `localFont` vers le `.woff2`.
  - Avis : remplacer le `setInterval` de 30 ms par une animation CSS ou un `requestAnimationFrame` qui ne lit pas la mise en page à chaque image (le comportement visible reste le même, `reviews.spec.mjs` repasse).
  - Flèche : icône `ArrowRight` de `lucide-react` (déjà installé) avec `aria-hidden`.
  - Logos : `sizes="116px"`, `alt` « Logo <nom du partenaire> » au lieu du nom de fichier, `aria-hidden` sur les copies dupliquées par le défilement pour qu'un lecteur d'écran ne lise chaque logo qu'une fois.
  - Formulaire : `fetch` au lieu d'`axios`, même charge utile et mêmes champs ajoutés (`origine`, `page`, `gclid`), puis `npm uninstall axios`.
- [ ] **Step 4 : lancer** `npm run build` puis toute la suite e2e, attendu PASS.
- [ ] **Step 5 : commit** `perf: lighter font, reviews, icons, logos and form request`

### Relecture de fin de phase 3

- [ ] Relecture indépendante du diff de la phase (agent neuf, modèle le plus capable) ; mêmes règles de correction qu'aux phases 1 et 2.

## Fin de branche

- [ ] Mettre à jour `CLAUDE.md` (section Architecture) : page hub `/zones`, aide `pageOpenGraph`, `serviceId`, `Screen animate`.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e` : tout passe.
- [ ] Vérification visuelle Playwright MCP à 375 et 1440 px sur `/`, `/zones`, `/zones/ixelles`, `/services/toiture`, `/blog/isolation-facade`, `/about` (captures dans un dossier temporaire).
- [ ] PR vers `dev` : résumé par phase, liste des textes ajoutés ou retirés (phase 2) pour relecture par Macar.

## Hors de cette branche

- Fiche Google : doublon « MACAR SA » laissé en l'état (décision du 23/11/2026) ; invitation propriétaire du compte perso à accepter ; catégories et services de la fiche à compléter dans Google Business Profile.
- Bing Webmaster Tools, IndexNow, variables `NEXT_PUBLIC_GSC_TOKEN` et `NEXT_PUBLIC_BING_TOKEN` sur Vercel.
- Content-Security-Policy (à introduire d'abord en `Report-Only`).
- Version néerlandaise, photos de chantier, nouveaux articles du plan de blog, renommage du slug `prix-renovation-toiture`.
- Bandeau cookies plus compact sur mobile et zones tactiles de 44 px (changement de design à valider à part).
