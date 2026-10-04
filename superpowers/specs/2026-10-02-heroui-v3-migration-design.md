# Migration vers HeroUI v3 : design

- Date : 2026-10-02
- Branche : `heroui-v3-migration`, créée depuis `dev` (commit `a37ed9e`)
- Statut : design validé en conversation, spec relue de façon contradictoire, à relire par le propriétaire avant le plan d'implémentation

## 1. Objectif et critère de réussite

**Objectif** : passer le site de HeroUI 2.8.8 à HeroUI v3, en gardant un site le plus proche possible du site actuel. Ce n'est pas une refonte.

**Parité stricte**, définie ainsi :

- **Visuelle** : chaque page rend comme aujourd'hui, en desktop et en mobile, y compris :
  - les états ouverts (menu mobile, FAQ, préférences cookies) ;
  - l'état de focus clavier des composants migrés.
- **Comportementale** : on garde les mêmes interactions, les mêmes animations et leur minutage, la même navigation clavier et la même gestion du focus, ainsi que les attributs d'accessibilité exposés aujourd'hui (libellés, états, textes alternatifs). Aucun comportement nouveau n'est ajouté, même s'il serait une amélioration.
- La structure interne du DOM peut changer tant que le rendu et le comportement restent identiques. Le HTML produit doit rester valide.

**Exceptions validées** : ce sont les seules différences acceptées. La liste complète est en section 9.

**Réussite** :

- les deux PR sont mergées dans `dev` (ou la PR unique, en cas de repli, voir section 3) ;
- chaque preview Vercel est validée visuellement par le propriétaire ;
- la comparaison avec la référence ne montre aucune différence hors de la section 9.

## 2. Contexte vérifié

Les faits ci-dessous ont été établis par une recherche, une vérification contradictoire et une relecture de cette spec. Les sources sont en section 12.

- **HeroUI v3 est stable.** `@heroui/react` et `@heroui/styles` sont en 3.2.6 (tag `latest`, 2026-09-17). La 3.0.0 date du 2026-03-21. La v2 est gelée en 2.8.10.
- **Prérequis de la v3** :
  - `react >=19` : déjà satisfait (19.2.6).
  - `tailwindcss >=4` : non satisfait (le projet est en 3.3.5).
  - En dépendances de pair : `react-aria` `^3.52.1`, `react-aria-components` `^1.21.1`, `@react-aria/ssr`, `@react-aria/utils` et `@internationalized/date`.
- **Ce qui change dans la v3** :
  - Elle repose sur React Aria Components, avec des composants composés (`Card.Header`, `Accordion.Trigger`…).
  - Le style est livré par `@heroui/styles` : des classes BEM et des variables CSS déclarées dans une sous-couche de `theme`.
  - Disparaissent : `HeroUIProvider`, le plugin Tailwind `heroui()`, la prop `classNames`, les couleurs `primary`, `secondary`, `content1` à `4`, et les échelles numérotées (`default-100`…).
- **La Navbar n'existe plus en v3.** Le guide officiel recommande de la reconstruire avec des balises HTML et Tailwind.
- **Il n'existe aucun codemod v2 vers v3.**
- **État réel de la production** :
  - `@heroui/react` 2.8.8 embarque `@heroui/theme` 2.4.26. Celui-ci exige Tailwind 4, et npm l'a donc imbriqué sous `node_modules/@heroui/react/node_modules/`.
  - Le glob `./node_modules/@heroui/theme/dist/**` de `tailwind.config.ts` ne correspond à rien. Une classe interne d'un composant HeroUI n'est donc générée que si la même classe apparaît dans `src`, et dans ce cas elle s'applique. Les autres n'existent pas (`h-6`, `text-tiny`, `shadow-medium`, `rounded-large`, `outline-solid`, `bg-divider`, les variantes `data-[...]` internes…).
  - **Le rendu de référence combine donc les classes de l'application et les classes internes v2 qui coïncident avec elles.**
  - Conséquences visibles :
    - les cartes d'avis sont carrées, sans ombre ni padding HeroUI (le padding visible vient des classes de l'application) ;
    - la flèche de la FAQ ne pivote jamais ;
    - les interrupteurs cookies s'affichent comme des cases à cocher natives ;
    - le logo mobile est aligné à droite, et non centré ;
    - les chips sont en forme de pilule (`rounded-full` est compilée), mais sans hauteur ni taille de police HeroUI.
  - La référence de parité est donc le rendu actuel mesuré, pas la documentation HeroUI.
