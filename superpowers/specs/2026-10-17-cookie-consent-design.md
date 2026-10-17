# Bandeau cookies conforme et mode consentement v2 de Google (M.1) : design

- Date : 2026-10-17
- Branche : `Cookie-consent` (M.1), à faire partir de `dev`
- Statut : design discuté en conversation, à relire avant le plan
- Contexte imposé par la tâche suivante : `superpowers/specs/2026-10-17-cookies-m1-contexte-pour-m2.md`. M.2, « compter les envois du formulaire et les clics téléphone », se fera sur une autre branche par-dessus M.1. Ce document reprend tout ce que M.2 attend de M.1 ; en cas de doute, le document de contexte fait foi sur l'interface (section 7).

## 1. Pourquoi

Le bandeau actuel (`src/app/_components/CookieConsent.tsx`) n'est qu'un affichage :

- « Refuser tout », « Accepter tout » et « Accepter la sélection » font la même chose : ils posent le cookie `macar_cookie_consent_is_true=true` (365 jours) et ferment le bandeau.
- Google Analytics 4 se charge pour tous les visiteurs dès la première page (`src/app/layout.tsx`), avant tout choix et même après un refus. Il n'y a aucun `gtag('consent', 'default', …)`.
- Les interrupteurs des préférences sont cochés par défaut et leur état n'est lu nulle part.
- Une fois le cookie posé, rien ne permet de rouvrir le bandeau ; la politique cookies dit de supprimer le cookie dans le navigateur.
- La catégorie « Les fonctionnalités » ne correspond à aucun cookie : le site n'intègre aucun service tiers (Facebook et Google Maps sont de simples liens).

Macar lance bientôt des Annonces Local Services puis Google Ads, et le propriétaire les installe lui-même. Pour juger ces pubs, M.2 comptera les demandes de devis et les clics téléphone, puis le propriétaire les importera comme conversions dans Google Ads. Google exige pour cela les signaux du mode consentement v2 auprès des visiteurs de l'Espace économique européen. M.1 est donc un préalable à M.2.

Le propriétaire veut un bandeau qui respecte vraiment le choix du visiteur et qui suit les règles en vigueur.

**Réussite** : un visiteur qui refuse n'est jamais suivi (aucune requête vers Google, aucun cookie Google) ; un visiteur qui accepte est mesuré avec les bons signaux de consentement ; il peut changer d'avis à tout moment ; M.2 peut se brancher sans retoucher le bandeau ; la liste de contrôle de la section 10 est au vert.

## 2. Règles à respecter (vérifiées sur les sources officielles)

