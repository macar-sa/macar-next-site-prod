# Bannière cookies (M.1) : contexte et points à tenir pour que la mesure (M.2) puisse se brancher dessus

Rédigé le 17 octobre 2026 pour la personne (et l'agent IA) qui travaille sur la branche M.1 « bannière cookies conforme et mode Consentement v2 ». La tâche M.2 « compter les envois du formulaire et les clics téléphone » sera faite sur une autre branche, par-dessus M.1. Ce document dit ce que M.2 attend de M.1 et ce qu'il faut éviter de casser.

## 1. Pourquoi on fait ça

Macar va lancer des Annonces Local Services puis Google Ads (voir `# Sales / 01 Publicité / Macar - Planning publicité.xlsx`, tâches M.1, M.2, M.3, G.2). Pour juger ces pubs il faut compter les demandes de devis et les clics téléphone, puis les importer comme conversions dans Google Ads. Deux contraintes rendent M.1 indispensable avant M.2 :

- Google exige les signaux **Consent Mode v2** pour mesurer les pubs auprès des visiteurs de l'EEE. Sans eux, les conversions importées dans Google Ads ne sont pas prises en compte.
- La bannière actuelle n'est pas conforme : elle charge Google Analytics pour tout le monde et traite « Refuser tout » comme un accord.

## 2. État actuel du code (vérifié le 17 octobre 2026)

| Fichier | Ce qu'il fait aujourd'hui |
|---|---|
| `src/app/_components/CookieConsent.tsx` | Trois boutons (Refuser tout, Préférences, Accepter tout). **Les trois écrivent le même cookie** `macar_cookie_consent_is_true=true` (365 jours). Trois catégories : Essentiels (verrouillé), Analytique, Les fonctionnalités. Les interrupteurs sont **pré-cochés** (`defaultSelected`) et leur état n'est lu nulle part. Une fois le cookie posé, aucun moyen de rouvrir la bannière. |
| `src/app/layout.tsx` | Charge `gtag.js` et fait `gtag('config', gaId)` via `next/script` (`afterInteractive`) **sans regarder le consentement**. Seul garde-fou : `window.location.hostname !== 'localhost'`. Aucun `gtag('consent', 'default', ...)`. `<Analytics />` de Vercel est monté dans le body (sans cookie). |
| Variables d'env | `NEXT_PUBLIC_GOOGLE_ANALYTICS` (GA4, actif en prod), `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` (définie mais **jamais utilisée** dans le code), `NEXT_PUBLIC_FORMSPREE_ENDPOINT`. |
| `src/app/politique-cookies/page.tsx` | Tableau de 4 lignes : `_ga`, `_ga_*`, « Vercel Analytics », `macar_cookie_consent_is_true`. La section « Gestion de votre consentement » dit de **supprimer le cookie dans le navigateur** pour revoir la bannière. |
| `src/app/politique-confidentialite/page.tsx` | Base légale « consentement recueilli via la bannière cookies » pour la mesure d'audience. Sous-traitants listés : Formspree, Vercel, Google Ireland (GA4). |
| `e2e/helpers.mjs` | `CONSENT_COOKIE = { name: "macar_cookie_consent_is_true", value: "true" }`, posé par `prepare()` dans **tous** les tests pour cacher la bannière. Toute requête externe (dont `googletagmanager.com`) est bloquée. |
| `e2e/tests/cookies.spec.mjs` | 4 tests qui figent l'**ancien** comportement : « Accepter tout » pose le cookie `true`, les 3 interrupteurs sont cochés par défaut, etc. À réécrire avec le nouveau comportement, pas à supprimer. |
| `e2e/tests/legal.spec.mjs` | Vérifie les 4 noms de lignes du tableau cookies (`ROWS`). À adapter si le nom du cookie change. |

## 3. Ce que M.1 doit garantir (règles)

Côté droit (en principe, à confirmer si besoin sur autoriteprotectiondonnees.be) :

1. **Aucun cookie non essentiel ni aucun script Google avant un choix explicite.** Le silence ou la navigation ne vaut pas accord.
2. **Refuser aussi facile qu'accepter** : même niveau, même visibilité, un seul clic.
3. **Pas de case pré-cochée** pour une catégorie facultative.
4. **Le choix doit être mémorisé par catégorie**, avec la date et une version de la bannière, et redemandé après un délai raisonnable (6 mois est la durée couramment recommandée, 13 mois est le maximum admis pour la durée du cookie).
5. **Le visiteur doit pouvoir changer d'avis à tout moment** : un lien « Gérer mes cookies » (pied de page et page Politique cookies) qui rouvre la bannière. Remplacer dans la politique cookies l'instruction « supprimez le cookie dans votre navigateur ».
6. Les pages légales décrivent la réalité : nom du nouveau cookie, durée, catégories, et plus tard Google Ads et Meta.

Côté Google (Consent Mode v2) :

7. Les quatre signaux doivent exister : `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`. Le `gtag('consent', 'default', { ... tous 'denied' ... })` doit être poussé dans `dataLayer` **avant** que `gtag.js` ne soit chargé, puis `gtag('consent', 'update', { ... })` au choix du visiteur, et à chaque visite suivante dès que le cookie de consentement est lu.
8. **Il faut une catégorie « Publicité » (marketing)** en plus de « Analytique ». La catégorie « Les fonctionnalités » actuelle ne correspond à rien dans le code : la remplacer ou la supprimer. Correspondance proposée :
   - Analytique → `analytics_storage`
   - Publicité → `ad_storage`, `ad_user_data`, `ad_personalization` (et plus tard le pixel Meta)
   Sans `ad_storage` accordé, une conversion GA4 importée dans Google Ads ne peut pas être attribuée au clic sur la pub, donc M.2 et G.2 perdent leur sens.
9. **Mode recommandé : « basique »**, c'est-à-dire ne pas charger `gtag.js` du tout tant que rien n'est accordé. Le mode « avancé » de Google (pings sans cookie quand le visiteur refuse) sert à modéliser les conversions manquantes, mais la modélisation ne s'active qu'à partir de plusieurs centaines de clics pub par jour. Au budget de Macar elle ne se déclenchera jamais, et le mode basique est plus simple à défendre juridiquement.
10. Vercel Analytics ne pose pas de cookie et peut rester chargé en continu au titre de la mesure d'audience exemptée, comme la politique cookies le décrit déjà. À garder cohérent dans le texte.

## 4. L'interface dont M.2 a besoin

M.2 va appeler `gtag('event', 'generate_lead', ...)` au succès du formulaire et `gtag('event', 'phone_click', ...)` sur les liens `tel:`. Pour que ça marche sans retoucher la bannière, M.1 devrait fournir :

1. **Un module unique de consentement**, par exemple `src/lib/consent.ts`, qui exporte au minimum :
   - le type des catégories (`analytics`, `marketing`) ;
   - `readConsent()` qui renvoie `{ analytics: boolean; marketing: boolean; at: string; version: number } | null` (null = pas encore choisi) ;
   - une façon de s'abonner aux changements (événement DOM personnalisé ou callback), pour que le chargement de Google et le pixel Meta réagissent au choix sans recharger la page.
   Le format exact du cookie est votre choix, mais il doit être **lisible par Playwright** pour poser directement « tout accepté » et « tout refusé » dans les tests.

2. **Le chargement de Google isolé dans un composant client dédié**, par exemple `src/app/_components/GoogleTag.tsx`, monté dans `layout.tsx` à la place du bloc `<Script>` actuel. Il :
   - crée `window.dataLayer` et la fonction `window.gtag` **immédiatement**, même avant tout consentement (ce sont de simples pushs dans un tableau, pas un cookie) ;
   - pousse le `consent default` à denied ;
   - ne charge le script `gtag.js` et n'appelle `gtag('config', gaId)` que lorsque `analytics` est accordé ;
   - pousse `consent update` à chaque changement.
   Intérêt pour M.2 : son utilitaire d'événements pourra simplement faire `window.gtag?.('event', ...)`, et les tests Playwright pourront lire `window.dataLayer` même si le script Google est bloqué par le réseau de test (ce qui est le cas dans `e2e/helpers.mjs`).

3. **Un garde-fou environnement** à la place du test sur `localhost` : ne rien charger si `NEXT_PUBLIC_GOOGLE_ANALYTICS` est absent, et garder le blocage réseau des tests comme deuxième barrière.

4. **Dans `e2e/helpers.mjs`**, remplacer `CONSENT_COOKIE` par deux préréglages (`tout accepté`, `tout refusé`) et garder `prepare(context, baseURL, { consent })` compatible, parce que tous les autres tests l'utilisent. M.2 ajoutera ses tests sur `dataLayer`.

## 5. Répartition pour éviter les conflits de fusion

| Branche M.1 (vous) | Branche M.2 (ensuite) |
|---|---|
| `CookieConsent.tsx`, nouveau module de consentement, nouveau composant de chargement Google, bloc Google dans `layout.tsx` | `src/components/contact_form.tsx` (événement au succès Formspree) |
| Lien « Gérer mes cookies » dans `footer.tsx` | Liens `tel:` dans `footer.tsx` et `HomeView.tsx` (événement au clic) |
| Pages légales : section gestion du consentement, nom et durée du cookie, catégories | Pages légales : ajout de Google Ads (et Meta) comme destinataires quand G.2 arrive |
| `e2e/helpers.mjs`, `e2e/tests/cookies.spec.mjs`, `e2e/tests/legal.spec.mjs` | Nouveaux tests sur les événements, `e2e/tests/form.spec.mjs` |

Le pixel Meta (`NEXT_PUBLIC_FACEBOOK_PIXEL_ID`) n'est pas à brancher dans M.1 : prévoir seulement que la catégorie Publicité existe pour qu'il puisse s'y accrocher plus tard.

## 6. Conventions du dépôt à respecter

- Branche partant de `dev`, PR vers `dev`. Le workflow GitHub lance lint, types, build et la suite Playwright.
- HeroUI v3 natif : consulter le serveur MCP `heroui-react` avant de modifier la bannière (composants composés `Card`, `Switch`, `Button`, `Modal` ou `Drawer` si vous voulez une vraie fenêtre de préférences). Aucune classe ne doit modifier le style d'un composant HeroUI.
- Textes visibles : pas de tiret long, ton direct. Les textes de la bannière et des pages légales sont lus par de vrais clients.
- Tester dans le navigateur (MCP `playwright`) en 375 px et 1440 px : la bannière ne doit rien masquer d'important sur mobile et doit rester utilisable au clavier (Tab, Entrée, Échap).
- Spec dans `superpowers/specs/AAAA-MM-JJ-<sujet>-design.md`, plan dans `superpowers/plans/`.

## 7. Liste de contrôle de fin de M.1

- [ ] Première visite sans cookie : aucune requête vers `googletagmanager.com` ni `google-analytics.com`, aucun cookie `_ga`.
- [ ] « Refuser tout » : cookie de consentement avec toutes les catégories à `false`, toujours aucune requête Google, bannière fermée.
- [ ] « Accepter tout » : `gtag.js` chargé, `dataLayer` contient `consent default` (denied) **puis** `consent update` (granted) **puis** `config`.
- [ ] Préférences : Analytique seul accordé → `analytics_storage: granted`, les trois `ad_*` restent `denied`.
- [ ] Visite suivante avec cookie « accepté » : Google se charge sans réafficher la bannière, `consent update` renvoyé.
- [ ] « Gérer mes cookies » rouvre la bannière avec l'état enregistré, et un changement est appliqué sans recharger.
- [ ] Pages légales à jour (nom du cookie, durée, catégories, procédure de retrait).
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e` passent.

## Sources utiles

- Google, « Consent Mode » et « Consentement des utilisateurs de l'EEE » (Aide Google Ads et Google Tag).
- Autorité de protection des données (Belgique), recommandations sur les cookies et les bannières.
- Planning et stratégie pub : `# Sales / 01 Publicité / Macar - Planning publicité.xlsx` et `Macar - Stratégie et roadmap publicité.docx`.