- **Comportements implicites de la Navbar v2**, lus dans `@heroui/navbar` :
  - blocage du scroll avec `usePreventScroll` quand le menu est ouvert ;
  - fermeture du menu à tout changement de largeur de la barre, en ignorant l'apparition ou la disparition de la barre de défilement ;
  - bouton menu de type toggle (`aria-pressed`) ;
  - menu rendu dans un `Overlay` de `@react-aria/overlays` via `portalContainer`. Cet `Overlay` l'enveloppe dans un `FocusScope restoreFocus` sans piège : à la fermeture, le focus revient à l'élément qui l'avait avant l'ouverture (le bouton menu) ;
  - menu monté seulement quand il est ouvert, avec une animation de sortie (`AnimatePresence`, 0,25 s).
- **Comportements implicites de l'Accordion v2**, lus dans `@heroui/accordion`, `@heroui/use-aria-accordion` et `@heroui/framer-utils` :
  - titres en `h2` ;
  - une seule réponse ouverte (`selectionMode="single"`) ;
  - navigation au clavier entre les questions dans `useReactAriaAccordionItem` : flèches haut et bas, Début, Fin, sans boucler, et sans ouvrir la réponse ;
  - réponses fermées absentes du DOM ;
  - ouverture animée par framer-motion : hauteur en ressort de 0,3 s, opacité en 0,4 s. Fermeture en 0,3 s.

## 3. Stratégie

On migre en trois temps sur la branche `heroui-v3-migration` :

1. **Étape 0, référence** : on capture le rendu et le comportement actuels.
2. **Étape 1, Tailwind 4 avec HeroUI v2.** C'est une PR vers `dev`, et elle doit être visuellement neutre.
3. **Étape 2, HeroUI v3**, avec la Navbar reconstruite. C'est une seconde PR vers `dev`.

Les régressions de Tailwind 4 et les changements dus à HeroUI v3 sont ainsi isolés : à l'étape 1, toute différence est une régression.

**Plan de repli** :

- Le seul point non testé est le plugin `heroui()` v2 chargé sous Tailwind 4. S'il se comporte mal à l'étape 1, on fusionne les étapes 1 et 2 en une seule PR. Le contenu de l'étape 2 ne change pas.
- Dans ce cas, les comparaisons prévues entre l'étape 1 et l'étape 2 se font contre la référence de l'étape 0.

Les stratégies écartées sont décrites en section 11.

## 4. Étape 0 : référence

- **Source de la référence** : un build de production local (`next build` puis `next start`) du commit `a37ed9e`, base de la branche. La production macar.be sert seulement de contrôle de cohérence, car elle peut être en retard sur `dev`.
- **Pages capturées** : toutes les routes statiques, une page `/zones/<slug>` et un article de blog. Cela inclut `/`, `/about`, `/services` et les 4 pages service, `/blog`, `/job`, `/mentions-legales`, `/politique-confidentialite` et `/politique-cookies`.
- **Largeurs** : 1280 px et 390 px pour toutes les pages, plus 320 px pour la Navbar.
- **États capturés** :
  - menu mobile ouvert ;
  - FAQ fermée, puis avec une question ouverte ;
  - bandeau cookies, avec les préférences ouvertes ;
  - focus clavier sur une question de FAQ, sur un interrupteur et sur le bouton menu.
- **Animations** :
  - Les captures sont stabilisées : animations terminées, défilement automatique des avis figé, bandeau cookies fermé sauf dans les captures qui lui sont dédiées.
  - On enregistre aussi, image par image ou en vidéo, l'ouverture et la fermeture du menu mobile et d'une question de FAQ, pour en reproduire le minutage.
  - Dans la v2, l'animation de hauteur du menu est en pratique masquée par la classe `min-h-[calc(100dvh-4rem)]`. On reproduit le comportement observé, pas le code.
- **Mesures** :
  - Lighthouse mobile et desktop sur `/` et `/services/renovation`, médiane de 5 exécutions ;
  - le CSS compilé de référence, par classe (voir 8.2) ;
  - les classes présentes dans le DOM rendu de chaque page capturée.
- **Outillage** : les scripts de capture et de comparaison restent **hors du dépôt**. Aucune dépendance n'est ajoutée au projet pour la vérification.

## 5. Étape 1 : Tailwind 4, HeroUI v2 conservé

### 5.1 Dépendances