Base légale belge : article 10/2 de la loi du 30 juillet 2018 (inséré par la loi du 21 décembre 2021). Seul ce qui est strictement nécessaire au service demandé par le visiteur est dispensé de consentement. La mesure d'audience par cookies **n'en fait pas partie** (checklist cookies de l'APD, octobre 2023).

D'après la checklist de l'APD (https://www.autoriteprotectiondonnees.be/publications/checklist-cookies.pdf), l'arrêt Planet49 de la CJUE (C-673/17) et le rapport de l'EDPB sur les bandeaux cookies :

1. Rien ne lit ni n'écrit de cookie non essentiel, et aucun script Google ne se charge, avant le choix du visiteur.
2. « Tout refuser » est au premier niveau du bandeau, à côté de « Tout accepter », présenté de la même manière (même variante, même taille), en un clic. Un simple bouton « Paramètres » ne suffit pas.
3. Aucune case cochée d'avance. Ni le défilement ni la fermeture du bandeau ne valent consentement.
4. Un choix séparé par finalité, au plus tard au second niveau.
5. Pas de mur de cookies : le site reste utilisable sans répondre.
6. Retirer son consentement est aussi simple que le donner, et le retrait prend effet.
7. Le cookie qui mémorise le choix est gardé un temps limité : « 6 mois est en principe raisonnable ».
8. Garder une trace datée et numérotée des versions successives du bandeau et de la politique cookies.

Google (https://support.google.com/google-ads/answer/13695607 et la politique de consentement de l'UE) : recueillir le consentement des visiteurs de l'EEE, transmettre les signaux `ad_storage`, `ad_user_data`, `ad_personalization` et `analytics_storage`, conserver une trace des consentements, expliquer comment le retirer. Google n'impose une plateforme de consentement certifiée qu'aux éditeurs AdSense, Ad Manager ou AdMob, pas aux annonceurs : un bandeau fait maison est permis.

## 3. Objectifs, hors périmètre, à éviter

**Objectifs (M.1)**

- Bandeau conforme aux règles de la section 2, avec deux catégories facultatives : Analytique et Publicité.
- Mode consentement v2 de Google en **mode basique**, branché pour Analytics 4.
- Module de consentement et composant de chargement de Google que M.2 réutilise tels quels (section 7).
- Lien « Gérer mes cookies » toujours accessible.
- Politique cookies à jour (cookie de choix, catégories, retrait).
- Préréglages de consentement dans les tests e2e.

**Laissé à M.2 et G.2 (ne pas faire ici)**

- Événements `generate_lead` (formulaire) et `phone_click` (liens `tel:`), dans `contact_form.tsx`, `footer.tsx` (liens `tel:`) et `HomeView.tsx`.
- Google Ads et Meta comme destinataires dans les pages légales, et leurs cookies dans le tableau.
- Le pixel Meta (`NEXT_PUBLIC_FACEBOOK_PIXEL_ID`, définie mais inutilisée) : la catégorie Publicité existe pour qu'il s'y accroche plus tard.
- Une balise Google Ads (`AW-…`) sur le site : les conversions seront des événements GA4 importés dans Google Ads.

**Hors périmètre**

- Une plateforme de consentement payante (Cookiebot, Axeptio…).
- Un registre des consentements côté serveur (le site n'a pas de backend ; voir section 8).
- Google Tag Manager.
- Les photos de profil des avis Google (`lh3.googleusercontent.com`) : simples images, pas de cookie.
- Vercel Analytics : la doc Vercel indique qu'il ne pose aucun cookie et ne garde qu'un hachage valable un jour. Il reste chargé en continu, comme aujourd'hui, et la politique cookies le décrit ainsi.

**À éviter** (ce qui ferait échouer le projet même si tout « marche »)

- Un bandeau conforme en apparence qui laisse passer une requête vers Google avant le choix ou après un refus.
- Un « Tout refuser » moins visible que « Tout accepter » (couleur, taille, position plus discrète).
- Un retrait du consentement qui laisse les cookies Google en place ou laisse Analytics envoyer des données.
- Une interface de consentement que M.2 devrait modifier pour se brancher.

## 4. Mode consentement : basique

Décidé (document de contexte M.2, point 9) : `gtag.js` ne se charge pas tant qu'Analytique n'est pas accordé. Si le visiteur refuse, rien ne part chez Google. Le mode avancé (signaux sans cookie envoyés malgré le refus) sert à modéliser les conversions manquantes, mais Google ne l'active qu'à partir de plusieurs centaines de clics publicitaires par jour, ce que le budget de Macar n'atteindra pas ; et le mode basique est le plus simple à défendre juridiquement.

## 5. Comportement

### Premier niveau du bandeau

- Carte HeroUI v3 en bas de l'écran, comme aujourd'hui, sans voile sur la page (pas de mur). Sur mobile, elle ne masque rien d'important.
- Titre « Cookies » et un texte court : Macar utilise des cookies pour mesurer la fréquentation du site et l'efficacité de ses publicités, seulement avec l'accord du visiteur ; lien vers la politique cookies.
- Trois boutons : **Tout refuser**, **Personnaliser**, **Tout accepter**. « Tout refuser » et « Tout accepter » ont exactement la même variante et la même taille ; « Personnaliser » est en `tertiary`.
- Pas de croix de fermeture, et Échap ne ferme pas le bandeau à la première visite : fermer sans choisir ne doit rien décider.

### Second niveau (Personnaliser)

Trois interrupteurs HeroUI `Switch` :

| Catégorie | Clé dans le code | État au départ | Signaux Google |
|---|---|---|---|
| Essentiels | (aucune) | activé, verrouillé | aucun (cookie de choix seulement) |
| Analytique | `analytics` | **désactivé** | `analytics_storage` |
| Publicité | `marketing` | **désactivé** | `ad_storage`, `ad_user_data`, `ad_personalization` |

Quand le visiteur rouvre ce niveau après un premier choix, les interrupteurs reflètent son choix enregistré.

Boutons : **Tout refuser**, **Enregistrer mes choix**, **Tout accepter**.

Le bandeau se manie entièrement au clavier (Tab, Entrée, Espace sur les interrupteurs).

### Après un choix

1. Le choix est enregistré dans le cookie de consentement (section 6) et annoncé aux abonnés (section 7).
2. Le bandeau se ferme.
3. `gtag('consent', 'update', …)` transmet les quatre signaux (`granted` ou `denied`).
4. Si Analytique est accordé et que `gtag.js` n'est pas encore chargé, il est chargé et `gtag('config', …)` est appelé.
5. Un visiteur qui revient avec un choix valide n'a pas de bandeau ; `consent update` est renvoyé dès la lecture du cookie et `gtag.js` est chargé si Analytique est accordé.

Publicité accordé sans Analytique : les signaux `ad_*` passent à `granted` dans `dataLayer`, mais `gtag.js` ne se charge pas (rien à mesurer sans Analytics tant qu'il n'y a ni balise Ads ni pixel Meta).

### Retrait et changement d'avis

- Lien **« Gérer mes cookies »** dans le pied de page (avec les liens légaux) et bouton du même nom sur la page politique cookies. Ils rouvrent le bandeau au second niveau, avec le choix enregistré.
- Quand le bandeau est rouvert ainsi, un bouton **Annuler** et la touche Échap le referment sans rien changer.
- Un changement s'applique **sans recharger la page** (exigence de M.2).
- Retirer Analytique :
  - envoie `analytics_storage: 'denied'` ;
  - coupe Analytics pour le reste de la visite avec le mécanisme officiel `window['ga-disable-<ID>'] = true`, pour qu'aucun signal sans cookie ne parte ; il repasse à `false` si le visiteur accorde de nouveau Analytique ;
  - supprime `_ga` et `_ga_*` sur le domaine courant et sur le domaine parent (`.macar.be`).
- Retirer Publicité envoie les trois `ad_*` à `denied` et supprime `_gcl_*` et `_gac_*` s'ils existent (prévu pour G.2).

## 6. Données techniques

### Cookie de consentement

- Nom : `macar_consent`.
- Valeur : JSON encodé (`encodeURIComponent`) `{ "analytics": bool, "marketing": bool, "at": "<date ISO>", "version": <nombre> }`. Playwright peut le poser directement.
- Durée : 6 mois (règle 7). `SameSite=Lax`, `path=/`, `Secure` en production.
- Version : une constante dans le module. Un cookie dont la version diffère est ignoré et le bandeau réapparaît. On l'augmente quand le bandeau ou la liste des catégories change de façon importante (par exemple à l'arrivée du pixel Meta).
- L'ancien cookie `macar_cookie_consent_is_true` est supprimé au chargement et n'est pas repris : l'ancien « consentement » n'était pas valable, les visiteurs revoient donc le bandeau une fois.

### Chargement de Google (composant `GoogleTag`)

Composant client dédié, monté dans `layout.tsx` à la place du bloc `<Script>` actuel :

1. crée `window.dataLayer` et `window.gtag` immédiatement, avant tout consentement (de simples ajouts dans un tableau, sans cookie ni requête) ;
2. pousse `gtag('consent', 'default', …)` avec les quatre signaux à `denied`, puis `gtag('set', 'ads_data_redaction', true)` ;
3. lit le consentement ; s'il existe, pousse `consent update` ;
4. si Analytique est accordé et que `NEXT_PUBLIC_GOOGLE_ANALYTICS` est défini : charge `gtag.js`, puis `gtag('js', new Date())` et `gtag('config', <ID>, { cookie_expires: <13 mois en secondes> })` ;
5. s'abonne aux changements de consentement et applique les sections 5 « Après un choix » et « Retrait ».

Ordre attendu dans `dataLayer` après « Tout accepter » : `consent default` (denied), puis `consent update` (granted), puis `config`. Google insiste : le `default` doit précéder toute commande qui envoie des mesures.

**Garde-fou** : le test actuel sur `localhost` disparaît. Sans `NEXT_PUBLIC_GOOGLE_ANALYTICS`, `gtag.js` n'est jamais chargé ; `dataLayer` et `gtag` existent quand même, pour que les appels de M.2 (`window.gtag?.('event', …)`) restent sans effet et que les tests puissent lire `dataLayer`. Le blocage réseau des tests reste la deuxième barrière.

Durée des cookies Analytics : Google les garde 2 ans par défaut. `cookie_expires` la ramène à 13 mois, le chiffre déjà annoncé dans la politique cookies.

Aucune nouvelle variable d'environnement.

## 7. Interface fournie à M.2

Module unique `src/lib/consent.ts` :

- type des catégories : `"analytics" | "marketing"` ;
- `readConsent(): { analytics: boolean; marketing: boolean; at: string; version: number } | null` (`null` = pas encore de choix valide) ;
- `writeConsent(choice)` ;
- abonnement aux changements par un événement DOM personnalisé sur `window` (nom exporté en constante, le choix dans `detail`) et une fonction `onConsentChange(callback)` qui renvoie la fonction de désabonnement ;
- `openConsentPreferences()` (ou équivalent) pour rouvrir le bandeau depuis le pied de page et la politique cookies.

`src/app/_components/GoogleTag.tsx` : composant décrit en section 6.

`e2e/helpers.mjs` : `CONSENT_COOKIE` est remplacé par deux préréglages exportés, « tout accepté » et « tout refusé ». `prepare(context, baseURL, { consent })` reste compatible : `consent: true` (défaut) pose « tout accepté », `consent: false` ne pose rien ; on peut aussi passer un préréglage. Tous les tests existants continuent de passer sans modification de leur appel à `prepare`.

## 8. Preuve du consentement

Le site n'a pas de serveur pour tenir un registre. La preuve repose sur :

- le cookie du visiteur, qui garde la date et la version de son choix ;
- l'historique git, qui garde chaque version du bandeau et de la politique cookies ;
- un numéro de version et une date de mise à jour affichés en bas de la politique cookies, alignés sur la version du consentement.

C'est la limite de l'approche « fait maison » sans backend. Elle est acceptée pour ce projet.

## 9. Textes à mettre à jour

Rédaction en français, sans tiret long, ton direct : ces textes sont lus par de vrais clients.

- **Bandeau** : textes du premier et du second niveau ; descriptions courtes des catégories Analytique (statistiques de fréquentation) et Publicité (mesurer l'efficacité de nos publicités).
- **Politique cookies** (`src/app/politique-cookies/page.tsx`) :
  - tableau : `_ga`, `_ga_*` (13 mois), Vercel Analytics (sans cookie), `macar_consent` (6 mois) à la place de `macar_cookie_consent_is_true` ;
  - section « Gestion de votre consentement » : les catégories, le bouton « Gérer mes cookies » présent sur la page, ce qui se passe au retrait ; retirer l'instruction de supprimer le cookie dans le navigateur ;
  - la phrase « Aucun cookie publicitaire… » reste vraie tant que G.2 n'a rien ajouté : la garder ;
  - date de mise à jour et numéro de version.
- **Politique de confidentialité** : inchangée dans M.1 (elle renvoie déjà à la bannière pour le consentement).
- **Pied de page** (`footer.tsx`) : lien « Gérer mes cookies » avec les liens légaux.

## 10. Contrôles

Liste de contrôle de fin de M.1 (reprise du document de contexte, complétée) :

- Première visite sans cookie : bandeau visible, aucune requête vers `googletagmanager.com` ni `google-analytics.com`, aucun cookie `_ga`, `dataLayer` contient seulement le `consent default`.
- « Tout refuser » : cookie `macar_consent` avec les deux catégories à `false`, aucune requête Google, bandeau fermé.
- « Tout accepter » : requête vers `gtag.js` tentée, `dataLayer` contient `consent default` (denied) puis `consent update` (granted) puis `config`.
- Analytique seul : `analytics_storage: granted`, les trois `ad_*` restent `denied`.
- Publicité seule : `ad_*` à `granted`, `analytics_storage` à `denied`, aucune requête vers `gtag.js`.
- Second niveau : Analytique et Publicité décochés au départ, Essentiels coché et verrouillé.
- « Tout refuser » et « Tout accepter » ont la même variante.
- Visite suivante avec « tout accepté » : pas de bandeau, `consent update` renvoyé, `gtag.js` demandé. Avec l'ancien cookie ou une autre version : bandeau.
- « Gérer mes cookies » (pied de page et politique cookies) rouvre le second niveau avec l'état enregistré ; Annuler et Échap le referment sans rien changer ; un changement s'applique sans recharger.
- Retrait d'Analytique : `consent update` denied, `ga-disable` posé, cookies `_ga` et `_ga_*` posés par le test supprimés.
- Le bandeau ne bloque pas la page (on peut suivre un lien du menu sans répondre).
- Pas de défilement horizontal à 320 px avec le bandeau ouvert.
- Pages légales à jour (nom du cookie, durée, catégories, procédure de retrait).
- `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e` passent.

Tests : `e2e/tests/cookies.spec.mjs` réécrit (pas supprimé), `e2e/helpers.mjs` (section 7), `e2e/tests/legal.spec.mjs` adapté au nouveau nom de cookie. Les tests qui vérifient le chargement de `gtag.js` ont besoin d'un identifiant au build : le workflow `.github/workflows/e2e.yml` construit avec `NEXT_PUBLIC_GOOGLE_ANALYTICS=G-TEST` ; en local, ces tests s'ignorent avec un message clair si le build n'a pas d'identifiant. Les requêtes externes restent bloquées.

Vérification au navigateur (MCP Playwright) en 375 px et 1440 px : bandeau, second niveau, lien du pied de page, clavier.

Après mise en ligne, le propriétaire vérifie avec Tag Assistant de Google que les signaux arrivent.

## 11. Décisions laissées au constructeur

- Découpage interne du bandeau (un composant, ou un composant par niveau) et la façon dont `openConsentPreferences()` atteint le bandeau.
- Variante HeroUI exacte des boutons « Tout refuser » et « Tout accepter », du moment qu'elle est la même pour les deux. Consulter le serveur MCP `heroui-react` avant d'écrire le bandeau ; un `Modal` ou un `Drawer` pour le second niveau est permis s'il ne bloque pas le premier passage.
- Libellés exacts des textes, dans le respect de la section 9.
- Animation d'apparition (celle d'aujourd'hui peut rester).