| Paquet | Action |
|---|---|
| `tailwindcss` | `^3.3.0` vers `~4.3` |
| `@tailwindcss/postcss` | ajouter, `~4.3` |
| `tailwind-merge` | `^2.2.0` vers `^3` (la v3 de tailwind-merge cible Tailwind 4) |
| `@heroui/react` | reste en 2.8.8, la version de la référence (lockfile conservé, pas de mise à jour à l'étape 1) |
| `autoprefixer` | retirer (préfixes intégrés à Tailwind 4) |
| `tailwindcss-animate` | retirer (aucune classe `animate-*` dans `src`) |
| `next-reveal` | retirer (import mort dans `CookieConsent.tsx`, paquet de 2022 qui embarque next 12 et react 18, signalé critique par `npm audit`) |
| `@radix-ui/react-icons` | retirer (jamais importé) |

Retirer ces paquets ne change pas le rendu : aucun n'est utilisé au moment de l'exécution.

### 5.2 Configuration

- `postcss.config.js` : seulement `@tailwindcss/postcss`.
- `src/app/globals.css` contient :
  - `@import "tailwindcss";`
  - un bloc `@theme` qui reprend les couleurs et la police de `tailwind.config.ts` (`background`, `headings`, `text`, `accent1`, `cardbackground`, `bordercard`, `font-sans`) ;
  - dans ce même bloc, **chaque couleur de la palette par défaut utilisée par une classe compilée de la référence**, redéfinie avec sa valeur hexadécimale de Tailwind 3. En effet, Tailwind 4 a changé ces valeurs (oklch). Exemples : `--color-amber-400: #fbbf24` (étoiles des avis), `--color-red-500: #ef4444`, `--color-red-600: #dc2626`, `--color-red-700: #b91c1c`, `--color-gray-100: #f3f4f6`, `--color-gray-300: #d1d5db`, `--color-gray-400: #9ca3af`, `--color-gray-500: #6b7280`, `--color-gray-600: #4b5563`, `--color-blue-100: #dbeafe`, `--color-blue-500: #3b82f6`, ainsi que les `neutral-*` utilisés. La liste exacte est extraite des classes de `src` et du CSS de référence ;
  - le plugin v2, chargé par `@plugin` via un fichier `hero.ts` temporaire. On n'ajoute **pas** de `@source` vers `@heroui/theme`, pour reproduire l'état de la production (voir section 2).
- `tailwind.config.ts` : supprimé.
- `components.json` : la clé `tailwind.config` est vidée, puisque le fichier n'existe plus.

### 5.3 Classes

- On lance l'outil officiel `npx @tailwindcss/upgrade` sur un arbre git propre, puis on relit à la main tout son diff. Lors d'un essai, il a supprimé le plugin `heroui()` et les globs sans prévenir.
- **Renommages attendus** :
  - environ 22 `!` placés en tête de classe passent en fin de classe (`navbar.tsx`, `GoogleReviews.tsx` et les 3 pages légales) ;
  - `flex-shrink-*` (10 occurrences dans 6 fichiers) devient `shrink-*` ;
  - `rounded` devient `rounded-sm` ;
  - `outline-none` devient `outline-hidden` ;
  - `shadow-sm` devient `shadow-xs` ;
  - `backdrop-blur-sm` devient `backdrop-blur-xs` ;
  - `bg-gradient-to-*` devient `bg-linear-to-*`.
- Les anciens noms `flex-shrink-*` et `bg-gradient-to-*` compilent encore en Tailwind 4.3 : les renommer est un nettoyage sans risque.
- **Attention aux classes internes v2 qui deviennent actives à l'étape 1.** Certaines classes que HeroUI v2 pose sur ses propres éléments se mettent à générer du CSS. C'est le cas quand un renommage les fait apparaître dans `src` : `shrink-0`, par exemple, est aussi posé sur les séparateurs de la FAQ et sur l'avatar. C'est aussi le cas quand Tailwind 4 les connaît alors que Tailwind 3.3 ne les connaissait pas (`min-h-16`, `min-w-8`). Elles sont détectées par la comparaison de 8.2 et neutralisées si elles changent le rendu.

### 5.4 Neutraliser les changements de défauts de Tailwind 4

On ajoute dans `globals.css` les blocs de compatibilité du guide officiel de mise à jour, **avec les valeurs littérales de Tailwind 3**. Les blocs du guide utilisent les variables de la palette v4, qui ne donnent pas les mêmes couleurs.

- **Couleur de bordure par défaut** : `#e5e7eb`.
- **Anneau de focus** : `--default-ring-width: 3px; --default-ring-color: rgb(59 130 246 / 0.5);`.
- **Placeholders** : `color: #9ca3af`.
- **Boutons** : `cursor: pointer`.
- **Survol** : comportement de Tailwind 3 restauré avec `@custom-variant hover (&:hover);`.

Les 24 utilitaires `space-x-*` / `space-y-*` changent de sélecteur en Tailwind 4. Ils sont contrôlés par les captures et corrigés au cas par cas si un rendu bouge.

### 5.5 Critère de sortie

- Captures identiques à la référence (section 8).
- CSS compilé par classe : identique, ou différent seulement sans effet visuel, avec une justification écrite dans la PR.
- Contrôles techniques au vert (section 8).

## 6. Étape 2 : HeroUI v3

### 6.1 Dépendances

- `@heroui/react` et `@heroui/styles` en `3.2.6`, à version fixe.
- `react-aria` est déclaré explicitement dans `package.json`, dans la plage `^3.52.1` exigée par `@heroui/react` 3.2.6. C'est une dépendance de pair, et `navbar.tsx` l'importe directement (`usePreventScroll`, `FocusScope`).
- On retire `hero.ts` et le `@plugin` de l'étape 1, ainsi que `@heroui/theme` s'il a été ajouté.
- `framer-motion` reste : il est importé directement par `screen.tsx`, `cards.tsx` et `CookieConsent.tsx`.

### 6.2 CSS et couleurs (`globals.css`)

**Ordre des blocs** :

1. `@import "tailwindcss";`
2. `@import "@heroui/styles";`
3. le `@theme` du site, repris de l'étape 1 ;
4. le `@theme` de compatibilité v2 ;
5. le bloc `:root` hors couche.

Pour une même clé, Tailwind 4 garde la dernière déclaration. Les `@theme` du site, placés après l'import, remplacent donc les clés homonymes du `@theme inline` de HeroUI (`--color-background`, `--color-foreground`…).

**Le bloc `@theme` de compatibilité** recrée les couleurs v2 utilisées par le site : `default-50` à `700`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground` et `foreground`.

- Les valeurs sont recopiées des variables `--heroui-*` du build de référence. Exemples : `--heroui-primary: 212.02 100% 46.67%` (soit `#006FEE`), `--heroui-default-200: 240 5.88% 90%`, `--heroui-foreground: 201.82 24.44% 8.82%` (soit `#11181C`).
- Les 58 classes concernées, réparties dans 8 fichiers, rendent donc à l'identique sans modification : `ServiceDetailBody.tsx`, `zones/[slug]/page.tsx`, `services/page.tsx`, `ServiceSection.tsx`, `components/ui/button.tsx`, `navbar.tsx`, `MdxComponents.tsx` et `HomeView.tsx`.

**Le bloc `:root` hors de tout `@layer`** :

- Les variables HeroUI sont déclarées dans une sous-couche de `theme`. Une déclaration hors couche l'emporte toujours.
- Ce bloc ramène les variables v3 aux valeurs actuelles et reprend la règle racine que posait le plugin v2 :
  - `--background: #F6F8FF`. Sans cette ligne, toutes les classes `bg-background` / `text-background` / `from-background` du site passeraient au gris de la v3.
  - `--border: #e5e7eb`, la bordure par défaut du préflight Tailwind 3. La v3 applique `border-color: var(--border)` à tous les éléments.
  - `--accent: #124FAA` (`accent1`, la couleur de la marque). Le style de focus des composants v3 est neutralisé composant par composant (6.4), donc `--focus` n'a pas d'effet visible.
  - `background-color: #FFFFFF` et `color: hsl(201.82 24.44% 8.82%)` sur `:root`, comme le posait le plugin v2. Le canevas reste blanc (rebond de défilement iOS compris), et la couleur de texte héritée ne change pas.

**Composants shadcn** (`src/components/ui/*`, utilisés par `contact_form.tsx`) :

- Certaines classes de couleur ne produisent aucun CSS aujourd'hui mais s'activeraient en v3, par exemple `hover:bg-accent`, `text-muted-foreground` ou `border-input`.
- Règle : toute classe dont le CSS compilé change entre l'étape 1 et l'étape 2 est corrigée pour retrouver le rendu de l'étape 1. Une classe qui ne produisait rien est retirée.

### 6.3 Provider

- `HeroUIProvider` est retiré.
- `providers.tsx` ne contient plus qu'un `I18nProvider` de React Aria, avec la locale fixe `fr-BE`.
- On ne reprend pas l'exemple officiel qui lit `headers()` : il rendrait toutes les routes dynamiques.
- `layout.tsx` reste inchangé, puisqu'il importe toujours `Providers`.

### 6.4 Composants

**Règle générale** : pour chaque composant, le style par défaut v3 est remplacé par le rendu de référence, c'est-à-dire les styles calculés mesurés à l'étape 0. Les détails ci-dessous sont les écarts connus. Les captures et la comparaison de 8.2 font foi.

#### Accordion (`HomeView.tsx`, FAQ en 2 colonnes de 4 et 3 questions)

**Structure** : `Accordion` > `Accordion.Item` > `Accordion.Heading` > `Accordion.Trigger` (+ `Accordion.Indicator`), puis `Accordion.Panel` > `Accordion.Body`.

**Parité** :

- **Titres en `h2`** : `<Accordion.Heading level={2}>`. Le défaut de React Aria est `h3`.
- Une seule réponse ouverte par colonne.
- **Rendu de référence à reproduire**, à partir des classes appliquées aujourd'hui :
  - racine : `px-2` ;
  - déclencheur : `flex py-4 w-full gap-3 items-center` ;
  - titre : `text-foreground text-sm sm:text-base text-left` (couleur `foreground` v2) ;
  - réponse : `pt-2 pb-4 text-sm text-left`, en couleur héritée (`text-font-gray` n'existe pas) ;
  - une ligne de 1 px `#e5e7eb` entre les questions, mais pas après la dernière.
- **Styles par défaut v3 à neutraliser** :
  - sur `Trigger` : `px-4`, `font-medium` et le fond au survol ;
  - sur la div interne de `Body`, qui reçoit le `className` : `px-4` et `text-muted` ;
  - le séparateur `::after` de `Item`, remis à l'apparence de référence.
- **Focus** : le style de focus v3 du déclencheur (`status-focused` : `ring-2`, `outline-none`) est neutralisé. Le focus garde le contour natif du navigateur, comme dans les captures de référence.
- **Flèche** :
  - `Accordion.Indicator` reçoit le SVG actuel : chevron vers la gauche, path `M15.5 19l-7-7 7-7`, 1em, `stroke-width` 1.5, couleur héritée.
  - Les styles v3 `size-4`, `text-muted` et `-rotate-180` sont retirés.
  - Au repos, la flèche est identique à la référence. À l'ouverture, elle pivote de -90° avec `transition-transform` (150 ms), comme le prévoyait `data-[open=true]:-rotate-90` en v2 (exception 2).
- **Animation du panneau** : on reprend le minutage v2 par une surcharge de `transition` sur `Accordion.Panel`. À l'ouverture : hauteur en 300 ms, opacité en 400 ms. À la fermeture : 300 ms. On vérifie par rapport à l'enregistrement de l'étape 0.
- **Navigation clavier v2 reproduite**, avec un gestionnaire `onKeyDown` sur chaque colonne :
  - Flèche bas et Flèche haut déplacent le focus vers la question suivante ou précédente de la même colonne, sans boucler ;
  - Début et Fin vont à la première et à la dernière question de la colonne ;
  - `preventDefault` est appelé sur ces quatre touches ;
  - le focus se déplace sans ouvrir la réponse.
- **Réponses dans le HTML** : les réponses fermées sont présentes et masquées dans le HTML (`hidden="until-found"`). La recherche dans la page les trouve et ouvre la question (exception 4).
- Le JSON-LD FAQPage n'est pas modifié.

#### Switch x3 (`CookieConsent.tsx`)

**Structure** : `Switch` > `Switch.Content` > `Switch.Control` > `Switch.Thumb`, imposée depuis la 3.2.0.

**Parité** :

- Les cases natives deviennent de vrais interrupteurs (exception 1), en taille `sm`.
- **Couleur activée** : `#17C964` (le vert `success` de la v2), y compris au survol et à l'appui.
  - Les variables `--switch-control-bg-checked` et `--switch-control-bg-checked-hover` valent toutes deux `#17C964`.
  - Elles sont posées sur l'élément `Switch` lui-même (classe ou `style`), pas dans `:root`, car `.switch` les redéclare.
- Les props `aria-label`, `defaultSelected`, `isSelected` et `isDisabled` sont conservées **telles quelles**, y compris le doublon `"Analytics Cookies"` (ticket séparé).
- « Essentiels » reste coché et désactivé.
- **Focus** : l'anneau de focus v3 est neutralisé. Le focus clavier garde le contour natif du navigateur, comme sur la case native d'aujourd'hui.

#### Chip (`ServiceSection.tsx`, Server Component, 4 pages service)

**Structure** : `Chip` + `Chip.Label`.

**Parité** : le style par défaut v3 est remplacé par le rendu de référence :

- pilule `rounded-full`, `inline-flex items-center whitespace-nowrap` ;
- `px-1` sur la racine et `px-1` sur le libellé ;
- fond `bg-primary/10`, libellé en `text-primary font-medium` (`primary` fourni par le bloc de compatibilité) ;
- hauteur et taille de police héritées, puisque `h-6` et `text-tiny` ne sont pas compilées aujourd'hui.

Un test confirme que le rendu côté serveur fonctionne.

#### Card (`GoogleReviews.tsx`)

**Structure** : `Card` > `Card.Header` > `Card.Content`.

**Parité** : le style par défaut v3 est neutralisé sur les trois parties, pour retrouver des cartes carrées sans ombre :

- **la racine** : padding `p-4`, `gap-3`, rayon de 24 px, ombre `shadow-surface`, fond de la variante ;
- **`Card.Header`** : `flex-col`, auquel on ajoute `flex-row` pour garder l'avatar à côté du nom ;
- **`Card.Content`** : `gap-1`.

Les classes actuelles sont conservées : largeur `calc((100%-2rem)/3)`, `snap-start`, boîte « Voir plus » de hauteur fixe, padding de l'application. Le texte de la carte, y compris celui de l'avis, garde la couleur `foreground` v2 (`#11181C`).

#### Avatar (`GoogleReviews.tsx`)

**Structure** : `Avatar` > `Avatar.Image` + `Avatar.Fallback`.

**Parité** :

- Même taille et même forme qu'aujourd'hui.
- `Avatar.Image` garde `alt` égal au nom de l'auteur et reçoit `referrerPolicy="no-referrer"`.
- `Avatar.Fallback` affiche les initiales de l'auteur pendant le chargement de la photo, et à la place d'une image cassée si la photo ne charge pas (exception 3).

## 7. Navbar reconstruite

`navbar.tsx` est réécrit sans aucun composant HeroUI. L'export `NavBar` est inchangé.

### 7.1 Structure et rendu

- Les repères (landmarks) restent les mêmes qu'en v2 : un `<nav>` externe qui contient un `<header>`.
- La barre est collante en haut de page (`sticky top-0 z-[100]`), haute de 64 px, sur fond `bg-background`, avec la même bordure basse (`border-b border-default-200/50`).
- Le `<header>` interne garde les classes de mise en page de la référence : `flex flex-row flex-nowrap items-center justify-between gap-4`, `w-full max-w-full md:max-w-[1600px] px-4 md:px-16 2xl:px-4 h-16`.
- **Desktop (768 px et plus)** :
  - dans un même `<ul>`, espacés de `gap-6` : le logo (grand à partir de `lg`, 120 px en dessous) et les 6 liens `NavLink` ;
  - « Demander un devis » (`PrimaryButton`) à droite.
- **Mobile** : le bouton menu à gauche, le logo de 120 px **aligné à droite**. Ce sont deux blocs aux extrémités (`justify-between`), comme le rendu v2 actuel.
- Toutes les positions sont identiques aux captures de référence.

### 7.2 Bouton menu

- C'est un `<button>` qui expose son état avec `aria-pressed`, comme le toggle v2.
- Son `aria-label` vaut « Ouvrir le menu » ou « Fermer le menu ».
- Il affiche les icônes lucide `Menu` / `X` en 24 px.

### 7.3 Panneau mobile

- **Position** : il est rendu dans `document.body` avec `createPortal`, en position fixe sous la barre (`top: 4rem`, à gauche, à droite et en bas à 0), avec `z-index: 9999`. Il passe ainsi au-dessus du bandeau cookies, comme aujourd'hui.
- **Montage** : il n'existe pas dans le DOM quand le menu est fermé, une fois la séquence de fermeture terminée. Il reste monté pendant la durée mesurée à l'étape 0.
- **Styles calculés identiques à ceux du `ul` v2** :
  - colonne `flex flex-col` avec `gap-1`, `overflow-y-auto` et `max-w-full` ;
  - hauteur `calc(100vh - 4rem)`, avec un minimum de `calc(100dvh - 4rem)` ;
  - lignes de 44 px et séparateur ;
  - bouton « Demander un devis » plein, en `accent1` ;
  - fond `#F6F8FF`, padding `pt-4 pb-6 px-4` ;
  - bordure basse `border-default-200/50` et ombre `shadow-lg`, hors écran dans la référence.
- **Animations** : elles reproduisent exactement la séquence enregistrée à l'étape 0. À l'ouverture, apparition en fondu avec glissement vertical en 0,25 s (`navbar-menu-in`). À la fermeture, le minutage mesuré. Les keyframes passent dans `globals.css`.
- Le portail créé à la main avec `document.createElement` et la balise `<style>` en ligne disparaissent.

### 7.4 Comportements reproduits

- **Scroll bloqué** tant que le menu est ouvert, avec `usePreventScroll` de `react-aria` (déclaré dans `package.json`, voir 6.1).
- **Retour du focus comme en v2** : le panneau est enveloppé dans `FocusScope` de `react-aria`, avec `restoreFocus` et sans `contain`. À la fermeture, le focus revient à l'élément qui l'avait avant l'ouverture.
- **Fermeture** :
  - au clic sur un lien du menu et sur le logo mobile ;
  - à tout changement de largeur de la barre, rotation du téléphone comprise. On applique la même règle que la v2 : la variation due à l'apparition ou la disparition de la barre de défilement est ignorée.
- **Aucun comportement ajouté** : pas de fermeture par Échap, pas de piège de focus.

## 8. Vérification

### 8.1 Comparaison visuelle

- À la fin de chaque étape, on refait les captures de l'étape 0 (mêmes pages, largeurs et états) et on les compare au pixel près avec la référence.
- Étape 1 : zéro différence.
- Étape 2 : seulement les différences de la section 9. Toute autre différence est corrigée avant d'ouvrir la PR.
- Les enregistrements d'animation (menu, FAQ) sont comparés aux minutages de la référence.

### 8.2 CSS compilé par classe

- On compare le CSS compilé de deux ensembles de classes :
  - les classes utilisées dans `src` et `content` ;
  - les classes présentes dans le DOM rendu de la référence, classes internes HeroUI v2 comprises.
- Les comparaisons :
  - à l'étape 1, entre Tailwind 3.3.5 et Tailwind 4 ;
  - à l'étape 2, entre l'étape 1 et l'étape 2 (ou la référence, en cas de repli).
- Chaque écart est soit corrigé, soit justifié dans la PR (écart sans effet visuel).

### 8.3 Contrôles techniques, à chaque étape

- **Commandes** : `npx tsc --noEmit` et `npm run build` (webpack, pas `--turbopack`).
- **Pas de lint** : le dépôt n'a aucune configuration ESLint, et `npm run lint` ouvrirait l'assistant de `next lint`, qui installe ESLint et écrit une configuration. La mise en place du lint fait l'objet d'un ticket séparé.
- **Installation** :
  - `npm ci` sur un clone propre, sans `--force` ni `--legacy-peer-deps` ;
  - `npm ls tailwindcss` : une seule version de Tailwind dans l'arbre après l'étape 2 ;
  - `package-lock.json` contient les binaires Linux de `@tailwindcss/oxide` et de `lightningcss`, nécessaires au build Vercel.
- **Après l'étape 2** :
  - zéro import de `Navbar*`, `CardBody` ou `HeroUIProvider` ;
  - pour les composants qui existent dans les deux versions, uniquement la forme composée (`Accordion.Item`, `Card.Header`…) ;
  - aucune prop v2 (`title=` sur un élément d'accordéon, `classNames=`, `imgProps=`) ;
  - zéro référence à `heroui()` ou à `@heroui/theme`.
- **Lighthouse** comparé à la référence, en médiane de 5 exécutions :
  - accessibilité et CLS au moins égaux à la référence ;
  - performance à 3 points près au plus.

### 8.4 Comportements, sur la preview Vercel, avec un vrai iPhone et un vrai Android

- **Menu mobile** :
  - scroll bloqué ;
  - fermeture au clic sur un lien et sur le logo, et à la rotation ;
  - focus rendu au bouton menu à la fermeture ;
  - `/#faq` défile jusqu'à la FAQ ;
  - le menu passe au-dessus du bandeau cookies ;
  - pas de défilement horizontal à 320 px.
- **FAQ** :
  - une seule réponse ouverte par colonne ;
  - navigation aux flèches, Début et Fin, Tab et Entrée ;
  - Ctrl+F trouve une réponse fermée et ouvre la question.
- **Cookies**, après suppression du cookie `macar_cookie_consent_is_true` :
  - le bandeau apparaît ;
  - les deux interrupteurs basculent à la souris et à la barre d'espace, et restent verts au survol et à l'appui ;
  - « Essentiels » est verrouillé ;
  - le curseur ne saccade pas (issue HeroUI #6874).
- **Avis** :
  - défilement automatique et pause au survol ;
  - « Voir plus » ;
  - pas d'en-tête `Referer` sur les requêtes vers `lh3.googleusercontent.com` ;
  - initiales si une photo ne charge pas.
- **Global** : animations framer-motion des sections et des cartes, carrousel de logos, formulaire de contact (bordures, focus, placeholders), canevas blanc au rebond de défilement iOS.

### 8.5 Merge

Chaque PR vers `dev` n'est mergée qu'après la validation visuelle de sa preview Vercel par le propriétaire.

## 9. Différences visibles acceptées (liste exhaustive)

1. Les interrupteurs du bandeau cookies deviennent de vrais interrupteurs HeroUI v3, verts quand ils sont activés, à la place des cases à cocher natives.
2. La flèche des questions de la FAQ (le même chevron qu'aujourd'hui) pivote de -90° à l'ouverture et revient en douceur (150 ms) à la fermeture (décision du 2026-10-04).
3. La photo des avis Google apparaît une fraction de seconde après le reste de la carte. Les initiales s'affichent en attendant, et à la place d'une image cassée si la photo ne charge pas.
4. La recherche dans la page (Ctrl+F) trouve le texte des réponses fermées de la FAQ et ouvre la question correspondante.

Toute autre différence constatée est un défaut à corriger.

## 10. Hors périmètre (tickets séparés)

- **Bandeau cookies et RGPD.** Google Analytics (`layout.tsx`) se charge sans tenir compte du consentement. Les interrupteurs ne sont reliés à rien. « Refuser Tout » enregistre un consentement. Deux interrupteurs partagent `aria-label="Analytics Cookies"`.
- **Police Raptor partiellement appliquée.**
  - Elle fonctionne via `raptor.className` (`textStyles.tsx`).
  - En revanche, `font-[var(--font-raptor)]` (titres du blog) compile en `font-weight`, et `font-sans` pointe vers `--font-raptor`, qui n'est défini sur aucun élément.
  - S'y ajoutent des classes mortes (`text-font-gray`, `text-font-lighter-gray`…).
- **Sections invisibles avant hydratation.** `screen.tsx` rend `opacity:0` côté serveur via framer-motion, ce qui pénalise le LCP. Piste : remplacer framer-motion par du CSS.
- **Bloc de compatibilité des couleurs** (v2 et palette Tailwind 3) : le remplacer par les couleurs Macar.
- **Navigation clavier du menu mobile** : Échap et piège de focus. Le retour du focus existant est conservé.
- **Mise en place du lint** : ESLint et sa configuration.
- **`next-mdx-remote`** : le paquet est archivé en amont.
- **Avertissement `npm audit` sur postcss 8.4.31** : il vient de l'épinglage fait par Next 15.5, hors de notre contrôle.

## 11. Risques et inconnues

| Risque | Parade |
|---|---|
| Le plugin v2 se comporte mal sous Tailwind 4 (non testé) | Repli : fusion des étapes 1 et 2 (section 3) |
| Des classes internes v2 deviennent actives à l'étape 1 | Comparaison des classes du DOM rendu (8.2), neutralisation au cas par cas |
| Conflit d'installation (ERESOLVE) entre les dépendances de pair | `npm ci` propre à chaque étape. Ne jamais utiliser `--force` |
| Tailwind 4 et les couleurs oklch de la v3 visent Safari 16.4+, Chrome 111+ et Firefox 128+ | Accepté pour un site vitrine en 2026. Les couleurs visibles du site restent en hexadécimal, via les blocs de compatibilité et `:root` |
| Une 3.2.7 est en préparation | On épingle 3.2.6 et on ne met à jour qu'après la migration |
| Le changement de défauts de `space-*` ou du préflight passe inaperçu | Comparaison des captures et du CSS par classe (section 8) |
| Le Chip v3 utilisé dans un Server Component | Test de rendu à l'étape 2. En cas d'échec, `ServiceSection.tsx` devient un composant client |
| Le minutage d'une animation (ressort framer-motion) n'est pas reproductible exactement en CSS | Comparaison avec l'enregistrement de l'étape 0. Si un écart reste perceptible, il est soumis au propriétaire avant la PR |

**Stratégies écartées** :

- **Tout migrer d'un coup** : régressions Tailwind et changements HeroUI se mélangent dans la même comparaison. Cette stratégie ne reste que comme repli.
- **Faire cohabiter v2 et v3 avec des alias de paquets** : documenté seulement pour pnpm, deux systèmes CSS en collision, et démesuré pour 6 fichiers.

## 12. Sources

- **Versions et prérequis** : `npm view @heroui/react dist-tags time peerDependencies`, https://heroui.com/en/docs/react/getting-started/quick-start
- **Migration v2 vers v3** : https://heroui.com/en/docs/react/migration, https://heroui.com/en/docs/react/migration/full-migration
- **Guides par composant** : https://heroui.com/en/docs/react/migration/navbar, et sous le même préfixe `/accordion`, `/switch`, `/chip`, `/card`, `/avatar`
- **Switch 3.2.0** : https://heroui.com/en/docs/react/releases/v3-2-0
- **Intégration Next.js et I18nProvider** : https://heroui.com/en/docs/react/getting-started/frameworks
- **Tailwind 4** : https://tailwindcss.com/docs/upgrade-guide, https://tailwindcss.com/docs/installation/framework-guides/nextjs
- **tailwind-merge 3** : https://github.com/dcastil/tailwind-merge/releases/tag/v3.0.0
- **Issue Switch** : https://github.com/heroui-inc/heroui/issues/6874
- **Styles v3** : `@heroui/styles` 3.2.6, `dist/components/accordion.css`, `switch.css`, `card.css`, `dist/themes/shared/theme.css`, `dist/themes/default/index.css`
- **React Aria** : `react-aria-components` 1.21.1 `Heading` (niveau 3 par défaut), `react-aria` 3.52.1 `useDisclosure` (`hidden="until-found"`, `beforematch`), `@react-aria/overlays` `Overlay` (`FocusScope restoreFocus`)
- **Comportements v2** :
  - `node_modules/@heroui/react/node_modules/@heroui/navbar/dist/` : `usePreventScroll`, `useResizeObserver`, `useToggleButton`, `menuVariants`, `Overlay` ;
  - `node_modules/@heroui/react/node_modules/@heroui/accordion/dist/` : `HeadingComponent = "h2"` ;
  - `node_modules/@heroui/use-aria-accordion/dist/chunk-AHLWZTIP.mjs` : `useReactAriaAccordionItem`, touches ;
  - `node_modules/@heroui/framer-utils/dist/` : variantes `collapse` ;
  - `node_modules/@heroui/react/node_modules/@heroui/avatar/dist/` : `showFallback` à `false`.
- **Rendu de référence** : `.next/static/css/61f72beef2126a12.css` et HTML prérendu (`.next/server/app/index.html`, `.next/server/app/services/*.html`)
