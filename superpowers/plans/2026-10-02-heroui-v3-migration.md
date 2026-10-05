# Migration HeroUI v3 : plan d'implémentation

> **Pour les agents :** sous-skill requis : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**Objectif :** passer le site Macar de HeroUI 2.8.8 et Tailwind 3.3.5 à HeroUI 3.2.6 et Tailwind 4.3, sans aucune différence visible ni comportementale en dehors des 4 différences acceptées de la section 9 de la spec.

**Architecture :** trois temps sur la branche `heroui-v3-migration`. Étape 0 : un dossier d'outils hors du dépôt capture la référence (`a37ed9e`) : captures au pixel près, styles calculés, minutages, comportements, Lighthouse. Étape 1 (PR 1 vers `dev`) : Tailwind 4 avec le plugin HeroUI v2 chargé par `hero.ts`, visuellement neutre. Étape 2 (PR 2 vers `dev`) : HeroUI v3 (fondation CSS, provider, Accordion, Switch, Chip, Card, Avatar) et Navbar reconstruite sans HeroUI, dans un seul commit de bascule, puis vérification complète contre la référence.

**Stack technique :** Next.js 15.5.25 (build webpack), React 19.2.6, Tailwind CSS 4.3.3 (`@tailwindcss/postcss`, lightningcss 1.32.0), tailwind-merge 3.7.0, HeroUI 2.8.8 puis `@heroui/react` et `@heroui/styles` 3.2.6, `react-aria` 3.52.1, framer-motion 11, Node 24.19.0 et npm 11. Outils de vérification : `@playwright/test` 1.63.0 (Chromium), `lighthouse` 13.5.0, `chrome-launcher` 1.2.2, `pngjs` 7.0.0, `html-validate` 11.16.1.

**Spec :** `superpowers/specs/2026-10-02-heroui-v3-migration-design.md`

**Plan de repli (spec, section 3) : non déclenché.** Le prototype de l'étape 1 a prouvé que le plugin `heroui()` v2, chargé par `@plugin` sous Tailwind 4.3.3 et sans `@source` vers `@heroui/theme`, reproduit la référence : 0 pixel et 0 style calculé de différence sur les 44 captures du prototype (matrice proche de celle du harnais, avec en plus le survol d'un lien de la barre et le focus d'un champ du formulaire), aucune des 487 classes du DOM rendu ne change d'état (voir la partie 2) ; la tâche 22 le revérifie sur les 47 captures du harnais. Le plan garde donc les deux PR de la spec. Si la vérification de la tâche 22 montre malgré tout une différence due au plugin lui-même, la tâche 22 (étape 2) décrit le repli : étapes 1 et 2 dans une seule PR.

## Contraintes globales

- **Branche** : tout le travail du dépôt se fait sur `heroui-v3-migration` (créée depuis `dev`, base `a37ed9e`). Les deux PR partent de cette branche vers `dev`.
- **Versions épinglées** : `tailwindcss` et `@tailwindcss/postcss` en `~4.3.3`, `tailwind-merge` en `^3.7.0`, `@tailwindcss/upgrade@4.3.3` pour l'outil de mise à jour, `@heroui/react` reste résolu en 2.8.8 pendant l'étape 1, puis `@heroui/react` et `@heroui/styles` en `3.2.6` exact et `react-aria` en `^3.52.1` à l'étape 2. Outils : `@playwright/test` 1.63.0, `lighthouse` 13.5.0, `chrome-launcher` 1.2.2, `pngjs` 7.0.0, `html-validate` 11.16.1, en versions exactes.
- **Installation** : jamais `--force` ni `--legacy-peer-deps`. Un `ERESOLVE` se résout par l'ordre des commandes (tâche 25), jamais en forçant.
- **Aucune dépendance de vérification dans le dépôt** : les outils vivent dans `D:\Repos\macar-migration-tools`, hors du dépôt, avec leur propre `package.json`, leurs `node_modules` et leur propre dépôt git local (jamais poussé).
- **Parité stricte** : rendu, styles calculés, minutages, clavier, focus et attributs d'accessibilité identiques à la référence `a37ed9e`, en dehors des 4 différences acceptées : (1) interrupteurs du bandeau cookies en vrais interrupteurs HeroUI v3 verts ; (2) flèche de la FAQ qui pivote de -90° à l'ouverture et revient en 150 ms à la fermeture ; (3) initiales des avis pendant le chargement de la photo et à la place d'une photo cassée ; (4) Ctrl+F qui trouve et ouvre une réponse fermée de la FAQ. Toute autre différence est un défaut, sauf les écarts sans effet visuel listés plus bas et justifiés dans la PR.
- **Étape 1** : zéro différence de capture et de style calculé, aucun fichier d'autorisation.
- **Typographie** : aucun tiret cadratin ni demi-cadratin dans aucun texte produit (code, commentaires, messages de commit, descriptions de PR) : virgules, deux-points ou parenthèses à la place.
- **Commits** : un titre en une phrase anglaise à l'impératif dans le style du dépôt, éventuellement un paragraphe d'explication après une ligne vide, puis une ligne vide et `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, toujours passés par un heredoc (`git commit -F - <<'EOF'`). Fichiers ajoutés un par un (jamais `git add -A` à l'étape 1), et `git restore tsconfig.tsbuildinfo` avant chaque commit et après chaque `npx tsc --noEmit` (fichier suivi que `tsc` réécrit).
- **Écriture des fichiers** : contenu complet avec l'outil Write, modifications partielles avec l'outil Edit, textes exactement comme donnés. Pas de heredoc ni de `sed` pour écrire du code (l'outil Bash a altéré des barres obliques inverses pendant le prototypage) ; les heredocs ne servent qu'aux messages de commit.
- **Serveur testé** : `npm run build` puis `npx next start -p 3100`, adresse `http://localhost:3100`, un seul serveur à la fois. Un serveur s'arrête toujours par son port (`Get-NetTCPConnection -LocalPort 3100 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`), jamais en tuant la tâche de fond.
- **Disque** : le dépôt, les outils et tous les clones vivent sur `D:` (`D:\Repos`). Au moins 3 Go libres sur `D:` avant les tâches 1, 12 et 24 (`df -h /d`). Ne rien créer de lourd sur `C:`, presque plein : il est tombé à 0 octet pendant le prototypage (`ENOSPC`). Seul le cache npm y écrit encore, garder au moins 1 Go libre sur `C:` (`df -h /c`).
- **Pas de lint** : le dépôt n'a pas de configuration ESLint, `npm run lint` lancerait un assistant qui en écrit une (ticket séparé, spec 8.3).
- **Pousser** publie la branche et déclenche une preview Vercel : demander l'accord explicite du propriétaire avant chaque `git push`.
- **PR** : base `dev`, tête `heroui-v3-migration`. Une PR n'est mergée qu'après la validation visuelle de sa preview Vercel par le propriétaire (spec 8.5), et par un commit de fusion (« Create a merge commit », comme les PR précédentes du dépôt) : un squash ferait réapparaître les commits de l'étape 1 dans la PR de l'étape 2.
- **Descriptions de PR** : terminées par `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## Points d'attention de la revue

Ces cinq classes d'entrées, ou modes de défaillance, sont celles qui peuvent toucher un vrai visiteur sans qu'aucun test des parties rédigées ne les exerce. Chacune a reçu un test dans la tâche qui possède la spécification concernée. Les sept tests ajoutés ont été exécutés par l'assembleur du plan sur la référence (`STEP=0`, 38 tests du harnais : 37 passés, 1 ignoré) et sur un prototype complet de l'étape 2 (`STEP=2`, 48 tests avec ceux des tâches 29 et 34 : 48 passés).

1. **Défilement au doigt sur iPhone, menu ouvert (et canevas blanc).** `usePreventScroll` de `react-aria` 3.52.1 n'a plus la même voie iOS que celle de la v2 (`@react-aria/overlays` 3.31.0) : style injecté, condition WebKit, surcharge de `focus`. Un défaut se verrait par une page qui défile sous le menu, une page bloquée après fermeture ou un retour en haut de page. Le test existant ne passait que par la molette. **Test ajouté (tâche 8, `tests/navbar.spec.mjs`, « menu mobile au doigt, plateforme iPhone »)** : plateforme et agent utilisateur d'iPhone (la voie iOS de `usePreventScroll` s'active), saisie tactile, glissés réels envoyés par le protocole DevTools ; menu ouvert, la page ne bouge pas ; fermé, la position (1500 px) est gardée, aucun style de blocage ne reste sur `html` ni `body`, la page défile de nouveau, et le canevas (`html`) reste blanc. Le rebond élastique de Safari reste un contrôle manuel (tâches 23 et 41).
2. **Photos d'avis lentes.** L'exception 3 change ce que voit un visiteur sur un réseau mobile lent : initiales pendant le chargement. Un avatar qui changerait de taille au chargement décalerait le texte des avis. Les tests existants ne couvraient que la photo chargée ou en échec. **Test ajouté (tâche 9, `tests/reviews.spec.mjs`, « photo lente »)** : photos retenues par le réseau, la carte et le nom gardent exactement la même boîte avant et après le chargement, la photo s'affiche en 32 x 32 px, opaque ; avec `STEP=2`, les initiales sont visibles pendant l'attente puis disparaissent.
3. **Navigation au clavier seul dans les deux colonnes de la FAQ.** La v3 remplace le gestionnaire clavier de la v2 par un gestionnaire maison posé sur chaque déclencheur (tâche 30). Les tests existants vérifiaient les flèches dans une colonne, pas le passage d'une colonne à l'autre. **Test ajouté (tâche 9, `tests/faq.spec.mjs`, « clavier seul »)** : Tab et Maj+Tab parcourent les 7 questions dans l'ordre, une réponse ouverte ne retient pas le focus, le focus clavier est `:focus-visible` dans la deuxième colonne, et une réponse reste ouverte par colonne quand on ouvre au clavier dans l'autre.
4. **Très petits écrans (320 px).** Les chips (`whitespace-nowrap`) des pages service, les interrupteurs du bandeau cookies et la FAQ changent de composant. Le test existant ne regardait que l'accueil. **Tests ajoutés** : tâche 8 (`tests/navbar.spec.mjs`, « aucune des 15 pages ne défile horizontalement ») et tâche 9 (`tests/cookies.spec.mjs`, « à 320 px, préférences ouvertes ») : aucune page ne dépasse 320 px de large, le bandeau et ses trois interrupteurs restent dans l'écran.
5. **Cookie de consentement absent, présent ou inattendu.** Le bandeau dépend d'un cookie lu après l'hydratation ; les interrupteurs v3 sont rendus dedans. Les tests existants couvraient le cookie absent ou à `true`, sur l'accueil. **Tests ajoutés (tâche 9, `tests/cookies.spec.mjs`)** : cookie à une autre valeur que `true` (bandeau affiché sur l'accueil et sur une page service) ; après « Accepter Tout », le bandeau ne revient ni au rechargement ni sur une autre page.

La rotation du téléphone menu ouvert, également citée dans la revue, est déjà exercée : `tests/navbar.spec.mjs` (« changement de largeur (dont rotation) », passage de 390 x 844 à 844 x 390) et `tests/navbar-scrollbar.spec.mjs` (tâche 34). Le vrai geste reste dans la liste manuelle de la tâche 41.

## Écarts par rapport à la spec (à faire relire par le propriétaire)

Chaque écart est justifié par une mesure dans la partie qui le porte ; il est rappelé ici pour que le propriétaire les voie tous au même endroit.

**Tranché par le propriétaire le 2026-10-04** (déjà intégré aux tâches concernées) :

- **Flèche de la FAQ animée dans les deux sens** (tâches 4, 29 et 30) : la rotation de -90° est animée en 150 ms à l'ouverture **et** à la fermeture. La transition de `rotate` est déclarée dans tous les états (tâche 30), l'entrée de l'exception 2 de `allow-step2.json` couvre `#faq button[aria-expanded] svg` dans tous les états (tâche 4, créée ainsi dès le départ, donc la référence de la tâche 11 en tient compte sans recapture), et le test de la flèche vérifie le retour animé (tâche 29).
- **Délais d'ouverture de la FAQ gardés** (tâche 30) : 30 ms pour la hauteur et 16 ms pour l'opacité, ajoutés aux durées de la spec parce que framer-motion démarrait plus tard (sans eux, la courbe d'ouverture est en avance de 22,5 px, au-delà du bruit de la référence).
- **Apparence des initiales acceptée** (tâche 33) : rond gris et texte de 12 px par défaut de la v3, la référence n'ayant jamais affiché de repli.
- **Poids du CSS accepté** (tâche 26) : `@import "@heroui/styles"` livre le CSS de tous les composants (feuille bloquante de 8 Ko à 44 Ko compressés). Mesure de l'assembleur, médiane de 5, même machine : `/` mobile 77 (référence 79), desktop 98 (97), `/services/renovation` mobile 79 (71), desktop 99 (97), accessibilité 95, 95, 92, 91 (référence 91, 91, 88, 87), CLS identiques : dans les seuils. La variante à imports sélectifs (partie 3) ne s'applique que si la tâche 40 sort du seuil, avec l'accord du propriétaire.

**Partie 1, outillage** :

1. `screen.tsx` et `cards.tsx` utilisent `animate` (pas `whileInView`) : il n'y a pas d'apparition au défilement à déclencher ; la capture parcourt quand même la page (images `loading="lazy"`) et attend `document.getAnimations()` puis un délai fixe.
2. Le défilement automatique des avis ne progresse pas dans Chromium sans tête : le test compte les écritures de `scrollLeft` (en marche, en pause au survol, reprise) ; le mouvement réel reste un contrôle manuel (8.4).
3. Ctrl+F ne s'automatise pas : le test utilise un lien de fragment de texte (`#:~:text=`), qui déclenche le même événement `beforematch` sur un contenu `hidden="until-found"`.
4. Spec 8.2 « CSS compilé par classe » : réalisée par `style-diff.mjs` (styles calculés de tous les éléments rendus, groupés par liste de classes), complétée par `class-activity.mjs` (étape 1, activité de chaque classe du DOM), `state-diff.mjs` (étapes 1 et 2 : classes à variante d'état `hover:`, `active:`, `focus:`, `focus-visible:` et `group-hover:`, état forcé par le protocole DevTools, qu'aucune capture ne montre) et `class-css-diff.mjs` (étape 2, règles compilées de chaque classe). Les variantes qui dépendent de l'état rendu (`disabled:`, `peer-disabled:`, `placeholder:`, `data-[...]:`) sont déjà couvertes par `computed.json`. Les états posés par JavaScript (attributs `data-*` de HeroUI et de React Aria) ne sont pas forcés : les tests de comportement les couvrent (interrupteurs au survol et à l'appui).
5. Les photos `lh3.googleusercontent.com` sont remplacées par une image fixe générée, et toute autre requête externe est bloquée, des deux côtés de chaque comparaison.
6. La règle de la barre de défilement et le blocage iOS n'étaient pas automatisés par la partie 1 : la tâche 34 automatise la première, la tâche 8 la voie iOS de `usePreventScroll` (point d'attention 1) ; le vrai Safari reste manuel.
7. Les captures de la Navbar à 320 px ne portent que sur l'accueil (`navbar`, `menu-open`, `focus-menu-button`) ; `navbar-check.mjs` (tâche 34) ajoute 10 largeurs de barre.
8. Le dossier d'outils est son propre dépôt git local, pour que les étapes de commit des outils aient une cible.
9. Les exceptions 3 et 4 ne se voient pas dans des captures stabilisées : leurs entrées d'autorisation ne couvrent que la boîte de l'avatar et des éléments masqués.

**Partie 2, étape 1** :

10. `flex-shrink-*` n'est pas renommé à l'étape 1 (5.3) : `shrink-0` activerait la classe interne v2 sur l'interrupteur et les séparateurs de la FAQ (mesuré). Renommage à l'étape 2 (tâches 28 et 33).
11. `outline-none` devient `outline-2 outline-transparent outline-offset-2`, pas `outline-hidden` (qui donne `outline-style: none`).
12. `bg-gradient-to-l from-background to-transparent` devient l'utilitaire `bg-fade-left`, pas `bg-linear-to-l` (interpolation oklab et angle réécrit).
13. Les blocs de compatibilité dépassent la liste de 5.4 : police de `html`, surbrillance au toucher, padding des cellules, curseur `:disabled`, `--radius-full`, listes de transitions, piles d'ombres et `ring-2`, minutage des animations (effet de bord de `tailwindcss-animate`). Chacun corrige une différence mesurée.
14. Les 24 `space-*` et les 2 `divide-*` sont tous convertis en variante `sibling:` (sélecteur de Tailwind 3), pas au cas par cas.
15. Hors spec : 12 lignes reçoivent une hauteur de ligne responsive explicite (`lg:leading-*`), car Tailwind 4 fait passer `leading-*` avant `lg:text-*`.
16. Hors spec : 27 couleurs avec opacité sont écrites avec leur valeur Tailwind 3 (Tailwind 4 les mélange en oklab, pixels décalés d'un niveau). Conséquence : l'affirmation de 6.2 (« les 58 classes rendent à l'identique sans modification ») est fausse pour ces variantes, reprises à l'étape 2 (écart 22).
17. Hors spec : lightningcss arrondit `33.333333%` et réécrit `calc((100% - 2rem) / 3)` : utilitaires `w-third`, `w-two-thirds`, `w-review-card`.
18. Hors spec : `min-h-16`, `min-w-8` et `min-h-8`, sans CSS en Tailwind 3 et générées par Tailwind 4, sont retirées.
19. `source(none)` et deux `@source` reproduisent exactement les globs `content` de Tailwind 3 (la détection automatique lirait aussi les articles MDX).
20. `--color-gray-200`, `--color-gray-400` et `--color-neutral-700` sont gardées dans `@theme` bien qu'aucune classe ne les utilise après les remplacements (CSS compilé identique).
21. Classes renommées par l'outil hors de la liste de 5.3 (`border-b-1`, `h-[1px]`, `z-[100]`, `font-[var(--font-raptor)]`, `aspect-[16/9]`, `aspect-[2/1]`, `[scrollbar-width:none]`), sans effet ; `components.json` reçoit `"config": ""`.

**Partie 3, fondation de l'étape 2** :

22. Les classes `hsl(var(--heroui-*)/a)` de l'étape 1 sont renommées `hsl(var(--v2-*)/a)` (16 occurrences dans 6 fichiers), les variables du plugin v2 disparaissant avec `hero.ts`.
23. Le `@theme` de compatibilité déclare les canaux HSL v2 en variables `--v2-*` lues par `hsl(var(...))`, avec les valeurs arrondies que lightningcss produit (`201.82`, `212.02`).
24. Le bloc `:root` utilise `hsl(var(--v2-background))` et `hsl(var(--v2-foreground))` (mêmes valeurs calculées que les littéraux de la spec).
25. Ajouts : remise à zéro `.carousel .slider` (collision de nom avec le Slider de HeroUI : logos écartés, titre de l'accueil qui débordait en 390 px) et retrait de la classe morte `ease-in-out-quad`, que le thème v3 activait.
26. Composants shadcn : `text-muted-foreground` et `border-input` ne s'activent pas en 3.2.6 ; seules `hover:bg-accent` et `hover:text-accent-foreground` s'activent, et sont retirées.
27. L'installation commence par `npm uninstall @heroui/react` (sinon `ERESOLVE`) ; npm ajoute `@adobe/react-spectrum` au lockfile (via `@react-types/color`), jamais importé.
28. Le renommage `flex-shrink-0` vers `shrink-0` (5.3) se fait à l'étape 2 : 5 occurrences à la tâche 28, 5 dans `GoogleReviews.tsx` à la tâche 33.
29. `view-transition-name` de `html` passe de `root` à `none` (règle de base de `@heroui/styles`), sans effet (aucune transition de vue) ; la `div` de `HeroUIProvider` disparaît du DOM.
30. Un seul commit de bascule pour toute l'étape 2 (tâche 37) : le paquet `@heroui/react` a le même nom en v2 et en v3, une bascule partielle demanderait la cohabitation par alias que la spec écarte.

**Partie 4, composants** :

31. Le Chip est importé de `@heroui/react/chip` : l'import racine casse `next build` dans un Server Component (`client-only` de `react-aria-components`). `ServiceSection.tsx` reste un Server Component ; le repli de la spec (composant client) n'est pas nécessaire.
32. Le gestionnaire clavier est posé sur chaque `Accordion.Trigger` (pas sur la colonne : `DisclosureGroup` ne transmet pas `onKeyDown`), avec le même comportement.
33. Séparateurs : `hideSeparator` et de vrais `<hr>` entre les questions, comme dans la référence, au lieu de restyler le `::after` v3.
34. Flèche : animée à l'ouverture et à la fermeture, voir « Tranché par le propriétaire » ci-dessus.
35. Minutage du panneau : durées de la spec, courbe `easeOut` de framer-motion, ressort approché par `cubic-bezier(0.29, 0.48, 0.03, 1)`, plus les délais d'ouverture (gardés, voir « Tranché par le propriétaire »).
36. `record.mjs` signale l'ouverture de la FAQ en `opacity` hors tolérance (environ -50 à -58 ms) à cause d'un artefact d'une image de la référence ; `curve-diff.mjs` (tâche 29) juge la FAQ image par image.
37. Attributs : `Accordion.Panel` reçoit `role="region"` (nom de la question, comme en v2) ; l'`aria-label` de la `div` de chaque question v2 n'est pas repris (non exposé) ; le déclencheur porte `aria-controls` aussi fermé ; le HTML prérendu a `hidden=""`, React Aria passe à `hidden="until-found"` à l'hydratation.
38. Focus : `outline: revert` sur le déclencheur ; pour l'interrupteur, dont le focus est sur un `input` caché, le contour natif est dessiné sur `Switch.Control` (règle de Chrome : `outline-style: auto`, `-webkit-focus-ring-color`).
39. Détails de parité hors spec : surbrillance au toucher rendue à la valeur héritée, `Card` garde `tabIndex={-1}`, l'avatar v3 n'a plus `tabindex="-1"`, le Chip est un `span` (une `div` en v2), le HTML prérendu ne contient plus d'`<img>` d'avatar (exception 3).
40. Neutralisations mesurées au-delà de la liste de 6.4 (item, titre, déclencheur, indicateur, panneau, carte, avatar, chip), détaillées classe par classe aux tâches 30 à 33.

**Partie 5, Navbar** :

41. Le bouton menu utilise aussi `useToggleButton` de `react-aria` (le hook du toggle v2) : mêmes attributs, même prise de focus à l'appui (Safari iOS), sans dépendance ajoutée.
42. HTML valide : chaque groupe devient `ul > li` (la v2 rendait `ul > button` et `ul > div`). Styles et boîtes identiques, mais l'arbre d'accessibilité gagne 3 `listitem` (1 visible en 1280 px, 2 en 390 et 320 px). Mesuré par `aria-diff.mjs` en relecture finale : menu ouvert, le panneau précède l'annonceur de route de Next (`alert` vide) dans l'arbre au lieu de le suivre, sans effet (l'annonceur est vide et ne prend pas le focus). Ce sont les seules différences de l'arbre d'accessibilité (liste `aria-step2.json`, tâche 34).
43. Le fond du panneau est une `div` fixe montée avec lui, dont le fondu devient une animation CSS (`navbar-backdrop-in`) au lieu d'une transition : images identiques à chaque instant, mais `style-diff.mjs` signale 4 propriétés d'animation sur cette `div` (seul groupe de styles de la tâche 40, justifié dans la PR).
44. Durée de montage après fermeture : `MENU_EXIT_MS = 265` (disparition mesurée entre 276 et 295 ms, v2 entre 275 et 284 ms).
45. Les classes v2 sans CSS (`z-40`, `w-6`, `basis-0`, `flex-grow`...) ne sont pas reprises, les `!` du panneau et `pointer-events-auto` sont retirés ; le CSS par classe change de 16 classes (dont `transform`, qui n'était compilée qu'à cause d'un mot de l'ancienne balise `<style>`).
46. Outils hors contrat : `navbar-check.mjs` et `tests/navbar-scrollbar.spec.mjs` (tâche 34).

**Assemblage du plan** :

47. Ordre : la tâche de bascule (37) est placée après les parties 4 et 5, et les contrôles sur le build de bascule (38, 39) juste après ; les tâches d'outils 29 et 34 restent en tête de leur partie (elles ne servent que `ref-site` sur le port 3100, jamais le dépôt).
48. Sept tests ajoutés pour les points d'attention (tâches 8 et 9) : la suite du harnais passe de 31 à 38 tests, puis à 48 avec les tâches 29 et 34.
49. Lighthouse : sur la machine de l'assembleur, deux médianes de 5 de la référence elle-même sur `/services/renovation` mobile ont donné 71 puis 67, soit plus que le seuil de 3 points. Les tâches 22 et 40 prévoient donc, en cas d'échec de performance seulement, une nouvelle mesure de la référence dans la même session ; le seuil n'est jamais élargi.
50. Les commits intermédiaires de l'étape 1 (tâches 13 et 14) compilent (vérifié par l'assembleur : `next build` et `tsc` passent) mais ne sont pas visuellement neutres : le plugin v2 n'est rechargé qu'à la tâche 15. Seul l'état final de la PR 1 est jugé.

**Relecture finale** :

51. Contrôles ajoutés au harnais, hors du contrat initial (tâches 4 et 5) : `capture.mjs` écrit aussi l'arbre d'accessibilité de chaque capture (`aria/*.yml`, spec 1 : libellés, états, textes alternatifs) et `aria-diff.mjs` le compare ; `state-diff.mjs` compare les classes à variante d'état (écart 4) ; `html-diff.mjs` valide le HTML prérendu des 28 pages (`html-validate` 11.16.1, préréglage `standard`, spec 1 : HTML valide). Mesures du relecteur sur les prototypes : étape 1 (`cfde316`) 0 différence partout ; étape 2 (état complet de l'assembleur) 0 différence d'état forcé, aucune erreur HTML nouvelle (127 erreurs dans la référence, 8 à l'étape 2), arbre d'accessibilité conforme à l'écart 42.
52. La page 404 (`not-found.tsx`, route statique prérendue avec la barre et le bandeau du layout) est capturée en plus des 14 pages de la spec 4 : 15 pages, 47 captures. Identique au pixel près aux étapes 1 et 2 sur les prototypes.
53. Contrôle de cohérence avec la production (spec 4) : tâche 11, étape 7, sur `https://www.macar.be` (`macar.be` redirige vers `www`, et le harnais bloque tout autre hôte que celui de `--base`). Mesure du relecteur le 3 octobre 2026 : les 30 captures `default` identiques à la référence locale.

## Provenance et validation

Chaque partie a été prototypée dans des clones jetables, jamais dans le dépôt : outils et référence (partie 1), étape 1 complète (partie 2), fondation (partie 3), composants (partie 4) et Navbar (partie 5) ; les résultats de chaque prototype sont dans la partie concernée. L'assembleur du plan a ensuite :

- extrait le code des outils directement de ce plan, et capturé une référence de `a37ed9e` ;
- construit l'état complet de l'étape 2 (composants de la partie 4 et Navbar de la partie 5, code de ce plan, dépendances de la tâche 25) : `tsc` sans erreur, 33 pages statiques ;
- mesuré cet état contre la référence : 45 captures (matrice d'avant l'ajout de la page 404), 39 identiques, 6 différences autorisées (exceptions 1 et 2), 0 échec ; `style-diff.mjs` : un seul groupe, la `div` de fond du menu (écart 43) ; `navbar-check.mjs` identique ; minutages du menu sans `OUT` ; courbes de la FAQ dans les seuils ; `step2-static-checks.mjs` sans échec ; collisions de classes toutes connues (25) ; 48 tests de comportement passés avec `STEP=2` ; Lighthouse dans les seuils ;
- rejoué les tâches 13 et 14 sur un clone de `a37ed9e` (outil de mise à jour, cartes, dépendances) : sorties conformes au plan, build et typage au vert à chaque commit.

Le relecteur final a ensuite ajouté la page 404 et les outils de l'écart 51, puis remesuré trois builds (référence `a37ed9e`, prototype de l'étape 1 `cfde316`, état complet de l'étape 2 de l'assembleur) : étape 1, 47 captures identiques, 0 style, 0 état forcé, 0 différence d'accessibilité, 0 erreur HTML nouvelle ; étape 2, 47 captures dont 41 identiques et 6 différences autorisées, le seul groupe de styles de l'écart 43, 0 état forcé, les seules différences d'accessibilité de l'écart 42, 0 erreur HTML nouvelle ; le test des interrupteurs (tâche 9) sur les deux interrupteurs et le test des 320 px sur les 15 pages passent.

## Structure des fichiers

**Dépôt `D:\Repos\macar-next-site-prod`** (branche `heroui-v3-migration`) :

| Fichier | Tâches | Responsabilité |
|---|---|---|
| `package.json`, `package-lock.json` | 13, 14, 25 | Tailwind 4.3, tailwind-merge 3, paquets inutilisés retirés ; puis HeroUI 3.2.6 et `react-aria` |
| `postcss.config.js` | 13, 15 | seulement `@tailwindcss/postcss` |
| `tailwind.config.ts` | 13 (supprimé) | remplacé par `globals.css` |
| `components.json` | 15 | clé `tailwind.config` vidée |
| `hero.ts` | 15 (créé), 26 (supprimé) | pont temporaire vers le plugin HeroUI v2 |
| `src/app/globals.css` | 13, 15, 26, 30, 35 | Tailwind 4, thème du site, palette Tailwind 3, compatibilité Tailwind 3 ; puis `@heroui/styles`, compatibilité v2, `:root`, minutage de la FAQ, animations du menu |
| `src/app/providers.tsx` | 27 | `I18nProvider` en `fr-BE` à la place de `HeroUIProvider` |
| `src/app/layout.tsx` | aucune | inchangé |
| `src/app/_components/navbar.tsx` | 13, 16, 19, 28, 36 | renommages Tailwind 4, puis Navbar réécrite sans HeroUI |
| `src/app/_components/HomeView.tsx` | 17, 20, 28, 30 | `space-x`, largeurs exactes, `shrink-0`, FAQ en Accordion v3 |
| `src/app/_components/faqKeyboard.ts` | 30 (créé) | navigation au clavier de la FAQ (flèches, Début, Fin) |
| `src/app/_components/CookieConsent.tsx` | 14, 17, 31 | import mort retiré, `divide-*`, interrupteurs Switch v3 |
| `src/app/_components/ServiceSection.tsx` | 17, 18, 19, 28, 32 | `space-y`, hauteurs de ligne, couleurs avec opacité, `shrink-0`, Chip v3 |
| `src/components/GoogleReviews.tsx` | 13, 16, 19, 20, 33 | renommages, classes mortes, opacité, largeur et dégradé exacts, Card et Avatar v3 |
| `src/app/_components/ServiceDetailBody.tsx`, `src/app/services/page.tsx` | 19, 28 | couleurs avec opacité, puis variables `--v2-*` et `shrink-0` |
| `src/app/zones/[slug]/page.tsx` | 18, 19, 28 | hauteur de ligne, opacité, `--v2-*`, `shrink-0` |
| `src/app/_components/buttons.tsx` | 19, 28 | opacité, retrait de `ease-in-out-quad` |
| `src/app/_components/footer.tsx` | 13, 28 | `h-px`, retrait de `ease-in-out-quad` |
| `src/app/_components/textStyles.tsx` | 18 | hauteur de ligne responsive |
| `src/app/_components/cards.tsx`, `src/app/_components/checkMark.tsx`, `src/components/trusted.tsx` | 13 | renommages de l'outil |
| `src/app/blog/page.tsx` | 13, 18, 19, 20 | renommages, hauteur de ligne, opacité, transformation au survol |
| `src/app/blog/[slug]/page.tsx` | 13, 18, 19 | renommages, hauteurs de ligne, opacité |
| `src/app/blog/_components/MdxComponents.tsx` | 13, 17, 18, 19 | renommages, `space-y`, hauteurs de ligne, opacité |
| `src/app/mentions-legales/page.tsx`, `src/app/politique-confidentialite/page.tsx`, `src/app/politique-cookies/page.tsx` | 13, 19 | `!` en fin de classe, bordures avec opacité |
| `src/components/contact_form.tsx`, `src/components/jobs.tsx` | 17 | `space-y` |
| `src/components/ui/card.tsx` | 13, 17 | `shadow-xs`, `space-y` |
| `src/components/ui/button.tsx` | 13, 19, 20, 28 | opacité, contour de focus, `--v2-*`, survols `accent` retirés |
| `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx` | 13, 20 | contour de focus Tailwind 3 |
| `tsconfig.tsbuildinfo` | aucune | réécrit par `tsc`, toujours restauré, jamais committé |
| `superpowers/plans/2026-10-02-heroui-v3-migration.md` | aucune | ce plan |

**Dossier d'outils `D:\Repos\macar-migration-tools`** (dépôt git local `main`, jamais poussé ; `node_modules/`, `ref-site/`, `runs/` et `test-results/` ignorés) :

| Fichier | Tâche | Responsabilité |
|---|---|---|
| `package.json`, `package-lock.json`, `.gitignore` | 1 | dépendances épinglées des outils |
| `ref-site/`, `ref-site.json` | 2 | clone et build de production de `a37ed9e`, servi sur 3100 |
| `lib/common.mjs`, `lib/dom-probe.mjs` | 3 | configuration, stabilisation des pages, sonde des styles calculés |
| `allow-step2.json`, `capture.mjs` | 4 | différences autorisées (section 9), captures et `computed.json`, `classes.json`, `regions.json`, `captures.json`, `aria/*.yml` |
| `compare.mjs`, `style-diff.mjs`, `state-diff.mjs`, `aria-diff.mjs`, `html-diff.mjs` | 5 | comparaison au pixel près, styles calculés, états forcés (survol, appui, focus), arbre d'accessibilité, validité du HTML prérendu |
| `selftest.mjs` | 6 | contrôles négatifs des comparateurs |
| `record.mjs` | 7 | vidéos et minutages du menu et de la FAQ |
| `playwright.config.mjs`, `tests/helpers.mjs`, `tests/navbar.spec.mjs` | 8 | spécifications de la Navbar (7.2 à 7.4, 8.4), dont points d'attention 1 et 4 |
| `tests/faq.spec.mjs`, `tests/cookies.spec.mjs`, `tests/reviews.spec.mjs` | 9 | spécifications FAQ, cookies, avis, dont points d'attention 2 à 5 |
| `lighthouse.mjs` | 10 | médiane de 5, seuils de 8.3 |
| `baseline/` | 11 | référence de l'étape 0 |
| `replace-classes.mjs`, `css-rules.mjs`, `leading-check.mjs`, `class-activity.mjs`, `maps/upgrade-tool-result.json`, `maps/step1-*.json` | 12 | remplacements de classes contrôlés, lecture du CSS compilé, 8.2 de l'étape 1 |
| `css-compile.mjs`, `class-css-diff.mjs`, `layer-collisions.mjs`, `step2-static-checks.mjs`, `maps/step2-*.json` | 24 | compilation du CSS sans Next, 8.2 de l'étape 2, collisions de noms, contrôles de source de 8.3 |
| `curve-diff.mjs`, `tests/components.spec.mjs` | 29 | courbes de la FAQ, parité des composants |
| `navbar-check.mjs`, `tests/navbar-scrollbar.spec.mjs`, `baseline/navbar/`, `aria-step2.json` | 34 | parité de la Navbar, règle de la barre de défilement, différences attendues de l'arbre d'accessibilité |
| `runs/` | 11 à 41 | sorties des exécutions (ignorées par git) |

## Ordre d'exécution

| Tâches | Partie | Où | Commit |
|---|---|---|---|
| 1 à 11 | 1. Outillage et référence (étape 0) | dossier d'outils | dossier d'outils |
| 12 | 2. Étape 1 | dossier d'outils | dossier d'outils |
| 13 à 20 | 2. Étape 1 | dépôt | un commit par tâche |
| 21, 22 | 2. Étape 1 | dépôt servi sur 3100, clone propre | aucun |
| 23 | 2. Étape 1 | dépôt, GitHub | push et PR 1 |
| 24 | 3. Étape 2, fondation | dossier d'outils | dossier d'outils |
| 25 à 28 | 3. Étape 2, fondation | dépôt | aucun (arbre de travail) |
| 29 | 4. Composants | dossier d'outils | dossier d'outils |
| 30 à 33 | 4. Composants | dépôt | aucun (arbre de travail) |
| 34 | 5. Navbar | dossier d'outils | dossier d'outils |
| 35, 36 | 5. Navbar | dépôt | aucun (arbre de travail) |
| 37 | 6. Bascule et vérification | dépôt | commit unique de la bascule |
| 38 à 40 | 6. Bascule et vérification | dépôt servi sur 3100 | seulement des corrections |
| 41 | 6. Bascule et vérification | dépôt, GitHub | push et PR 2 |

Les tâches 13 à 41 s'exécutent dans l'ordre. Les tâches de l'étape 2 peuvent commencer pendant que la PR 1 attend sa validation (elles ne poussent rien), mais la tâche 41 exige que la PR 1 soit mergée (sauf en cas de repli, décrit à la tâche 22, étape 2 : une seule PR, pas de tâche 23).

---

## Partie 1 : outillage de vérification et référence (étape 0)

Cette partie couvre la section 4 de la spec (étape 0, référence) et fournit les outils utilisés par les sections 8.1 à 8.4 aux étapes 1 et 2. Elle ne touche **pas** au dépôt `macar-next-site-prod` : tout se passe dans `D:\Repos\macar-migration-tools`, un dossier hors du dépôt qui a son propre `package.json`, ses propres `node_modules` et son propre dépôt git local (jamais poussé), pour que les étapes de commit gardent une trace des outils et de la référence.

**Commandes** : toutes les commandes `bash` se lancent dans l'outil Bash (Git Bash). Les chemins contiennent une espace, ils sont donc toujours entre guillemets. Les commandes `powershell` se lancent dans l'outil PowerShell.

**Disque** : pendant le prototypage, le disque `C:` est tombé à 0 octet libre (erreurs `ENOSPC` sur `npm ci` et sur Lighthouse). Tout vit désormais sur `D:`. Avant la tâche 1, vérifier qu'il reste au moins 3 Go libres sur `D:` (`df -h /d` dans Git Bash) et au moins 1 Go sur `C:` pour le cache npm (`df -h /c`). Le clone de référence occupe environ 1,3 Go (`node_modules` et `.next`), la référence environ 60 Mo.

**Arrêt des serveurs** : tuer la tâche de fond qui a lancé `npx next start` ne tue pas le serveur Next (constaté pendant le prototypage, le port restait occupé). On arrête toujours un serveur par son port, avec la commande PowerShell donnée dans les tâches.

**Contrat des outils** (noms fixes, utilisés par les parties suivantes) :

| Commande | Rôle |
|---|---|
| `node capture.mjs --base <url> --out <dir> [--only <regex>]` | captures `<page>__<largeur>__<état>.png`, `computed.json`, `classes.json`, `regions.json`, `captures.json`, arbre d'accessibilité `aria/<capture>.yml` |
| `node compare.mjs --ref <dir> --cur <dir> [--allow allow-step2.json]` | comparaison au pixel près, `<cur>/diff/*.png`, `<cur>/compare-report.json`, code 0 seulement sans différence hors des zones autorisées |
| `node style-diff.mjs --ref <dir> --cur <dir> [--allow allow-step2.json]` | comparaison des styles calculés (forme opérationnelle de 8.2), groupée par liste de classes, `<cur>/style-diff.txt` et `.json` |
| `node record.mjs --base <url> --out <dir> [--ref <timings.json>] [--tolerance 50]` | vidéos `menu.webm` et `faq.webm`, minutages par image dans `timings.json` |
| `BASE_URL=<url> STEP=0\|1\|2 npx playwright test` | spécifications de comportement `tests/*.spec.mjs` |
| `node lighthouse.mjs --base <url> --out <dir> [--runs 5] [--ref <lighthouse.json>]` | médiane de 5 exécutions, mobile et desktop, sur `/` et `/services/renovation` |
| `node selftest.mjs --ref <dir>` | contrôles négatifs de `compare.mjs` et `style-diff.mjs` |
| `node state-diff.mjs --base <url> --out <dir>` puis `node state-diff.mjs --ref <dir> --cur <dir> [--allow allow-step2.json]` | styles calculés sous survol, appui et focus forcés (`<dir>/states.json`), code 0 seulement sans différence |
| `node aria-diff.mjs --ref <dir> --cur <dir> [--expect aria-step2.json]` | comparaison des arbres d'accessibilité `aria/*.yml`, code 0 seulement si chaque différence est attendue |
| `node html-diff.mjs --ref-site <dépôt> --cur-site <dépôt> --out <dir>` | validité du HTML prérendu (`.next/server/app`), code 0 seulement sans erreur nouvelle |

Le site testé est toujours servi par `npm run build` puis `npx next start -p 3100`, à l'adresse `http://localhost:3100`. La référence va dans `macar-migration-tools\baseline`, les exécutions suivantes dans `macar-migration-tools\runs\<nom>`.

**Matrice de capture** (47 captures, section 4 de la spec) :

- 15 pages : `/`, `/about`, `/services`, les 4 pages service, `/blog`, `/blog/isolation-facade` (article qui contient du code en ligne et une citation, donc les classes `bg-default-100` de `MdxComponents.tsx`), `/job`, `/mentions-legales`, `/politique-confidentialite`, `/politique-cookies`, `/zones/uccle`, et la page 404 (`not-found.tsx`, atteinte par `/page-introuvable-harness`, écart 52).
- État `default` (page entière) à 1280 et 390 px pour les 15 pages : 30 captures.
- Accueil à 320 px : `navbar` (bande haute de 72 px).
- Accueil à 390 et 320 px : `menu-open`, `focus-menu-button`.
- Accueil à 1280 et 390 px : `faq-closed`, `faq-open` (première question), `focus-faq` (première question, au clavier), `cookie-banner`, `cookie-preferences`, `focus-switch` (interrupteur « Analytique », au clavier).

**Stabilisation** (validée : deux captures du même build, puis une capture d'un second build du même commit, sont identiques au pixel près et au style près) :

- le cookie `macar_cookie_consent_is_true=true` masque le bandeau, sauf pour les états `cookie-*` et `focus-switch` ;
- un script injecté avant la page neutralise `setInterval(fn, 30)` (défilement automatique des avis, `GoogleReviews.tsx`) et `setTimeout(fn, 8000)` (lecture automatique du carrousel de logos, `logocarousel.tsx`), deux constantes que la migration ne touche pas ;
- les photos `lh3.googleusercontent.com` sont remplacées par une image fixe générée (72 x 72), toute autre requête externe est bloquée ;
- la page est parcourue de haut en bas (images `loading="lazy"`), puis on attend les polices, les images rendues, les animations finies (`document.getAnimations()`) et 900 ms ;
- la souris est garée en (1, 1), dans la marge gauche de la barre, après chaque clic ;
- les captures utilisent `animations: "disabled"`, une échelle de 1 et `--force-color-profile=srgb`.

---

### Task 1: Créer le dossier d'outils et installer ses dépendances

**Files:**
- Create: `D:\Repos\macar-migration-tools\package.json`
- Create: `D:\Repos\macar-migration-tools\.gitignore`

**Interfaces:**
- Consumes: Node 24 (`node -v` donne `v24.19.0`), npm 11, git.
- Produces: `macar-migration-tools` avec `@playwright/test` 1.63.0 (Chromium compris), `lighthouse` 13.5.0, `chrome-launcher` 1.2.2, `pngjs` 7.0.0, `html-validate` 11.16.1, en versions exactes pour que le Chromium des captures ne change jamais entre la référence et les étapes 1 et 2. Dépôt git local `main`.

- [ ] **Step 1: Vérifier que le dossier n'existe pas et qu'il reste de la place**

```bash
ls "D:/Repos/macar-migration-tools" ; df -h /d | tail -1
```

Attendu : `ls: cannot access ...: No such file or directory`, et au moins 3 Go dans la colonne `Avail`.

- [ ] **Step 2: Créer le dossier et `package.json`**

```bash
mkdir -p "D:/Repos/macar-migration-tools"
```

Contenu complet de `package.json` :

```json
{
  "name": "macar-migration-tools",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "playwright test"
  },
  "dependencies": {
    "@playwright/test": "1.63.0",
    "chrome-launcher": "1.2.2",
    "html-validate": "11.16.1",
    "lighthouse": "13.5.0",
    "pngjs": "7.0.0"
  }
}
```

- [ ] **Step 3: Créer `.gitignore`**

```gitignore
node_modules/
ref-site/
runs/
test-results/
```

- [ ] **Step 4: Installer les dépendances et Chromium**

```bash
cd "D:/Repos/macar-migration-tools" && npm install --no-audit --no-fund && npx playwright install chromium && npx playwright --version
```

Attendu : `added 125 packages`, puis `Version 1.63.0`.

- [ ] **Step 5: Initialiser le dépôt git local et committer**

```bash
cd "D:/Repos/macar-migration-tools" && git init -b main && git add -A && git commit -F - <<'EOF'
Create the migration tools folder with pinned dependencies

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Attendu : `[main (root-commit) ...] Create the migration tools folder with pinned dependencies`, 3 fichiers (`.gitignore`, `package.json`, `package-lock.json`).

---

### Task 2: Construire et servir le site de référence (commit a37ed9e)

**Files:**
- Create: `D:\Repos\macar-migration-tools\ref-site\` (clone ignoré par git)
- Create: `D:\Repos\macar-migration-tools\ref-site.json`

**Interfaces:**
- Consumes: le dépôt `D:\Repos\macar-next-site-prod` (lecture seule, aucun fichier modifié, aucune branche changée).
- Produces: un build de production de `a37ed9e` servi sur `http://localhost:3100`. Ce serveur est utilisé par les tâches 4 à 11. `ref-site.json` consigne le commit et les noms des CSS compilés.

- [ ] **Step 1: Cloner le dépôt et se placer sur a37ed9e**

```bash
cd "D:/Repos/macar-migration-tools" && git clone "D:/Repos/macar-next-site-prod" ref-site && git -C ref-site checkout --detach a37ed9e && git -C ref-site log -1 --format=%h
```

Attendu : `a37ed9e`. Le clone ne contient ni `docs/` (ignoré) ni fichier `.env` (le dépôt n'en a pas : le build de référence ne charge donc pas Google Analytics, comme les builds des étapes 1 et 2).

- [ ] **Step 2: Installer et construire**

```bash
cd "D:/Repos/macar-migration-tools/ref-site" && npm ci --no-audit --no-fund && npm run build
```

Attendu : `npm ci` se termine sans erreur (npm 11 affiche `npm warn allow-scripts` pour `@heroui/shared-utils`, `esbuild` et `scrollreveal` : ces scripts d'installation ne sont pas lancés, sans effet sur le build). `next build` affiche `Next.js 15.5.25`, puis la liste des routes avec `/zones/[slug]` et `/blog/[slug]`.

- [ ] **Step 3: Vérifier que le CSS compilé est celui de la référence**

```bash
ls "D:/Repos/macar-migration-tools/ref-site/.next/static/css"
```

Attendu, exactement (mêmes noms que dans le `.next` du dépôt, dont `61f72beef2126a12.css` cité par la spec) :

```
0b850f3d555b6b7f.css
217e3e81ab1f3a89.css
61f72beef2126a12.css
ae4ed9c503fd1e33.css
```

- [ ] **Step 4: Consigner la référence dans `ref-site.json`**

```bash
cd "D:/Repos/macar-migration-tools" && node -e "const fs=require('fs');const {execSync}=require('child_process');fs.writeFileSync('ref-site.json',JSON.stringify({commit:execSync('git -C ref-site rev-parse --short HEAD').toString().trim(),css:fs.readdirSync('ref-site/.next/static/css').sort(),node:process.version},null,2)+'\n')" && cat ref-site.json
```

Attendu :

```json
{
  "commit": "a37ed9e",
  "css": [
    "0b850f3d555b6b7f.css",
    "217e3e81ab1f3a89.css",
    "61f72beef2126a12.css",
    "ae4ed9c503fd1e33.css"
  ],
  "node": "v24.19.0"
}
```

- [ ] **Step 5: Servir le build sur le port 3100**

Lancer en arrière-plan (outil Bash avec `run_in_background: true` et `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-migration-tools/ref-site" && npx next start -p 3100
```

Puis, au premier plan :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/zones/uccle
```

Attendu : `200`.

- [ ] **Step 6: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add ref-site.json && git commit -F - <<'EOF'
Record the reference build of commit a37ed9e

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Bibliothèque partagée (configuration, stabilisation, sonde DOM)

**Files:**
- Create: `D:\Repos\macar-migration-tools\lib\common.mjs`
- Create: `D:\Repos\macar-migration-tools\lib\dom-probe.mjs`

**Interfaces:**
- Consumes: `@playwright/test`, `pngjs`.
- Produces : `PAGES` (15 pages, `slug` et `path`, dont la page 404 atteinte par une adresse inconnue), `VIEWPORTS` (1280 x 800, 390 x 844, 320 x 568), `CONSENT_COOKIE`, `SEL` (sélecteurs indépendants de HeroUI : bouton menu par `aria-label`, FAQ par `#faq button[aria-expanded]`, colonnes par `#faq div.grid > *`), `FREEZE_SCRIPT`, `routeNetwork`, `newContext`, `stabilize`, `settle`, `parkMouse`, `keyboardFocus` (focus programmatique puis Maj+Tab et Tab, pour obtenir `:focus-visible`), `parseArgs`, `readJson`, `writeJson`, `allowSelectors`, `loadAllow`, `allowFor`. `dom-probe.mjs` exporte `PROPS` (liste des propriétés comparées) et `collectDom` (fonction exécutée dans la page).

**Choix de `computed.json`** : pour chaque élément visible (`checkVisibility`, boîte non vide) qui croise la zone capturée, on enregistre `[clé, balise, classes, texte propre, boîte, valeurs]`. La clé est le chemin DOM `html>body:1>div:2>...` (rang parmi les frères de même balise), stable tant que le DOM ne change pas. Les pseudo-éléments `::before`, `::after` (si `content` n'est pas `none`) et `::placeholder` sont enregistrés à part. Les couleurs sont normalisées en `rgba(r,g,b,a)` 8 bits en les peignant sur un canevas : une couleur `oklch` ou `color-mix` de Tailwind 4 est ainsi comparée à sa valeur réellement affichée. `width` et `height` sont remplacés par la boîte mesurée.

- [ ] **Step 1: Vérifier que la bibliothèque n'existe pas encore**

```bash
cd "D:/Repos/macar-migration-tools" && node -e "import('./lib/common.mjs').then(()=>console.log('present'),e=>console.log(e.code))"
```

Attendu : `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 2: Créer `lib/common.mjs`**

```js
// Shared configuration and helpers for the Macar migration harness.
// Everything here must stay valid for the v2 reference AND the v3 site:
// selectors rely on roles, aria attributes, ids and texts, never on HeroUI classes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

export const TOOLS_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export const PAGES = [
  { slug: "home", path: "/" },
  { slug: "about", path: "/about" },
  { slug: "services", path: "/services" },
  { slug: "services-renovation", path: "/services/renovation" },
  { slug: "services-plomberie", path: "/services/plomberie" },
  { slug: "services-electricite", path: "/services/electricite" },
  { slug: "services-toiture", path: "/services/toiture" },
  { slug: "blog", path: "/blog" },
  { slug: "blog-isolation-facade", path: "/blog/isolation-facade" },
  { slug: "job", path: "/job" },
  { slug: "mentions-legales", path: "/mentions-legales" },
  { slug: "politique-confidentialite", path: "/politique-confidentialite" },
  { slug: "politique-cookies", path: "/politique-cookies" },
  { slug: "zones-uccle", path: "/zones/uccle" },
  { slug: "not-found", path: "/page-introuvable-harness" },
];

export const VIEWPORTS = {
  1280: { width: 1280, height: 800 },
  390: { width: 390, height: 844 },
  320: { width: 320, height: 568 },
};

export const CONSENT_COOKIE = { name: "macar_cookie_consent_is_true", value: "true" };

export const SEL = {
  menuButton: 'button[aria-label="Ouvrir le menu"], button[aria-label="Fermer le menu"]',
  faqSection: "#faq",
  faqTriggers: "#faq button[aria-expanded]",
  faqColumns: "#faq div.grid > *",
};

// Init script injected before any page script.
// 1. GoogleReviews auto-scroll: setInterval(fn, 30) never runs, so scrollLeft stays at 0.
// 2. Logo carousel (react-responsive-carousel): autoplay setTimeout(fn, 8000) never runs.
// Both delays are constants of the site code (GoogleReviews.tsx, logocarousel.tsx), unchanged by the migration.
export const FREEZE_SCRIPT = `(() => {
  const realSetInterval = window.setInterval.bind(window);
  const realSetTimeout = window.setTimeout.bind(window);
  let fakeId = 2000000000;
  window.__macarFrozenTimers = [];
  window.setInterval = function (fn, delay, ...args) {
    if (Number(delay) === 30) { window.__macarFrozenTimers.push("interval:30"); return ++fakeId; }
    return realSetInterval(fn, delay, ...args);
  };
  window.setTimeout = function (fn, delay, ...args) {
    if (Number(delay) === 8000) { window.__macarFrozenTimers.push("timeout:8000"); return ++fakeId; }
    return realSetTimeout(fn, delay, ...args);
  };
})();`;

// Fixed 72x72 avatar served instead of lh3.googleusercontent.com photos (deterministic, offline).
let avatarPng = null;
export function avatarFixture() {
  if (avatarPng) return avatarPng;
  const png = new PNG({ width: 72, height: 72 });
  for (let y = 0; y < 72; y++) {
    for (let x = 0; x < 72; x++) {
      const i = (y * 72 + x) * 4;
      const inner = (x - 36) ** 2 + (y - 30) ** 2 < 14 ** 2;
      png.data[i] = inner ? 245 : 70;
      png.data[i + 1] = inner ? 200 : 110;
      png.data[i + 2] = inner ? 160 : 180;
      png.data[i + 3] = 255;
    }
  }
  avatarPng = PNG.sync.write(png);
  return avatarPng;
}

// Network policy: the site under test is served locally; Google avatars get the fixture,
// every other external request is aborted (analytics, etc.).
export async function routeNetwork(context, baseUrl, { onAvatarRequest, abortAvatar } = {}) {
  const base = new URL(baseUrl);
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.host === base.host) return route.continue();
    if (url.host === "lh3.googleusercontent.com") {
      if (onAvatarRequest) await onAvatarRequest(route.request());
      if (abortAvatar && abortAvatar(url.href)) return route.abort("failed");
      return route.fulfill({ status: 200, contentType: "image/png", body: avatarFixture() });
    }
    if (url.protocol === "data:" || url.protocol === "blob:") return route.continue();
    return route.abort("blockedbyclient");
  });
}

export async function newContext(browser, baseUrl, width, { consent = true, recordVideoDir } = {}) {
  const context = await browser.newContext({
    viewport: VIEWPORTS[width],
    deviceScaleFactor: 1,
    locale: "fr-BE",
    timezoneId: "Europe/Brussels",
    colorScheme: "light",
    reducedMotion: "no-preference",
    ...(recordVideoDir ? { recordVideo: { dir: recordVideoDir, size: VIEWPORTS[width] } } : {}),
  });
  await context.addInitScript(FREEZE_SCRIPT);
  if (consent) {
    await context.addCookies([{ ...CONSENT_COOKIE, url: baseUrl }]);
  }
  await routeNetwork(context, baseUrl);
  return context;
}

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Wait until fonts, images and finite animations are done, after scrolling the whole page
// once so that lazy images load.
export async function stabilize(page, { scrollThrough = true } = {}) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  if (scrollThrough) {
    await page.evaluate(async () => {
      const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo({ top: y, left: 0, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    await page.waitForLoadState("networkidle");
  }
  await settle(page);
}

export async function settle(page, ms = 900) {
  await page.evaluate(async () => {
    // Only rendered images: a lazy image inside a display:none block, or horizontally outside
    // the viewport (cloned slides of the logo carousel), never loads.
    const imgs = [...document.images].filter((img) => {
      if (!img.checkVisibility()) return false;
      const b = img.getBoundingClientRect();
      return !(img.loading === "lazy" && (b.right <= 0 || b.left >= window.innerWidth));
    });
    const loaded = Promise.all(
      imgs.map((img) =>
        img.complete ? null : new Promise((r) => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); })
      )
    );
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 10000))]);
    await Promise.all(imgs.map((img) => (img.complete && img.naturalWidth ? img.decode().catch(() => {}) : null)));
  });
  await delay(ms);
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((a) => {
      const t = a.effect && a.effect.getComputedTiming();
      return t && t.endTime !== Infinity && a.playState === "running";
    });
    await Promise.race([Promise.all(finite.map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 3000))]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

// Moves the pointer to the top-left corner (left padding of the sticky navbar <header>,
// nothing hoverable there at any width) so no hover state remains after a click.
export async function parkMouse(page) {
  await page.mouse.move(1, 1);
}

// Focus an element "via the keyboard": programmatic focus, then Shift+Tab and Tab,
// so that :focus-visible and React Aria keyboard modality are both active.
export async function keyboardFocus(page, locator) {
  await locator.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const ok = await locator.evaluate((el) => el === document.activeElement);
  if (!ok) throw new Error("keyboardFocus: focus did not land on the target element");
}

export function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

// All selectors used by allow*.json files of the tools dir: capture.mjs records their rects and keys.
export function allowSelectors() {
  const set = new Set();
  for (const f of fs.readdirSync(TOOLS_DIR)) {
    if (!/^allow.*\.json$/.test(f)) continue;
    for (const e of readJson(path.join(TOOLS_DIR, f))) if (e.selector) set.add(e.selector);
  }
  return [...set].sort();
}

export function loadAllow(file) {
  if (!file) return [];
  const entries = readJson(path.resolve(file));
  for (const e of entries) {
    if (!e.reason) throw new Error(`allow entry without reason: ${JSON.stringify(e)}`);
    if (!e.selector && !e.region) throw new Error(`allow entry needs selector or region: ${JSON.stringify(e)}`);
  }
  return entries;
}

export function allowFor(entries, meta) {
  const m = (v, x) => v === undefined || v === "*" || String(v) === String(x);
  return entries.filter((e) => m(e.page, meta.page) && m(e.width, meta.width) && m(e.state, meta.state));
}
```

- [ ] **Step 3: Créer `lib/dom-probe.mjs`**

```js
// In-page probes, evaluated with page.evaluate(fn, arg). Must be self-contained functions.

export const PROPS = [
  "display", "position", "top", "right", "bottom", "left", "z-index", "float", "clear", "box-sizing",
  "min-width", "min-height", "max-width", "max-height",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
  "outline-style", "outline-width", "outline-color", "outline-offset",
  "box-shadow",
  "background-color", "background-image", "background-size", "background-position", "background-repeat", "background-clip",
  "color", "opacity", "visibility", "overflow-x", "overflow-y",
  "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing",
  "text-align", "text-decoration-line", "text-decoration-color", "text-decoration-style", "text-underline-offset",
  "text-transform", "text-indent", "text-overflow", "white-space", "word-break", "overflow-wrap",
  "-webkit-line-clamp", "vertical-align", "list-style-type", "list-style-position",
  "flex-direction", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis",
  "justify-content", "justify-items", "align-items", "align-self", "align-content", "order", "row-gap", "column-gap",
  "grid-template-columns", "grid-template-rows", "grid-column-start", "grid-column-end", "grid-row-start", "grid-row-end", "grid-auto-flow",
  "transform", "translate", "rotate", "scale", "transform-origin",
  "filter", "backdrop-filter", "mix-blend-mode", "isolation", "clip-path", "mask-image",
  "object-fit", "object-position", "aspect-ratio",
  "cursor", "pointer-events", "user-select",
  "transition-property", "transition-duration", "transition-timing-function", "transition-delay",
  "animation-name", "animation-duration",
  "fill", "stroke", "stroke-width",
  "scroll-snap-type", "scroll-snap-align", "overscroll-behavior-x", "content-visibility",
  "accent-color", "appearance", "caret-color", "content",
];

// Collects every visible element (and its ::before / ::after / ::placeholder) intersecting `region`
// (page coordinates; null = whole page). Returns { elements, classes, regions }.
export function collectDom({ props, region, selectors }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const colorCache = new Map();
  const toRgba = (c) => {
    if (colorCache.has(c)) return colorCache.get(c);
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    const out = `rgba(${d[0]},${d[1]},${d[2]},${Math.round((d[3] / 255) * 1000) / 1000})`;
    colorCache.set(c, out);
    return out;
  };
  const COLOR_RE = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/g;
  const COLOR_TEST = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/;
  const normalize = (v) => (typeof v === "string" && COLOR_TEST.test(v) ? v.replace(COLOR_RE, (m) => toRgba(m)) : v);

  const sx = window.scrollX;
  const sy = window.scrollY;
  const keyOf = new Map();
  const pathKey = (el) => {
    if (keyOf.has(el)) return keyOf.get(el);
    let key;
    const tag = el.tagName.toLowerCase();
    if (!el.parentElement) key = tag;
    else {
      let n = 1;
      for (let s = el.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === el.tagName) n++;
      key = `${pathKey(el.parentElement)}>${tag}:${n}`;
    }
    keyOf.set(el, key);
    return key;
  };
  const ownText = (el) => {
    let t = "";
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    t = t.replace(/\s+/g, " ").trim();
    return t.length > 80 ? t.slice(0, 80) : t;
  };
  const intersects = (r) =>
    !region || (r[0] < region.x + region.width && r[0] + r[2] > region.x && r[1] < region.y + region.height && r[1] + r[3] > region.y);
  const round = (n) => Math.round(n * 100) / 100;
  const styleValues = (cs) => props.map((p) => normalize(cs.getPropertyValue(p)));

  const elements = [];
  const classes = new Set();
  for (const el of document.querySelectorAll("*")) {
    if (el.classList) for (const c of el.classList) classes.add(c);
    if (["HEAD", "SCRIPT", "STYLE", "META", "LINK", "TITLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName)) continue;
    if (el.closest("head")) continue;
    if (!el.checkVisibility({ visibilityProperty: true })) continue;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const rect = [round(b.left + sx), round(b.top + sy), round(b.width), round(b.height)];
    if (!intersects(rect)) continue;
    const key = pathKey(el);
    const cls = typeof el.className === "string" ? el.className.trim().replace(/\s+/g, " ") : (el.getAttribute("class") || "");
    elements.push([key, el.tagName.toLowerCase(), cls, ownText(el), rect, styleValues(getComputedStyle(el))]);
    for (const pseudo of ["::before", "::after"]) {
      const ps = getComputedStyle(el, pseudo);
      if (ps.content === "none" || ps.content === "normal" || ps.display === "none") continue;
      elements.push([key + pseudo, pseudo, cls, "", rect, styleValues(ps)]);
    }
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      if (el.getAttribute("placeholder")) elements.push([key + "::placeholder", "::placeholder", cls, "", rect, styleValues(getComputedStyle(el, "::placeholder"))]);
    }
  }

  const regions = {};
  for (const s of selectors) {
    const hits = [...document.querySelectorAll(s)].filter((el) => el.getBoundingClientRect().width > 0 || el.getBoundingClientRect().height > 0);
    regions[s] = {
      keys: [...document.querySelectorAll(s)].map(pathKey),
      rects: hits.map((el) => {
        const b = el.getBoundingClientRect();
        return [round(b.left + sx), round(b.top + sy), round(b.width), round(b.height)];
      }),
    };
  }
  return {
    elements,
    classes: [...classes].sort(),
    regions,
    scroll: [sx, sy],
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  };
}
```

- [ ] **Step 4: Vérifier le chargement**

```bash
cd "D:/Repos/macar-migration-tools" && node -e "Promise.all([import('./lib/common.mjs'),import('./lib/dom-probe.mjs')]).then(([c,p])=>console.log(c.PAGES.length, Object.keys(c.VIEWPORTS).join(','), p.PROPS.length, c.avatarFixture().length > 0))"
```

Attendu : `15 320,390,1280 129 true`.

- [ ] **Step 5: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add lib && git commit -F - <<'EOF'
Add the shared page stabilisation and DOM probe helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Liste des différences autorisées et script de capture

**Files:**
- Create: `D:\Repos\macar-migration-tools\allow-step2.json`
- Create: `D:\Repos\macar-migration-tools\capture.mjs`

**Interfaces:**
- Consumes: `lib/common.mjs`, `lib/dom-probe.mjs`, serveur de la tâche 2 sur 3100.
- Produces: `capture.mjs` (contrat ci-dessus, dont l'arbre d'accessibilité `aria/<capture>.yml` de chaque capture : rôles, noms accessibles, textes alternatifs, états) et `allow-step2.json`.

**Format de `allow-step2.json`** : une liste d'entrées `{ page, width, state, selector | region, reason }`. `page` est un slug de `PAGES`, `width` un nombre, `state` un nom d'état ; `"*"` vaut pour tous. `selector` est un sélecteur CSS : `capture.mjs` enregistre, pour **tous** les sélecteurs de tous les fichiers `allow*.json` du dossier, les boîtes et les clés DOM des éléments trouvés (`regions.json`), dans la référence comme dans la capture courante. `compare.mjs` ignore alors les pixels dans l'union des boîtes des deux côtés (marge de 4 px pour les contours de focus), et `style-diff.mjs` ignore ces éléments et leurs descendants. `region` est soit un rectangle `[x, y, largeur, hauteur]` en pixels de l'image, soit `"*"` pour toute la capture. `reason` est obligatoire.

Le fichier doit exister **avant** la capture de référence, pour que les boîtes des sélecteurs y soient enregistrées. Si on ajoute un sélecteur plus tard, il faut recapturer la référence depuis `ref-site` (le build est conservé).

Les 4 exceptions de la section 9 : les exceptions 1 et 2 sont visibles dans les captures (interrupteurs dans `cookie-preferences` et `focus-switch`, chevron pivoté dans `faq-open`). L'exception 3 ne l'est pas dans des captures stabilisées (on attend le chargement des images), son entrée couvre seulement la boîte de l'avatar. L'exception 4 porte sur des éléments masqués, donc absents des captures et de `computed.json` : son entrée la documente sans élargir aucune zone.

- [ ] **Step 1: Vérifier que la capture n'existe pas encore**

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/try
```

Attendu : une erreur Node `Error: Cannot find module '...capture.mjs'` (code 1).

- [ ] **Step 2: Créer `allow-step2.json`**

```json
[
  {
    "page": "home",
    "width": "*",
    "state": "cookie-preferences",
    "selector": "label:has(input[role=\"switch\"])",
    "reason": "Section 9, exception 1 : les cases natives deviennent des interrupteurs HeroUI v3 verts"
  },
  {
    "page": "home",
    "width": "*",
    "state": "focus-switch",
    "selector": "label:has(input[role=\"switch\"])",
    "reason": "Section 9, exception 1 : interrupteur v3 à la place de la case native (état de focus clavier)"
  },
  {
    "page": "home",
    "width": "*",
    "state": "*",
    "selector": "#faq button[aria-expanded] svg",
    "reason": "Section 9, exception 2 : le chevron pivote de -90 degrés à l'ouverture et revient en 150 ms à la fermeture (transition de rotate déclarée dans tous les états, décision du 2026-10-04)"
  },
  {
    "page": "home",
    "width": "*",
    "state": "default",
    "selector": "img[referrerpolicy=\"no-referrer\"], span:has(> img[referrerpolicy=\"no-referrer\"])",
    "reason": "Section 9, exception 3 : avatar des avis (Avatar.Image et Avatar.Fallback, initiales pendant le chargement ou si la photo échoue)"
  },
  {
    "page": "home",
    "width": "*",
    "state": "*",
    "selector": "#faq [hidden=\"until-found\"]",
    "reason": "Section 9, exception 4 : réponses fermées présentes et masquées (hidden=until-found), trouvables par Ctrl+F"
  }
]
```

- [ ] **Step 3: Créer `capture.mjs`**

```js
// node capture.mjs --base <url> --out <dir> [--only <regex>]
// Screenshots of every page x width x state (spec section 4) + computed.json, classes.json,
// regions.json, captures.json and the accessibility tree of each capture (aria/<name>.yml).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import {
  PAGES, SEL, newContext, stabilize, settle, parkMouse, keyboardFocus, parseArgs, writeJson, allowSelectors,
} from "./lib/common.mjs";
import { PROPS, collectDom } from "./lib/dom-probe.mjs";

const args = parseArgs();
if (!args.base || !args.out) {
  console.error("usage: node capture.mjs --base <url> --out <dir> [--only <regex>]");
  process.exit(2);
}
const BASE = args.base.replace(/\/$/, "");
const OUT = path.resolve(args.out);
const ONLY = args.only ? new RegExp(args.only) : null;

// ---- capture matrix -------------------------------------------------------
const home = PAGES.find((p) => p.slug === "home");
const matrix = [];
for (const p of PAGES) for (const width of [1280, 390]) matrix.push({ page: p, width, state: "default" });
matrix.push({ page: home, width: 320, state: "navbar" });
for (const width of [390, 320]) {
  matrix.push({ page: home, width, state: "menu-open" });
  matrix.push({ page: home, width, state: "focus-menu-button" });
}
for (const width of [1280, 390]) {
  for (const state of ["faq-closed", "faq-open", "focus-faq", "cookie-banner", "cookie-preferences", "focus-switch"]) {
    matrix.push({ page: home, width, state });
  }
}

// ---- state actions: each returns the screenshot clip (page coords) or null for full page / viewport
const rectOf = (page, selector) =>
  page.locator(selector).first().evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { x: Math.floor(b.left + scrollX), y: Math.floor(b.top + scrollY), width: Math.ceil(b.width), height: Math.ceil(b.height) };
  });
const toTop = (page) => page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
const viewportClip = (page) => ({ x: 0, y: 0, ...page.viewportSize() });

const STATES = {
  async default(page) {
    return { fullPage: true, clip: null };
  },
  async navbar(page) {
    return { fullPage: false, clip: { x: 0, y: 0, width: page.viewportSize().width, height: 72 } };
  },
  async "menu-open"(page) {
    await page.locator(SEL.menuButton).click();
    await parkMouse(page);
    await settle(page);
    return { fullPage: false, clip: viewportClip(page) };
  },
  async "focus-menu-button"(page) {
    await keyboardFocus(page, page.locator(SEL.menuButton));
    await settle(page, 300);
    return { fullPage: false, clip: { x: 0, y: 0, width: page.viewportSize().width, height: 72 } };
  },
  async "faq-closed"(page) {
    return { fullPage: true, clip: await rectOf(page, SEL.faqSection) };
  },
  async "faq-open"(page) {
    await page.locator(SEL.faqTriggers).first().click();
    await parkMouse(page);
    await settle(page);
    await toTop(page);
    await settle(page, 200);
    return { fullPage: true, clip: await rectOf(page, SEL.faqSection) };
  },
  async "focus-faq"(page) {
    await keyboardFocus(page, page.locator(SEL.faqTriggers).first());
    await toTop(page);
    await settle(page, 300);
    return { fullPage: true, clip: await rectOf(page, SEL.faqSection) };
  },
  async "cookie-banner"(page) {
    await page.getByText("Macar utilise des cookies").waitFor();
    await settle(page);
    return { fullPage: false, clip: viewportClip(page) };
  },
  async "cookie-preferences"(page) {
    await page.getByRole("button", { name: "Préférences", exact: true }).click();
    await parkMouse(page);
    await page.getByRole("switch").first().waitFor({ state: "attached" });
    await settle(page);
    return { fullPage: false, clip: viewportClip(page) };
  },
  async "focus-switch"(page) {
    await page.getByRole("button", { name: "Préférences", exact: true }).click();
    await parkMouse(page);
    const sw = page.getByRole("switch", { name: "Analytics Cookies" }).first();
    await sw.waitFor({ state: "attached" });
    await settle(page);
    await keyboardFocus(page, sw);
    await toTop(page);
    await settle(page, 300);
    return { fullPage: false, clip: viewportClip(page) };
  },
};

// ---- run --------------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
const selectors = allowSelectors();
const computed = { props: PROPS, captures: {} };
const classes = { all: new Set(), byPage: {} };
const regions = {};
const captures = {};
const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
let failures = 0;

for (const item of matrix) {
  const name = `${item.page.slug}__${item.width}__${item.state}`;
  if (ONLY && !ONLY.test(name)) continue;
  const t0 = Date.now();
  const cookieState = item.state.startsWith("cookie-") || item.state === "focus-switch";
  const context = await newContext(browser, BASE, item.width, { consent: !cookieState });
  const page = await context.newPage();
  try {
    await page.goto(BASE + item.page.path, { waitUntil: "load" });
    await stabilize(page);
    const shot = await STATES[item.state](page);
    const file = `${name}.png`;
    const opts = { path: path.join(OUT, file), animations: "disabled", caret: "hide", scale: "css" };
    if (shot.fullPage) opts.fullPage = true;
    if (shot.clip) opts.clip = shot.clip;
    await page.screenshot(opts);
    const scroll = await page.evaluate(() => [window.scrollX, window.scrollY]);
    // Region (page coords) used to restrict computed styles to what the screenshot shows.
    const region = shot.clip
      ? shot.fullPage ? shot.clip : { ...shot.clip, x: shot.clip.x + scroll[0], y: shot.clip.y + scroll[1] }
      : null;
    const dom = await page.evaluate(collectDom, { props: PROPS, region, selectors });
    const aria = await page.locator("body").ariaSnapshot();
    fs.mkdirSync(path.join(OUT, "aria"), { recursive: true });
    fs.writeFileSync(path.join(OUT, "aria", `${name}.yml`), aria + "\n");
    computed.captures[name] = { elements: dom.elements };
    regions[name] = dom.regions;
    dom.classes.forEach((c) => classes.all.add(c));
    classes.byPage[item.page.slug] = [...new Set([...(classes.byPage[item.page.slug] || []), ...dom.classes])].sort();
    const origin = shot.clip ? [region.x, region.y] : [0, 0];
    captures[name] = {
      page: item.page.slug, path: item.page.path, width: item.width, state: item.state, file, origin,
      scrollWidth: dom.scrollWidth, scrollHeight: dom.scrollHeight,
      frozenTimers: await page.evaluate(() => window.__macarFrozenTimers || []),
    };
    console.log(`ok   ${name} (${dom.elements.length} elements, ${Date.now() - t0} ms)`);
  } catch (e) {
    failures++;
    console.error(`FAIL ${name}: ${e.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}
await browser.close();

writeJson(path.join(OUT, "computed.json"), computed);
writeJson(path.join(OUT, "classes.json"), { all: [...classes.all].sort(), byPage: classes.byPage });
writeJson(path.join(OUT, "regions.json"), regions);
writeJson(path.join(OUT, "captures.json"), captures);
console.log(`${Object.keys(captures).length} captures written to ${OUT}, ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
```

- [ ] **Step 4: Lancer la capture sur les états de l'accueil**

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/try --only "^home__"
```

Attendu : 19 lignes `ok   home__...` (par exemple `ok   home__1280__default (634 elements, ... ms)`), puis `19 captures written to ...runs\try, 0 failure(s)`, en moins d'une minute.

- [ ] **Step 5: Contrôler visuellement 4 captures**

Ouvrir avec l'outil Read : `runs/try/home__390__menu-open.png` (croix, logo à droite, 6 liens, bouton « Demander un devis » plein), `runs/try/home__1280__faq-open.png` (première réponse ouverte, chevrons vers la gauche), `runs/try/home__390__focus-switch.png` (cases natives, contour de focus sur « Analytique »), `runs/try/home__320__focus-menu-button.png` (contour de focus natif autour de l'icône menu).

- [ ] **Step 6: Vérifier les boîtes des sélecteurs autorisés**

```bash
cd "D:/Repos/macar-migration-tools" && node -e "const r=require('./runs/try/regions.json');console.log(JSON.stringify(r['home__1280__cookie-preferences']['label:has(input[role=\"switch\"])'].rects), JSON.stringify(r['home__1280__faq-open']['#faq button[aria-expanded] svg'].rects))"
```

Attendu : 3 boîtes de 40 x 36 pour les interrupteurs (par exemple `[[1215,416,40,36],[1215,541,40,36],[1215,666,40,36]]`) et 7 boîtes de 16 x 16 pour les chevrons (une par question, la première étant celle de la question ouverte).

Puis l'arbre d'accessibilité :

```bash
cd "D:/Repos/macar-migration-tools" && ls runs/try/aria | wc -l && grep -c 'button "Fermer le menu" \[pressed\]' runs/try/aria/home__390__menu-open.yml && grep -c 'switch "Analytics Cookies" \[checked\]' runs/try/aria/home__1280__cookie-preferences.yml
```

Attendu : `19`, `1`, puis `2`.

- [ ] **Step 7: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add allow-step2.json capture.mjs && git commit -F - <<'EOF'
Add the page capture script and the accepted step 2 differences

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Comparateurs : pixels, styles calculés, états forcés, accessibilité et HTML

**Files:**
- Create: `D:\Repos\macar-migration-tools\compare.mjs`
- Create: `D:\Repos\macar-migration-tools\style-diff.mjs`
- Create: `D:\Repos\macar-migration-tools\state-diff.mjs`
- Create: `D:\Repos\macar-migration-tools\aria-diff.mjs`
- Create: `D:\Repos\macar-migration-tools\html-diff.mjs`

**Interfaces:**
- Consumes: deux dossiers produits par `capture.mjs`, et éventuellement `allow-step2.json` ; le serveur de la tâche 2 sur 3100 (`state-diff.mjs` en mode capture) ; `ref-site/.next/server/app` (`html-diff.mjs`) ; `html-validate` 11.16.1 (tâche 1).
- Produces: `compare.mjs`, `style-diff.mjs`, `state-diff.mjs`, `aria-diff.mjs` et `html-diff.mjs` (contrat ci-dessus).

**`compare.mjs`** : égalité exacte des octets RGBA, sans tolérance. Une taille d'image différente est un échec, sauf entrée `region: "*"`. Dans `<cur>/diff/<nom>.png`, le rouge signale une différence interdite, le bleu une différence autorisée.

**`style-diff.mjs`** : correspondance des éléments en 4 passes, pour rester exacte à l'étape 1 (DOM identique) et utile à l'étape 2 (DOM interne réécrit, ce que la spec autorise) :

1. même chemin DOM, même balise, mêmes classes : toutes les propriétés et la boîte ;
2. même chemin, même balise, même texte propre et même boîte (classe renommée, par exemple `flex-shrink-0` devenu `shrink-0`) : toutes les propriétés ;
3. même texte propre (n-ième occurrence) : propriétés de texte ;
4. élément qui peint (fond, bordure, ombre, contour, image, SVG, champ) avec la même boîte : propriétés de peinture.

Un élément qui peint ou qui porte du texte et qui reste sans correspondance est signalé `REMOVED` ou `ADDED`. Une enveloppe qui ne peint rien est ignorée. Le rapport est groupé par liste de classes (`classes de la référence  =>  classes courantes` quand elles diffèrent).

**`state-diff.mjs`** (spec 8.2 pour les classes à variante d'état, qu'aucune capture ne montre : survol, appui, focus de champ) : sur les 15 pages en 1280 et 390 px, chaque élément visible dont une classe porte `hover:`, `active:`, `focus:`, `focus-visible:` ou `group-hover:` reçoit l'état correspondant, forcé par le protocole DevTools (`CSS.forcePseudoState`, sur l'ancêtre `.group` pour `group-hover:`) ; les transitions en cours sont terminées, puis les propriétés de `PROPS` sont lues. Aucun événement n'est envoyé : les états posés par JavaScript ne sont pas couverts (les tests de comportement le font). Les variantes d'état rendu (`disabled:`, `peer-disabled:`, `placeholder:`, `data-[...]:`) sont déjà dans `computed.json`. Comparaison par chemin DOM, état et balise, puis par état, balise, texte propre et boîte (DOM réécrit à l'étape 2). Les entrées de `--allow` s'appliquent par page et par largeur.

**`aria-diff.mjs`** (spec 1 : libellés, états et textes alternatifs exposés aujourd'hui) : compare ligne à ligne, sans l'indentation, les arbres d'accessibilité `aria/*.yml` écrits par `capture.mjs` (`locator.ariaSnapshot()` de Playwright : rôles, noms accessibles, états `[expanded]`, `[checked]`, `[pressed]`, `[disabled]`, cibles des liens). Une différence attendue est listée dans un fichier `--expect` (`aria-step2.json`, tâche 34) avec sa raison.

**`html-diff.mjs`** (spec 1 : « Le HTML produit doit rester valide ») : valide les 28 pages prérendues (`.next/server/app/**/*.html`) des deux builds avec le préréglage `html-validate:standard` (règles de conformité, sans règles de style) et signale toute erreur que le build courant ajoute, comptée par page, règle et message (les sélecteurs portent des identifiants React Aria qui changent d'un build à l'autre). La référence a déjà 127 erreurs (balise `<style>` de HeroUI dans une `div`, `ul > button` et `ul > div` de la Navbar v2, `aria-label` sur une `div`, `div` dans un `button`, deux `main`) : seules les nouvelles comptent.

- [ ] **Step 1: Faire une seconde capture complète du même build**

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/det-a && node capture.mjs --base http://localhost:3100 --out runs/det-b
```

Attendu, deux fois : `47 captures written to ..., 0 failure(s)` (environ 2 min 20 chacune).

- [ ] **Step 2: Vérifier que les comparateurs n'existent pas encore**

```bash
cd "D:/Repos/macar-migration-tools" && node compare.mjs --ref runs/det-a --cur runs/det-b
```

Attendu : une erreur Node `Error: Cannot find module '...compare.mjs'` (code 1).

- [ ] **Step 3: Créer `compare.mjs`**

```js
// node compare.mjs --ref <dir> --cur <dir> [--allow allow-step2.json]
// Exact pixel comparison of every capture. Exit 0 only if every difference lies in an allowed region.
// Writes <cur>/diff/<name>.png (red: forbidden difference, blue: allowed difference) and <cur>/compare-report.json.
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { parseArgs, readJson, writeJson, loadAllow, allowFor } from "./lib/common.mjs";

const args = parseArgs();
if (!args.ref || !args.cur) {
  console.error("usage: node compare.mjs --ref <dir> --cur <dir> [--allow <file>]");
  process.exit(2);
}
const REF = path.resolve(args.ref);
const CUR = path.resolve(args.cur);
const allow = loadAllow(args.allow);
const PAD = 4; // px around an allowed element (focus outlines, anti-aliasing)

const refCaps = readJson(path.join(REF, "captures.json"));
const curCaps = readJson(path.join(CUR, "captures.json"));
const refRegions = readJson(path.join(REF, "regions.json"));
const curRegions = readJson(path.join(CUR, "regions.json"));
fs.rmSync(path.join(CUR, "diff"), { recursive: true, force: true });
fs.mkdirSync(path.join(CUR, "diff"), { recursive: true });

// Allowed rectangles in image coordinates for one capture.
function allowedRects(name, meta, refMeta, curMeta) {
  const rects = [];
  for (const e of allowFor(allow, meta)) {
    if (e.region === "*") continue; // whole capture, handled by the caller
    if (e.region) {
      const [x, y, w, h] = e.region;
      rects.push([x - PAD, y - PAD, w + 2 * PAD, h + 2 * PAD]);
      continue;
    }
    for (const [regions, m] of [[refRegions, refMeta], [curRegions, curMeta]]) {
      const hit = regions[name] && regions[name][e.selector];
      if (!hit) continue;
      for (const [x, y, w, h] of hit.rects) rects.push([x - m.origin[0] - PAD, y - m.origin[1] - PAD, w + 2 * PAD, h + 2 * PAD]);
    }
  }
  return rects;
}

const report = { identical: [], allowedOnly: [], failed: [], missing: [], extra: [] };
for (const name of Object.keys(refCaps).sort()) {
  const refMeta = refCaps[name];
  const curMeta = curCaps[name];
  if (!curMeta) { report.missing.push(name); continue; }
  const a = PNG.sync.read(fs.readFileSync(path.join(REF, refMeta.file)));
  const b = PNG.sync.read(fs.readFileSync(path.join(CUR, curMeta.file)));
  const rects = allowedRects(name, refMeta, refMeta, curMeta);
  const wholeAllowed = allowFor(allow, refMeta).some((e) => e.region === "*");
  if (a.width !== b.width || a.height !== b.height) {
    const entry = { name, reason: `size ${a.width}x${a.height} -> ${b.width}x${b.height}` };
    (wholeAllowed ? report.allowedOnly : report.failed).push(entry);
    continue;
  }
  const inAllowed = (x, y) => wholeAllowed || rects.some(([rx, ry, rw, rh]) => x >= rx && x < rx + rw && y >= ry && y < ry + rh);
  const out = new PNG({ width: a.width, height: a.height });
  let bad = 0;
  let ok = 0;
  let box = null;
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * 4;
      const same = a.data[i] === b.data[i] && a.data[i + 1] === b.data[i + 1] && a.data[i + 2] === b.data[i + 2] && a.data[i + 3] === b.data[i + 3];
      if (same) {
        const g = Math.round(0.3 * a.data[i] + 0.59 * a.data[i + 1] + 0.11 * a.data[i + 2]);
        const v = 255 - Math.round((255 - g) * 0.25);
        out.data[i] = v; out.data[i + 1] = v; out.data[i + 2] = v; out.data[i + 3] = 255;
      } else if (inAllowed(x, y)) {
        ok++;
        out.data[i] = 0; out.data[i + 1] = 90; out.data[i + 2] = 255; out.data[i + 3] = 255;
      } else {
        bad++;
        out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 0; out.data[i + 3] = 255;
        box = box ? [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)] : [x, y, x, y];
      }
    }
  }
  if (bad === 0 && ok === 0) { report.identical.push(name); continue; }
  fs.writeFileSync(path.join(CUR, "diff", `${name}.png`), PNG.sync.write(out));
  if (bad === 0) report.allowedOnly.push({ name, allowedPixels: ok });
  else report.failed.push({ name, pixels: bad, allowedPixels: ok, bbox: box && { x: box[0], y: box[1], width: box[2] - box[0] + 1, height: box[3] - box[1] + 1 } });
}
for (const name of Object.keys(curCaps)) if (!refCaps[name]) report.extra.push(name);

writeJson(path.join(CUR, "compare-report.json"), report);
console.log(`identical: ${report.identical.length}`);
console.log(`allowed differences only: ${report.allowedOnly.length}`);
for (const e of report.allowedOnly) console.log(`  ALLOWED ${e.name} ${e.reason || `${e.allowedPixels} px`}`);
console.log(`failed: ${report.failed.length}`);
for (const e of report.failed) console.log(`  DIFF ${e.name} ${e.reason || `${e.pixels} px, bbox ${JSON.stringify(e.bbox)}`}`);
if (report.missing.length) console.log(`missing in cur: ${report.missing.join(", ")}`);
if (report.extra.length) console.log(`extra in cur (ignored): ${report.extra.join(", ")}`);
process.exit(report.failed.length || report.missing.length ? 1 : 0);
```

- [ ] **Step 4: Créer `style-diff.mjs`**

```js
// node style-diff.mjs --ref <dir> --cur <dir> [--allow allow-step2.json]
// Compares computed.json of two captures (operational form of spec 8.2).
// Matching, per capture:
//   1. same DOM path + tag + class list            -> every property and the box are compared
//   2. same DOM path + tag + own text + same box   -> every property (class renamed, e.g. step 1)
//   3. same own text (n-th occurrence)             -> text properties only (DOM restructured, step 2)
//   4. painted element with the same box           -> paint properties only (DOM restructured, step 2)
// Unmatched elements that paint something or carry text are reported as removed/added.
// Unmatched wrappers that paint nothing are ignored (the spec allows internal DOM changes).
// Exit 0 only if no difference remains outside the allow list.
import path from "node:path";
import fs from "node:fs";
import { parseArgs, readJson, loadAllow, allowFor } from "./lib/common.mjs";

const args = parseArgs();
if (!args.ref || !args.cur) {
  console.error("usage: node style-diff.mjs --ref <dir> --cur <dir> [--allow <file>]");
  process.exit(2);
}
const REF = path.resolve(args.ref);
const CUR = path.resolve(args.cur);
const allow = loadAllow(args.allow);

const ref = readJson(path.join(REF, "computed.json"));
const cur = readJson(path.join(CUR, "computed.json"));
const refCaps = readJson(path.join(REF, "captures.json"));
const curCaps = readJson(path.join(CUR, "captures.json"));
const refRegions = readJson(path.join(REF, "regions.json"));
const curRegions = readJson(path.join(CUR, "regions.json"));

const PROPS = ref.props;
const curIndex = new Map(cur.props.map((p, i) => [p, i]));
const TEXT_PROPS = new Set([
  "color", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "text-align",
  "text-decoration-line", "text-decoration-color", "text-decoration-style", "text-underline-offset", "text-transform",
  "white-space", "word-break", "overflow-wrap", "-webkit-line-clamp", "opacity", "visibility",
]);
const PAINT_PROPS = new Set([
  "background-color", "background-image", "background-size", "background-position", "background-repeat", "background-clip",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
  "outline-style", "outline-width", "outline-color", "outline-offset", "box-shadow", "opacity", "visibility",
  "transform", "translate", "rotate", "scale", "filter", "backdrop-filter", "mix-blend-mode", "clip-path", "mask-image",
  "object-fit", "object-position", "fill", "stroke", "stroke-width", "color",
]);
const REPLACED = new Set(["img", "svg", "path", "circle", "rect", "line", "polyline", "polygon", "g", "input", "textarea", "select", "video", "canvas", "iframe", "picture"]);

const val = (el, prop, side) => el[5][side === "ref" ? PROPS.indexOf(prop) : curIndex.get(prop)];
const isTransparent = (c) => !c || /,0\)$/.test(c);
function paints(el, side) {
  if (REPLACED.has(el[1])) return true;
  if (!isTransparent(val(el, "background-color", side))) return true;
  if (val(el, "background-image", side) !== "none") return true;
  if (val(el, "box-shadow", side) !== "none") return true;
  if (val(el, "outline-style", side) !== "none" && parseFloat(val(el, "outline-width", side)) > 0) return true;
  for (const s of ["top", "right", "bottom", "left"]) {
    if (val(el, `border-${s}-style`, side) !== "none" && parseFloat(val(el, `border-${s}-width`, side)) > 0 && !isTransparent(val(el, `border-${s}-color`, side))) return true;
  }
  return false;
}
const sameRect = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.5);

function excludedKeys(regions, name, entries) {
  const keys = [];
  for (const e of entries) if (e.selector && regions[name] && regions[name][e.selector]) keys.push(...regions[name][e.selector].keys);
  return keys;
}
function isExcluded(el, keys, entries, origin) {
  if (keys.some((k) => el[0] === k || el[0].startsWith(k + ">") || el[0].startsWith(k + "::"))) return true;
  for (const e of entries) {
    if (!Array.isArray(e.region)) continue;
    const [x, y, w, h] = e.region;
    const r = el[4];
    const rx = r[0] - origin[0];
    const ry = r[1] - origin[1];
    if (rx >= x && ry >= y && rx + r[2] <= x + w && ry + r[3] <= y + h) return true;
  }
  return false;
}

const groups = new Map(); // class list -> { count, captures:Set, changes: Map(prop -> Set("a -> b")), samples: [] }
let total = 0;
function record(groupKey, name, el, changes) {
  total++;
  if (!groups.has(groupKey)) groups.set(groupKey, { count: 0, captures: new Set(), changes: new Map(), samples: [] });
  const g = groups.get(groupKey);
  g.count++;
  g.captures.add(name);
  for (const [p, a, b] of changes) {
    if (!g.changes.has(p)) g.changes.set(p, new Set());
    if (g.changes.get(p).size < 4) g.changes.get(p).add(`${a}  ->  ${b}`);
  }
  if (g.samples.length < 3) g.samples.push(`${name} ${el[0]}${el[3] ? ` "${el[3]}"` : ""}`);
}
function diffProps(a, b, only) {
  const changes = [];
  for (const p of PROPS) {
    if (only && !only.has(p)) continue;
    if (!curIndex.has(p)) continue;
    const va = val(a, p, "ref");
    const vb = val(b, p, "cur");
    if (va !== vb) changes.push([p, va, vb]);
  }
  return changes;
}

const missing = [];
for (const name of Object.keys(refCaps).sort()) {
  if (!cur.captures[name] || !ref.captures[name]) { missing.push(name); continue; }
  const entries = allowFor(allow, refCaps[name]);
  if (entries.some((e) => e.region === "*")) continue;
  const rk = excludedKeys(refRegions, name, entries);
  const ck = excludedKeys(curRegions, name, entries);
  const A = ref.captures[name].elements.filter((el) => !isExcluded(el, rk, entries, refCaps[name].origin));
  const B = cur.captures[name].elements.filter((el) => !isExcluded(el, ck, entries, curCaps[name].origin));
  const usedB = new Set();
  const left = [];
  const byKey = new Map(B.map((el, i) => [el[0], i]));

  // pass 1 and 2
  for (const a of A) {
    const i = byKey.get(a[0]);
    const b = i === undefined ? null : B[i];
    if (b && !usedB.has(i) && b[1] === a[1] && (b[2] === a[2] || (b[3] === a[3] && sameRect(a[4], b[4])))) {
      usedB.add(i);
      const changes = diffProps(a, b);
      if (!sameRect(a[4], b[4])) changes.push(["box", a[4].join(","), b[4].join(",")]);
      if (changes.length) record(a[2] === b[2] ? a[2] || `<${a[1]}>` : `${a[2]}  =>  ${b[2]}`, name, a, changes);
    } else left.push(a);
  }
  // pass 3: own text, n-th occurrence
  const textQueue = new Map();
  B.forEach((b, i) => { if (!usedB.has(i) && b[3]) { if (!textQueue.has(b[3])) textQueue.set(b[3], []); textQueue.get(b[3]).push(i); } });
  const left2 = [];
  for (const a of left) {
    const q = a[3] && textQueue.get(a[3]);
    if (q && q.length) {
      const i = q.shift();
      usedB.add(i);
      const changes = diffProps(a, B[i], TEXT_PROPS);
      if (changes.length) record(`${a[2] || `<${a[1]}>`}  =>  ${B[i][2] || `<${B[i][1]}>`}`, name, a, changes);
    } else left2.push(a);
  }
  // pass 4: painted elements with the same box
  for (const a of left2) {
    if (!paints(a, "ref") && !a[3]) continue;
    const i = B.findIndex((b, j) => !usedB.has(j) && paints(b, "cur") && sameRect(a[4], b[4]) && diffProps(a, b, PAINT_PROPS).length === 0);
    if (i >= 0) { usedB.add(i); continue; }
    const j = B.findIndex((b, k) => !usedB.has(k) && paints(b, "cur") && sameRect(a[4], b[4]) && (a[1] === b[1] || (REPLACED.has(a[1]) === REPLACED.has(b[1]))));
    if (j >= 0) {
      usedB.add(j);
      record(`${a[2] || `<${a[1]}>`}  =>  ${B[j][2] || `<${B[j][1]}>`}`, name, a, diffProps(a, B[j], PAINT_PROPS));
      continue;
    }
    record(`REMOVED ${a[2] || `<${a[1]}>`}`, name, a, [["element", `${a[1]} ${a[4].join(",")}`, "absent"]]);
  }
  B.forEach((b, i) => {
    if (usedB.has(i) || (!paints(b, "cur") && !b[3])) return;
    record(`ADDED ${b[2] || `<${b[1]}>`}`, name, b, [["element", "absent", `${b[1]} ${b[4].join(",")}`]]);
  });
}

const lines = [];
const sorted = [...groups.entries()].sort((x, y) => y[1].count - x[1].count);
for (const [cls, g] of sorted) {
  lines.push(`\n[${g.count}x] ${cls}`);
  lines.push(`  captures: ${[...g.captures].slice(0, 6).join(", ")}${g.captures.size > 6 ? ` (+${g.captures.size - 6})` : ""}`);
  for (const [p, set] of g.changes) for (const s of set) lines.push(`  ${p}: ${s}`);
  for (const s of g.samples) lines.push(`  e.g. ${s}`);
}
const out = [`style differences: ${total} element(s) in ${groups.size} class group(s)`, ...lines].join("\n");
fs.writeFileSync(path.join(CUR, "style-diff.txt"), out + "\n");
fs.writeFileSync(path.join(CUR, "style-diff.json"), JSON.stringify(sorted.map(([cls, g]) => ({
  classes: cls, count: g.count, captures: [...g.captures],
  changes: Object.fromEntries([...g.changes].map(([p, s]) => [p, [...s]])), samples: g.samples,
})), null, 1));
console.log(out.split("\n").slice(0, 80).join("\n"));
if (missing.length) console.log(`missing captures in cur: ${missing.join(", ")}`);
console.log(`full report: ${path.join(CUR, "style-diff.txt")}`);
process.exit(total || missing.length ? 1 : 0);
```

- [ ] **Step 5: Créer `state-diff.mjs`**

```js
// node state-diff.mjs --base <url> --out <dir>
// node state-diff.mjs --ref <dir> --cur <dir> [--allow allow-step2.json]
// Interaction states that no screenshot shows (spec 8.2 for classes with a state variant).
// Capture mode: on every page of PAGES at 1280 and 390 px, every visible element whose class list
// holds a hover:, active:, focus:, focus-visible: or group-hover: class gets that state forced through
// the DevTools protocol (CSS.forcePseudoState, on the closest .group ancestor for group-hover:);
// running CSS transitions are finished, then PROPS are read with getComputedStyle and the state is
// released. Result: <out>/states.json. Variants that depend on the rendered state (disabled:,
// peer-disabled:, placeholder:, data-[...]:) are already covered by computed.json.
// Compare mode: entries are matched by DOM path + state + tag, then by state + tag + own text + box
// (DOM rewritten at step 2). Exit 0 only if no difference remains outside the allow list
// (allow entries apply by page and width; their state is ignored here).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { PAGES, newContext, stabilize, parkMouse, parseArgs, readJson, writeJson, loadAllow, allowSelectors } from "./lib/common.mjs";
import { PROPS } from "./lib/dom-probe.mjs";

const args = parseArgs();
const STATE_OF = { hover: "hover", active: "active", focus: "focus", "focus-visible": "focus-visible", "group-hover": "hover" };

// In-page: marks every target (data-sd) and returns [index, key, tag, classes, own text, box, states, allowedBy].
function markTargets({ variants, selectors }) {
  const round = (n) => Math.round(n * 100) / 100;
  const keyOf = new Map();
  const pathKey = (el) => {
    if (keyOf.has(el)) return keyOf.get(el);
    let key;
    const tag = el.tagName.toLowerCase();
    if (!el.parentElement) key = tag;
    else {
      let n = 1;
      for (let s = el.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === el.tagName) n++;
      key = `${pathKey(el.parentElement)}>${tag}:${n}`;
    }
    keyOf.set(el, key);
    return key;
  };
  const ownText = (el) => {
    let t = "";
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    t = t.replace(/\s+/g, " ").trim();
    return t.length > 80 ? t.slice(0, 80) : t;
  };
  const out = [];
  let next = 0;
  for (const el of document.querySelectorAll("body [class]")) {
    const tokens = typeof el.className === "string" ? el.className.split(/\s+/) : (el.getAttribute("class") || "").split(/\s+/);
    const found = new Set();
    for (const t of tokens) {
      const parts = t.split(":");
      for (const v of parts.slice(0, -1)) if (variants.includes(v)) found.add(v);
    }
    if (!found.size) continue;
    if (!el.checkVisibility({ visibilityProperty: true })) continue;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const states = [];
    for (const v of found) {
      let target = el;
      if (v === "group-hover") {
        target = el.parentElement && el.parentElement.closest(".group");
        if (!target) continue;
      }
      if (!target.hasAttribute("data-sd")) target.setAttribute("data-sd", String(next++));
      states.push([v, Number(target.getAttribute("data-sd"))]);
    }
    if (!el.hasAttribute("data-sd")) el.setAttribute("data-sd", String(next++));
    const allowedBy = selectors.filter((s) => { try { return !!el.closest(s); } catch { return false; } });
    out.push([Number(el.getAttribute("data-sd")), pathKey(el), el.tagName.toLowerCase(),
      (el.getAttribute("class") || "").trim().replace(/\s+/g, " "), ownText(el),
      [round(b.left + scrollX), round(b.top + scrollY), round(b.width), round(b.height)], states, allowedBy]);
  }
  return out;
}

// In-page: finishes running CSS transitions, then reads PROPS of one marked element (colors as rgba).
function readState({ id, props }) {
  const el = document.querySelector(`[data-sd="${id}"]`);
  getComputedStyle(el).color;
  for (const a of document.getAnimations()) if (a instanceof CSSTransition) a.finish();
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const toRgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${d[0]},${d[1]},${d[2]},${Math.round((d[3] / 255) * 1000) / 1000})`;
  };
  const COLOR_RE = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/g;
  const COLOR_TEST = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/;
  const cs = getComputedStyle(el);
  return props.map((p) => {
    const v = cs.getPropertyValue(p);
    return COLOR_TEST.test(v) ? v.replace(COLOR_RE, (m) => toRgba(m)) : v;
  });
}

async function capture() {
  const BASE = args.base.replace(/\/$/, "");
  const OUT = path.resolve(args.out);
  const selectors = allowSelectors();
  const result = { props: PROPS, captures: {} };
  const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
  let failures = 0;
  let count = 0;
  for (const p of PAGES) {
    for (const width of [1280, 390]) {
      const name = `${p.slug}__${width}`;
      const context = await newContext(browser, BASE, width);
      const page = await context.newPage();
      try {
        await page.goto(BASE + p.path, { waitUntil: "load" });
        await stabilize(page);
        await parkMouse(page);
        const targets = await page.evaluate(markTargets, { variants: Object.keys(STATE_OF), selectors });
        const cdp = await context.newCDPSession(page);
        await cdp.send("DOM.enable");
        await cdp.send("CSS.enable");
        const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
        const nodeIds = new Map();
        const nodeOf = async (id) => {
          if (!nodeIds.has(id)) nodeIds.set(id, (await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-sd="${id}"]` })).nodeId);
          return nodeIds.get(id);
        };
        const entries = [];
        for (const [id, key, tag, cls, text, rect, states, allowedBy] of targets) {
          for (const [variant, forcedOn] of states) {
            const nodeId = await nodeOf(forcedOn);
            await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [STATE_OF[variant]] });
            const values = await page.evaluate(readState, { id, props: PROPS });
            await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
            entries.push([`${key}|${variant}`, tag, cls, text, rect, values, allowedBy]);
          }
        }
        await page.evaluate(() => { for (const a of document.getAnimations()) if (a instanceof CSSTransition) a.finish(); });
        result.captures[name] = { page: p.slug, width, elements: entries };
        count += entries.length;
        console.log(`ok   ${name} (${targets.length} elements, ${entries.length} states)`);
      } catch (e) {
        failures++;
        console.error(`FAIL ${name}: ${e.message.split("\n")[0]}`);
      } finally {
        await context.close();
      }
    }
  }
  await browser.close();
  writeJson(path.join(OUT, "states.json"), result);
  console.log(`${count} forced states written to ${path.join(OUT, "states.json")}, ${failures} failure(s)`);
  process.exit(failures ? 1 : 0);
}

function compare() {
  const REF = path.resolve(args.ref);
  const CUR = path.resolve(args.cur);
  const allow = loadAllow(args.allow);
  const ref = readJson(path.join(REF, "states.json"));
  const cur = readJson(path.join(CUR, "states.json"));
  const curIndex = new Map(cur.props.map((p, i) => [p, i]));
  const sameRect = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.5);
  const lines = [];
  let total = 0;
  const report = (name, label, e, detail) => {
    total++;
    lines.push(`${label} ${name} ${e[0]}${e[3] ? ` "${e[3]}"` : ""}\n  classes: ${e[2]}${detail ? `\n${detail}` : ""}`);
  };
  for (const name of Object.keys(ref.captures).sort()) {
    const A = ref.captures[name];
    const B = cur.captures[name];
    if (!B) { total++; lines.push(`MISSING ${name}`); continue; }
    const allowed = new Set(allow.filter((e) => e.selector && (e.page === undefined || e.page === "*" || e.page === A.page)
      && (e.width === undefined || e.width === "*" || String(e.width) === String(A.width))).map((e) => e.selector));
    const skip = (e) => e[6].some((s) => allowed.has(s));
    const used = new Set();
    const byKey = new Map(B.elements.map((e, i) => [e[0], i]));
    const left = [];
    for (const a of A.elements) {
      const i = byKey.get(a[0]);
      if (i !== undefined && !used.has(i) && B.elements[i][1] === a[1]) { used.add(i); left.push([a, B.elements[i]]); continue; }
      const state = a[0].split("|")[1];
      const j = B.elements.findIndex((b, k) => !used.has(k) && b[0].split("|")[1] === state && b[1] === a[1] && b[3] === a[3] && sameRect(a[4], b[4]));
      if (j >= 0) { used.add(j); left.push([a, B.elements[j]]); continue; }
      if (!skip(a)) report(name, "REMOVED", a, "");
    }
    for (const [a, b] of left) {
      if (skip(a) || skip(b)) continue;
      const changes = [];
      ref.props.forEach((p, k) => {
        if (!curIndex.has(p)) return;
        const va = a[5][k];
        const vb = b[5][curIndex.get(p)];
        if (va !== vb) changes.push(`  ${p}: ${va}  ->  ${vb}`);
      });
      if (!sameRect(a[4], b[4])) changes.push(`  box: ${a[4].join(",")}  ->  ${b[4].join(",")}`);
      if (changes.length) report(name, "CHANGED", a, (a[2] === b[2] ? "" : `  now: ${b[2]}\n`) + changes.join("\n"));
    }
    B.elements.forEach((b, i) => { if (!used.has(i) && !skip(b)) report(name, "ADDED", b, ""); });
  }
  const out = [`state differences: ${total}`, ...lines].join("\n");
  fs.writeFileSync(path.join(CUR, "state-diff.txt"), out + "\n");
  console.log(out.split("\n").slice(0, 80).join("\n"));
  console.log(`full report: ${path.join(CUR, "state-diff.txt")}`);
  process.exit(total ? 1 : 0);
}

if (args.base && args.out) await capture();
else if (args.ref && args.cur) compare();
else {
  console.error("usage: node state-diff.mjs --base <url> --out <dir> | --ref <dir> --cur <dir> [--allow <file>]");
  process.exit(2);
}
```

- [ ] **Step 6: Créer `aria-diff.mjs`**

```js
// node aria-diff.mjs --ref <dir> --cur <dir> [--expect <file>]
// Compares the accessibility snapshots written by capture.mjs (<dir>/aria/<capture>.yml): roles,
// accessible names (labels, alt texts), states ([expanded], [checked], [pressed]...) and link targets.
// Lines are compared without their indentation (a wrapper such as an added listitem only adds its own
// line). An --expect file lists the documented differences:
//   [{ "captures": "<regex on the capture name>", "change": "+" | "-", "line": "<regex on the trimmed line>", "reason": "..." }]
// Exit 0 only if every added or removed line is expected.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, readJson } from "./lib/common.mjs";

const args = parseArgs();
if (!args.ref || !args.cur) {
  console.error("usage: node aria-diff.mjs --ref <dir> --cur <dir> [--expect <file>]");
  process.exit(2);
}
const REF = path.join(path.resolve(args.ref), "aria");
const CUR = path.join(path.resolve(args.cur), "aria");
const expect = args.expect ? readJson(path.resolve(args.expect)) : [];
for (const e of expect) if (!e.reason || !e.captures || !e.change || !e.line) throw new Error(`expect entry incomplete: ${JSON.stringify(e)}`);
const rules = expect.map((e) => ({ ...e, capRe: new RegExp(e.captures), lineRe: new RegExp(e.line), used: 0 }));

const read = (file) => fs.readFileSync(file, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

// Longest common subsequence diff: returns [["-", line] | ["+", line]].
function diff(a, b) {
  const n = a.length;
  const m = b.length;
  const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) out.push(["-", a[i++]]); else out.push(["+", b[j++]]);
  }
  while (i < n) out.push(["-", a[i++]]);
  while (j < m) out.push(["+", b[j++]]);
  return out;
}

const lines = [];
let unexpected = 0;
let expected = 0;
for (const file of fs.readdirSync(REF).filter((f) => f.endsWith(".yml")).sort()) {
  const name = file.replace(/\.yml$/, "");
  if (!fs.existsSync(path.join(CUR, file))) { unexpected++; lines.push(`MISSING ${name}`); continue; }
  const changes = diff(read(path.join(REF, file)), read(path.join(CUR, file)));
  const shown = [];
  for (const [sign, line] of changes) {
    const rule = rules.find((r) => r.change === sign && r.capRe.test(name) && r.lineRe.test(line));
    if (rule) { rule.used++; expected++; shown.push(`  ${sign} ${line}    (expected: ${rule.reason})`); } else { unexpected++; shown.push(`  ${sign} ${line}    UNEXPECTED`); }
  }
  if (shown.length) lines.push(name, ...shown);
}
for (const r of rules) if (!r.used) lines.push(`expect entry never used: ${r.reason}`);
const out = [`aria differences: ${unexpected} unexpected, ${expected} expected`, ...lines].join("\n");
fs.writeFileSync(path.join(path.resolve(args.cur), "aria-diff.txt"), out + "\n");
console.log(out.split("\n").slice(0, 120).join("\n"));
console.log(`full report: ${path.join(path.resolve(args.cur), "aria-diff.txt")}`);
process.exit(unexpected ? 1 : 0);
```

- [ ] **Step 7: Créer `html-diff.mjs`**

```js
// node html-diff.mjs --ref-site <repo dir> --cur-site <repo dir> --out <dir>
// Spec 1, "le HTML produit doit rester valide": validates every prerendered page
// (<repo>/.next/server/app/**/*.html) of both builds with the html-validate:standard preset
// (conformance rules only, no style rules) and reports every error the current build adds.
// Errors are counted per page, rule and message (selectors carry React Aria ids that change per build).
// Writes <out>/html-diff.txt. Exit 0 only if the current build adds no error.
import fs from "node:fs";
import path from "node:path";
import { HtmlValidate, StaticConfigLoader } from "html-validate";
import { parseArgs } from "./lib/common.mjs";

const args = parseArgs();
if (!args["ref-site"] || !args["cur-site"] || !args.out) {
  console.error("usage: node html-diff.mjs --ref-site <repo dir> --cur-site <repo dir> --out <dir>");
  process.exit(2);
}
const validator = new HtmlValidate(new StaticConfigLoader({ extends: ["html-validate:standard"] }));

async function errors(repo) {
  const root = path.join(path.resolve(repo), ".next", "server", "app");
  const files = fs.readdirSync(root, { recursive: true }).filter((f) => f.endsWith(".html")).map((f) => f.split(path.sep).join("/")).sort();
  const counts = new Map();
  for (const f of files) {
    const report = await validator.validateFile(path.join(root, f));
    for (const r of report.results) for (const m of r.messages) {
      const key = `${f}  ${m.ruleId}  ${m.message}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return { files, counts };
}

const ref = await errors(args["ref-site"]);
const cur = await errors(args["cur-site"]);
const lines = [];
let added = 0;
let removed = 0;
for (const f of ref.files) if (!cur.files.includes(f)) lines.push(`MISSING PAGE ${f}`);
for (const [key, n] of cur.counts) {
  const d = n - (ref.counts.get(key) || 0);
  if (d > 0) { added += d; lines.push(`NEW ${d}x ${key}`); }
}
for (const [key, n] of ref.counts) {
  const d = n - (cur.counts.get(key) || 0);
  if (d > 0) { removed += d; lines.push(`FIXED ${d}x ${key}`); }
}
const sum = (c) => [...c.values()].reduce((a, b) => a + b, 0);
const out = [
  `pages: ${ref.files.length} reference, ${cur.files.length} current`,
  `HTML errors: ${sum(ref.counts)} reference, ${sum(cur.counts)} current`,
  `new HTML errors: ${added}`,
  `fixed HTML errors: ${removed}`,
  ...lines.sort(),
].join("\n");
fs.mkdirSync(path.resolve(args.out), { recursive: true });
fs.writeFileSync(path.join(path.resolve(args.out), "html-diff.txt"), out + "\n");
console.log(out.split("\n").filter((l) => !l.startsWith("FIXED")).join("\n"));
process.exit(added || lines.some((l) => l.startsWith("MISSING")) ? 1 : 0);
```

- [ ] **Step 8: Prouver le déterminisme des captures**

```bash
cd "D:/Repos/macar-migration-tools" && node compare.mjs --ref runs/det-a --cur runs/det-b; echo "exit $?"; node style-diff.mjs --ref runs/det-a --cur runs/det-b; echo "exit $?"; node aria-diff.mjs --ref runs/det-a --cur runs/det-b; echo "exit $?"
```

Attendu :

```
identical: 47
allowed differences only: 0
failed: 0
exit 0
style differences: 0 element(s) in 0 class group(s)
full report: ...runs\det-b\style-diff.txt
exit 0
aria differences: 0 unexpected, 0 expected
full report: ...runs\det-b\aria-diff.txt
exit 0
```

Si une capture diffère, ouvrir `runs/det-b/diff/<nom>.png`, trouver la source d'instabilité (animation, minuterie, image), corriger `lib/common.mjs` et recommencer les étapes 1 et 8. Ne pas passer à la suite tant que la comparaison n'est pas à zéro.

- [ ] **Step 9: Prouver le déterminisme des états forcés**

```bash
cd "D:/Repos/macar-migration-tools" && node state-diff.mjs --base http://localhost:3100 --out runs/det-a | tail -n 1 && node state-diff.mjs --base http://localhost:3100 --out runs/det-b | tail -n 1 && node state-diff.mjs --ref runs/det-a --cur runs/det-b; echo "exit $?"
```

Attendu (environ 2 min par passage ; 658 états forcés mesurés sur `a37ed9e`) :

```
658 forced states written to ...runs\det-a\states.json, 0 failure(s)
658 forced states written to ...runs\det-b\states.json, 0 failure(s)
state differences: 0
full report: ...runs\det-b\state-diff.txt
exit 0
```

Contrôle de sensibilité, mesuré pendant la relecture : une valeur `text-decoration-line` passée de `underline` à `none` sur le bouton « Voir plus » (`hover:underline`) d'une copie de `states.json` donne `state differences: 1`, la ligne `CHANGED home__1280 ...|hover "Voir plus"` et le code 1.

- [ ] **Step 10: Valider le HTML prérendu de la référence contre lui-même**

```bash
cd "D:/Repos/macar-migration-tools" && node html-diff.mjs --ref-site ref-site --cur-site ref-site --out runs/html-self; echo "exit $?"
```

Attendu :

```
pages: 28 reference, 28 current
HTML errors: 127 reference, 127 current
new HTML errors: 0
fixed HTML errors: 0
exit 0
```

- [ ] **Step 11: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add compare.mjs style-diff.mjs state-diff.mjs aria-diff.mjs html-diff.mjs && git commit -F - <<'EOF'
Add the pixel, style, state, accessibility and HTML comparison scripts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6: Contrôles négatifs des comparateurs

**Files:**
- Create: `D:\Repos\macar-migration-tools\selftest.mjs`

**Interfaces:**
- Consumes: un dossier de capture, `compare.mjs`, `style-diff.mjs`, `allow-step2.json`.
- Produces: `node selftest.mjs --ref <dir>` : prouve qu'un pixel changé fait échouer `compare.mjs`, qu'un pixel changé dans le chevron ouvert passe avec `--allow allow-step2.json` (exception 2) et échoue sans, et qu'une couleur changée fait échouer `style-diff.mjs`.

- [ ] **Step 1: Créer `selftest.mjs`**

```js
// node selftest.mjs --ref <capture dir>
// Negative controls for compare.mjs and style-diff.mjs: copies the capture, injects known differences,
// and checks that each tool fails (or passes thanks to allow-step2.json) exactly as expected.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";
import { parseArgs, readJson, writeJson, TOOLS_DIR } from "./lib/common.mjs";

const args = parseArgs();
if (!args.ref) { console.error("usage: node selftest.mjs --ref <capture dir>"); process.exit(2); }
const REF = path.resolve(args.ref);
const TMP = path.join(TOOLS_DIR, "runs", "selftest");
const ALLOW = path.join(TOOLS_DIR, "allow-step2.json");

function run(script, extra = []) {
  try {
    execFileSync(process.execPath, [path.join(TOOLS_DIR, script), "--ref", REF, "--cur", TMP, ...extra], { stdio: "pipe" });
    return 0;
  } catch (e) {
    return e.status;
  }
}
function reset() {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.cpSync(REF, TMP, { recursive: true, filter: (src) => !src.includes(`${path.sep}diff`) });
}
function paint(file, x, y) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const i = (y * png.width + x) * 4;
  png.data[i] = 255 - png.data[i];
  fs.writeFileSync(file, PNG.sync.write(png));
}
let failures = 0;
const check = (label, got, want) => {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${label} (exit ${got}, expected ${want})`);
};

reset();
check("compare: identical copy", run("compare.mjs"), 0);
check("style-diff: identical copy", run("style-diff.mjs"), 0);

reset();
paint(path.join(TMP, "home__1280__default.png"), 640, 400);
check("compare: one pixel changed", run("compare.mjs"), 1);

reset();
const caps = readJson(path.join(TMP, "captures.json"));
const regions = readJson(path.join(TMP, "regions.json"));
const meta = caps["home__1280__faq-open"];
// rects[0] is the first question's chevron, the one the faq-open state opens.
const [cx, cy] = regions["home__1280__faq-open"]["#faq button[aria-expanded] svg"].rects[0];
paint(path.join(TMP, meta.file), Math.round(cx - meta.origin[0] + 4), Math.round(cy - meta.origin[1] + 4));
check("compare: pixel changed inside the open FAQ chevron, without allow", run("compare.mjs"), 1);
check("compare: same change with allow-step2.json (exception 2)", run("compare.mjs", ["--allow", ALLOW]), 0);

reset();
const computed = readJson(path.join(TMP, "computed.json"));
const colorIdx = computed.props.indexOf("color");
const el = computed.captures["home__1280__default"].elements.find((e) => e[3]);
el[5][colorIdx] = "rgba(255,0,0,1)";
writeJson(path.join(TMP, "computed.json"), computed);
check(`style-diff: color changed on ${el[1]} "${el[3]}"`, run("style-diff.mjs"), 1);

fs.rmSync(TMP, { recursive: true, force: true });
console.log(failures ? `${failures} self-test failure(s)` : "all self-tests passed");
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Lancer les contrôles sur la capture de la tâche 5**

```bash
cd "D:/Repos/macar-migration-tools" && node selftest.mjs --ref runs/det-a; echo "exit $?"
```

Attendu (en moins d'une minute) :

```
PASS compare: identical copy (exit 0, expected 0)
PASS style-diff: identical copy (exit 0, expected 0)
PASS compare: one pixel changed (exit 1, expected 1)
PASS compare: pixel changed inside the open FAQ chevron, without allow (exit 1, expected 1)
PASS compare: same change with allow-step2.json (exception 2) (exit 0, expected 0)
PASS style-diff: color changed on p "Accueil" (exit 1, expected 1)
all self-tests passed
exit 0
```

Pendant le prototypage, un contrôle réel a aussi été fait sur un build modifié (bordure des cartes d'avis en `border-neutral-300`, `flex-shrink-0` renommé en `shrink-0`, chevron pivoté par CSS) : `compare.mjs` a signalé les deux captures `home__*__default` (bordures) et seulement autorisé les deux `faq-open` ; `style-diff.mjs` a signalé la couleur de bordure et, en plus, l'activation de la classe interne v2 `shrink-0` sur les 40 séparateurs `hr` de la FAQ (`flex-shrink: 1 -> 0`, sans effet visuel). C'est exactement le risque décrit en 5.3 de la spec.

- [ ] **Step 3: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add selftest.mjs && git commit -F - <<'EOF'
Add negative controls for the comparison scripts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7: Enregistrement des animations (menu mobile, FAQ)

**Files:**
- Create: `D:\Repos\macar-migration-tools\record.mjs`

**Interfaces:**
- Consumes: `lib/common.mjs`, serveur sur 3100.
- Produces: `record.mjs` (contrat ci-dessus). `timings.json` contient, pour `menu` (390 px) et `faq` (1280 px), phases `open` et `close`, les échantillons par image (`t` en ms après le clic) et `durations` : dernier changement de chaque signal. Signaux du menu, mesurés sur le lien « Nous recrutons » du panneau : `opacity` (opacité effective, produit des ancêtres), `y` (position verticale), `present` (lien rendu), `covers` (le bas de l'écran est couvert par le panneau). Signaux de la FAQ : `opacity` et `present` de la première réponse, `y` de la deuxième question (elle descend avec la hauteur du panneau). Ces mesures ne dépendent pas de la structure DOM, elles valent pour v2 et pour v3.

- [ ] **Step 1: Créer `record.mjs`**

```js
// node record.mjs --base <url> --out <dir> [--ref <timings.json>] [--tolerance 50]
// Records the opening and closing of the mobile menu (390 px) and of one FAQ question (1280 px):
// a video per sequence (<out>/menu.webm, <out>/faq.webm) and per-frame samples + durations in <out>/timings.json.
// With --ref, compares the durations with a reference timings.json (exit 1 beyond the tolerance, in ms).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { newContext, stabilize, parkMouse, delay, parseArgs, readJson, SEL } from "./lib/common.mjs";

const args = parseArgs();
if (!args.base || !args.out) {
  console.error("usage: node record.mjs --base <url> --out <dir> [--ref <timings.json>] [--tolerance <ms>]");
  process.exit(2);
}
const BASE = args.base.replace(/\/$/, "");
const OUT = path.resolve(args.out);
const TOL = Number(args.tolerance || 50);
const FIRST_ANSWER = "Macar est une entreprise belge spécialisée";
fs.mkdirSync(OUT, { recursive: true });

// In-page sampler: one sample per animation frame for `ms` milliseconds after the next click.
async function sampleAfterClick(page, locator, kind, ms = 1500) {
  await page.evaluate(({ kind, ms, firstAnswer }) => {
    const effOpacity = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return Math.round(o * 1000) / 1000; };
    const hasFixedAncestor = (el) => { for (let e = el; e; e = e.parentElement) if (getComputedStyle(e).position === "fixed") return true; return false; };
    const probes = {
      menu() {
        const link = [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Nous recrutons" && hasFixedAncestor(a));
        const below = document.elementFromPoint(Math.floor(innerWidth / 2), innerHeight - 20);
        return {
          present: !!link,
          opacity: link ? effOpacity(link) : 0,
          y: link ? Math.round(link.getBoundingClientRect().top * 10) / 10 : null,
          covers: !!below && hasFixedAncestor(below) && !below.closest("nav"),
        };
      },
      faq() {
        const triggers = [...document.querySelectorAll("#faq button[aria-expanded]")];
        const answer = [...document.querySelectorAll("#faq *")].find((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.includes(firstAnswer)));
        const visible = !!answer && answer.checkVisibility({ visibilityProperty: true });
        return {
          present: visible,
          opacity: visible ? effOpacity(answer) : 0,
          y: Math.round(triggers[1].getBoundingClientRect().top * 10) / 10,
        };
      },
    };
    window.__rec = { samples: [], clickT: null };
    window.addEventListener("click", () => {
      if (window.__rec.clickT !== null) return;
      const t0 = performance.now();
      window.__rec.clickT = t0;
      const loop = () => {
        window.__rec.samples.push({ t: Math.round((performance.now() - t0) * 10) / 10, ...probes[kind]() });
        if (performance.now() - t0 < ms) requestAnimationFrame(loop);
      };
      window.__rec.samples.push({ t: 0, ...probes[kind]() });
      requestAnimationFrame(loop);
    }, { capture: true, once: true });
  }, { kind, ms, firstAnswer: FIRST_ANSWER });
  await locator.click();
  await parkMouse(page);
  await delay(ms + 300);
  return page.evaluate(() => window.__rec.samples);
}

// Time (ms after the click) of the last change of each signal.
function durations(samples) {
  const out = {};
  for (const key of ["opacity", "y", "present", "covers"]) {
    if (!(key in samples[0])) continue;
    let last = 0;
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1][key];
      const b = samples[i][key];
      const changed = typeof a === "number" && typeof b === "number" ? Math.abs(a - b) > 0.01 : a !== b;
      if (changed) last = samples[i].t;
    }
    out[key] = last;
  }
  return out;
}

async function sequence(browser, width, name, run) {
  const videoDir = path.join(OUT, `video-${name}`);
  fs.rmSync(videoDir, { recursive: true, force: true });
  const context = await newContext(browser, BASE, width, { recordVideoDir: videoDir });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await stabilize(page, { scrollThrough: false });
  const result = await run(page);
  const video = page.video();
  await context.close();
  if (video) {
    fs.copyFileSync(await video.path(), path.join(OUT, `${name}.webm`));
    fs.rmSync(videoDir, { recursive: true, force: true });
  }
  return result;
}

const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
const timings = {};

timings.menu = await sequence(browser, 390, "menu", async (page) => {
  const button = page.locator(SEL.menuButton);
  const open = await sampleAfterClick(page, button, "menu");
  await delay(300);
  const close = await sampleAfterClick(page, button, "menu");
  return { open: { durations: durations(open), samples: open }, close: { durations: durations(close), samples: close } };
});

timings.faq = await sequence(browser, 1280, "faq", async (page) => {
  await page.locator(SEL.faqSection).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await delay(300);
  const trigger = page.locator(SEL.faqTriggers).first();
  const open = await sampleAfterClick(page, trigger, "faq");
  await delay(300);
  const close = await sampleAfterClick(page, trigger, "faq");
  return { open: { durations: durations(open), samples: open }, close: { durations: durations(close), samples: close } };
});
await browser.close();

fs.writeFileSync(path.join(OUT, "timings.json"), JSON.stringify(timings, null, 1));
let failed = 0;
const refT = args.ref ? readJson(path.resolve(args.ref)) : null;
for (const comp of ["menu", "faq"]) {
  for (const phase of ["open", "close"]) {
    const d = timings[comp][phase].durations;
    const r = refT && refT[comp][phase].durations;
    const parts = Object.entries(d).map(([k, v]) => {
      if (!r) return `${k}=${v}ms`;
      const delta = Math.round(v - r[k]);
      const bad = Math.abs(delta) > TOL;
      if (bad) failed++;
      return `${k}=${v}ms (ref ${r[k]}ms, ${delta >= 0 ? "+" : ""}${delta}${bad ? " OUT" : ""})`;
    });
    console.log(`${comp} ${phase}: ${parts.join(", ")}`);
  }
}
console.log(`timings and videos written to ${OUT}`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Enregistrer deux fois et comparer**

```bash
cd "D:/Repos/macar-migration-tools" && node record.mjs --base http://localhost:3100 --out runs/rec-a && node record.mjs --base http://localhost:3100 --out runs/rec-b --ref runs/rec-a/timings.json; echo "exit $?"
```

Attendu (valeurs mesurées sur le prototype, à 15 ms près d'une exécution à l'autre) :

```
menu open: opacity=240ms, y=258ms, present=10ms, covers=10ms
menu close: opacity=272ms, y=272ms, present=272ms, covers=272ms
faq open: opacity=450ms, y=350ms, present=14ms
faq close: opacity=327ms, y=327ms, present=327ms
```

Lecture : le menu apparaît en fondu et glisse en 0,25 s ; à la fermeture il reste affiché tel quel puis disparaît d'un coup vers 270 à 290 ms (démontage après l'`AnimatePresence` de 0,25 s, l'animation de hauteur étant masquée par `min-h-[calc(100dvh-4rem)]`). La FAQ s'ouvre en hauteur vers 340 à 350 ms (ressort de 0,3 s) et en opacité vers 440 à 450 ms (0,4 s), et se ferme en 320 à 335 ms. La seconde exécution affiche `(ref ..., +n)` sans `OUT`, puis `exit 0`. Les vidéos `menu.webm` et `faq.webm` sont dans chaque dossier.

- [ ] **Step 3: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add record.mjs && git commit -F - <<'EOF'
Add the menu and FAQ animation recorder

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8: Spécifications de comportement de la barre de navigation

**Files:**
- Create: `D:\Repos\macar-migration-tools\playwright.config.mjs`
- Create: `D:\Repos\macar-migration-tools\tests\helpers.mjs`
- Create: `D:\Repos\macar-migration-tools\tests\navbar.spec.mjs`

**Interfaces:**
- Consumes: `lib/common.mjs`, serveur sur 3100 (variable `BASE_URL`, défaut `http://localhost:3100`).
- Produces: configuration Playwright, `tests/helpers.mjs` (`STEP`, `prepare`, `open`, `markMenuLinks`, `menuLink`, `keyboardFocus`, `SEL`), et les comportements 7.2 à 7.4 et 8.4 (menu) de la spec. Deux tests couvrent en plus les points d'attention 1 et 4 de la revue : défilement au doigt sur plateforme iPhone, et aucune des 15 pages plus large que 320 px.

**Variable `STEP`** : `STEP=0` (référence) et `STEP=1` (Tailwind 4, HeroUI v2) attendent le comportement d'aujourd'hui. `STEP=2` (HeroUI v3) attend les changements acceptés de la section 9 : exception 1 (interrupteur vert au repos, au survol et à l'appui), exception 3 (initiales à la place d'une photo en échec), exception 4 (réponses fermées présentes en `hidden="until-found"` et ouvertes par la recherche dans la page). Les tests de la barre ne dépendent pas de `STEP` : la spec exige le même comportement à toutes les étapes.

**Repérage du panneau mobile** sans classe HeroUI : `markMenuLinks` marque les liens visibles qui ont un ancêtre en `position: fixed` et ne sont pas dans `<nav>` (le panneau v2 est rendu dans un portail sous `body`, le panneau de l'étape 2 aussi, d'après 7.3).

**Non automatisé ici** : la variation de largeur due à la barre de défilement (Chromium sans tête n'en affiche pas ; elle est automatisée plus loin, tâche 34, `tests/navbar-scrollbar.spec.mjs`) et le rebond élastique de Safari (vérification manuelle de 8.4). Le blocage du défilement est testé deux fois : à la molette (voie standard de `usePreventScroll`) et au doigt avec la plateforme et l'agent utilisateur d'un iPhone (voie iOS de `usePreventScroll`, point d'attention 1, glissés tactiles réels envoyés par le protocole DevTools). Seul un vrai iPhone prouve le comportement de WebKit.

- [ ] **Step 1: Créer `playwright.config.mjs`**

```js
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
  outputDir: "./test-results",
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

- [ ] **Step 2: Créer `tests/helpers.mjs`**

```js
import { CONSENT_COOKIE, routeNetwork, SEL } from "../lib/common.mjs";

export { SEL };
export { keyboardFocus } from "../lib/common.mjs";

// STEP=0 (reference) and STEP=1 (Tailwind 4, HeroUI v2) expect today's behaviour.
// STEP=2 (HeroUI v3) expects the accepted changes of spec section 9.
export const STEP = Number(process.env.STEP ?? 0);

export async function prepare(context, baseURL, { consent = true, onAvatarRequest, abortAvatar } = {}) {
  if (consent) await context.addCookies([{ ...CONSENT_COOKIE, url: baseURL }]);
  await routeNetwork(context, baseURL, { onAvatarRequest, abortAvatar });
}

// Navigates and waits for hydration (network idle after load).
export async function open(page, url) {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
}

// Links of the mobile menu panel: links with a position:fixed ancestor outside <nav>.
// They get a data-harness-menu attribute so that a locator can target them. Returns their count.
export async function markMenuLinks(page) {
  return page.evaluate(() => {
    const fixed = (el) => { for (let e = el; e; e = e.parentElement) if (getComputedStyle(e).position === "fixed") return true; return false; };
    let n = 0;
    for (const a of document.querySelectorAll("a")) {
      if (!a.closest("nav") && fixed(a) && a.checkVisibility()) { a.setAttribute("data-harness-menu", ""); n++; }
      else a.removeAttribute("data-harness-menu");
    }
    return n;
  });
}

export const menuLink = (page, name) => page.locator("a[data-harness-menu]").filter({ hasText: new RegExp(`^${name}$`) });
```

- [ ] **Step 3: Créer `tests/navbar.spec.mjs`**

```js
// Spec 7.2 to 7.4 and 8.4 (menu mobile). Same expectations at every step.
import { test, expect } from "@playwright/test";
import { prepare, open, markMenuLinks, menuLink, SEL } from "./helpers.mjs";
import { PAGES } from "../lib/common.mjs";

test.use({ viewport: { width: 390, height: 844 } });

const menuCount = (page) => expect.poll(() => markMenuLinks(page), { timeout: 3000 });

test.describe("menu mobile", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("le bouton menu est un toggle aria-pressed avec libellés français", async ({ page }) => {
    await open(page, "/");
    const button = page.locator(SEL.menuButton);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveAttribute("aria-label", "Ouvrir le menu");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveAttribute("aria-label", "Fermer le menu");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveAttribute("aria-label", "Ouvrir le menu");
  });

  test("le panneau n'existe que menu ouvert, avec 6 liens et le devis", async ({ page }) => {
    await open(page, "/");
    expect(await markMenuLinks(page)).toBe(0);
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    for (const name of ["Accueil", "Découvrez Macar", "Services", "Blog", "FAQ", "Nous recrutons", "Demander un devis"]) {
      await expect(menuLink(page, name)).toHaveCount(1);
    }
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(0);
  });

  test("clic sur un lien du menu : navigation et fermeture", async ({ page }) => {
    await open(page, "/");
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await menuLink(page, "Services").click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator(SEL.menuButton)).toHaveAttribute("aria-pressed", "false");
    await menuCount(page).toBe(0);
  });

  test("clic sur le logo mobile : fermeture", async ({ page }) => {
    await open(page, "/about");
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await page.locator('nav a[href="/"]:visible').first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(SEL.menuButton)).toHaveAttribute("aria-pressed", "false");
    await menuCount(page).toBe(0);
  });

  test("changement de largeur (dont rotation) : fermeture", async ({ page }) => {
    await open(page, "/");
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await page.setViewportSize({ width: 430, height: 844 });
    await expect(page.locator(SEL.menuButton)).toHaveAttribute("aria-pressed", "false");
    await menuCount(page).toBe(0);
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await page.setViewportSize({ width: 844, height: 390 });
    await menuCount(page).toBe(0);
  });

  test("changement de hauteur seule : le menu reste ouvert", async ({ page }) => {
    await open(page, "/");
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await page.setViewportSize({ width: 390, height: 700 });
    await page.waitForTimeout(500);
    await expect(page.locator(SEL.menuButton)).toHaveAttribute("aria-pressed", "true");
    expect(await markMenuLinks(page)).toBe(7);
  });

  test("défilement de la page bloqué tant que le menu est ouvert", async ({ page }) => {
    await open(page, "/");
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await page.mouse.move(195, 600);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(0);
    await page.mouse.move(195, 600);
    await page.mouse.wheel(0, 900);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("Échap ne ferme pas le menu (aucun comportement ajouté)", async ({ page }) => {
    await open(page, "/");
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    await expect(page.locator(SEL.menuButton)).toHaveAttribute("aria-pressed", "true");
  });

  test("lien FAQ : défilement jusqu'à la FAQ et focus rendu au bouton menu", async ({ page }) => {
    await open(page, "/");
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    await menuLink(page, "FAQ").click();
    await menuCount(page).toBe(0);
    await expect(page.locator("#faq")).toBeInViewport();
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label"));
    expect(focused).toBe("Ouvrir le menu");
  });

  test("focus rendu au bouton menu après fermeture depuis un lien du panneau au clavier", async ({ page }) => {
    await open(page, "/");
    const button = page.locator(SEL.menuButton);
    await button.focus();
    await page.keyboard.press("Enter");
    await menuCount(page).toBe(7);
    await menuLink(page, "Accueil").focus();
    await page.keyboard.press("Enter");
    await menuCount(page).toBe(0);
    await expect(button).toBeFocused();
  });
});

test.describe("menu mobile et bandeau cookies", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL, { consent: false }));

  test("le menu passe au-dessus du bandeau cookies", async ({ page }) => {
    await open(page, "/");
    const banner = page.getByText("Macar utilise des cookies");
    await expect(banner).toBeVisible();
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    const onTop = await banner.evaluate((p) => {
      let box = p;
      while (box && getComputedStyle(box).position !== "fixed") box = box.parentElement;
      const b = box.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      let panel = hit;
      while (panel && getComputedStyle(panel).position !== "fixed") panel = panel.parentElement;
      return !box.contains(hit) && !!panel && !!panel.querySelector("a[data-harness-menu]");
    });
    expect(onTop).toBe(true);
  });
});

test.describe("320 px", () => {
  test.use({ viewport: { width: 320, height: 568 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("pas de défilement horizontal, menu fermé puis ouvert", async ({ page }) => {
    await open(page, "/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.locator(SEL.menuButton).click();
    await menuCount(page).toBe(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });

  test("aucune des 15 pages ne défile horizontalement", async ({ page }) => {
    test.setTimeout(180000);
    const wide = [];
    for (const p of PAGES) {
      await open(page, p.path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      if (width > 320) wide.push(`${p.path}: ${width}px`);
    }
    expect(wide).toEqual([]);
  });
});

// Safari on iOS: React Aria's usePreventScroll takes its touch path only when the platform is an
// iPhone (and, in v3, when the engine is WebKit). The page is given the platform and user agent of
// an iPhone, touch input is on, and the swipes are real touch sequences sent through the Chrome
// DevTools Protocol. Rubber-band scrolling itself stays a manual check on a real iPhone (spec 8.4).
const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";

test.describe("menu mobile au doigt, plateforme iPhone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, userAgent: IPHONE_UA });
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "platform", { configurable: true, get: () => "iPhone" });
      Object.defineProperty(Navigator.prototype, "userAgentData", { configurable: true, get: () => undefined });
    });
    await prepare(context, baseURL);
  });

  test("menu ouvert la page ne défile pas au doigt ; fermé elle garde sa position, défile de nouveau et le canevas reste blanc", async ({ page, context }) => {
    await open(page, "/");
    expect(await page.evaluate(() => [navigator.platform, /AppleWebKit/.test(navigator.userAgent), /Chrome/.test(navigator.userAgent)])).toEqual(["iPhone", true, false]);
    const cdp = await context.newCDPSession(page);
    const swipeUp = async () => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 700 }] });
      for (let i = 1; i <= 10; i++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 700 - 40 * i }] });
        await page.waitForTimeout(16);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(600);
    };
    const scrollY = () => page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect.poll(scrollY).toBe(1500);
    await page.locator(SEL.menuButton).tap();
    await menuCount(page).toBe(7);
    await swipeUp();
    expect(await scrollY()).toBe(1500);
    await page.locator(SEL.menuButton).tap();
    await menuCount(page).toBe(0);
    expect(await scrollY()).toBe(1500);
    expect(await page.evaluate(() => [document.documentElement.style.overflow, document.body.style.overflow, document.body.style.position])).toEqual(["", "", ""]);
    await swipeUp();
    await expect.poll(scrollY).toBeGreaterThan(1500);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgb(255, 255, 255)");
  });
});
```

- [ ] **Step 4: Lancer les tests de la barre sur la référence**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=0 npx playwright test tests/navbar.spec.mjs
```

Attendu : `14 passed`. Ces tests décrivent le comportement de la référence : s'il en échoue un, c'est le test qui est faux, pas le site.

- [ ] **Step 5: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add playwright.config.mjs tests && git commit -F - <<'EOF'
Add the navbar behaviour specs encoding the reference

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 9: Spécifications de comportement de la FAQ, des cookies et des avis

**Files:**
- Create: `D:\Repos\macar-migration-tools\tests\faq.spec.mjs`
- Create: `D:\Repos\macar-migration-tools\tests\cookies.spec.mjs`
- Create: `D:\Repos\macar-migration-tools\tests\reviews.spec.mjs`

**Interfaces:**
- Consumes: `tests/helpers.mjs`, serveur sur 3100.
- Produces: les comportements 6.4 (Accordion, Switch, Card, Avatar) et 8.4 (FAQ, cookies, avis) de la spec. Cinq tests couvrent en plus les points d'attention 2, 3, 4 et 5 de la revue : photo lente, clavier seul dans les deux colonnes de la FAQ, bandeau cookies à 320 px, cookie de consentement inattendu, consentement gardé au rechargement.

Trois points constatés pendant le prototypage, qui expliquent la forme de ces tests :

- **Ctrl+F** ne s'automatise pas. On utilise une navigation vers un fragment de texte (`#:~:text=`), qui déclenche le même événement `beforematch` sur un contenu `hidden="until-found"`. Vérifié dans ce Chromium sur une page de test : `page.goto` et un clic sur un lien `#:~:text=` révèlent le contenu, `window.find` ne le fait pas. Le lien est injecté puis cliqué après l'hydratation, comme une recherche dans une page déjà chargée.
- **Défilement automatique des avis** : dans Chromium sans tête, la position du carrousel ne progresse pas (chaque pas de 1 px en `scroll-behavior: smooth` est annulé, `scrollLeft` reste à 12 px à 390 comme à 1280 px). Le test compte donc les écritures dans `scrollLeft` : elles ont lieu souris dehors, s'arrêtent au survol et reprennent ensuite. Le mouvement réel reste à vérifier sur appareil (8.4).
- **Photo en échec** : dans la référence, l'`<img>` cassée reste dans la page (`showFallback` à `false` en v2), sans initiales.

Les tests `STEP=2` n'ont pas pu être exécutés par le prototype de cette partie (aucun build v3 n'existait). L'assembleur du plan les a exécutés ensuite sur un prototype complet de l'étape 2 : tous passent. Ils s'appuient sur les `data-slot` de `@heroui/react` 3.2.6 (`switch-control`, `avatar-fallback`) lus dans `dist/components/switch/switch.js` et `dist/components/avatar/avatar.js`.

- [ ] **Step 1: Créer `tests/faq.spec.mjs`**

```js
// Spec 6.4 (Accordion) and 8.4 (FAQ). STEP=2 switches the "closed answers" and "find in page" expectations (exception 4).
import { test, expect } from "@playwright/test";
import { prepare, open, keyboardFocus, STEP, SEL } from "./helpers.mjs";

test.use({ viewport: { width: 1280, height: 800 } });
test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

const ANSWER_1 = "Macar est une entreprise belge spécialisée";
const ANSWER_2 = "Macar est située au 43, avenue Prudent Bols";
const triggers = (page) => page.locator(SEL.faqTriggers);
const expanded = (page) => triggers(page).evaluateAll((els) => els.map((e) => e.getAttribute("aria-expanded")));
const activeIndex = (page) => page.evaluate(() => [...document.querySelectorAll("#faq button[aria-expanded]")].indexOf(document.activeElement));

test("7 questions en 2 colonnes (4 et 3), chaque titre est un h2", async ({ page }) => {
  await open(page, "/");
  const perColumn = await page.locator(SEL.faqColumns).evaluateAll((cols) => cols.map((c) => c.querySelectorAll("button[aria-expanded]").length));
  expect(perColumn).toEqual([4, 3]);
  await expect(page.locator("#faq h2 button[aria-expanded]")).toHaveCount(7);
  expect(await expanded(page)).toEqual(Array(7).fill("false"));
});

test("une seule réponse ouverte par colonne, colonnes indépendantes", async ({ page }) => {
  await open(page, "/");
  await triggers(page).nth(0).click();
  await expect(page.getByText(ANSWER_1)).toBeVisible();
  await triggers(page).nth(1).click();
  await expect(page.getByText(ANSWER_2)).toBeVisible();
  await triggers(page).nth(4).click();
  await expect.poll(() => expanded(page)).toEqual(["false", "true", "false", "false", "true", "false", "false"]);
  await triggers(page).nth(1).click();
  await expect.poll(() => expanded(page)).toEqual(["false", "false", "false", "false", "true", "false", "false"]);
});

test("réponses fermées : absentes du DOM (étapes 0 et 1) ou cachées until-found (étape 2)", async ({ page }) => {
  await open(page, "/");
  if (STEP < 2) {
    await expect(page.getByText(ANSWER_1)).toHaveCount(0);
  } else {
    await expect(page.locator('#faq [hidden="until-found"]')).toHaveCount(7);
    await expect(page.getByText(ANSWER_1)).toHaveCount(1);
    await expect(page.getByText(ANSWER_1)).toBeHidden();
  }
});

test("flèches, Début et Fin déplacent le focus dans la colonne, sans boucler ni ouvrir", async ({ page }) => {
  await open(page, "/");
  await keyboardFocus(page, triggers(page).nth(0));
  const y0 = await page.evaluate(() => window.scrollY);
  const steps = [
    ["ArrowDown", 1], ["ArrowDown", 2], ["ArrowDown", 3], ["ArrowDown", 3],
    ["Home", 0], ["ArrowUp", 0], ["End", 3], ["ArrowUp", 2],
  ];
  for (const [key, index] of steps) {
    await page.keyboard.press(key);
    expect(await activeIndex(page), `après ${key}`).toBe(index);
  }
  expect(await page.evaluate(() => window.scrollY)).toBe(y0);
  await keyboardFocus(page, triggers(page).nth(4));
  for (const [key, index] of [["ArrowUp", 4], ["End", 6], ["ArrowDown", 6], ["Home", 4], ["ArrowDown", 5]]) {
    await page.keyboard.press(key);
    expect(await activeIndex(page), `après ${key}`).toBe(index);
  }
  expect(await expanded(page)).toEqual(Array(7).fill("false"));
});

test("clavier seul : Tab et Maj+Tab parcourent les 7 questions des deux colonnes, une réponse ouverte par colonne", async ({ page }) => {
  await open(page, "/");
  await keyboardFocus(page, triggers(page).nth(0));
  for (let i = 1; i < 7; i++) {
    await page.keyboard.press("Tab");
    expect(await activeIndex(page), `Tab vers la question ${i}`).toBe(i);
  }
  for (let i = 5; i >= 0; i--) {
    await page.keyboard.press("Shift+Tab");
    expect(await activeIndex(page), `Maj+Tab vers la question ${i}`).toBe(i);
  }
  await page.keyboard.press("Enter");
  await expect(triggers(page).nth(0)).toHaveAttribute("aria-expanded", "true");
  // The open answer has no focusable content: Tab goes on to the next questions, then to column 2.
  for (let i = 1; i <= 4; i++) await page.keyboard.press("Tab");
  expect(await activeIndex(page)).toBe(4);
  expect(await triggers(page).nth(4).evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  await page.keyboard.press("Enter");
  await expect.poll(() => expanded(page)).toEqual(["true", "false", "false", "false", "true", "false", "false"]);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect.poll(() => expanded(page)).toEqual(["true", "false", "false", "false", "false", "true", "false"]);
});

test("Tab puis Entrée et Espace ouvrent et ferment la question", async ({ page }) => {
  await open(page, "/");
  await keyboardFocus(page, triggers(page).nth(0));
  await page.keyboard.press("Tab");
  expect(await activeIndex(page)).toBe(1);
  await page.keyboard.press("Enter");
  await expect(triggers(page).nth(1)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Enter");
  await expect(triggers(page).nth(1)).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press(" ");
  await expect(triggers(page).nth(1)).toHaveAttribute("aria-expanded", "true");
});

test("recherche dans la page (fragment de texte) sur une réponse fermée", async ({ page }) => {
  // Same mechanism as Ctrl+F: a text fragment navigation fires "beforematch" on hidden=until-found content
  // (checked in this Chromium: page.goto and link clicks reveal until-found content, window.find does not).
  // The link is clicked after hydration, like a user searching an already loaded page.
  await open(page, "/");
  await page.evaluate((text) => {
    const a = document.createElement("a");
    a.id = "harness-find";
    a.href = "#:~:text=" + encodeURIComponent(text);
    a.textContent = "find";
    a.style.cssText = "position:fixed;top:0;left:0;z-index:2147483647;background:#fff";
    document.body.appendChild(a);
  }, ANSWER_2);
  await page.click("#harness-find");
  await page.waitForTimeout(1000);
  if (STEP < 2) {
    expect(await expanded(page)).toEqual(Array(7).fill("false"));
    await expect(page.getByText(ANSWER_2)).toHaveCount(0);
  } else {
    await expect(triggers(page).nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(ANSWER_2)).toBeVisible();
  }
});
```

- [ ] **Step 2: Créer `tests/cookies.spec.mjs`**

```js
// Spec 6.4 (Switch) and 8.4 (cookies). STEP=2 adds the green-on-hover/press check (exception 1).
import { test, expect } from "@playwright/test";
import { prepare, open, STEP } from "./helpers.mjs";

test.use({ viewport: { width: 1280, height: 800 } });

const BANNER_TEXT = "Macar utilise des cookies";
const switches = (page) => page.getByRole("switch");
const labelOf = (sw) => sw.locator("xpath=ancestor::label[1]");

async function openPreferences(page) {
  await open(page, "/");
  await expect(page.getByText(BANNER_TEXT)).toBeVisible();
  await page.getByRole("button", { name: "Préférences", exact: true }).click();
  await expect(switches(page)).toHaveCount(3);
}

test.describe("avec le cookie de consentement", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));
  test("le bandeau n'apparaît pas", async ({ page }) => {
    await open(page, "/");
    await page.waitForTimeout(800);
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);
  });
});

test.describe("avec un cookie de consentement différent de true", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await prepare(context, baseURL, { consent: false });
    await context.addCookies([{ name: "macar_cookie_consent_is_true", value: "false", url: baseURL }]);
  });
  test("le bandeau apparaît, sur l'accueil comme sur une page service", async ({ page }) => {
    for (const url of ["/", "/services/renovation"]) {
      await open(page, url);
      await expect(page.getByText(BANNER_TEXT)).toBeVisible();
    }
  });
});

test.describe("sans le cookie de consentement", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL, { consent: false }));

  test("le bandeau apparaît, Préférences affiche 3 interrupteurs", async ({ page }) => {
    await openPreferences(page);
    const essentials = page.getByRole("switch", { name: "Essential Cookies" });
    await expect(essentials).toBeChecked();
    await expect(essentials).toBeDisabled();
    const analytics = page.getByRole("switch", { name: "Analytics Cookies" });
    await expect(analytics).toHaveCount(2);
    for (const i of [0, 1]) {
      await expect(analytics.nth(i)).toBeChecked();
      await expect(analytics.nth(i)).toBeEnabled();
    }
  });

  test("les deux interrupteurs basculent à la souris", async ({ page }) => {
    await openPreferences(page);
    for (const i of [1, 2]) {
      const sw = switches(page).nth(i);
      await labelOf(sw).click();
      await expect(sw).not.toBeChecked();
      await labelOf(sw).click();
      await expect(sw).toBeChecked();
    }
  });

  test("les deux interrupteurs basculent à la barre d'espace", async ({ page }) => {
    await openPreferences(page);
    for (const i of [1, 2]) {
      const sw = switches(page).nth(i);
      await sw.focus();
      await page.keyboard.press(" ");
      await expect(sw).not.toBeChecked();
      await page.keyboard.press(" ");
      await expect(sw).toBeChecked();
    }
  });

  test("Essentiels reste coché et verrouillé", async ({ page }) => {
    await openPreferences(page);
    const essentials = switches(page).nth(0);
    await labelOf(essentials).click({ force: true });
    await expect(essentials).toBeChecked();
    await expect(essentials).toBeDisabled();
  });

  test("Accepter Tout enregistre le consentement et ferme le bandeau", async ({ page, context }) => {
    await open(page, "/");
    await page.getByRole("button", { name: "Accepter Tout", exact: true }).click();
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);
    const cookie = (await context.cookies()).find((c) => c.name === "macar_cookie_consent_is_true");
    expect(cookie && cookie.value).toBe("true");
  });

  test("Refuser Tout enregistre aussi le consentement (comportement actuel, hors périmètre)", async ({ page, context }) => {
    await open(page, "/");
    await page.getByRole("button", { name: "Refuser Tout", exact: true }).click();
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);
    const cookie = (await context.cookies()).find((c) => c.name === "macar_cookie_consent_is_true");
    expect(cookie && cookie.value).toBe("true");
  });

  test("après Accepter Tout, le bandeau ne revient ni au rechargement ni sur une autre page", async ({ page }) => {
    await open(page, "/");
    await page.getByRole("button", { name: "Accepter Tout", exact: true }).click();
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);
    await page.reload({ waitUntil: "load" });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);
    await open(page, "/services/renovation");
    await page.waitForTimeout(800);
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);
  });

  test("à 320 px, préférences ouvertes : bandeau et interrupteurs dans l'écran, sans défilement horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openPreferences(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const outside = await page.evaluate(() => {
      const banner = [...document.querySelectorAll("div")].find((d) => getComputedStyle(d).position === "fixed" && d.textContent.includes("Préférences") && d.querySelector('[role="switch"]'));
      const boxes = [banner, ...document.querySelectorAll('[role="switch"]')].map((el) => el.closest("label") || el);
      return boxes.map((el) => el.getBoundingClientRect()).filter((b) => b.left < 0 || b.right > 320).length;
    });
    expect(outside).toBe(0);
  });

  test("interrupteur activé vert #17C964 au repos, au survol et à l'appui (étape 2)", async ({ page }) => {
    test.skip(STEP < 2, "Étapes 0 et 1 : case à cocher native (exception 1 de la section 9)");
    await openPreferences(page);
    for (const i of [1, 2]) {
      const sw = switches(page).nth(i);
      const control = labelOf(sw).locator('[data-slot="switch-control"]');
      const bg = () => control.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(1, 1);
      await page.waitForTimeout(300);
      expect(await bg()).toBe("rgb(23, 201, 100)");
      await labelOf(sw).hover();
      await page.waitForTimeout(300);
      expect(await bg()).toBe("rgb(23, 201, 100)");
      await page.mouse.down();
      await page.waitForTimeout(300);
      expect(await bg()).toBe("rgb(23, 201, 100)");
      // Releasing the button outside the label must not toggle the switch.
      await page.mouse.move(1, 1);
      await page.mouse.up();
      await expect(sw).toBeChecked();
    }
  });
});
```

- [ ] **Step 3: Créer `tests/reviews.spec.mjs`**

```js
// Spec 6.4 (Card, Avatar) and 8.4 (avis). STEP=2 switches the broken-photo expectation (exception 3).
import { test, expect } from "@playwright/test";
import { prepare, open, STEP } from "./helpers.mjs";

test.use({ viewport: { width: 1280, height: 800 } });

const avatars = (page) => page.locator('img[src*="googleusercontent.com"]');
const carousel = (page) => page.locator("div.overflow-x-auto").filter({ has: page.getByText("Voir plus").first() });

test.describe("avatars", () => {
  test("alt = nom de l'auteur et referrerpolicy no-referrer", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
    await expect.poll(() => avatars(page).count()).toBeGreaterThanOrEqual(9);
    const attrs = await avatars(page).evaluateAll((imgs) => imgs.map((i) => ({ alt: i.getAttribute("alt"), policy: i.getAttribute("referrerpolicy") })));
    for (const { alt, policy } of attrs) {
      expect(policy).toBe("no-referrer");
      expect(alt).toBeTruthy();
      await expect(page.getByText(alt, { exact: true }).first()).toBeAttached();
    }
  });

  test("aucun en-tête Referer vers lh3.googleusercontent.com", async ({ page, context, baseURL }) => {
    const headers = [];
    await prepare(context, baseURL, { onAvatarRequest: async (req) => headers.push(await req.allHeaders()) });
    const local = [];
    page.on("request", async (req) => { if (req.url().includes("/_next/image")) local.push(await req.allHeaders()); });
    await open(page, "/");
    await expect.poll(() => headers.length).toBeGreaterThanOrEqual(9);
    for (const h of headers) expect(h.referer).toBeUndefined();
    // Control: the capture of the header works (local images do send a Referer).
    expect(local.some((h) => h.referer)).toBe(true);
  });

  test("photo en échec : image cassée (étapes 0 et 1) ou initiales (étape 2)", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL, { abortAvatar: () => true });
    await open(page, "/");
    await page.waitForTimeout(1000);
    const name = (await page.locator("p.font-semibold").first().textContent()).trim();
    const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
    if (STEP < 2) {
      await expect(page.locator(`img[alt="${name}"]`)).toHaveCount(1);
      expect(await page.locator(`img[alt="${name}"]`).evaluate((i) => i.complete && i.naturalWidth === 0)).toBe(true);
    } else {
      await expect(page.locator(`img[alt="${name}"]`)).toHaveCount(0);
      await expect(page.locator('[data-slot="avatar-fallback"]').first()).toHaveText(initials);
    }
  });
});

test.describe("photo lente", () => {
  test("la carte ne bouge pas pendant le chargement de la photo ; initiales en attendant (étape 2)", async ({ page, context, baseURL }) => {
    // Every Google photo is held until release(): a slow mobile network.
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await prepare(context, baseURL, { onAvatarRequest: () => gate });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const card = page.locator("div.snap-start").first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    const name = (await card.locator("p.font-semibold").textContent()).trim();
    const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
    const layout = () =>
      card.evaluate((el) => {
        const c = el.getBoundingClientRect();
        const t = el.querySelector("p.font-semibold").getBoundingClientRect();
        const r = (n) => Math.round(n * 100) / 100;
        return { card: [r(c.width), r(c.height)], name: [r(t.left - c.left), r(t.top - c.top)] };
      });
    const loaded = () =>
      page.evaluate((n) => {
        const img = document.querySelector(`img[alt="${n}"]`);
        return !!img && img.complete && img.naturalWidth > 0;
      }, name);
    expect(await loaded()).toBe(false);
    const before = await layout();
    if (STEP >= 2) await expect(card.locator('[data-slot="avatar-fallback"]')).toHaveText(initials);
    release();
    await expect.poll(loaded).toBe(true);
    await page.waitForTimeout(500);
    expect(await layout()).toEqual(before);
    const photo = await card.locator(`img[alt="${name}"]`).evaluate((img) => {
      const b = img.getBoundingClientRect();
      return [b.width, b.height, getComputedStyle(img).opacity];
    });
    expect(photo).toEqual([32, 32, "1"]);
    if (STEP >= 2) await expect(card.locator('[data-slot="avatar-fallback"]')).toHaveCount(0);
  });
});

test.describe("carrousel", () => {
  // In headless Chromium the carousel position does not progress (each 1 px smooth step is
  // cancelled, scrollLeft stays at 12 px at 390 and 1280 px), so the test counts the auto-scroll
  // writes to scrollLeft: they run when the pointer is outside, stop on hover and resume after.
  test.beforeEach(async ({ context, baseURL }) => {
    await prepare(context, baseURL);
    await context.addInitScript(() => {
      const d = Object.getOwnPropertyDescriptor(Element.prototype, "scrollLeft");
      window.__carouselWrites = 0;
      Object.defineProperty(Element.prototype, "scrollLeft", {
        configurable: true,
        get() { return d.get.call(this); },
        set(v) { if (this.classList && this.classList.contains("snap-x")) window.__carouselWrites++; d.set.call(this, v); },
      });
    });
  });
  const writes = (page) => page.evaluate(() => window.__carouselWrites);

  test("défilement automatique, pause au survol, reprise", async ({ page }) => {
    await open(page, "/");
    await carousel(page).scrollIntoViewIfNeeded();
    const w0 = await writes(page);
    await page.waitForTimeout(1000);
    expect(await writes(page)).toBeGreaterThan(w0 + 15);
    await carousel(page).hover({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(200);
    const p0 = await writes(page);
    await page.waitForTimeout(1000);
    expect(await writes(page)).toBe(p0);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(1000);
    expect(await writes(page)).toBeGreaterThan(p0 + 15);
  });

  test("Voir plus déplie l'avis, Voir moins le replie", async ({ page }) => {
    await open(page, "/");
    const more = page.getByRole("button", { name: "Voir plus" }).first();
    await more.scrollIntoViewIfNeeded();
    await more.click();
    await expect(page.getByRole("button", { name: "Voir moins" })).toHaveCount(1);
    await page.getByRole("button", { name: "Voir moins" }).click();
    await expect(page.getByRole("button", { name: "Voir moins" })).toHaveCount(0);
  });
});
```

- [ ] **Step 4: Lancer toute la suite sur la référence, avec STEP=0 puis STEP=1**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=0 npx playwright test && BASE_URL=http://localhost:3100 STEP=1 npx playwright test
```

Attendu, deux fois : `1 skipped` (le test du vert de l'étape 2) et `37 passed`, en une minute environ.

- [ ] **Step 5: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add tests && git commit -F - <<'EOF'
Add the FAQ, cookie banner and reviews behaviour specs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 10: Mesure Lighthouse

**Files:**
- Create: `D:\Repos\macar-migration-tools\lighthouse.mjs`

**Interfaces:**
- Consumes: `lighthouse` 13.5.0 (API programmatique), `chrome-launcher` 1.2.2, le Chromium de Playwright (`chromium.executablePath()`), serveur sur 3100.
- Produces: `<out>/lighthouse.json` (pour chaque `"<url> <mobile|desktop>"` : `median` et `runs`) et `<out>/lighthouse/<page>__<forme>__run<n>.json` (rapports complets). Avec `--ref`, applique les seuils de 8.3 : accessibilité au moins égale, CLS au moins aussi bon (marge de 0,0005), performance à 3 points près au plus ; code 1 sinon.

- [ ] **Step 1: Créer `lighthouse.mjs`**

```js
// node lighthouse.mjs --base <url> --out <dir> [--runs 5] [--ref <lighthouse.json>]
// Lighthouse (mobile and desktop) on / and /services/renovation, median of N runs, Playwright's Chromium.
// With --ref, applies the spec 8.3 thresholds: accessibility and CLS at least as good, performance within 3 points.
import fs from "node:fs";
import path from "node:path";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";
import { chromium } from "@playwright/test";
import { parseArgs, readJson } from "./lib/common.mjs";

const args = parseArgs();
if (!args.base || !args.out) {
  console.error("usage: node lighthouse.mjs --base <url> --out <dir> [--runs 5] [--ref <lighthouse.json>]");
  process.exit(2);
}
const BASE = args.base.replace(/\/$/, "");
const OUT = path.resolve(args.out);
const RUNS = Number(args.runs || 5);
const URLS = ["/", "/services/renovation"];
const FORMS = ["mobile", "desktop"];
const METRICS = ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"];
fs.mkdirSync(path.join(OUT, "lighthouse"), { recursive: true });

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-first-run", "--disable-extensions", "--force-color-profile=srgb"],
});
const summary = {};
try {
  for (const url of URLS) {
    for (const form of FORMS) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        const flags = { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };
        const result = await lighthouse(BASE + url, flags, form === "desktop" ? desktopConfig : undefined);
        const lhr = result.lhr;
        const run = {
          performance: Math.round(lhr.categories.performance.score * 100),
          accessibility: Math.round(lhr.categories.accessibility.score * 100),
          "best-practices": Math.round(lhr.categories["best-practices"].score * 100),
          seo: Math.round(lhr.categories.seo.score * 100),
        };
        for (const m of METRICS) run[m] = lhr.audits[m].numericValue;
        runs.push(run);
        const slug = url === "/" ? "home" : url.replace(/^\//, "").replace(/\//g, "-");
        fs.writeFileSync(path.join(OUT, "lighthouse", `${slug}__${form}__run${i + 1}.json`), result.report);
        console.log(`${url} ${form} run ${i + 1}: perf ${run.performance}, a11y ${run.accessibility}, CLS ${run["cumulative-layout-shift"].toFixed(3)}`);
      }
      const med = {};
      for (const k of Object.keys(runs[0])) med[k] = median(runs.map((r) => r[k]));
      summary[`${url} ${form}`] = { median: med, runs };
    }
  }
} finally {
  await chrome.kill();
}
fs.writeFileSync(path.join(OUT, "lighthouse.json"), JSON.stringify(summary, null, 1));

let failed = 0;
const ref = args.ref ? readJson(path.resolve(args.ref)) : null;
for (const [key, { median: m }] of Object.entries(summary)) {
  let line = `${key}: perf ${m.performance}, a11y ${m.accessibility}, BP ${m["best-practices"]}, SEO ${m.seo}, LCP ${Math.round(m["largest-contentful-paint"])} ms, CLS ${m["cumulative-layout-shift"].toFixed(3)}`;
  if (ref && ref[key]) {
    const r = ref[key].median;
    const problems = [];
    if (m.accessibility < r.accessibility) problems.push(`a11y ${m.accessibility} < ${r.accessibility}`);
    if (m["cumulative-layout-shift"] > r["cumulative-layout-shift"] + 0.0005) problems.push(`CLS ${m["cumulative-layout-shift"].toFixed(3)} > ${r["cumulative-layout-shift"].toFixed(3)}`);
    if (m.performance < r.performance - 3) problems.push(`perf ${m.performance} < ${r.performance} - 3`);
    failed += problems.length;
    line += problems.length ? `  FAIL: ${problems.join("; ")}` : `  OK vs ref (perf ${r.performance}, a11y ${r.accessibility}, CLS ${r["cumulative-layout-shift"].toFixed(3)})`;
  }
  console.log(line);
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Essai rapide avec une seule exécution**

```bash
cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out runs/lh-try --runs 1
```

Attendu : 4 lignes `... run 1: perf ..., a11y ..., CLS ...` puis 4 lignes de synthèse, par exemple `/ desktop: perf 97, a11y 91, BP 96, SEO 100, LCP 1282 ms, CLS 0.000`. Lighthouse peut afficher une pile `LanternError: NO_LCP` issue de son moteur d'analyse de trace : elle est interne et sans effet sur les scores.

- [ ] **Step 3: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add lighthouse.mjs && git commit -F - <<'EOF'
Add the Lighthouse median runner

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 11: Produire la référence de l'étape 0

**Files:**
- Create: `D:\Repos\macar-migration-tools\baseline\` (47 PNG, `computed.json`, `classes.json`, `regions.json`, `captures.json`, `aria\`, `states.json`, `record\`, `lighthouse.json`, `lighthouse\`, `behaviour-step0.txt`)
- Create (ignoré par git) : `D:\Repos\macar-migration-tools\runs\prod-check\` (contrôle de cohérence avec la production)

**Interfaces:**
- Consumes: tous les scripts des tâches 3 à 10, serveur de référence sur 3100.
- Produces: la référence utilisée par les parties suivantes :
  - captures : `--ref "D:/Repos/macar-migration-tools/baseline"` pour `compare.mjs`, `style-diff.mjs`, `aria-diff.mjs` et `state-diff.mjs` (`baseline/aria/`, `baseline/states.json`) ;
  - minutages : `--ref baseline/record/timings.json` pour `record.mjs` ;
  - Lighthouse : `--ref baseline/lighthouse.json` pour `lighthouse.mjs` ;
  - classes du DOM rendu (8.2) : `baseline/classes.json` (`all` et `byPage`), classes internes HeroUI v2 comprises ;
  - CSS compilé de la référence : `ref-site/.next/static/css/61f72beef2126a12.css`.

- [ ] **Step 1: Capturer la référence**

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out baseline | tail -n 1 && node state-diff.mjs --base http://localhost:3100 --out baseline | tail -n 1
```

Attendu : `47 captures written to ...\baseline, 0 failure(s)`, puis `658 forced states written to ...\baseline\states.json, 0 failure(s)`.

- [ ] **Step 2: Prouver le déterminisme sur la référence elle-même**

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/baseline-check && node compare.mjs --ref baseline --cur runs/baseline-check && node style-diff.mjs --ref baseline --cur runs/baseline-check && node aria-diff.mjs --ref baseline --cur runs/baseline-check && node selftest.mjs --ref baseline
```

Attendu : `identical: 47`, `failed: 0`, `style differences: 0 element(s) in 0 class group(s)`, `aria differences: 0 unexpected, 0 expected`, puis `all self-tests passed`. La commande enchaîne avec `&&` : elle s'arrête au premier échec.

- [ ] **Step 3: Enregistrer les animations de référence**

```bash
cd "D:/Repos/macar-migration-tools" && node record.mjs --base http://localhost:3100 --out baseline/record && node record.mjs --base http://localhost:3100 --out runs/record-check --ref baseline/record/timings.json
```

Attendu : des durées proches de celles de la tâche 7, et la seconde commande sans `OUT` (code 0).

- [ ] **Step 4: Mesurer Lighthouse (médiane de 5), deux fois**

```bash
cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out baseline && node lighthouse.mjs --base http://localhost:3100 --out runs/lighthouse-check --ref baseline/lighthouse.json
```

Attendu (environ 6 min par mesure ; valeurs du prototype) :

```
/ mobile: perf 77, a11y 91, BP 96, SEO 100, LCP 4991 ms, CLS 0.000  OK vs ref (perf 77, a11y 91, CLS 0.000)
/ desktop: perf 97, a11y 91, BP 96, SEO 100, LCP 1292 ms, CLS 0.000  OK vs ref (perf 97, a11y 91, CLS 0.000)
/services/renovation mobile: perf 68, a11y 88, BP 96, SEO 100, LCP 6474 ms, CLS 0.023  OK vs ref (perf 69, a11y 88, CLS 0.023)
/services/renovation desktop: perf 97, a11y 87, BP 96, SEO 100, LCP 1229 ms, CLS 0.000  OK vs ref (perf 97, a11y 87, CLS 0.000)
```

La seconde mesure, sur le même build, doit passer les seuils : c'est la preuve que le seuil de 3 points de la spec n'est pas plus étroit que le bruit de mesure. Sur mobile, une exécution isolée varie de 66 à 79 ; la médiane, elle, a varié d'un point au plus.

- [ ] **Step 5: Lancer les spécifications de comportement et garder le résultat**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=0 npx playwright test 2>&1 | tee baseline/behaviour-step0.txt | tail -3
```

Attendu : `1 skipped` et `37 passed`.

- [ ] **Step 6: Arrêter le serveur de référence**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`. Le build `ref-site` est conservé : pour recapturer la référence (nouveau sélecteur dans un `allow*.json`), relancer `npx next start -p 3100` dans `ref-site` puis l'étape 1.

- [ ] **Step 7: Contrôle de cohérence avec la production (spec 4)**

La production sert seulement de contrôle de cohérence : la référence reste le build local de `a37ed9e`. L'adresse est `https://www.macar.be` (`macar.be` redirige vers `www`, et le harnais bloque tout hôte autre que celui de `--base`). Seuls les états `default` sont capturés (pas de cookie ni de clic sur le site public).

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base https://www.macar.be --out runs/prod-check --only "__default$" | tail -n 1; node compare.mjs --ref baseline --cur runs/prod-check > runs/prod-check/compare.txt; grep -E '^(identical|failed):|^  DIFF' runs/prod-check/compare.txt
```

Attendu (mesure du 3 octobre 2026) : `30 captures written to ...\runs\prod-check, 0 failure(s)`, `identical: 30`, `failed: 0`. La ligne `missing in cur:` de `compare.txt` (les 17 états de l'accueil non capturés) et le code de sortie 1 de `compare.mjs` sont normaux ici. Chaque ligne `DIFF` doit s'expliquer par un commit présent dans `a37ed9e` et absent de la production, listé par :

```bash
cd "D:/Repos/macar-next-site-prod" && git fetch origin && git log --oneline origin/main..a37ed9e -- src content public
```

Si une différence ne s'explique par aucun de ces commits (police, image optimisée, variable d'environnement), s'arrêter et la signaler au propriétaire avant de continuer : la référence locale ne représenterait pas le site réel. Aucun commit pour cette étape (`runs/` est ignoré).

- [ ] **Step 8: Committer la référence**

```bash
cd "D:/Repos/macar-migration-tools" && git add baseline && git commit -F - <<'EOF'
Capture the step 0 baseline of commit a37ed9e

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Attendu : environ 125 fichiers ajoutés (47 PNG, 4 JSON de capture, 47 fichiers `aria/*.yml`, `states.json`, `record/`, `lighthouse.json`, 20 rapports Lighthouse, `behaviour-step0.txt`).

---

### Utilisation des outils aux étapes 1 et 2

Pour un build à vérifier (dépôt ou clone, servi par `npm run build` puis `npx next start -p 3100`) :

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/step1 && node compare.mjs --ref baseline --cur runs/step1 ; node style-diff.mjs --ref baseline --cur runs/step1 ; node aria-diff.mjs --ref baseline --cur runs/step1 ; node state-diff.mjs --base http://localhost:3100 --out runs/step1 && node state-diff.mjs --ref baseline --cur runs/step1 ; node html-diff.mjs --ref-site ref-site --cur-site ../macar-next-site-prod --out runs/step1 ; node record.mjs --base http://localhost:3100 --out runs/step1/record --ref baseline/record/timings.json ; BASE_URL=http://localhost:3100 STEP=1 npx playwright test ; node lighthouse.mjs --base http://localhost:3100 --out runs/step1 --ref baseline/lighthouse.json
```

À l'étape 2, remplacer `step1` par `step2`, `STEP=1` par `STEP=2`, ajouter `--allow allow-step2.json` à `compare.mjs`, `style-diff.mjs` et `state-diff.mjs --ref`, et `--expect aria-step2.json` à `aria-diff.mjs`. En cas de repli (section 3 de la spec, tâche 22, étape 2), la comparaison de l'étape 2 se fait aussi contre `baseline`. La vérification complète de l'étape 2 est la tâche 40.

## Partie 2 : étape 1, Tailwind 4 avec HeroUI v2 conservé (PR 1)

Cette partie couvre la section 5 de la spec (étape 1) et la PR vers `dev` qui la livre. Elle travaille dans le dépôt `D:\Repos\macar-next-site-prod`, sur la branche `heroui-v3-migration`, et utilise les outils et la référence produits par la partie 1 (`D:\Repos\macar-migration-tools`, dossier `baseline`).

**Commandes** : les commandes `bash` se lancent dans l'outil Bash (Git Bash), les commandes `powershell` dans l'outil PowerShell. Les chemins contiennent une espace : ils sont toujours entre guillemets. Les fichiers dont le contenu complet est donné s'écrivent avec l'outil Write (pas de heredoc : l'outil Bash a altéré les barres obliques inverses des heredocs pendant le prototypage).

**Serveur** : le site testé est servi sur `http://localhost:3100` (contrat de la partie 1). On arrête toujours un serveur par son port, avec la commande PowerShell donnée.

**Fichier suivi modifié par le build** : `tsconfig.tsbuildinfo` est versionné et `npx tsc --noEmit` le réécrit. Les commits de cette partie ajoutent donc les fichiers un par un, jamais avec `git add -A`, et `git restore tsconfig.tsbuildinfo` est lancé avant chaque commit.

### Résultats du prototype (à lire avant de commencer)

Le prototype a été mené dans un clone jetable (`...\scratchpad\proto\step1`, branche `proto`, commit `cfde316`), comparé à un build de production de `a37ed9e` sur 44 captures (14 pages en 1280 et 390 px, accueil en 320 px, menu ouvert, FAQ ouverte, bandeau et préférences cookies, focus clavier sur la FAQ, sur un interrupteur, sur le bouton menu et sur un champ du formulaire, survol d'un lien de la barre) et sur tous les styles calculés de chaque élément. État final : **0 pixel différent sur les 44 captures et 0 différence de style calculé, à la chaîne de caractères près** (sans normalisation des couleurs ni des ombres).

**Question clé de la spec (section 3, plan de repli) : le plugin `heroui()` v2 chargé par `@plugin` sous Tailwind 4, sans `@source` vers `@heroui/theme`, reproduit-il la référence ?** Oui. Il génère les variables `--heroui-*`, la règle racine `:root,[data-theme]{color:...;background-color:...}` et ses utilitaires (`text-tiny`, `rounded-large`...) seulement si la classe apparaît dans les sources, exactement comme Tailwind 3.3.5 avec le glob mort. Aucune classe interne HeroUI n'est générée en plus, à trois exceptions près, qui viennent de nos sources et sont traitées (tâches 13 et 16) : `shrink-0` (créée par le renommage `flex-shrink-0`), `min-h-16`, `min-w-8` et `min-h-8` (inconnues de Tailwind 3.3, connues de Tailwind 4). Le contrôle `class-activity.mjs` (tâche 12) le prouve : sur les 487 classes présentes dans le DOM des deux builds, aucune ne change d'état (CSS généré ou non). Le repli de la section 3 n'est donc pas nécessaire.

**Tailwind 4 seul n'est pas neutre.** Avec la configuration de la spec (5.2 et 5.4) et les renommages de l'outil officiel, le prototype a mesuré les écarts suivants. Chacun a une parade, validée par les captures.

| Mesure | Écart mesuré | Exemple mesuré | Parade (tâche) |
|---|---|---|---|
| M1 | Classes internes v2 qui s'activent | `shrink-0` sur l'interrupteur (`flex-shrink` passe de 1 à 0, mesuré) et sur les `<hr>` de la FAQ ; `min-h-16` sur le `<header>` de la barre (64 px) ; `min-w-8 min-h-8` sur l'avatar | garder `flex-shrink-0` (13), retirer les classes mortes (16) |
| M2 | `space-*` et `divide-*` changent de sélecteur (`:where(... > :not(:last-child))`, marge et bordure en bas) | accueil en 390 px : 7119 px de haut au lieu de 7087 ; lignes du bandeau cookies décalées de 1 px | variante `sibling:` qui reprend le sélecteur Tailwind 3 (15, 17) |
| M3 | `leading-*` l'emporte désormais sur `lg:text-*` (Tailwind 4 lit `--tw-leading` en premier) | titre de l'accueil en 1280 px : `line-height` 120 px au lieu de 60 ; article de blog : 10458 px de haut au lieu de 9566 | `lg:leading-*` explicites sur 12 lignes (18) |
| M4 | Les couleurs avec opacité (`/30`, `/10`...) passent par `color-mix(in oklab)` | lignes des pages légales : pixel `206,208,213` au lieu de `207,208,213` | valeurs littérales Tailwind 3 en classes arbitraires (19) |
| M5 | lightningcss arrondit les nombres (`33.333333%` devient `33.3333%`, `calc((100% - 2rem)/3)` est réécrit) et remplace `to left` par `270deg` | colonnes de l'accueil larges de 383,984 px au lieu de 384 ; texte des avis anticrénelé différemment | utilitaires `w-third`, `w-two-thirds`, `w-review-card`, `bg-fade-left` dont la valeur passe par `var()` (15, 20) |
| M6 | `transition`, `transition-colors` et `transition-transform` transitionnent plus de propriétés (`outline-color`, dégradés, `translate`, `scale`, `rotate`) | le contour de focus natif s'animerait sur 150 ms | `@utility` qui remettent les listes Tailwind 3 (15) ; `group-hover:scale-105` devient `group-hover:transform-[scale(1.05)]` (20) |
| M7 | `box-shadow` empile 5 couches au lieu de 3 | `shadow-md`, `shadow-lg`, `ring-2` | `@utility` qui remettent la pile Tailwind 3 (15) |
| M8 | `rounded-full` vaut `calc(infinity * 1px)` | rayon calculé `3.35544e+07px` au lieu de `9999px` | `--radius-full: 9999px` (15) |
| M9 | Retirer `tailwindcss-animate` retire `animation-duration` et `animation-timing-function` posés par `duration-300`, `duration-500`, `ease-in-out` | 296 valeurs calculées différentes | trois `@utility` (15) |
| M10 | Préflight Tailwind 4 | `html` en police système au lieu de Times ; `-webkit-tap-highlight-color` transparent ; `td` sans padding de 1 px ; bordure, placeholder et curseur des boutons | bloc `@layer base` (15) |
| M11 | `hover:` limité à `@media (hover: hover)` | survol au doigt | `@custom-variant hover (&:hover);` (15) |
| M12 | `outline-hidden` donne `outline-style: none` (Tailwind 3 : contour transparent de 2 px) | focus des champs du formulaire | `focus-visible:outline-2 focus-visible:outline-transparent focus-visible:outline-offset-2` (20) |
| M13 | Palette par défaut en oklch | ambre des étoiles, rouges, gris | couleurs Tailwind 3 en hexadécimal dans `@theme` (15) |

Sans effet et laissés tels quels : `autoprefixer` retirait les préfixes obsolètes du CSS de `react-responsive-carousel` (`-moz-transition`...), ils restent désormais dans le CSS compilé, sans effet dans un navigateur actuel (captures identiques).

**Détection des sources** : `@import "tailwindcss" source(none)` puis deux `@source` reproduisent exactement les globs `content` de `tailwind.config.ts` (`src/app` et `src/components`, sans `node_modules`). La détection automatique de Tailwind 4 lirait aussi `content/` (articles MDX), `src/lib`, `src/data` et le `README` : 1596 candidats de plus. Aucun ne coïncide aujourd'hui avec une classe du DOM, mais un mot d'un futur article (`h-6`, `z-40`...) suffirait à activer une classe interne HeroUI. La restriction rend l'étape 1 fidèle à Tailwind 3 et protège l'étape 2.

#### Couleurs de la palette par défaut utilisées (spec 5.2)

Liste extraite des classes de `src` et du CSS compilé de la référence (`61f72beef2126a12.css`), opacité comprise. `white`, `black` et `transparent` sont identiques en Tailwind 4 et ne sont pas redéfinies.

| Variable | Valeur Tailwind 3 | Usage dans la référence |
|---|---|---|
| `--color-amber-400` | `#fbbf24` | `fill-amber-400 text-amber-400` (étoiles, `GoogleReviews.tsx`, `HomeView.tsx`) |
| `--color-blue-100` | `#dbeafe` | `bg-blue-100` (`cards.tsx`) |
| `--color-blue-500` | `#3b82f6` | `hover:border-blue-500` (`cards.tsx`) ; anneau de focus par défaut `rgb(59 130 246 / 0.5)` |
| `--color-gray-100` | `#f3f4f6` | `hover:bg-gray-100` (`CookieConsent.tsx`) |
| `--color-gray-200` | `#e5e7eb` | bordure par défaut du préflight (bloc de compatibilité) |
| `--color-gray-300` | `#d1d5db` | `border-gray-300` (`CookieConsent.tsx`) |
| `--color-gray-400` | `#9ca3af` | couleur des placeholders du préflight (bloc de compatibilité) |
| `--color-gray-500` | `#6b7280` | `text-gray-500` x2 (`contact_form.tsx`) |
| `--color-gray-600` | `#4b5563` | `text-gray-600` x4 (`jobs.tsx`) |
| `--color-neutral-100` | `#f5f5f5` | `border-neutral-100` (`GoogleReviews.tsx`, `cards.tsx`) |
| `--color-neutral-200` | `#e5e5e5` | `text-neutral-200` (`GoogleReviews.tsx`) ; `bg-neutral-200/10` (`buttons.tsx`, devient `bg-[rgb(229_229_229/0.1)]`) |
| `--color-neutral-500` | `#737373` | `bg-neutral-500` x2 (`footer.tsx`), `border-neutral-500` (`politique-cookies`) ; `border-neutral-500/30` x4 (3 pages légales, devient `border-[rgb(115_115_115/0.3)]`) |
| `--color-neutral-700` | `#404040` | `border-neutral-700/30` x3 (`politique-cookies`, devient `border-[rgb(64_64_64/0.3)]`) |
| `--color-red-500` | `#ef4444` | `text-red-500` x4 (`contact_form.tsx`) |
| `--color-red-600` | `#dc2626` | `text-red-600` (`contact_form.tsx`) |
| `--color-red-700` | `#b91c1c` | `text-red-700` (`contact_form.tsx`) |

Les couleurs du site avec opacité sont aussi remplacées par leur valeur Tailwind 3 : `bg-cardbackground/80` devient `bg-[rgb(255_255_255/0.8)]`, `bg-accent1/10` devient `bg-[rgb(18_79_170/0.1)]`, `text-text/70` devient `text-[rgb(71_75_100/0.7)]`, etc. (tâche 19, liste complète dans la carte `step1-opacity-colors.json`). Les couleurs HeroUI avec opacité gardent la variable du plugin v2 : `bg-primary/10` devient `bg-[hsl(var(--heroui-primary)/0.1)]`.

#### Écarts par rapport à la spec

Numérotation locale à cette partie ; dans le reste du plan, ces écarts sont cités par leur numéro global (liste en tête du plan).

1. **`flex-shrink-*` n'est pas renommé à l'étape 1** (spec 5.3). L'outil officiel le fait, la tâche 13 l'annule. Raison : `shrink-0` est aussi posé par HeroUI v2 sur les séparateurs de la FAQ et sur l'interrupteur ; le faire apparaître dans `src` active la classe sur ces éléments (`flex-shrink` passe de 1 à 0, mesuré). `flex-shrink-0` compile toujours en Tailwind 4.3. Le renommage est à faire à l'étape 2, quand HeroUI v2 aura disparu.
2. **`outline-none` ne devient pas `outline-hidden`** (spec 5.3). `outline-hidden` donne `outline-style: none` hors mode contraste forcé, alors que Tailwind 3 posait un contour transparent de 2 px. Il devient `outline-2 outline-transparent outline-offset-2`, identique à Tailwind 3 dans tous les modes.
3. **`bg-gradient-to-l from-background to-transparent` ne devient pas `bg-linear-to-l`** (spec 5.3) mais l'utilitaire `bg-fade-left` : `bg-linear-to-l` interpole en oklab (pixels différents) et lightningcss réécrit `to left` en `270deg`.
4. **Les blocs de compatibilité dépassent la liste de 5.4** (tableau ci-dessus, mesures M5 à M12) : chaque bloc ajouté corrige une différence mesurée.
5. **Les 24 `space-*` et les 2 `divide-*` sont tous convertis** (spec 5.4 : « au cas par cas si un rendu bouge »). Le changement de sélecteur déplace les marges et les bordures sur d'autres éléments : la comparaison des styles calculés le signale partout, et plusieurs rendus bougent (hauteur de l'accueil, bandeau cookies). La conversion systématique garde un sélecteur unique et simple.
6. **Classes renommées en dehors de la liste de 5.3** : l'outil renomme aussi `border-b-1`, `h-[1px]`, `z-[100]`, `font-[var(--font-raptor)]`, `aspect-[16/9]`, `aspect-[2/1]` et `[scrollbar-width:none]` (tableau de la tâche 13), sans effet sur le rendu. Les tâches 16 à 20 remplacent en plus les classes des mesures M1 à M5 et M12 (cartes JSON complètes dans la tâche 12).
7. **`components.json`** : la clé `tailwind.config` vaut `""` (spec 5.2 : « vidée »).

#### Ce que l'étape 2 doit savoir (produit par cette partie)

- Les classes `bg-[hsl(var(--heroui-*)/...)]`, `border-[hsl(var(--heroui-default-200)/0.5)]`, `hover:bg-[hsl(var(--heroui-*)/...)]` et `marker:text-[hsl(var(--heroui-primary)/0.7)]` (navbar, chip, `ServiceDetailBody.tsx`, `services/page.tsx`, `zones/[slug]/page.tsx`, `components/ui/button.tsx`, `ServiceSection.tsx`) lisent les variables du plugin v2 : elles doivent être réécrites à l'étape 2 (les variables `--heroui-*` disparaissent avec `hero.ts`). Une classe Tailwind 4 avec opacité (`bg-primary/10`) ne rend pas les mêmes pixels (mesure M4).
- `@utility transition-transform` ne transitionne que `transform`. La flèche de la FAQ de l'étape 2 (rotation de -90° animée en 150 ms) doit donc utiliser `transform-[rotate(-90deg)]` (propriété `transform`), pas `-rotate-90` (propriété `rotate`), ou bien ce bloc doit être retiré à l'étape 2 avec une nouvelle comparaison. (Résolu à la tâche 30 : la flèche reçoit sa propre transition de `rotate`, déclarée dans tous les états, sans toucher à ce bloc.)
- Les `@utility` `shadow-xs`, `shadow-md`, `shadow-lg`, `ring-2`, `rounded-full` (via `--radius-full`), `@custom-variant hover` et le `@layer base` de compatibilité s'appliquent aussi aux styles de `@heroui/styles` qui utilisent ces utilitaires par `@apply`.
- `from-background` n'existe plus dans `src` (remplacé par `bg-fade-left`).
- `flex-shrink-0` reste à renommer en `shrink-0` (10 occurrences, carte `step1-keep-flex-shrink.json` à appliquer à l'envers ; fait aux tâches 28 et 33).

---

### Task 12: Outils de l'étape 1 et cartes de remplacement

**Files:**
- Create: `D:\Repos\macar-migration-tools\replace-classes.mjs`
- Create: `D:\Repos\macar-migration-tools\css-rules.mjs`
- Create: `D:\Repos\macar-migration-tools\leading-check.mjs`
- Create: `D:\Repos\macar-migration-tools\class-activity.mjs`
- Create: `D:\Repos\macar-migration-tools\maps\upgrade-tool-result.json`
- Create: `D:\Repos\macar-migration-tools\maps\step1-keep-flex-shrink.json`
- Create: `D:\Repos\macar-migration-tools\maps\step1-dead-min-sizes.json`
- Create: `D:\Repos\macar-migration-tools\maps\step1-sibling.json`
- Create: `D:\Repos\macar-migration-tools\maps\step1-line-height.json`
- Create: `D:\Repos\macar-migration-tools\maps\step1-opacity-colors.json`
- Create: `D:\Repos\macar-migration-tools\maps\step1-exact-values.json`

**Interfaces:**
- Consumes: le dossier d'outils de la partie 1 (Node 24, dépôt git local `main`), la référence `baseline` et le build `ref-site`.
- Produces:
  - `node replace-classes.mjs --repo <dépôt> --map <carte.json> [--check]` : remplace des classes entières (délimitées par une espace, un guillemet, un accent grave ou une accolade) et vérifie d'abord le nombre exact d'occurrences ; code 1 et aucune écriture si un compte diffère.
  - `node css-rules.mjs --css <dossier .css> [--grep <texte>]... [--absent <texte>]...` : aplatit le CSS compilé (une règle par ligne, préfixée par son chemin `@layer` / `@media`) ; code 1 si un `--grep` ne trouve rien ou si un `--absent` trouve une règle.
  - `node leading-check.mjs --repo <dépôt>` : liste les lignes de `src` qui mélangent un `leading-*` de base et une taille de texte responsive sans `lg:leading-*` ; code 1 s'il en reste.
  - `node class-activity.mjs --ref-classes <classes.json> --cur-classes <classes.json> --ref-css <dossier> --cur-css <dossier>` : forme « par classe » de la section 8.2 ; code 1 si une classe présente dans les deux DOM produit du CSS dans un build et pas dans l'autre.
  - Les cartes `maps\*.json` utilisées par les tâches 13 à 20.

- [ ] **Step 1: Vérifier les préalables**

```bash
cd "D:/Repos/macar-migration-tools" && git log --oneline -1 && ls baseline | grep -c '\.png$' && ls ref-site/.next/static/css && df -h /d | tail -1
```

Attendu : le dernier commit de la partie 1 (`Capture the step 0 baseline of commit a37ed9e`), `47`, les quatre fichiers CSS de la référence, et au moins 3 Go libres (le build du dépôt et le clone propre de la tâche 21 en demandent environ 1,5 Go).

- [ ] **Step 2: Créer `replace-classes.mjs`**

Contenu complet :

```js
// node replace-classes.mjs --repo <repo dir> --map <map.json> [--check]
// Replaces whole class tokens in source files and checks the exact number of occurrences first.
// A map is a JSON list of { "file": "<path relative to the repo>", "from": "<class or class sequence>", "to": "<replacement>", "count": <n> }.
// A token is delimited by whitespace, a quote, a backtick or a brace, so "shrink-0" never matches inside "flex-shrink-0".
// With --check nothing is written ("to" may then be omitted): the script only verifies the counts.
// Exit 1 (and nothing written) if any count differs.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i < 0 ? undefined : argv[i + 1]; };
const repo = opt("repo"), mapFile = opt("map"), check = argv.includes("--check");
if (!repo || !mapFile) {
  console.error("usage: node replace-classes.mjs --repo <repo dir> --map <map.json> [--check]");
  process.exit(2);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const entries = JSON.parse(fs.readFileSync(mapFile, "utf8"));
const files = new Map();
let errors = 0;

for (const e of entries) {
  const file = path.join(repo, e.file);
  if (!files.has(file)) files.set(file, fs.readFileSync(file, "utf8"));
  const re = new RegExp(`(?<=[\\s"'\`{])${escapeRe(e.from)}(?=[\\s"'\`}])`, "g");
  const text = files.get(file);
  const found = (text.match(re) || []).length;
  const ok = found === e.count && (check || typeof e.to === "string");
  if (!ok) errors++;
  console.log(`${ok ? "ok  " : "FAIL"} ${e.file}: ${e.from}${check ? "" : ` -> ${e.to}`} (${found}/${e.count})`);
  if (!check) files.set(file, text.replace(re, e.to));
}

if (errors) {
  console.log(`${errors} unexpected count(s), nothing written`);
  process.exit(1);
}
if (!check) for (const [file, text] of files) fs.writeFileSync(file, text);
console.log(`${entries.length} entries, ${files.size} files ${check ? "checked" : "written"}`);
```

- [ ] **Step 3: Créer `css-rules.mjs`**

Contenu complet :

```js
// node css-rules.mjs --css <dir of compiled .css files> [--grep <text>]... [--absent <text>]...
// Flattens the compiled CSS (one rule per line, prefixed by its @layer / @media path) and prints the rules
// whose text contains a --grep needle. Exit 1 if a --grep needle matches nothing or an --absent needle matches a rule.
import fs from "node:fs";
import path from "node:path";

const grep = [], absent = [];
let dir;
for (let i = 2; i < process.argv.length; i += 2) {
  const [k, v] = [process.argv[i], process.argv[i + 1]];
  if (k === "--css") dir = v;
  else if (k === "--grep") grep.push(v);
  else if (k === "--absent") absent.push(v);
}
if (!dir || (!grep.length && !absent.length)) {
  console.error("usage: node css-rules.mjs --css <dir> [--grep <text>]... [--absent <text>]...");
  process.exit(2);
}

const rules = [];
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".css")).sort()) {
  const css = fs.readFileSync(path.join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const stack = [];
  let buf = "";
  for (const ch of css) {
    if (ch === "{") { stack.push(buf.trim()); buf = ""; }
    else if (ch === "}") { if (buf.trim()) rules.push(`${stack.join(" >> ")} { ${buf.trim()} }`); stack.pop(); buf = ""; }
    else if (ch === ";" && stack.length === 0) { rules.push(buf.trim() + ";"); buf = ""; }
    else buf += ch;
  }
}

let failed = 0;
for (const n of grep) {
  const hits = rules.filter((r) => r.includes(n));
  console.log(`grep ${JSON.stringify(n)}: ${hits.length} rule(s)`);
  for (const r of hits) console.log(`  ${r.length > 240 ? r.slice(0, 240) + "..." : r}`);
  if (!hits.length) failed++;
}
for (const n of absent) {
  const hits = rules.filter((r) => r.includes(n));
  console.log(`absent ${JSON.stringify(n)}: ${hits.length ? `FOUND in ${hits.length} rule(s)` : "ok"}`);
  for (const r of hits.slice(0, 5)) console.log(`  ${r.length > 240 ? r.slice(0, 240) + "..." : r}`);
  if (hits.length) failed++;
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 4: Créer `leading-check.mjs`**

Contenu complet :

```js
// node leading-check.mjs --repo <repo dir>
// Tailwind 3: a responsive text size (lg:text-base) wins over a base leading-*, because its line-height comes later in the CSS.
// Tailwind 4: leading-* always wins (it sets --tw-leading, which text-* reads first). Lists the source lines that mix a base
// leading-* with a responsive text size but do not pin the Tailwind 3 line-height with a responsive leading-*.
import fs from "node:fs";
import path from "node:path";

const i = process.argv.indexOf("--repo");
if (i < 0) {
  console.error("usage: node leading-check.mjs --repo <repo dir>");
  process.exit(2);
}
const repo = process.argv[i + 1];
const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts|jsx|js|mdx)$/.test(e.name)) files.push(p);
  }
};
walk(path.join(repo, "src"));

const BASE_LEADING = /(?<![\w:-])leading-(none|tight|snug|normal|relaxed|loose)(?![\w-])/;
const RESP_TEXT = /(?<![\w-])(sm|md|lg|xl|2xl):text-(xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/;
const RESP_LEADING = /(?<![\w-])(sm|md|lg|xl|2xl):leading-/;
let n = 0;
for (const f of files.sort()) {
  fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((line, k) => {
    if (BASE_LEADING.test(line) && RESP_TEXT.test(line) && !RESP_LEADING.test(line)) {
      n++;
      const rel = path.relative(repo, f).split(path.sep).join("/");
      console.log(`${rel}:${k + 1}: ${line.trim().slice(0, 120)}`);
    }
  });
}
console.log(`${n} line(s) to fix`);
process.exit(n ? 1 : 0);
```

- [ ] **Step 5: Créer `class-activity.mjs`**

Contenu complet :

```js
// node class-activity.mjs --ref-classes <classes.json> --cur-classes <classes.json> --ref-css <css dir> --cur-css <css dir>
// Spec 8.2, per class: for every class present in the rendered DOM of both builds (HeroUI v2 internal classes included),
// checks that it produces CSS in both builds or in neither. A HeroUI v2 internal class that starts (or stops) producing
// CSS changes the rendering of a HeroUI element, possibly in a state the screenshots do not capture.
// Also lists the classes found in only one DOM (renamed classes), for the PR description.
// Exit 0 only if no class changes activity.
import fs from "node:fs";
import path from "node:path";

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
for (const k of ["ref-classes", "cur-classes", "ref-css", "cur-css"]) {
  if (!args[k]) {
    console.error("usage: node class-activity.mjs --ref-classes <json> --cur-classes <json> --ref-css <dir> --cur-css <dir>");
    process.exit(2);
  }
}

// classes.json of capture.mjs is { all: [...], byPage: {...} }; a plain array is accepted too.
const readClasses = (f) => {
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  return new Set(Array.isArray(j) ? j : j.all);
};

const unescapeCss = (s) =>
  s.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, "$1");

// Every class name used in a selector of any .css file of the directory (comments removed, at-rules kept).
function selectorClasses(dir) {
  const out = new Set();
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".css"))) {
    const css = fs.readFileSync(path.join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    let buf = "";
    for (const ch of css) {
      if (ch === "{") {
        const re = /\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[a-zA-Z0-9_-])+)/g;
        let m;
        while ((m = re.exec(buf))) out.add(unescapeCss(m[1]));
        buf = "";
      } else if (ch === "}" || ch === ";") buf = "";
      else buf += ch;
    }
  }
  return out;
}

const refDom = readClasses(args["ref-classes"]);
const curDom = readClasses(args["cur-classes"]);
const refCss = selectorClasses(args["ref-css"]);
const curCss = selectorClasses(args["cur-css"]);

const changed = [...refDom].filter((c) => curDom.has(c) && refCss.has(c) !== curCss.has(c));
const onlyRef = [...refDom].filter((c) => !curDom.has(c)).sort();
const onlyCur = [...curDom].filter((c) => !refDom.has(c)).sort();
const tag = (c, css) => (css.has(c) ? c : `${c} (no CSS)`);

console.log(`classes in both DOMs: ${[...refDom].filter((c) => curDom.has(c)).length}`);
console.log(`activity changed: ${changed.length}`);
for (const c of changed) console.log(`  ${c}: reference ${refCss.has(c) ? "has CSS" : "no CSS"}, current ${curCss.has(c) ? "has CSS" : "no CSS"}`);
console.log(`only in the reference DOM (${onlyRef.length}): ${onlyRef.map((c) => tag(c, refCss)).join(" ")}`);
console.log(`only in the current DOM (${onlyCur.length}): ${onlyCur.map((c) => tag(c, curCss)).join(" ")}`);
process.exit(changed.length ? 1 : 0);
```

- [ ] **Step 6: Créer `maps\upgrade-tool-result.json`** (carte de contrôle : ce que l'outil officiel doit avoir écrit)

```json
[
  { "file": "src/app/_components/HomeView.tsx", "from": "md:shrink-0", "count": 1 },
  { "file": "src/app/_components/ServiceDetailBody.tsx", "from": "shrink-0", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "shrink-0", "count": 1 },
  { "file": "src/app/_components/cards.tsx", "from": "rounded-sm", "count": 1 },
  { "file": "src/app/_components/checkMark.tsx", "from": "border-b", "count": 1 },
  { "file": "src/app/_components/footer.tsx", "from": "h-px", "count": 2 },
  { "file": "src/app/_components/navbar.tsx", "from": "z-100", "count": 1 },
  { "file": "src/app/_components/navbar.tsx", "from": "[&_span]:hidden!", "count": 1 },
  { "file": "src/app/_components/navbar.tsx", "from": "fixed! top-16! left-0! right-0! w-full!", "count": 1 },
  { "file": "src/app/_components/navbar.tsx", "from": "z-9999!", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "font-(--font-raptor)", "count": 3 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "aspect-video", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "rounded-sm", "count": 1 },
  { "file": "src/app/blog/_components/MdxComponents.tsx", "from": "font-(--font-raptor)", "count": 2 },
  { "file": "src/app/blog/_components/MdxComponents.tsx", "from": "rounded-sm", "count": 1 },
  { "file": "src/app/blog/_components/MdxComponents.tsx", "from": "aspect-video", "count": 1 },
  { "file": "src/app/blog/page.tsx", "from": "aspect-video", "count": 1 },
  { "file": "src/app/mentions-legales/page.tsx", "from": "max-w-none!", "count": 1 },
  { "file": "src/app/politique-confidentialite/page.tsx", "from": "max-w-none!", "count": 8 },
  { "file": "src/app/politique-confidentialite/page.tsx", "from": "max-w-3xl!", "count": 1 },
  { "file": "src/app/politique-cookies/page.tsx", "from": "max-w-none!", "count": 3 },
  { "file": "src/app/politique-cookies/page.tsx", "from": "max-w-3xl!", "count": 1 },
  { "file": "src/app/services/page.tsx", "from": "shrink-0", "count": 1 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "shrink-0", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "backdrop-blur-xs", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "shrink-0", "count": 5 },
  { "file": "src/components/GoogleReviews.tsx", "from": "pl-4!", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "scrollbar-none", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "bg-linear-to-l", "count": 1 },
  { "file": "src/components/trusted.tsx", "from": "aspect-2/1", "count": 3 },
  { "file": "src/components/ui/button.tsx", "from": "focus-visible:outline-hidden", "count": 1 },
  { "file": "src/components/ui/card.tsx", "from": "shadow-xs", "count": 1 },
  { "file": "src/components/ui/input.tsx", "from": "focus-visible:outline-hidden", "count": 1 },
  { "file": "src/components/ui/textarea.tsx", "from": "focus-visible:outline-hidden", "count": 1 }
]
```

- [ ] **Step 7: Créer `maps\step1-keep-flex-shrink.json`**

```json
[
  { "file": "src/app/_components/HomeView.tsx", "from": "md:shrink-0", "to": "md:flex-shrink-0", "count": 1 },
  { "file": "src/app/_components/ServiceDetailBody.tsx", "from": "shrink-0", "to": "flex-shrink-0", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "shrink-0", "to": "flex-shrink-0", "count": 1 },
  { "file": "src/app/services/page.tsx", "from": "shrink-0", "to": "flex-shrink-0", "count": 1 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "shrink-0", "to": "flex-shrink-0", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "shrink-0", "to": "flex-shrink-0", "count": 5 }
]
```

- [ ] **Step 8: Créer `maps\step1-dead-min-sizes.json`**

```json
[
  { "file": "src/app/_components/navbar.tsx", "from": "h-16 min-h-16", "to": "h-16", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "w-8 h-8 min-w-8 min-h-8", "to": "w-8 h-8", "count": 1 }
]
```

- [ ] **Step 9: Créer `maps\step1-sibling.json`**

```json
[
  { "file": "src/app/_components/CookieConsent.tsx", "from": "divide-y", "to": "sibling:border-t sibling:border-b-0", "count": 1 },
  { "file": "src/app/_components/CookieConsent.tsx", "from": "divide-x", "to": "sibling:border-l sibling:border-r-0", "count": 1 },
  { "file": "src/app/_components/HomeView.tsx", "from": "space-x-4", "to": "sibling:ml-4 sibling:mr-0", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "space-y-6", "to": "sibling:mt-6 sibling:mb-0", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "space-y-5", "to": "sibling:mt-5 sibling:mb-0", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "space-y-1", "to": "sibling:mt-1 sibling:mb-0", "count": 1 },
  { "file": "src/app/blog/_components/MdxComponents.tsx", "from": "space-y-2", "to": "sibling:mt-2 sibling:mb-0", "count": 2 },
  { "file": "src/components/contact_form.tsx", "from": "space-y-6", "to": "sibling:mt-6 sibling:mb-0", "count": 2 },
  { "file": "src/components/contact_form.tsx", "from": "space-y-8", "to": "sibling:mt-8 sibling:mb-0", "count": 1 },
  { "file": "src/components/contact_form.tsx", "from": "space-y-3", "to": "sibling:mt-3 sibling:mb-0", "count": 1 },
  { "file": "src/components/contact_form.tsx", "from": "space-y-2", "to": "sibling:mt-2 sibling:mb-0", "count": 5 },
  { "file": "src/components/jobs.tsx", "from": "space-y-4", "to": "sibling:mt-4 sibling:mb-0", "count": 4 },
  { "file": "src/components/jobs.tsx", "from": "space-y-2", "to": "sibling:mt-2 sibling:mb-0", "count": 4 },
  { "file": "src/components/ui/card.tsx", "from": "space-y-1.5", "to": "sibling:mt-1.5 sibling:mb-0", "count": 1 }
]
```

- [ ] **Step 10: Créer `maps\step1-line-height.json`**

Valeurs : celles que Tailwind 3 appliquait à partir du point de rupture, c'est-à-dire la hauteur de ligne de la taille responsive (`text-base` 1,5rem soit `leading-6`, `text-lg` et `text-xl` 1,75rem soit `leading-7`, `text-5xl` et plus 1 soit `leading-none`).

```json
[
  { "file": "src/app/_components/textStyles.tsx", "from": "leading-loose text-4xl lg:text-6xl", "to": "leading-loose lg:leading-none text-4xl lg:text-6xl", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "text-sm lg:text-base text-default-700 leading-relaxed", "to": "text-sm lg:text-base text-default-700 leading-relaxed lg:leading-6", "count": 2 },
  { "file": "src/app/blog/page.tsx", "from": "font-medium leading-snug", "to": "font-medium leading-snug lg:leading-7", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "leading-tight mb-6", "to": "leading-tight lg:leading-none mb-6", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "text-base lg:text-lg text-text leading-relaxed", "to": "text-base lg:text-lg text-text leading-relaxed lg:leading-7", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "text-sm lg:text-base text-text leading-relaxed", "to": "text-sm lg:text-base text-text leading-relaxed lg:leading-6", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "font-medium leading-snug", "to": "font-medium leading-snug lg:leading-7", "count": 1 },
  { "file": "src/app/blog/_components/MdxComponents.tsx", "from": "2xl:text-lg leading-loose", "to": "2xl:text-lg leading-loose lg:leading-6 2xl:leading-7", "count": 3 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "text-base lg:text-lg text-default-700 leading-relaxed", "to": "text-base lg:text-lg text-default-700 leading-relaxed lg:leading-7", "count": 1 }
]
```

- [ ] **Step 11: Créer `maps\step1-opacity-colors.json`**

Chaque valeur est celle du CSS compilé de la référence (`61f72beef2126a12.css`), par exemple `.border-neutral-500\/30{border-color:rgb(115 115 115/.3)}` et `.bg-primary\/10{background-color:hsl(var(--heroui-primary)/.1)}`.

```json
[
  { "file": "src/app/_components/navbar.tsx", "from": "border-default-200/50", "to": "border-[hsl(var(--heroui-default-200)/0.5)]", "count": 2 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "bg-primary/10", "to": "bg-[hsl(var(--heroui-primary)/0.1)]", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "marker:text-primary/70", "to": "marker:text-[hsl(var(--heroui-primary)/0.7)]", "count": 1 },
  { "file": "src/app/_components/ServiceDetailBody.tsx", "from": "bg-default-50/50", "to": "bg-[hsl(var(--heroui-default-50)/0.5)]", "count": 2 },
  { "file": "src/app/_components/ServiceDetailBody.tsx", "from": "hover:bg-primary/5", "to": "hover:bg-[hsl(var(--heroui-primary)/0.05)]", "count": 2 },
  { "file": "src/app/services/page.tsx", "from": "bg-default-50/50", "to": "bg-[hsl(var(--heroui-default-50)/0.5)]", "count": 1 },
  { "file": "src/app/services/page.tsx", "from": "hover:bg-primary/5", "to": "hover:bg-[hsl(var(--heroui-primary)/0.05)]", "count": 1 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "bg-default-50/50", "to": "bg-[hsl(var(--heroui-default-50)/0.5)]", "count": 2 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "hover:bg-primary/5", "to": "hover:bg-[hsl(var(--heroui-primary)/0.05)]", "count": 2 },
  { "file": "src/components/ui/button.tsx", "from": "hover:bg-primary/90", "to": "hover:bg-[hsl(var(--heroui-primary)/0.9)]", "count": 1 },
  { "file": "src/components/ui/button.tsx", "from": "hover:bg-secondary/80", "to": "hover:bg-[hsl(var(--heroui-secondary)/0.8)]", "count": 1 },
  { "file": "src/components/ui/button.tsx", "from": "hover:bg-accent1/90", "to": "hover:bg-[rgb(18_79_170/0.9)]", "count": 1 },
  { "file": "src/app/_components/buttons.tsx", "from": "bg-neutral-200/10", "to": "bg-[rgb(229_229_229/0.1)]", "count": 1 },
  { "file": "src/app/_components/buttons.tsx", "from": "hover:bg-accent1/90", "to": "hover:bg-[rgb(18_79_170/0.9)]", "count": 1 },
  { "file": "src/app/_components/buttons.tsx", "from": "bg-accent1/10", "to": "bg-[rgb(18_79_170/0.1)]", "count": 1 },
  { "file": "src/app/blog/page.tsx", "from": "text-text/70", "to": "text-[rgb(71_75_100/0.7)]", "count": 1 },
  { "file": "src/app/blog/page.tsx", "from": "bg-accent1/10", "to": "bg-[rgb(18_79_170/0.1)]", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "text-text/70", "to": "text-[rgb(71_75_100/0.7)]", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "text-text/80", "to": "text-[rgb(71_75_100/0.8)]", "count": 1 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "bg-accent1/10", "to": "bg-[rgb(18_79_170/0.1)]", "count": 2 },
  { "file": "src/app/blog/[slug]/page.tsx", "from": "hover:bg-accent1/5", "to": "hover:bg-[rgb(18_79_170/0.05)]", "count": 1 },
  { "file": "src/app/blog/_components/MdxComponents.tsx", "from": "text-text/90", "to": "text-[rgb(71_75_100/0.9)]", "count": 1 },
  { "file": "src/app/mentions-legales/page.tsx", "from": "border-neutral-500/30", "to": "border-[rgb(115_115_115/0.3)]", "count": 1 },
  { "file": "src/app/politique-confidentialite/page.tsx", "from": "border-neutral-500/30", "to": "border-[rgb(115_115_115/0.3)]", "count": 1 },
  { "file": "src/app/politique-cookies/page.tsx", "from": "border-neutral-500/30", "to": "border-[rgb(115_115_115/0.3)]", "count": 2 },
  { "file": "src/app/politique-cookies/page.tsx", "from": "border-neutral-700/30", "to": "border-[rgb(64_64_64/0.3)]", "count": 3 },
  { "file": "src/components/GoogleReviews.tsx", "from": "bg-cardbackground/80", "to": "bg-[rgb(255_255_255/0.8)]", "count": 1 }
]
```

Restent volontairement inchangées : `bg-light-background/10` (`CookieConsent.tsx`) et `hover:bg-destructive/90` (`components/ui/button.tsx`), qui ne produisent aucun CSS, ni en Tailwind 3 ni en Tailwind 4 (couleurs inexistantes).

- [ ] **Step 12: Créer `maps\step1-exact-values.json`**

```json
[
  { "file": "src/app/_components/HomeView.tsx", "from": "md:w-1/3", "to": "md:w-third", "count": 1 },
  { "file": "src/app/_components/HomeView.tsx", "from": "md:w-2/3", "to": "md:w-two-thirds", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "w-[calc((100%-2rem)/3)]", "to": "w-review-card", "count": 1 },
  { "file": "src/components/GoogleReviews.tsx", "from": "bg-linear-to-l from-background to-transparent", "to": "bg-fade-left", "count": 1 },
  { "file": "src/app/blog/page.tsx", "from": "group-hover:scale-105", "to": "group-hover:transform-[scale(1.05)]", "count": 1 },
  { "file": "src/components/ui/button.tsx", "from": "focus-visible:outline-hidden", "to": "focus-visible:outline-2 focus-visible:outline-transparent focus-visible:outline-offset-2", "count": 1 },
  { "file": "src/components/ui/input.tsx", "from": "focus-visible:outline-hidden", "to": "focus-visible:outline-2 focus-visible:outline-transparent focus-visible:outline-offset-2", "count": 1 },
  { "file": "src/components/ui/textarea.tsx", "from": "focus-visible:outline-hidden", "to": "focus-visible:outline-2 focus-visible:outline-transparent focus-visible:outline-offset-2", "count": 1 }
]
```

- [ ] **Step 13: Contrôler les outils sur la référence (lecture seule)**

Sur la référence (`ref-site`, commit `a37ed9e`) : la carte de contrôle de l'outil officiel doit échouer (les classes renommées n'existent pas encore), la carte `step1-sibling.json` doit trouver ses comptes exacts (l'outil ne touche pas aux `space-*`), `leading-check` doit trouver les 12 lignes de la tâche 18, la référence comparée à elle-même ne doit montrer aucun changement d'activité, et rien ne doit être écrit dans `ref-site` (toutes les commandes sont en `--check` ou en lecture).

```bash
cd "D:/Repos/macar-migration-tools" && node replace-classes.mjs --repo ref-site --map maps/upgrade-tool-result.json --check | tail -n 1; node replace-classes.mjs --repo ref-site --map maps/step1-sibling.json --check | tail -n 1; node leading-check.mjs --repo ref-site | tail -n 1; node -e 'console.log(require("./baseline/classes.json").all.length)'; node class-activity.mjs --ref-classes baseline/classes.json --cur-classes baseline/classes.json --ref-css ref-site/.next/static/css --cur-css ref-site/.next/static/css | sed -n 1,2p; node css-rules.mjs --css ref-site/.next/static/css --grep '.space-y-2>' --absent '.shrink-0'; git -C ref-site status --short | wc -l
```

Attendu (prototype, avec la liste de classes du prototype : 541) :

```
34 unexpected count(s), nothing written
14 entries, 7 files checked
12 line(s) to fix
541
classes in both DOMs: 541
activity changed: 0
grep ".space-y-2>": 1 rule(s)
  .space-y-2>:not([hidden])~:not([hidden]) { --tw-space-y-reverse:0;margin-top:calc(.5rem * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.5rem * var(--tw-space-y-reverse)) }
absent ".shrink-0": ok
0
```

Le nombre de classes vient de `baseline/classes.json` de la partie 1 : les deux nombres affichés doivent être égaux, même s'ils diffèrent de 541. Le `0` final prouve que `ref-site` n'a pas été modifié.

- [ ] **Step 14: Committer les outils**

```bash
cd "D:/Repos/macar-migration-tools" && git add replace-classes.mjs css-rules.mjs leading-check.mjs class-activity.mjs maps && git commit -F - <<'EOF'
Add the step 1 helper scripts and class maps

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 13: Lancer l'outil officiel de mise à jour et relire son diff

**Files:**
- Modify (par l'outil) : `package.json`, `package-lock.json`, `postcss.config.js`, `src/app/globals.css`, et 21 fichiers de `src` (tableau ci-dessous)
- Delete (par l'outil) : `tailwind.config.ts`
- Modify (correction) : `src/app/_components/HomeView.tsx`, `src/app/_components/ServiceDetailBody.tsx`, `src/app/_components/ServiceSection.tsx`, `src/app/services/page.tsx`, `src/app/zones/[slug]/page.tsx`, `src/components/GoogleReviews.tsx`

**Interfaces:**
- Consumes: `maps/upgrade-tool-result.json`, `maps/step1-keep-flex-shrink.json`, `replace-classes.mjs` (tâche 12).
- Produces: un commit avec les renommages de l'outil, sans le renommage `flex-shrink-0` ; `tailwindcss` et `@tailwindcss/postcss` en `^4.3.3`, `autoprefixer` retiré. `globals.css` et `postcss.config.js` seront réécrits à la tâche 15.

- [ ] **Step 1: Partir d'un arbre propre, sur la bonne branche, avec les dépendances de la référence**

```bash
cd "D:/Repos/macar-next-site-prod" && git switch heroui-v3-migration && git status --porcelain | wc -l && git log --oneline -1 && npm ci --no-audit --no-fund 2>&1 | grep -v allow-scripts | tail -n 2
```

Attendu : `0` (aucun fichier modifié ni non suivi : `docs/` est ignoré ; si un dossier non suivi apparaît, par exemple `.playwright-mcp/`, le supprimer avant de continuer, car l'outil exige un arbre propre), puis `a37ed9e Date the three blog articles to their real publication day`, puis `added ... packages`. `npm ci` garantit que Tailwind 3.3.5 et `@heroui/react` 2.8.8 de la référence sont installés : l'outil lit la configuration avec eux.

- [ ] **Step 2: Vérifier que les classes attendues ne sont pas encore là**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/upgrade-tool-result.json" --check | tail -n 1
```

Attendu : `34 unexpected count(s), nothing written`.

- [ ] **Step 3: Lancer l'outil, en version fixe**

```bash
cd "D:/Repos/macar-next-site-prod" && npx -y @tailwindcss/upgrade@4.3.3
```

Attendu (environ 1 min ; extraits, sans les couleurs) :

```
│ Updating dependencies…
│ ↳ Updated package: `tailwindcss`
│ Migrating templates…
│ ↳ Migrated `.\src\components\trusted.tsx`
...
│ ↳ Migrated templates for configuration file: `.\tailwind.config.ts` (21 files changed)
│ Migrating PostCSS configuration…
│ ↳ Installed package: `@tailwindcss/postcss`
│ ↳ Removed package: `autoprefixer`
│ ↳ Migrated PostCSS configuration: `.\postcss.config.js`
│ Verify the changes and commit them to your repository.
```

- [ ] **Step 4: Relire le diff de l'outil**

```bash
cd "D:/Repos/macar-next-site-prod" && git diff --stat && git diff -- package.json postcss.config.js && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/upgrade-tool-result.json" --check | tail -n 1
```

Attendu : exactement ces fichiers (le nombre de lignes de `package-lock.json` peut varier légèrement) :

```
 package-lock.json                          | 1405 ++++++++++++++--------------
 package.json                               |    4 +-
 postcss.config.js                          |    3 +-
 src/app/_components/HomeView.tsx           |    2 +-
 src/app/_components/ServiceDetailBody.tsx  |    2 +-
 src/app/_components/ServiceSection.tsx     |    2 +-
 src/app/_components/cards.tsx              |    2 +-
 src/app/_components/checkMark.tsx          |    2 +-
 src/app/_components/footer.tsx             |    4 +-
 src/app/_components/navbar.tsx             |    6 +-
 src/app/blog/[slug]/page.tsx               |   10 +-
 src/app/blog/_components/MdxComponents.tsx |    8 +-
 src/app/blog/page.tsx                      |    2 +-
 src/app/globals.css                        |   33 +-
 src/app/mentions-legales/page.tsx          |    2 +-
 src/app/politique-confidentialite/page.tsx |   18 +-
 src/app/politique-cookies/page.tsx         |    8 +-
 src/app/services/page.tsx                  |    2 +-
 src/app/zones/[slug]/page.tsx              |    2 +-
 src/components/GoogleReviews.tsx           |   16 +-
 src/components/trusted.tsx                 |    6 +-
 src/components/ui/button.tsx               |    2 +-
 src/components/ui/card.tsx                 |    2 +-
 src/components/ui/input.tsx                |    2 +-
 src/components/ui/textarea.tsx             |    2 +-
 tailwind.config.ts                         |   28 -
 26 files changed, 789 insertions(+), 786 deletions(-)
```

Dans `package.json` : `"@tailwindcss/postcss": "^4.3.3"` ajouté, `"autoprefixer"` retiré, `"tailwindcss": "^4.3.3"`. Dans `postcss.config.js` : `tailwindcss` et `autoprefixer` remplacés par `'@tailwindcss/postcss'`. Puis `34 entries, 21 files checked` : chaque renommage attendu est présent avec le bon nombre d'occurrences.

Relecture, renommage par renommage :

| Renommage de l'outil | Fichiers (occurrences) | Décision |
|---|---|---|
| `!classe` vers `classe!` (22) | `navbar.tsx` (7 : `[&_span]:hidden!`, `fixed! top-16! left-0! right-0! w-full!`, `z-9999!`), `GoogleReviews.tsx` (`pl-4!`), `mentions-legales/page.tsx` (1), `politique-confidentialite/page.tsx` (9), `politique-cookies/page.tsx` (4) | gardé, même CSS |
| `flex-shrink-0` vers `shrink-0` (10) | `HomeView.tsx` (`md:`), `ServiceDetailBody.tsx`, `ServiceSection.tsx`, `services/page.tsx`, `zones/[slug]/page.tsx`, `GoogleReviews.tsx` (5) | **annulé** à l'étape 5 (écart 10) |
| `rounded` vers `rounded-sm` (3) | `cards.tsx`, `blog/[slug]/page.tsx`, `MdxComponents.tsx` | gardé (0,25rem) |
| `focus-visible:outline-none` vers `focus-visible:outline-hidden` (3) | `components/ui/button.tsx`, `input.tsx`, `textarea.tsx` | remplacé à la tâche 20 |
| `shadow-sm` vers `shadow-xs` | `components/ui/card.tsx` | gardé (même ombre ; pile corrigée par `@utility shadow-xs`) |
| `backdrop-blur-sm` vers `backdrop-blur-xs` | `GoogleReviews.tsx` | gardé (4 px) |
| `bg-gradient-to-l` vers `bg-linear-to-l` | `GoogleReviews.tsx` | remplacé à la tâche 20 |
| `border-b-1` vers `border-b` | `checkMark.tsx` | gardé (1 px) |
| `h-[1px]` vers `h-px` (2) | `footer.tsx` | gardé |
| `z-[100]` vers `z-100` | `navbar.tsx` | gardé |
| `font-[var(--font-raptor)]` vers `font-(--font-raptor)` (5) | `blog/[slug]/page.tsx` (3), `MdxComponents.tsx` (2) | gardé : compile toujours en `font-weight:var(--font-raptor)`, comme la référence (bogue connu, section 10) |
| `aspect-[16/9]` vers `aspect-video` (3) | `blog/[slug]/page.tsx`, `MdxComponents.tsx`, `blog/page.tsx` | gardé |
| `aspect-[2/1]` vers `aspect-2/1` (3) | `trusted.tsx` | gardé |
| `[scrollbar-width:none]` vers `scrollbar-none` | `GoogleReviews.tsx` | gardé (`scrollbar-width:none`) |
| `tailwind.config.ts` supprimé, `globals.css` réécrit sans le plugin `heroui()` ni les globs | | `globals.css` remplacé à la tâche 15 |
| `tailwindcss-animate` laissé dans `package.json` | | retiré à la tâche 14 |

- [ ] **Step 5: Annuler le renommage `flex-shrink-0`**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/step1-keep-flex-shrink.json"
```

Attendu :

```
ok   src/app/_components/HomeView.tsx: md:shrink-0 -> md:flex-shrink-0 (1/1)
ok   src/app/_components/ServiceDetailBody.tsx: shrink-0 -> flex-shrink-0 (1/1)
ok   src/app/_components/ServiceSection.tsx: shrink-0 -> flex-shrink-0 (1/1)
ok   src/app/services/page.tsx: shrink-0 -> flex-shrink-0 (1/1)
ok   src/app/zones/[slug]/page.tsx: shrink-0 -> flex-shrink-0 (1/1)
ok   src/components/GoogleReviews.tsx: shrink-0 -> flex-shrink-0 (5/5)
6 entries, 6 files written
```

- [ ] **Step 6: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add package.json package-lock.json postcss.config.js tailwind.config.ts src && git status --short && git commit -F - <<'EOF'
Run the Tailwind 4 upgrade tool and keep the flex-shrink names

The official tool renames the important modifiers and the classes whose
scale changed. flex-shrink-0 is kept: HeroUI v2 also sets shrink-0 on its
own elements, and that class must not start producing CSS at this step.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Attendu : `git status --short` liste, en `M`, `package-lock.json`, `package.json`, `postcss.config.js`, `src/app/globals.css` et ces 16 fichiers de `src` : `_components/cards.tsx`, `_components/checkMark.tsx`, `_components/footer.tsx`, `_components/navbar.tsx`, `blog/[slug]/page.tsx`, `blog/_components/MdxComponents.tsx`, `blog/page.tsx`, `mentions-legales/page.tsx`, `politique-confidentialite/page.tsx`, `politique-cookies/page.tsx`, `components/GoogleReviews.tsx`, `components/trusted.tsx`, `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx` ; puis `D tailwind.config.ts`. `HomeView.tsx`, `ServiceDetailBody.tsx`, `ServiceSection.tsx`, `services/page.tsx` et `zones/[slug]/page.tsx` n'apparaissent plus : l'outil n'y avait changé que `flex-shrink-0`. Le build n'est pas lancé ici : le plugin HeroUI n'est pas encore rechargé.

---

### Task 14: Ajuster les dépendances

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/app/_components/CookieConsent.tsx` (import mort de `next-reveal`)

**Interfaces:**
- Consumes: le commit de la tâche 13.
- Produces: les dépendances de la spec 5.1 : `tailwindcss` et `@tailwindcss/postcss` en `~4.3.3`, `tailwind-merge` en `^3.7.0`, `@heroui/react` toujours résolu en 2.8.8 ; `autoprefixer`, `tailwindcss-animate`, `next-reveal` et `@radix-ui/react-icons` absents ; une seule version de Tailwind dans l'arbre.

- [ ] **Step 1: Vérifier l'état de départ**

```bash
cd "D:/Repos/macar-next-site-prod" && node -e 'const l=require("./package-lock.json");for(const k of ["@heroui/react","tailwindcss","@tailwindcss/postcss","tailwind-merge","@tailwindcss/oxide-linux-x64-gnu","lightningcss-linux-x64-gnu","autoprefixer","tailwindcss-animate","next-reveal","@radix-ui/react-icons"]){const p=l.packages["node_modules/"+k];console.log(k+" "+(p?p.version:"absent"))}'
```

Attendu : `tailwind-merge 2.2.0`, `tailwindcss-animate 1.0.7`, `next-reveal 1.0.6`, `@radix-ui/react-icons 1.3.2` encore présents, `autoprefixer absent`, `tailwindcss 4.3.3`.

- [ ] **Step 2: Retirer les paquets inutilisés**

```bash
cd "D:/Repos/macar-next-site-prod" && npm uninstall tailwindcss-animate next-reveal @radix-ui/react-icons --no-audit --no-fund 2>&1 | grep -v allow-scripts | tail -n 1
```

Attendu : `removed 19 packages in ...`.

- [ ] **Step 3: Fixer les plages de Tailwind et passer à tailwind-merge 3**

```bash
cd "D:/Repos/macar-next-site-prod" && npm install -D tailwindcss@~4.3.3 @tailwindcss/postcss@~4.3.3 --no-audit --no-fund 2>&1 | grep -v allow-scripts | tail -n 1 && npm install tailwind-merge@^3.7.0 --no-audit --no-fund 2>&1 | grep -v allow-scripts | tail -n 1
```

Attendu : `up to date in ...` puis `changed 1 package in ...`. Aucun `ERESOLVE`, et aucune option `--force` ni `--legacy-peer-deps`.

- [ ] **Step 4: Retirer l'import mort de `next-reveal`**

Dans `src/app/_components/CookieConsent.tsx`, remplacer :

```tsx
import { RevealWrapper, RevealList } from "next-reveal";
import { motion } from "framer-motion";
```

par :

```tsx
import { motion } from "framer-motion";
```

- [ ] **Step 5: Vérifier `package.json`, le lockfile et l'arbre**

```bash
cd "D:/Repos/macar-next-site-prod" && node -e 'const p=require("./package.json");console.log(JSON.stringify({dependencies:p.dependencies,devDependencies:p.devDependencies},null,2))' && node -e 'const l=require("./package-lock.json");for(const k of ["@heroui/react","tailwindcss","@tailwindcss/postcss","tailwind-merge","@tailwindcss/oxide-linux-x64-gnu","lightningcss-linux-x64-gnu","autoprefixer","tailwindcss-animate","next-reveal","@radix-ui/react-icons"]){const p=l.packages["node_modules/"+k];console.log(k+" "+(p?p.version:"absent"))}' && npm ls tailwindcss --all 2>&1 | grep -o 'tailwindcss@[0-9.]*' | sort | uniq -c && grep -rn "next-reveal" src | wc -l
```

Attendu :

```json
{
  "dependencies": {
    "@heroui/react": "^2.8.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@vercel/analytics": "^1.5.0",
    "axios": "^1.6.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "framer-motion": "^11.5.6",
    "gray-matter": "^4.0.3",
    "js-cookie": "^3.0.5",
    "lucide-react": "^1.47.0",
    "next": "^15.5.9",
    "next-mdx-remote": "^6.0.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-responsive-carousel": "^3.2.23",
    "reading-time": "^1.5.0",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-slug": "^6.0.0",
    "remark-gfm": "^4.0.1",
    "tailwind-merge": "^3.7.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "~4.3.3",
    "@types/js-cookie": "^3.0.6",
    "@types/node": "^20",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "postcss": "^8",
    "tailwindcss": "~4.3.3",
    "typescript": "^5",
    "vercel": "^60.1.3"
  }
}
```

puis :

```
@heroui/react 2.8.8
tailwindcss 4.3.3
@tailwindcss/postcss 4.3.3
tailwind-merge 3.7.0
@tailwindcss/oxide-linux-x64-gnu 4.3.3
lightningcss-linux-x64-gnu 1.32.0
autoprefixer absent
tailwindcss-animate absent
next-reveal absent
@radix-ui/react-icons absent
      9 tailwindcss@4.3.3
0
```

Les binaires Linux de `@tailwindcss/oxide` et de `lightningcss` sont dans le lockfile (build Vercel). Les copies de Tailwind 4.1.18 et 4.3.0 imbriquées sous `@heroui/react` ont disparu : `@heroui/theme` 2.4.26 utilise maintenant le Tailwind 4.3.3 du projet. `@heroui/react` reste en 2.8.8 malgré la plage `^2.8.0`, car le lockfile n'a pas été régénéré.

- [ ] **Step 6: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add package.json package-lock.json src/app/_components/CookieConsent.tsx && git commit -F - <<'EOF'
Update dependencies for Tailwind 4 and drop unused packages

Pin tailwindcss and @tailwindcss/postcss to 4.3, move tailwind-merge to v3
and remove tailwindcss-animate, next-reveal (dead import) and
@radix-ui/react-icons, none of which is used at runtime.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 15: Configuration Tailwind 4, plugin HeroUI v2 et blocs de compatibilité

**Files:**
- Create: `hero.ts`
- Modify: `postcss.config.js`
- Modify: `components.json`
- Modify: `src/app/globals.css` (contenu complet)

**Interfaces:**
- Consumes: les dépendances de la tâche 14.
- Produces:
  - `hero.ts` (temporaire, retiré à l'étape 2) chargé par `@plugin "../../hero.ts"` ;
  - dans `globals.css` : la variante `sibling:` (sélecteur Tailwind 3 des `space-*` et `divide-*`), les utilitaires `w-third`, `w-two-thirds`, `w-review-card` et `bg-fade-left`, utilisés par les tâches 17 et 20 ;
  - le premier build Tailwind 4 du site et la première comparaison avec la référence (attendue en échec : c'est le test que les tâches 16 à 20 font passer).

- [ ] **Step 1: Créer `hero.ts` à la racine du dépôt**

Contenu complet (code du guide https://v2.heroui.com/docs/guide/tailwind-v4) :

```ts
// Temporary bridge: loads the HeroUI v2 Tailwind plugin under Tailwind 4.
// Removed at step 2 (HeroUI v3 no longer ships a Tailwind plugin).
import { heroui } from "@heroui/react";

export default heroui();
```

- [ ] **Step 2: Réécrire `postcss.config.js`**

Contenu complet :

```js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 3: Vider la clé `tailwind.config` de `components.json`**

Dans `components.json`, remplacer :

```json
    "config": "tailwind.config.ts",
```

par :

```json
    "config": "",
```

- [ ] **Step 4: Écrire `src/app/globals.css`**

Contenu complet. Différences avec le guide HeroUI v2 : pas de `@source` vers `@heroui/theme` (spec 5.2), et `source(none)` avec deux `@source` qui reprennent les globs `content` de Tailwind 3. Les blocs après le `@theme` de l'anneau sont les parades 5 à 11 du tableau de résultats.

```css
@import "tailwindcss" source(none);

/* Same files as the Tailwind 3 `content` globs (no node_modules, no @heroui/theme). */
@source "../app/**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";

/* HeroUI v2 plugin, temporary until step 2. */
@plugin "../../hero.ts";

/* Tailwind 3 behaviour: hover also applies on touch devices. */
@custom-variant hover (&:hover);

/* Tailwind 3 selector of space-* and divide-*: every following visible sibling. */
@custom-variant sibling (& > :not([hidden]) ~ :not([hidden]));

@theme inline {
  --color-background: #F6F8FF;
  --color-headings: #0E1435;
  --color-text: #474B64;
  --color-accent1: #124FAA;
  --color-cardbackground: #FFFFFF;
  --color-bordercard: #D8DBE9;

  --font-sans: var(--font-raptor);

  /* Tailwind 3 default palette, only the shades used by the site. */
  --color-amber-400: #fbbf24;
  --color-blue-100: #dbeafe;
  --color-blue-500: #3b82f6;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-500: #737373;
  --color-neutral-700: #404040;
  --color-red-500: #ef4444;
  --color-red-600: #dc2626;
  --color-red-700: #b91c1c;

  /* Tailwind 3 values that differ in Tailwind 4. */
  --radius-full: 9999px;
}

@theme {
  --default-ring-width: 3px;
  --default-ring-color: rgb(59 130 246 / 0.5);
}

/* Tailwind 3 transition lists (Tailwind 4 adds outline-color, gradients, translate, scale, rotate). */
@utility transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
}

@utility transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
}

@utility transition-transform {
  transition-property: transform;
}

/* Tailwind 3 box-shadow stack: ring offset, ring, shadow (Tailwind 4 adds two inset layers). */
@utility shadow-xs {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@utility shadow-md {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@utility shadow-lg {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@utility ring-2 {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow, 0 0 #0000);
}

/* Former side effect of tailwindcss-animate (removed): these classes also set the animation timing. */
@utility duration-300 {
  animation-duration: 300ms;
}

@utility duration-500 {
  animation-duration: 500ms;
}

@utility ease-in-out {
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Exact values that lightningcss would round (33.3333%, 270deg): the var() keeps them as written. */
@utility w-third {
  width: calc(100% / var(--thirds, 3));
}

@utility w-two-thirds {
  width: calc(200% / var(--thirds, 3));
}

@utility w-review-card {
  width: calc((100% - 2rem) / var(--thirds, 3));
}

@utility bg-fade-left {
  background-image: linear-gradient(var(--fade-direction, to left), #F6F8FF, transparent);
}

/* Tailwind 3 preflight values that Tailwind 4 changed. */
@layer base {
  html {
    font-family: var(--font-raptor);
    -webkit-tap-highlight-color: initial;
  }

  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: #e5e7eb;
  }

  td,
  th {
    padding: 1px;
  }

  input::placeholder,
  textarea::placeholder {
    color: #9ca3af;
  }

  button,
  [role="button"] {
    cursor: pointer;
  }

  :disabled {
    cursor: default;
  }
}
```

Notes de lecture :
- les `@utility` qui portent le nom d'un utilitaire de Tailwind (`transition-colors`, `shadow-md`, `ring-2`, `duration-300`...) ne le remplacent pas : Tailwind 4.3.3 émet sa règle puis la nôtre, avec le même sélecteur, donc la nôtre l'emporte sur les propriétés qu'elle déclare (vérifié à l'étape 7 ; cet ordre est celui de la version épinglée `~4.3.3`, et la comparaison de la tâche 22 le contrôle à nouveau) ;
- `--radius-full` est lu par `rounded-full` à la place de `calc(infinity * 1px)` ;
- `html { font-family: var(--font-raptor) }` reprend la règle compilée de la référence : la variable n'étant définie sur aucun élément, la police de `html` reste celle du navigateur (Times New Roman), le `body` imposant Open Sans ;
- `-webkit-tap-highlight-color: initial` rend au navigateur sa couleur de surbrillance au toucher, que le préflight de Tailwind 4 met à `transparent`.

- [ ] **Step 5: Vérifier le typage et construire**

```bash
cd "D:/Repos/macar-next-site-prod" && npm run build 2>&1 | grep -E "Next.js|Compiled|rror|Generating static pages \(33/33\)"; npx tsc --noEmit; echo "tsc exit $?"; git restore tsconfig.tsbuildinfo
```

Attendu : `▲ Next.js 15.5.25`, `✓ Compiled successfully`, `✓ Generating static pages (33/33)`, aucune ligne `rror`, puis `tsc exit 0` (le typage passe après le build, qui régénère `.next/types`).

- [ ] **Step 6: Vérifier que le plugin v2 ne génère que les jetons**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep ':root,[data-theme]' --grep '--heroui-primary:' --absent '.shrink-0' --absent '.h-6 {' --absent '.text-tiny' --absent '.bg-divider' --absent '@media (hover:hover)'
```

Attendu : code 0, avec :

```
grep ":root,[data-theme]": 1 rule(s)
  @layer base >> :root,[data-theme] { color:hsl(var(--heroui-foreground));background-color:hsl(var(--heroui-background)) }
grep "--heroui-primary:": 1 rule(s)
  @layer base >> :root,[data-theme=light] { color-scheme:light;--heroui-background:0 0% 100%;--heroui-foreground-50:0 0% 98.04%;--heroui-foreground-100:240 4.76% 95.88%;--heroui-foreground-200:240 5.88% 90%;--heroui-foreground-300:240 4.88% 8...
absent ".shrink-0": ok
absent ".h-6 {": ok
absent ".text-tiny": ok
absent ".bg-divider": ok
absent "@media (hover:hover)": ok
```

- [ ] **Step 7: Vérifier que les blocs de compatibilité l'emportent**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.transition-colors {' --grep '.rounded-full {' --grep '.shadow-lg,.shadow-md,.shadow-xs {' --grep '.duration-300 {' --grep 'td,th {'
```

Attendu : code 0 ; pour `transition-colors` et `duration-300`, deux règles, celle de Tailwind puis la nôtre :

```
grep ".transition-colors {": 2 rule(s)
  @layer utilities >> .transition-colors { transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,...
  @layer utilities >> .transition-colors { transition-property:color,background-color,border-color,text-decoration-color,fill,stroke }
grep ".rounded-full {": 1 rule(s)
  @layer utilities >> .rounded-full { border-radius:9999px }
grep ".shadow-lg,.shadow-md,.shadow-xs {": 1 rule(s)
  @layer utilities >> .shadow-lg,.shadow-md,.shadow-xs { box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) }
grep ".duration-300 {": 2 rule(s)
  @layer utilities >> .duration-300 { --tw-duration:.3s;transition-duration:.3s }
  @layer utilities >> .duration-300 { animation-duration:.3s }
grep "td,th {": 1 rule(s)
  @layer base >> td,th { padding:1px }
```

- [ ] **Step 8: Première comparaison avec la référence (test attendu en échec)**

Lancer en arrière-plan (outil Bash, `run_in_background: true`, `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-next-site-prod" && npx next start -p 3100
```

Puis :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/step1-task15 | tail -n 1 && node compare.mjs --ref baseline --cur runs/step1-task15 > runs/step1-task15/compare.txt; echo "compare exit $?"; node style-diff.mjs --ref baseline --cur runs/step1-task15 > runs/step1-task15/style-diff-out.txt; echo "style-diff exit $?"; sed -n 1p runs/step1-task15/style-diff-out.txt; grep -E '^(identical|failed):' runs/step1-task15/compare.txt
```

Attendu : `47 captures written to ..., 0 failure(s)`, puis `compare exit 1`, `style-diff exit 1`, une première ligne `style differences: <n> element(s) in <m> class group(s)` avec `n` et `m` non nuls, et `failed:` non nul dans `compare.txt`. Échecs mesurés dans le prototype à ce stade (noms de la partie 1), au minimum :
- `home__1280__default` et les états de l'accueil en 1280 px : texte des avis et des services (largeurs 383,984 px, mesure M5), dégradé des avis (mesure M5) ;
- `home__390__default`, `home__390__menu-open`, `home__320__menu-open` et les autres états en 390 px : hauteur de page différente (mesure M2, formulaire de contact) ;
- `services-renovation`, `services-plomberie`, `services-electricite`, `services-toiture` en 1280 px : hauteur (mesures M2 et M3) ;
- `blog__1280__default` et `blog-isolation-facade__1280__default` : hauteurs de ligne (mesure M3) ;
- `mentions-legales`, `politique-confidentialite`, `politique-cookies` en 1280 et 390 px : lignes `border-neutral-500/30` (mesure M4) ;
- `zones-uccle__1280__default` : hauteur de ligne (mesure M3).
Dans `style-diff`, les groupes attendus : `min-height` du `<header>` de la barre (`h-16 min-h-16`) et de l'avatar, marges et bordures des enfants des `space-*` et `divide-*`, `line-height`, `background-image` du dégradé, largeurs.

Arrêter le serveur :

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`.

- [ ] **Step 9: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add hero.ts postcss.config.js components.json src/app/globals.css && git commit -F - <<'EOF'
Move Tailwind to v4 with HeroUI v2 kept

Load the HeroUI v2 plugin through hero.ts without any @source towards
@heroui/theme, so that only its tokens are generated, as in production.
Restrict the sources to the Tailwind 3 content globs, restore the
Tailwind 3 palette, preflight, hover, transition and shadow defaults, and
add the sibling variant and exact-value utilities used by the next commits.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 16: Neutraliser les classes internes HeroUI v2 nouvellement actives

**Files:**
- Modify: `src/app/_components/navbar.tsx` (`h-16 min-h-16` devient `h-16`, `classNames.wrapper`)
- Modify: `src/components/GoogleReviews.tsx` (`flex-shrink-0 w-8 h-8 min-w-8 min-h-8` devient `flex-shrink-0 w-8 h-8`, avatar)

**Interfaces:**
- Consumes: `maps/step1-dead-min-sizes.json`, le build de la tâche 15.
- Produces: aucune classe présente dans le DOM de la référence ne change d'état (le `<header>` HeroUI porte `min-h-16` et l'avatar `min-w-8 min-h-8` ; Tailwind 3.3 ne les générait pas, Tailwind 4 les génère).

- [ ] **Step 1: Constater que les classes sont générées**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.min-h-16' --grep '.min-w-8'
```

Attendu :

```
grep ".min-h-16": 1 rule(s)
  @layer utilities >> .min-h-16 { min-height:calc(var(--spacing) * 16) }
grep ".min-w-8": 1 rule(s)
  @layer utilities >> .min-w-8 { min-width:calc(var(--spacing) * 8) }
```

- [ ] **Step 2: Retirer les classes mortes**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/step1-dead-min-sizes.json"
```

Attendu :

```
ok   src/app/_components/navbar.tsx: h-16 min-h-16 -> h-16 (1/1)
ok   src/components/GoogleReviews.tsx: w-8 h-8 min-w-8 min-h-8 -> w-8 h-8 (1/1)
2 entries, 2 files written
```

- [ ] **Step 3: Reconstruire et vérifier**

```bash
cd "D:/Repos/macar-next-site-prod" && npm run build 2>&1 | grep -E "Compiled|rror"; node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --absent '.min-h-16' --absent '.min-w-8' --absent '.min-h-8'; echo "exit $?"
```

Attendu : `✓ Compiled successfully`, puis trois `ok` et `exit 0`.

- [ ] **Step 4: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add src/app/_components/navbar.tsx src/components/GoogleReviews.tsx && git commit -F - <<'EOF'
Drop min-size classes that Tailwind 3 never generated

min-h-16, min-w-8 and min-h-8 produced no CSS in Tailwind 3.3 but do in
Tailwind 4, and HeroUI v2 also sets min-h-16 on the navbar wrapper.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 17: Garder le sélecteur Tailwind 3 des `space-*` et `divide-*`

**Files:**
- Modify: `src/app/_components/CookieConsent.tsx` (`divide-y`, `divide-x`)
- Modify: `src/app/_components/HomeView.tsx` (`space-x-4`)
- Modify: `src/app/_components/ServiceSection.tsx` (`space-y-6`, `space-y-5`, `space-y-1`)
- Modify: `src/app/blog/_components/MdxComponents.tsx` (`space-y-2` x2)
- Modify: `src/components/contact_form.tsx` (`space-y-6` x2, `space-y-8`, `space-y-3`, `space-y-2` x5)
- Modify: `src/components/jobs.tsx` (`space-y-4` x4, `space-y-2` x4)
- Modify: `src/components/ui/card.tsx` (`space-y-1.5`)

**Interfaces:**
- Consumes: la variante `sibling:` de `globals.css` (tâche 15), `maps/step1-sibling.json`.
- Produces: `space-y-N` devient `sibling:mt-N sibling:mb-0`, `space-x-4` devient `sibling:ml-4 sibling:mr-0`, `divide-y` devient `sibling:border-t sibling:border-b-0`, `divide-x` devient `sibling:border-l sibling:border-r-0`. Sélecteur et spécificité (0,3,0) identiques à Tailwind 3 ; `divide-font-gray` reste (couleur inexistante, sans CSS, bordure en `#e5e7eb` par le préflight comme aujourd'hui).

- [ ] **Step 1: Constater le sélecteur de Tailwind 4**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep ':where(.space-y-2' --grep ':where(.divide-y'
```

Attendu :

```
grep ":where(.space-y-2": 1 rule(s)
  @layer utilities >> :where(.space-y-2>:not(:last-child)) { --tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 2) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-y-rever...
grep ":where(.divide-y": 1 rule(s)
  @layer utilities >> :where(.divide-y>:not(:last-child)) { --tw-divide-y-reverse:0;border-bottom-style:var(--tw-border-style);border-top-style:var(--tw-border-style);border-top-width:calc(1px * var(--tw-divide-y-reverse));border-bottom-width...
```

- [ ] **Step 2: Remplacer les 24 `space-*` et les 2 `divide-*`**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/step1-sibling.json"
```

Attendu :

```
ok   src/app/_components/CookieConsent.tsx: divide-y -> sibling:border-t sibling:border-b-0 (1/1)
ok   src/app/_components/CookieConsent.tsx: divide-x -> sibling:border-l sibling:border-r-0 (1/1)
ok   src/app/_components/HomeView.tsx: space-x-4 -> sibling:ml-4 sibling:mr-0 (1/1)
ok   src/app/_components/ServiceSection.tsx: space-y-6 -> sibling:mt-6 sibling:mb-0 (1/1)
ok   src/app/_components/ServiceSection.tsx: space-y-5 -> sibling:mt-5 sibling:mb-0 (1/1)
ok   src/app/_components/ServiceSection.tsx: space-y-1 -> sibling:mt-1 sibling:mb-0 (1/1)
ok   src/app/blog/_components/MdxComponents.tsx: space-y-2 -> sibling:mt-2 sibling:mb-0 (2/2)
ok   src/components/contact_form.tsx: space-y-6 -> sibling:mt-6 sibling:mb-0 (2/2)
ok   src/components/contact_form.tsx: space-y-8 -> sibling:mt-8 sibling:mb-0 (1/1)
ok   src/components/contact_form.tsx: space-y-3 -> sibling:mt-3 sibling:mb-0 (1/1)
ok   src/components/contact_form.tsx: space-y-2 -> sibling:mt-2 sibling:mb-0 (5/5)
ok   src/components/jobs.tsx: space-y-4 -> sibling:mt-4 sibling:mb-0 (4/4)
ok   src/components/jobs.tsx: space-y-2 -> sibling:mt-2 sibling:mb-0 (4/4)
ok   src/components/ui/card.tsx: space-y-1.5 -> sibling:mt-1.5 sibling:mb-0 (1/1)
14 entries, 7 files written
```

- [ ] **Step 3: Reconstruire et vérifier**

```bash
cd "D:/Repos/macar-next-site-prod" && grep -rnE '(^|[ "`{])(space-[xy]|divide-[xy])(-|[ "`}])' src | wc -l; npm run build 2>&1 | grep -E "Compiled|rror"; node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.sibling\:mt-2>' --grep '.sibling\:border-t>' --absent 'space-y' --absent 'space-x' --absent 'divide-'; echo "exit $?"
```

Attendu : `0`, `✓ Compiled successfully`, puis :

```
grep ".sibling\\:mt-2>": 1 rule(s)
  @layer utilities >> .sibling\:mt-2>:not([hidden])~:not([hidden]) { margin-top:calc(var(--spacing) * 2) }
grep ".sibling\\:border-t>": 1 rule(s)
  @layer utilities >> .sibling\:border-t>:not([hidden])~:not([hidden]) { border-top-style:var(--tw-border-style);border-top-width:1px }
absent "space-y": ok
absent "space-x": ok
absent "divide-": ok
exit 0
```

`cn()` (`components/ui/card.tsx`) reçoit `sibling:mt-1.5 sibling:mb-0` : tailwind-merge 3 traite `sibling:` comme une variante et ne fusionne pas `mt` avec `mb`.

- [ ] **Step 4: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add src/app/_components/CookieConsent.tsx src/app/_components/HomeView.tsx src/app/_components/ServiceSection.tsx src/app/blog/_components/MdxComponents.tsx src/components/contact_form.tsx src/components/jobs.tsx src/components/ui/card.tsx && git commit -F - <<'EOF'
Keep the Tailwind 3 sibling selector for space and divide utilities

Tailwind 4 moves the gap of space-* and divide-* to the bottom of every
child but the last, which changed the page height and the cookie banner
rows. The sibling variant restores the Tailwind 3 selector.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 18: Garder les hauteurs de ligne Tailwind 3 des tailles de texte responsives

**Files:**
- Modify: `src/app/_components/textStyles.tsx` (`MainHeading`)
- Modify: `src/app/_components/ServiceSection.tsx` (lignes 63 et 82)
- Modify: `src/app/blog/page.tsx` (ligne 92)
- Modify: `src/app/blog/[slug]/page.tsx` (lignes 132, 136, 170, 215)
- Modify: `src/app/blog/_components/MdxComponents.tsx` (lignes 32, 38, 44)
- Modify: `src/app/zones/[slug]/page.tsx` (ligne 86)

**Interfaces:**
- Consumes: `maps/step1-line-height.json`, `leading-check.mjs`.
- Produces: les 12 lignes ajoutent la hauteur de ligne que Tailwind 3 appliquait au point de rupture.

- [ ] **Step 1: Lister les lignes concernées**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/leading-check.mjs" --repo .; echo "exit $?"
```

Attendu :

```
src/app/_components/ServiceSection.tsx:63: <p className="text-sm lg:text-base text-default-700 leading-relaxed">
src/app/_components/ServiceSection.tsx:82: <p className="text-sm lg:text-base text-default-700 leading-relaxed">
src/app/_components/textStyles.tsx:34: className={`${raptor.className} leading-loose text-4xl lg:text-6xl 2xl:text-7xl max-w-[20ch] text-headings ${customClass
src/app/blog/[slug]/page.tsx:132: <h1 className="text-3xl lg:text-5xl text-headings font-(--font-raptor) leading-tight mb-6">
src/app/blog/[slug]/page.tsx:136: <p className="text-base lg:text-lg text-text leading-relaxed mb-10">
src/app/blog/[slug]/page.tsx:170: <p className="text-sm lg:text-base text-text leading-relaxed mb-6 max-w-prose">
src/app/blog/[slug]/page.tsx:215: <h3 className="text-base lg:text-lg text-headings font-medium leading-snug group-hover:text-accent1 transition-colors">
src/app/blog/_components/MdxComponents.tsx:32: className="text-sm lg:text-base 2xl:text-lg leading-loose text-text my-5 max-w-prose"
src/app/blog/_components/MdxComponents.tsx:38: className="list-disc pl-6 my-5 sibling:mt-2 sibling:mb-0 text-sm lg:text-base 2xl:text-lg leading-loose text-text max-w-
src/app/blog/_components/MdxComponents.tsx:44: className="list-decimal pl-6 my-5 sibling:mt-2 sibling:mb-0 text-sm lg:text-base 2xl:text-lg leading-loose text-text max
src/app/blog/page.tsx:92: <h3 className="text-lg lg:text-xl text-headings font-medium leading-snug group-hover:text-accent1 transition-colors">
src/app/zones/[slug]/page.tsx:86: <p className="mt-6 text-base lg:text-lg text-default-700 leading-relaxed">
12 line(s) to fix
exit 1
```

- [ ] **Step 2: Ajouter les hauteurs de ligne**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/step1-line-height.json"
```

Attendu :

```
ok   src/app/_components/textStyles.tsx: leading-loose text-4xl lg:text-6xl -> leading-loose lg:leading-none text-4xl lg:text-6xl (1/1)
ok   src/app/_components/ServiceSection.tsx: text-sm lg:text-base text-default-700 leading-relaxed -> text-sm lg:text-base text-default-700 leading-relaxed lg:leading-6 (2/2)
ok   src/app/blog/page.tsx: font-medium leading-snug -> font-medium leading-snug lg:leading-7 (1/1)
ok   src/app/blog/[slug]/page.tsx: leading-tight mb-6 -> leading-tight lg:leading-none mb-6 (1/1)
ok   src/app/blog/[slug]/page.tsx: text-base lg:text-lg text-text leading-relaxed -> text-base lg:text-lg text-text leading-relaxed lg:leading-7 (1/1)
ok   src/app/blog/[slug]/page.tsx: text-sm lg:text-base text-text leading-relaxed -> text-sm lg:text-base text-text leading-relaxed lg:leading-6 (1/1)
ok   src/app/blog/[slug]/page.tsx: font-medium leading-snug -> font-medium leading-snug lg:leading-7 (1/1)
ok   src/app/blog/_components/MdxComponents.tsx: 2xl:text-lg leading-loose -> 2xl:text-lg leading-loose lg:leading-6 2xl:leading-7 (3/3)
ok   src/app/zones/[slug]/page.tsx: text-base lg:text-lg text-default-700 leading-relaxed -> text-base lg:text-lg text-default-700 leading-relaxed lg:leading-7 (1/1)
9 entries, 6 files written
```

- [ ] **Step 3: Vérifier**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/leading-check.mjs" --repo .; echo "exit $?"; npm run build 2>&1 | grep -E "Compiled|rror"; node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.lg\:leading-6' --grep '.lg\:leading-none'
```

Attendu : `0 line(s) to fix`, `exit 0`, `✓ Compiled successfully`, puis :

```
grep ".lg\\:leading-6": 1 rule(s)
  @layer utilities >> @media (min-width:64rem) >> .lg\:leading-6 { --tw-leading:calc(var(--spacing) * 6);line-height:calc(var(--spacing) * 6) }
grep ".lg\\:leading-none": 1 rule(s)
  @layer utilities >> @media (min-width:64rem) >> .lg\:leading-none { --tw-leading:1;line-height:1 }
```

- [ ] **Step 4: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add src/app/_components/textStyles.tsx src/app/_components/ServiceSection.tsx src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" src/app/blog/_components/MdxComponents.tsx "src/app/zones/[slug]/page.tsx" && git commit -F - <<'EOF'
Pin the Tailwind 3 line heights of responsive text sizes

In Tailwind 3 a responsive text size such as lg:text-base also reset the
line height set by a base leading class. Tailwind 4 keeps the leading
class, so the Tailwind 3 values are now written explicitly.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 19: Remplacer les couleurs avec opacité par leur valeur Tailwind 3

**Files:**
- Modify: `src/app/_components/navbar.tsx`, `src/app/_components/ServiceSection.tsx`, `src/app/_components/ServiceDetailBody.tsx`, `src/app/services/page.tsx`, `src/app/zones/[slug]/page.tsx`, `src/components/ui/button.tsx`, `src/app/_components/buttons.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/_components/MdxComponents.tsx`, `src/app/mentions-legales/page.tsx`, `src/app/politique-confidentialite/page.tsx`, `src/app/politique-cookies/page.tsx`, `src/components/GoogleReviews.tsx`

**Interfaces:**
- Consumes: `maps/step1-opacity-colors.json`.
- Produces: plus aucune couleur calculée par `color-mix(in oklab)` ni en `oklab()` dans le CSS du site. Les classes `*-[hsl(var(--heroui-*)/...)]` dépendent du plugin v2 (voir « Ce que l'étape 2 doit savoir »).

- [ ] **Step 1: Constater les couleurs oklab**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.border-neutral-500\/30' --grep '.bg-primary\/10'
```

Attendu :

```
grep ".border-neutral-500\\/30": 1 rule(s)
  @layer utilities >> .border-neutral-500\/30 { border-color:oklab(55.5527% 0 0/.3) }
grep ".bg-primary\\/10": 2 rule(s)
  @layer utilities >> .bg-primary,.bg-primary\/10 { background-color:hsl(var(--heroui-primary)/1) }
  @layer utilities >> @supports (color:color-mix(in lab,red,red)) >> .bg-primary\/10 { background-color:color-mix(in oklab,hsl(var(--heroui-primary)/1) 10%,transparent) }
```

Le prototype a mesuré l'effet : sur fond `#F6F8FF`, `rgb(115 115 115 / .3)` donne le pixel `207,208,213` et `oklab(0.555527 0 0 / 0.3)` donne `206,208,213`. Une valeur `#7373734d` (forme minifiée par lightningcss) donne bien `207,208,213` : Chrome quantifie l'opacité sur 8 bits dans les deux cas.

- [ ] **Step 2: Remplacer les 27 entrées**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/step1-opacity-colors.json" | tail -n 1
```

Attendu : `27 entries, 14 files written` (chaque ligne précédente commence par `ok`).

- [ ] **Step 3: Vérifier**

```bash
cd "D:/Repos/macar-next-site-prod" && grep -rnoE '[a-z:]*(bg|text|border)-(default-[0-9]+|primary|secondary|accent1|neutral-[0-9]+|text|cardbackground)/[0-9]+' src; npm run build 2>&1 | grep -E "Compiled|rror"; node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.border-\[rgb\(115_115_115\/0\.3\)\]' --grep '.bg-\[hsl\(var\(--heroui-primary\)\/0\.1\)\]' --absent 'oklab(' --absent 'in oklab,hsl'; echo "exit $?"
```

Attendu : aucune ligne pour le `grep` (seules restent `bg-light-background/10` et `hover:bg-destructive/90`, hors du motif), `✓ Compiled successfully`, puis :

```
grep ".border-\\[rgb\\(115_115_115\\/0\\.3\\)\\]": 1 rule(s)
  @layer utilities >> .border-\[rgb\(115_115_115\/0\.3\)\] { border-color:#7373734d }
grep ".bg-\\[hsl\\(var\\(--heroui-primary\\)\\/0\\.1\\)\\]": 1 rule(s)
  @layer utilities >> .bg-\[hsl\(var\(--heroui-primary\)\/0\.1\)\] { background-color:hsl(var(--heroui-primary)/.1) }
absent "oklab(": ok
absent "in oklab,hsl": ok
exit 0
```

(La seule règle `color-mix` restante est la couleur de placeholder du préflight, remplacée par le bloc de compatibilité.)

- [ ] **Step 4: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add src/app/_components/navbar.tsx src/app/_components/ServiceSection.tsx src/app/_components/ServiceDetailBody.tsx src/app/services/page.tsx "src/app/zones/[slug]/page.tsx" src/components/ui/button.tsx src/app/_components/buttons.tsx src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" src/app/blog/_components/MdxComponents.tsx src/app/mentions-legales/page.tsx src/app/politique-confidentialite/page.tsx src/app/politique-cookies/page.tsx src/components/GoogleReviews.tsx && git commit -F - <<'EOF'
Replace opacity colours with their Tailwind 3 values

Tailwind 4 mixes opacity modifiers in oklab, which shifts some pixels by
one level. The classes now carry the exact rgb or hsl value that
Tailwind 3 compiled.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 20: Valeurs exactes face à lightningcss, transformation au survol et contour de focus

**Files:**
- Modify: `src/app/_components/HomeView.tsx` (`md:w-1/3`, `md:w-2/3`)
- Modify: `src/components/GoogleReviews.tsx` (largeur des cartes, dégradé)
- Modify: `src/app/blog/page.tsx` (`group-hover:scale-105`)
- Modify: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx` (`focus-visible:outline-hidden`)

**Interfaces:**
- Consumes: les utilitaires `w-third`, `w-two-thirds`, `w-review-card`, `bg-fade-left` et `@utility transition-transform` de `globals.css`, `maps/step1-exact-values.json`.
- Produces: les dernières différences de rendu et de style calculé disparaissent (largeurs 384 px exactes, dégradé `to left` en sRGB, transformation au survol en `transform` animée par `transition-transform`, contour de focus transparent de 2 px).

- [ ] **Step 1: Constater les valeurs arrondies et les écarts**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.md\:w-1\/3' --grep 'w-\[calc\(\(100\%-2rem\)\/3\)\]' --grep '.bg-linear-to-l' --grep '.group-hover\:scale-105' --grep '.focus-visible\:outline-hidden'
```

Attendu :

```
grep ".md\\:w-1\\/3": 1 rule(s)
  @layer utilities >> @media (min-width:48rem) >> .md\:w-1\/3 { width:33.3333% }
grep "w-\\[calc\\(\\(100\\%-2rem\\)\\/3\\)\\]": 1 rule(s)
  @layer utilities >> .w-\[calc\(\(100\%-2rem\)\/3\)\] { width:calc(33.3333% - .666667rem) }
grep ".bg-linear-to-l": 3 rule(s)
  @layer utilities >> .bg-linear-to-l { --tw-gradient-position:to left }
  @layer utilities >> @supports (background-image:linear-gradient(in lab,red,red)) >> .bg-linear-to-l { --tw-gradient-position:to left in oklab }
  @layer utilities >> .bg-linear-to-l { background-image:linear-gradient(var(--tw-gradient-stops)) }
grep ".group-hover\\:scale-105": 1 rule(s)
  @layer utilities >> .group-hover\:scale-105:is(:where(.group):hover *) { --tw-scale-x:105%;--tw-scale-y:105%;--tw-scale-z:105%;scale:var(--tw-scale-x) var(--tw-scale-y) }
grep ".focus-visible\\:outline-hidden": 2 rule(s)
  @layer utilities >> .focus-visible\:outline-hidden:focus-visible { --tw-outline-style:none;outline-style:none }
  @layer utilities >> @media (forced-colors:active) >> .focus-visible\:outline-hidden:focus-visible { outline-offset:2px;outline:2px solid #0000 }
```

Référence : `.md\:w-1\/3{width:33.333333%}`, `width:calc((100% - 2rem) / 3)`, dégradé `linear-gradient(to left, ...)` en sRGB, `transform` à l'échelle 1.05, `outline:2px solid transparent;outline-offset:2px`. Avec `scale` (propriété séparée), l'image ne serait plus animée par `transition-transform` restreint à `transform` (tâche 15) : d'où `transform-[scale(1.05)]`.

- [ ] **Step 2: Remplacer les 8 entrées**

```bash
cd "D:/Repos/macar-next-site-prod" && node "../macar-migration-tools/replace-classes.mjs" --repo . --map "../macar-migration-tools/maps/step1-exact-values.json"
```

Attendu :

```
ok   src/app/_components/HomeView.tsx: md:w-1/3 -> md:w-third (1/1)
ok   src/app/_components/HomeView.tsx: md:w-2/3 -> md:w-two-thirds (1/1)
ok   src/components/GoogleReviews.tsx: w-[calc((100%-2rem)/3)] -> w-review-card (1/1)
ok   src/components/GoogleReviews.tsx: bg-linear-to-l from-background to-transparent -> bg-fade-left (1/1)
ok   src/app/blog/page.tsx: group-hover:scale-105 -> group-hover:transform-[scale(1.05)] (1/1)
ok   src/components/ui/button.tsx: focus-visible:outline-hidden -> focus-visible:outline-2 focus-visible:outline-transparent focus-visible:outline-offset-2 (1/1)
ok   src/components/ui/input.tsx: focus-visible:outline-hidden -> focus-visible:outline-2 focus-visible:outline-transparent focus-visible:outline-offset-2 (1/1)
ok   src/components/ui/textarea.tsx: focus-visible:outline-hidden -> focus-visible:outline-2 focus-visible:outline-transparent focus-visible:outline-offset-2 (1/1)
8 entries, 6 files written
```

- [ ] **Step 3: Reconstruire et vérifier**

```bash
cd "D:/Repos/macar-next-site-prod" && npm run build 2>&1 | grep -E "Compiled|rror"; node "../macar-migration-tools/css-rules.mjs" --css .next/static/css --grep '.md\:w-third' --grep '.w-review-card' --grep '.bg-fade-left' --grep '.group-hover\:transform-\[scale\(1\.05\)\]' --grep '.focus-visible\:outline-transparent' --absent '33.3333%' --absent '.666667rem' --absent 'to left in oklab' --absent '.focus-visible\:outline-hidden'; echo "exit $?"
```

Attendu : `✓ Compiled successfully`, puis :

```
grep ".md\\:w-third": 1 rule(s)
  @layer utilities >> @media (min-width:48rem) >> .md\:w-third { width:calc(100% / var(--thirds,3)) }
grep ".w-review-card": 1 rule(s)
  @layer utilities >> .w-review-card { width:calc((100% - 2rem) / var(--thirds,3)) }
grep ".bg-fade-left": 1 rule(s)
  @layer utilities >> .bg-fade-left { background-image:linear-gradient(var(--fade-direction,to left),#f6f8ff,transparent) }
grep ".group-hover\\:transform-\\[scale\\(1\\.05\\)\\]": 1 rule(s)
  @layer utilities >> .group-hover\:transform-\[scale\(1\.05\)\]:is(:where(.group):hover *) { transform:scale(1.05) }
grep ".focus-visible\\:outline-transparent": 1 rule(s)
  @layer utilities >> .focus-visible\:outline-transparent:focus-visible { outline-color:#0000 }
absent "33.3333%": ok
absent ".666667rem": ok
absent "to left in oklab": ok
absent ".focus-visible\\:outline-hidden": ok
exit 0
```

- [ ] **Step 4: Committer**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo 2>/dev/null; git add src/app/_components/HomeView.tsx src/components/GoogleReviews.tsx src/app/blog/page.tsx src/components/ui/button.tsx src/components/ui/input.tsx src/components/ui/textarea.tsx && git commit -F - <<'EOF'
Keep exact widths, gradient and focus outline under lightningcss

lightningcss rounds 33.333333% and rewrites the review card calc, which
moved the columns by 1/64 px, and Tailwind 4 interpolates linear
gradients in oklab. Use small utilities whose values go through var(),
a transform on hover, and the Tailwind 3 transparent focus outline.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 21: Contrôles techniques (spec 8.3)

**Files:**
- Create (temporaire, supprimé à la fin) : `D:\Repos\macar-migration-tools\runs\step1-clean-clone\`

**Interfaces:**
- Consumes: la branche `heroui-v3-migration` après la tâche 20.
- Produces: la preuve que le dépôt s'installe et se construit depuis un clone propre, sans `--force`, avec une seule version de Tailwind.

- [ ] **Step 1: Typage et build dans le dépôt**

```bash
cd "D:/Repos/macar-next-site-prod" && npm run build 2>&1 | grep -E "Next.js|Compiled|rror|Generating static pages \(33/33\)"; npx tsc --noEmit; echo "tsc exit $?"; git restore tsconfig.tsbuildinfo; git status --porcelain | wc -l
```

Attendu : `▲ Next.js 15.5.25`, `✓ Compiled successfully`, `✓ Generating static pages (33/33)`, `tsc exit 0`, puis `0`. Pas de lint (spec 8.3).

- [ ] **Step 2: Installation et build depuis un clone propre**

```bash
df -h /d | tail -1; cd "D:/Repos/macar-migration-tools/runs" && rm -rf step1-clean-clone && git clone -q "D:/Repos/macar-next-site-prod" step1-clean-clone && cd step1-clean-clone && git log --oneline -1 && npm ci --no-audit --no-fund 2>&1 | grep -E "ERESOLVE|added" ; npm ls tailwindcss --all 2>&1 | grep -o 'tailwindcss@[0-9.]*' | sort | uniq -c; npm run build 2>&1 | grep -E "Compiled|rror|Generating static pages \(33/33\)"
```

Attendu : au moins 1,5 Go libres, le dernier commit de la tâche 20, une ligne `added ... packages` sans `ERESOLVE`, `9 tailwindcss@4.3.3`, `✓ Compiled successfully` et `✓ Generating static pages (33/33)`.

- [ ] **Step 3: Supprimer le clone**

```bash
rm -rf "D:/Repos/macar-migration-tools/runs/step1-clean-clone"; df -h /d | tail -1
```

- [ ] **Step 4: Lockfile (binaires Linux pour Vercel) et paquets retirés**

```bash
cd "D:/Repos/macar-next-site-prod" && node -e 'const l=require("./package-lock.json");for(const k of ["@heroui/react","tailwindcss","@tailwindcss/postcss","tailwind-merge","@tailwindcss/oxide-linux-x64-gnu","lightningcss-linux-x64-gnu","autoprefixer","tailwindcss-animate","next-reveal","@radix-ui/react-icons"]){const p=l.packages["node_modules/"+k];console.log(k+" "+(p?p.version:"absent"))}'
```

Attendu, exactement :

```
@heroui/react 2.8.8
tailwindcss 4.3.3
@tailwindcss/postcss 4.3.3
tailwind-merge 3.7.0
@tailwindcss/oxide-linux-x64-gnu 4.3.3
lightningcss-linux-x64-gnu 1.32.0
autoprefixer absent
tailwindcss-animate absent
next-reveal absent
@radix-ui/react-icons absent
```

Aucun commit dans cette tâche (aucun fichier du dépôt ne change).

---

### Task 22: Vérification complète contre la référence (spec 8.1, 8.2, 8.3 Lighthouse)

**Files:**
- Create: `D:\Repos\macar-migration-tools\runs\step1\` (captures, rapports, `class-activity.txt`, `states.json`, `state-diff.txt`, `aria-diff.txt`, `html-diff.txt`, `behaviour-step1.txt`, `lighthouse.json`)

**Interfaces:**
- Consumes: le build de la tâche 21 (`.next` du dépôt), `baseline`, `ref-site/.next/static/css`, `ref-site/.next/server/app`, tous les outils de la partie 1 et `class-activity.mjs`.
- Produces: le critère de sortie de la spec 5.5 : zéro différence de capture, zéro différence de style calculé, aucune classe qui change d'état, aucune différence sous survol, appui et focus forcés, même arbre d'accessibilité, aucune erreur HTML nouvelle, minutages et comportements identiques, Lighthouse dans les seuils.

- [ ] **Step 1: Servir le build de l'étape 1**

Vérifier que le port est libre :

```powershell
"listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False` (sinon arrêter le serveur avec la commande de l'étape 8). Lancer en arrière-plan (outil Bash, `run_in_background: true`, `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-next-site-prod" && npx next start -p 3100
```

Puis, au premier plan, attendre le serveur et préchauffer le cache d'images de Next (pendant le prototypage, la toute première capture d'une image optimisée a différé une fois) :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/step1-warmup | tail -n 1 && rm -rf runs/step1-warmup
```

Attendu : `47 captures written to ..., 0 failure(s)`.

- [ ] **Step 2: Captures, comparaison au pixel et styles calculés**

```bash
cd "D:/Repos/macar-migration-tools" && rm -rf runs/step1 && node capture.mjs --base http://localhost:3100 --out runs/step1 | tail -n 1 && node compare.mjs --ref baseline --cur runs/step1 > runs/step1/compare.txt; echo "compare exit $?"; grep -E '^(identical|allowed differences only|failed):' runs/step1/compare.txt; node style-diff.mjs --ref baseline --cur runs/step1 > runs/step1/style-diff-out.txt; echo "style-diff exit $?"; sed -n 1p runs/step1/style-diff-out.txt
```

Attendu : `47 captures written to ...\runs\step1, 0 failure(s)`, puis `compare exit 0`, `identical: 47`, `allowed differences only: 0`, `failed: 0`, puis `style-diff exit 0` et `style differences: 0 element(s) in 0 class group(s)`. Aucun fichier `--allow` à l'étape 1 (spec 8.1 : zéro différence).

Si une capture échoue, ouvrir `runs/step1/diff/<nom>.png` et `runs/step1/style-diff.txt`, corriger, refaire le build (tâche 21, étape 1), relancer le serveur et cette étape. Ne jamais ajouter d'entrée d'autorisation pour l'étape 1.

**Repli (spec, section 3)** : si une différence vient du plugin `heroui()` lui-même (classe ou jeton généré ou manquant qu'aucun bloc de `globals.css` ne peut neutraliser, confirmé par `class-activity.mjs` à l'étape 4), s'arrêter et signaler le repli au propriétaire avant de continuer. Avec son accord : ne pas exécuter la tâche 23 (pas de PR 1) ; enchaîner les tâches 24 à 40 sur la même branche, en comparant toujours à `baseline` (référence de l'étape 0) ; à la tâche 41, sauter l'étape 1 (il n'y a pas de PR 1 à attendre) et ouvrir une seule PR vers `dev`, avec le titre « Move to Tailwind 4 and HeroUI v3 », dont le corps reprend les sections des descriptions des tâches 23 (étape 5) et 41 (étape 5).

- [ ] **Step 3: États forcés, arbre d'accessibilité et HTML prérendu (spec 8.2 et section 1)**

```bash
cd "D:/Repos/macar-migration-tools" && node state-diff.mjs --base http://localhost:3100 --out runs/step1 | tail -n 1 && node state-diff.mjs --ref baseline --cur runs/step1 | head -n 20; echo "state-diff exit ${PIPESTATUS[0]}"; node aria-diff.mjs --ref baseline --cur runs/step1 | head -n 20; echo "aria-diff exit ${PIPESTATUS[0]}"; node html-diff.mjs --ref-site ref-site --cur-site ../macar-next-site-prod --out runs/step1; echo "html-diff exit $?"
```

Attendu (mesure du relecteur sur le prototype `cfde316`) :

```
658 forced states written to ...\runs\step1\states.json, 0 failure(s)
state differences: 0
full report: ...\runs\step1\state-diff.txt
state-diff exit 0
aria differences: 0 unexpected, 0 expected
full report: ...\runs\step1\aria-diff.txt
aria-diff exit 0
pages: 28 reference, 28 current
HTML errors: 127 reference, 127 current
new HTML errors: 0
fixed HTML errors: 0
html-diff exit 0
```

`state-diff.mjs` couvre les classes à variante d'état que les captures ne montrent pas (`hover:underline`, `hover:border-accent1`, `group-hover:transform-[scale(1.05)]`, `focus-visible:ring-2`...). Une ligne `CHANGED` est un défaut au même titre qu'une capture qui diffère : corriger, refaire le build, recommencer depuis l'étape 2. Aucun `--allow` ni `--expect` à l'étape 1.

- [ ] **Step 4: Activation des classes (spec 8.2, classes internes HeroUI v2 comprises)**

```bash
cd "D:/Repos/macar-migration-tools" && node class-activity.mjs --ref-classes baseline/classes.json --cur-classes runs/step1/classes.json --ref-css ref-site/.next/static/css --cur-css "../macar-next-site-prod/.next/static/css" > runs/step1/class-activity.txt; echo "exit $?"; sed -n 1,2p runs/step1/class-activity.txt
```

Attendu : `activity changed: 0` et `exit 0`. Les lignes « only in the reference DOM » et « only in the current DOM » de `runs/step1/class-activity.txt` ne doivent contenir que les classes des cartes des tâches 13 à 20 (dans le prototype : 54 classes d'un côté, 58 de l'autre, dont `min-h-16 (no CSS)`, `min-h-8 (no CSS)` et `min-w-8 (no CSS)` côté référence) ; elles servent à la description de la PR.

- [ ] **Step 5: Minutages des animations**

```bash
cd "D:/Repos/macar-migration-tools" && node record.mjs --base http://localhost:3100 --out runs/step1/record --ref baseline/record/timings.json; echo "record exit $?"
```

Attendu : aucune ligne `OUT`, `record exit 0` (Tailwind ne touche ni à framer-motion ni à l'animation `navbar-menu-in`).

- [ ] **Step 6: Spécifications de comportement avec STEP=1**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=1 npx playwright test 2>&1 | tee runs/step1/behaviour-step1.txt | tail -n 3
```

Attendu : `1 skipped` (le vert de l'interrupteur, propre à l'étape 2) et `37 passed`, comme la référence avec `STEP=0`.

- [ ] **Step 7: Lighthouse (médiane de 5, seuils de 8.3)**

```bash
cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out runs/step1 --ref baseline/lighthouse.json; echo "lighthouse exit $?"
```

Attendu (environ 6 min) : quatre lignes `/ mobile`, `/ desktop`, `/services/renovation mobile`, `/services/renovation desktop` qui finissent par `OK vs ref (...)`, et `lighthouse exit 0` (accessibilité et CLS au moins égaux, performance à 3 points près). Le JavaScript ne change que par tailwind-merge 3 (la page d'accueil passe de 60,7 kB à 63,9 kB dans le tableau des routes de `next build`) ; si la performance mobile sort du seuil, relancer une fois la mesure. Sur la machine de l'assembleur, deux médianes de 5 de la référence elle-même ont donné 71 puis 67 sur `/services/renovation` mobile : si une ligne finit encore par `FAIL` **seulement sur la performance**, mesurer de nouveau la référence puis l'étape 1 dans la même session. Arrêter le serveur :

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Lancer en arrière-plan (outil Bash, `run_in_background: true`, `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-migration-tools/ref-site" && npx next start -p 3100
```

Puis :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out runs/lighthouse-ref-step1 2>&1 | grep -E "^/[a-z/]* (mobile|desktop):"
```

Arrêter ce serveur avec la même commande PowerShell, relancer le serveur du dépôt comme à l'étape 1 de cette tâche (sans le préchauffage), puis :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out runs/step1-lighthouse-again --ref runs/lighthouse-ref-step1/lighthouse.json 2>&1 | grep -E "^/[a-z/]* (mobile|desktop):"; echo "lighthouse exit ${PIPESTATUS[0]}"
```

Attendu : `lighthouse exit 0`. Le seuil n'est jamais élargi ; un échec qui persiste, ou un échec d'accessibilité ou de CLS, est soumis au propriétaire avec les deux rapports (`runs/step1/lighthouse.json`, `runs/step1-lighthouse-again/lighthouse.json`).

- [ ] **Step 8: Arrêter le serveur**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`.

Aucun commit dans cette tâche : `runs/` est ignoré par le dépôt des outils, et le dépôt du site n'a pas changé.

---

### Task 23: Publier la branche, faire valider la preview Vercel, ouvrir la PR vers dev

**Files:**
- Create: `D:\Repos\macar-migration-tools\runs\step1\pr-body.md`

**Interfaces:**
- Consumes: les commits des tâches 13 à 20, les résultats de la tâche 22.
- Produces: la PR « étape 1 » de la spec, de `heroui-v3-migration` vers `dev`, ouverte seulement après la validation visuelle de la preview par le propriétaire (spec 8.5).

- [ ] **Step 1: Relire l'historique de la branche**

```bash
cd "D:/Repos/macar-next-site-prod" && git log --oneline a37ed9e..HEAD && git status --porcelain | wc -l
```

Attendu, dans cet ordre (du plus récent au plus ancien), puis `0` :

```
<sha> Keep exact widths, gradient and focus outline under lightningcss
<sha> Replace opacity colours with their Tailwind 3 values
<sha> Pin the Tailwind 3 line heights of responsive text sizes
<sha> Keep the Tailwind 3 sibling selector for space and divide utilities
<sha> Drop min-size classes that Tailwind 3 never generated
<sha> Move Tailwind to v4 with HeroUI v2 kept
<sha> Update dependencies for Tailwind 4 and drop unused packages
<sha> Run the Tailwind 4 upgrade tool and keep the flex-shrink names
```

- [ ] **Step 2: Demander l'accord du propriétaire, puis pousser la branche**

Pousser publie la branche sur GitHub et déclenche un déploiement de preview Vercel : demander l'accord explicite du propriétaire avant de lancer :

```bash
cd "D:/Repos/macar-next-site-prod" && git push -u origin heroui-v3-migration
```

Attendu : `branch 'heroui-v3-migration' set up to track 'origin/heroui-v3-migration'`.

- [ ] **Step 3: Récupérer l'adresse de la preview**

```bash
cd "D:/Repos/macar-next-site-prod" && sleep 120; gh api "repos/macar-sa/macar-next-site-prod/commits/$(git rev-parse HEAD)/statuses" --jq '.[] | select(.context | test("Vercel")) | "\(.state) \(.target_url)"' | head -n 3
```

Attendu : une ligne `success https://vercel.com/...` (page du déploiement, qui donne l'adresse de la preview). Si la liste est vide ou en `pending`, relancer la commande deux minutes plus tard ; si elle reste vide, prendre l'adresse dans le tableau de bord Vercel du projet (onglet Deployments, branche `heroui-v3-migration`).

- [ ] **Step 4: Validation visuelle par le propriétaire**

Transmettre l'adresse au propriétaire avec la liste de contrôle de la spec 8.4 qui concerne l'étape 1, sur un vrai iPhone et un vrai Android :
- toutes les pages en desktop et en mobile, identiques au site actuel ;
- menu mobile : scroll bloqué, fermeture au clic sur un lien et sur le logo, à la rotation, focus rendu au bouton menu, `/#faq` défile jusqu'à la FAQ, menu au-dessus du bandeau cookies, pas de défilement horizontal à 320 px ;
- FAQ : une seule réponse ouverte par colonne, flèches, Début, Fin, Tab, Entrée ;
- bandeau cookies (après suppression du cookie `macar_cookie_consent_is_true`) : apparition, préférences, cases natives inchangées, « Essentiels » verrouillé ;
- avis : défilement automatique, pause au survol, « Voir plus » ;
- surbrillance au toucher des liens et des boutons, identique au site actuel (bloc `-webkit-tap-highlight-color`) ;
- animations des sections et des cartes, carrousel de logos, formulaire de contact (bordures, focus, placeholders), canevas blanc au rebond de défilement iOS.

Attendre la réponse écrite du propriétaire. Toute remarque est un défaut : la corriger, recommencer la tâche 22, pousser, puis revenir à l'étape 3.

- [ ] **Step 5: Écrire la description de la PR**

Contenu complet de `runs\step1\pr-body.md` (outil Write) :

```markdown
### Étape 1 de la migration HeroUI v3 : Tailwind 4, HeroUI v2 conservé

Passage de Tailwind 3.3.5 à Tailwind 4.3.3, sans aucun changement visuel. HeroUI reste en 2.8.8 ; son plugin Tailwind est chargé par `hero.ts` (temporaire, retiré à l'étape 2), sans `@source` vers `@heroui/theme`, comme en production : seuls ses jetons sont générés.

#### Dépendances

- `tailwindcss` et `@tailwindcss/postcss` en `~4.3.3`, `tailwind-merge` en `^3.7.0`.
- Retirés : `autoprefixer` (intégré à Tailwind 4), `tailwindcss-animate` (aucune classe `animate-*`), `next-reveal` (import mort), `@radix-ui/react-icons` (jamais importé).

#### Ce qui change dans le code, et pourquoi

- Renommages de l'outil officiel `@tailwindcss/upgrade` 4.3.3 (modificateur `!` en fin de classe, `rounded-sm`, `shadow-xs`, `backdrop-blur-xs`, `h-px`, `aspect-video`...). `flex-shrink-0` est gardé : HeroUI v2 pose aussi `shrink-0` sur ses éléments.
- `globals.css` : palette Tailwind 3 en hexadécimal, préflight Tailwind 3 (bordure, placeholder, curseur, police de `html`, surbrillance au toucher, padding des cellules), survol au toucher, listes de transitions, piles d'ombres et rayon `rounded-full` de Tailwind 3.
- `space-*` et `divide-*` deviennent `sibling:mt-*`, `sibling:border-t`... (variante qui reprend le sélecteur de Tailwind 3).
- Hauteurs de ligne Tailwind 3 explicites sur 12 lignes (`lg:leading-6`...), car Tailwind 4 fait passer `leading-*` avant `lg:text-*`.
- Couleurs avec opacité écrites avec leur valeur Tailwind 3 (`border-[rgb(115_115_115/0.3)]`...), car Tailwind 4 les mélange en oklab.
- Utilitaires `w-third`, `w-two-thirds`, `w-review-card`, `bg-fade-left` : lightningcss arrondissait ces valeurs.
- Classes mortes retirées : `min-h-16`, `min-w-8`, `min-h-8` (aucun CSS en Tailwind 3).

#### Vérifications

- 47 captures (15 pages, page 404 comprise, en 1280 et 390 px, menu, FAQ, cookies, focus clavier) identiques au pixel près à la référence `a37ed9e`.
- Styles calculés de tous les éléments visibles : 0 différence.
- Classes du DOM rendu, classes internes HeroUI v2 comprises : aucune ne gagne ni ne perd de CSS.
- Classes à variante d'état (`hover:`, `active:`, `focus-visible:`, `group-hover:`), sous survol, appui et focus forcés sur les 15 pages : 0 différence de style calculé.
- Arbre d'accessibilité (rôles, libellés, états, textes alternatifs) identique sur les 47 captures ; HTML prérendu des 28 pages : aucune erreur de validité nouvelle.
- Minutages du menu mobile et de la FAQ identiques ; 37 spécifications de comportement passées.
- Lighthouse (médiane de 5) dans les seuils de la spec.
- `npx tsc --noEmit`, `npm run build`, `npm ci` sur un clone propre sans `--force` ; une seule version de Tailwind ; binaires Linux d'oxide et de lightningcss dans le lockfile.
- Preview Vercel validée par le propriétaire.

#### CSS compilé par classe (spec 8.2)

Justification par classe : aucune classe présente dans le DOM des deux builds ne gagne ni ne perd de CSS (`activity changed: 0`), et les styles calculés sont identiques partout, au repos comme sous survol, appui et focus forcés. Les seules classes propres à un build sont les classes renommées ou retirées ci-dessus ; les listes complètes sont en fin de description.

#### Sans effet visuel, signalé pour mémoire

- Le CSS de `react-responsive-carousel` garde ses préfixes `-moz-`, `-ms-` et `-o-`, qu'autoprefixer retirait.
```

Ajouter ensuite les listes par classe et la ligne de fin :

```bash
cd "D:/Repos/macar-migration-tools" && { echo; echo "<details><summary>CSS compilé par classe : activité de chaque classe du DOM (class-activity.mjs)</summary>"; echo; echo '```'; cat runs/step1/class-activity.txt; echo '```'; echo; echo "</details>"; echo; echo "<details><summary>Classes à variante d'état sous survol, appui et focus forcés (state-diff.mjs)</summary>"; echo; echo '```'; cat runs/step1/state-diff.txt; echo '```'; echo; echo "</details>"; echo; echo "🤖 Generated with [Claude Code](https://claude.com/claude-code)"; } >> runs/step1/pr-body.md && grep -c "^<details>" runs/step1/pr-body.md && tail -n 3 runs/step1/pr-body.md
```

Attendu : `2`, puis `</details>`, une ligne vide et `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

- [ ] **Step 6: Ouvrir la PR vers dev**

```bash
cd "D:/Repos/macar-next-site-prod" && gh pr create --base dev --head heroui-v3-migration --title "Move Tailwind to v4 with HeroUI v2 kept" --body-file "../macar-migration-tools/runs/step1/pr-body.md"
```

Attendu : l'adresse de la PR, `https://github.com/macar-sa/macar-next-site-prod/pull/<n>`. La PR n'est mergée qu'après la validation de sa preview par le propriétaire (déjà obtenue à l'étape 4 ; si des commits ont été ajoutés depuis, la redemander), et par un commit de fusion (« Create a merge commit ») : l'étape 2 continue sur la même branche, et sa PR (tâche 41) ne doit contenir que ses propres commits.

## Partie 3 : étape 2, fondation HeroUI v3 (dépendances, CSS, provider)

Cette partie couvre les sections 6.1, 6.2 et 6.3 de la spec : passage des paquets en HeroUI 3.2.6, `globals.css` final, `providers.tsx`, et correction des classes dont le CSS change avec HeroUI v3 (composants shadcn compris). Elle travaille dans le dépôt `D:\Repos\macar-next-site-prod`, branche `heroui-v3-migration`, à l'état final de l'étape 1 (partie 2), avec les outils du dossier `D:\Repos\macar-migration-tools` (parties 1 et 2).

**Commandes** : les commandes `bash` se lancent dans l'outil Bash (Git Bash), les commandes `powershell` dans l'outil PowerShell. Les chemins contiennent une espace : ils sont toujours entre guillemets. Les fichiers dont le contenu complet est donné s'écrivent avec l'outil Write (pas de heredoc : l'outil Bash altère les barres obliques inverses des heredocs). Les heredocs ne servent qu'aux messages de commit.

**Fichier suivi modifié par le typage** : `tsconfig.tsbuildinfo` est versionné et `npx tsc --noEmit` le réécrit. Chaque commande `tsc` de cette partie est suivie de `git restore tsconfig.tsbuildinfo`.

### Ordre des commits de l'étape 2 (décision)

Dès que `@heroui/react` passe en 3.2.6, les six imports HeroUI v2 du site (`providers.tsx`, `navbar.tsx`, `HomeView.tsx`, `CookieConsent.tsx`, `ServiceSection.tsx`, `GoogleReviews.tsx`) ne compilent plus : la v3 n'exporte ni `HeroUIProvider`, ni `Navbar*`, ni `CardBody`, et ses composants n'acceptent plus les props v2. Le paquet ayant le même nom en v2 et en v3, aucune tâche ne peut basculer une partie du site seulement (la cohabitation par alias de paquets est une stratégie écartée par la spec, section 11). La Navbar ne peut pas non plus passer avant : ses couleurs dépendent des variables renommées ici.

**Décision : un seul commit de bascule.** Les tâches 25 à 28 de cette partie, puis les tâches des parties 4 (composants : Accordion, Switch, Chip, Card et Avatar) et 5 (Navbar), modifient l'arbre de travail **sans committer**. La tâche 37 vient après toutes ces tâches : elle vérifie que tout compile (typage, build, contrôles 8.3) et fait le commit unique. Chaque commit de la branche compile donc. Les corrections trouvées ensuite par la vérification complète de l'étape 2 (captures, styles, comportements) font des commits séparés, qui compilent eux aussi.

Pendant les tâches sans commit, le build Next ne peut pas tourner. Cette partie vérifie donc chaque étape autrement :
- le CSS est compilé seul (`css-compile.mjs`, avec le `postcss` et le `@tailwindcss/postcss` du dépôt) et comparé classe par classe au CSS de l'étape 1 compilé de la même façon (`class-css-diff.mjs`) ;
- `npx tsc --noEmit` doit signaler des erreurs **seulement** dans les fichiers qui importent encore des composants v2, avec une liste exacte à chaque tâche.

Seule la tâche 24 committe, dans le dépôt des outils.

### Résultats du prototype (à lire avant de commencer)

Le prototype a été mené dans un clone jetable de l'état final de l'étape 1 (`...\scratchpad\proto\step2-foundation`, branche `proto`). Le commit `7f1cf05` contient exactement l'état produit par les tâches 25 à 28 (vérifié : rejouer les cartes et les éditions des tâches sur les sources de l'étape 1 redonne des sources identiques, au commentaire près). Le commit suivant (`17e9f71`, « PROTOTYPE STUB ONLY ») réinstalle HeroUI v2 sous l'alias npm `heroui-v2` et y pointe les cinq imports v2 : c'est un **bouchon de prototype**, qui n'a pas sa place dans le plan, mais qui a permis de construire le site avec la fondation v3 et les composants v2 encore en place, et donc de mesurer l'effet de la seule fondation.

Résultats, contre un build de l'étape 1 (même machine, même port) :

| Mesure | Résultat |
|---|---|
| `npm install` direct de `@heroui/react@3.2.6` | `ERESOLVE` : `react-aria@3.48.0`, amené par les sous-paquets de la v2, entre en conflit avec le pair `react-aria@^3.52.1`. Parade : `npm uninstall @heroui/react` d'abord (tâche 25) |
| Lockfile après la tâche 25 | `@heroui/react 3.2.6`, `@heroui/styles 3.2.6`, `react-aria 3.52.1`, `react-aria-components 1.21.1`, une seule copie de `tailwindcss` (4.3.3), binaires Linux d'oxide et de lightningcss présents, `@heroui/theme` absent ; `npm ci --dry-run` sans `ERESOLVE` |
| Captures du harnais (`capture.mjs`, `compare.mjs`, `style-diff.mjs` de la partie 1, 45 captures, avant l'ajout de la page 404) | **45 identiques au pixel près, 0 différence de style calculé** |
| Tous les styles calculés (477 propriétés, `::before`, `::after`, `::marker`, `::placeholder`), 7 pages en 1280 et 390 px | une seule différence : `view-transition-name` de `html` passe de `root` à `none` (règle de base de `@heroui/styles`), sans effet : le site ne lance aucune transition de vue |
| JavaScript | inchangé : `/about` reste à 151 kB de premier chargement, le `I18nProvider` n'ajoute rien de mesurable (`@heroui/react` est déclaré sans effets de bord) |
| Routes | toutes statiques (`○` ou `●`), aucune route `ƒ` : la locale fixe n'utilise pas `headers()` |
| CSS compilé | 41 Ko (8 Ko gzip) à l'étape 1, 455 Ko (44 Ko gzip) avec `@import "@heroui/styles"` : tout le CSS des composants HeroUI est livré (voir les risques) |

Défauts trouvés par le prototype, tous corrigés par cette partie :

1. **Collision de nom `.slider`.** `@heroui/styles` stylise la classe `.slider` (composant Slider v3), qui est aussi le nom de la piste de `react-responsive-carousel` (bandeau de logos). Le `gap: var(--spacing)` de HeroUI écartait les logos de 4 px ; la largeur minimale du bandeau élargissait la grille du haut de l'accueil, si bien qu'en 390 px le titre passait de 4 à 3 lignes (page plus courte de 45 px) et débordait de l'écran. Parade : la règle `.carousel .slider` de `globals.css` (tâche 26), et l'outil `layer-collisions.mjs` qui cherche ces collisions (aucune autre parmi les 543 classes du DOM de l'étape 1).
2. **Classe morte activée par le thème v3.** `ease-in-out-quad` (7 occurrences dans `buttons.tsx` et `footer.tsx`) ne produisait aucun CSS ; le thème de `@heroui/styles` définit `--ease-in-out-quad`, et la classe changerait la courbe des transitions au survol. Elle est retirée (tâche 28).
3. **Composants shadcn.** Seules `hover:bg-accent` et `hover:text-accent-foreground` (variantes `outline` et `ghost` de `ui/button.tsx`) s'activent : `--accent` devient la couleur de la marque. Elles ne produisaient rien et sont retirées (tâche 28). Les autres classes shadcn (`text-muted-foreground`, `border-input`, `bg-card`, `text-card-foreground`, `bg-destructive`...) ne produisent de CSS ni à l'étape 1 ni à l'étape 2 (la v3 n'a pas ces jetons) : elles ne changent pas.
4. **Classes qui lisaient les variables du plugin v2.** Les 16 occurrences de classes en `hsl(var(--heroui-*)/...)` écrites à l'étape 1 (couleurs avec opacité) perdraient leur couleur avec `hero.ts`. Elles lisent désormais les variables `--v2-*` du bloc de compatibilité (tâche 28).
5. **Le `div data-overlay-container` de `HeroUIProvider` disparaît** du DOM (`body > div > main` devient `body > main`). Sans effet de rendu : `style-diff.mjs` a apparié les éléments malgré ce changement de chemin (0 différence).

### Écarts par rapport à la spec

Numérotation locale à cette partie ; dans le reste du plan, ces écarts sont cités par leur numéro global (liste en tête du plan).

1. **6.2, « les 58 classes rendent à l'identique sans modification »** : vrai pour les classes sans opacité, que le bloc `@theme` de compatibilité sert telles quelles. Les classes avec opacité ont été réécrites à l'étape 1 en `hsl(var(--heroui-*)/a)` (une classe Tailwind 4 `bg-primary/10` passe par `color-mix(in oklab)` et change les pixels, mesuré à l'étape 1) ; elles sont renommées en `hsl(var(--v2-*)/a)` (16 occurrences dans 6 fichiers, carte `step2-v2-variables.json`).
2. **6.2, bloc de compatibilité** : les canaux HSL de la v2 sont des variables `--v2-*` déclarées dans le même `@theme` (`inline static`), et les couleurs `--color-*` les lisent par `hsl(var(...))`, comme le faisait le plugin v2. lightningcss arrondit `201.81999999999994` en `201.82` et `212.01999999999998` en `212.02` : les valeurs sont donc écrites ainsi, comme dans la spec (couleurs calculées identiques, mesuré).
3. **6.2, bloc `:root`** : `background-color: hsl(var(--v2-background))` et `color: hsl(var(--v2-foreground))`, au lieu de `#FFFFFF` et `hsl(201.82 24.44% 8.82%)` : mêmes valeurs calculées, une seule source pour les couleurs v2.
4. **6.2, blocs ajoutés** : entre le bloc 4 et le bloc 5, `globals.css` garde les blocs de l'étape 1 (`@custom-variant`, `@utility`, `@layer base`) et ajoute la remise à zéro `.carousel .slider` (défaut 1 ci-dessus). Le `@layer base` de l'étape 1, placé après `@import "@heroui/styles"`, l'emporte aussi sur la règle `border-color: var(--border)` de la base HeroUI.
5. **6.2, composants shadcn** : la spec cite `text-muted-foreground` et `border-input` parmi les classes qui s'activeraient ; c'est faux en 3.2.6 (aucun jeton `muted-foreground` ni `input`). Seules `hover:bg-accent` et `hover:text-accent-foreground` changent (défaut 3).
6. **Hors spec** : retrait de `ease-in-out-quad` (défaut 2) et remise à zéro `.carousel .slider` (défaut 1), en application de la règle de 6.2 (« toute classe dont le CSS compilé change est corrigée »).
7. **6.1** : l'installation doit commencer par `npm uninstall @heroui/react` (sinon `ERESOLVE`). npm ajoute aussi au lockfile `@adobe/react-spectrum` (via `@react-types/color`, dépendance de `@heroui/react`) : jamais importé, sans effet sur les bundles.
8. **5.3 (reporté de l'étape 1)** : le renommage `flex-shrink-0` vers `shrink-0` se fait ici pour 5 occurrences hors de `GoogleReviews.tsx` (carte `step2-shrink.json`). Les 5 de `GoogleReviews.tsx` sont sur les lignes que la tâche 33 réécrit : elle doit écrire `shrink-0`, et la tâche 37 le contrôle.
9. **Ordre des commits** : un seul commit de bascule (section ci-dessus).

### Ce que les parties suivantes doivent savoir (produit par cette partie)

- **État des fichiers après la tâche 28**, point de départ des tâches 30 à 33, 35 et 36 :
  - `navbar.tsx` contient `border-[hsl(var(--v2-default-200)/0.5)]` (2 fois) : la Navbar reconstruite doit utiliser cette classe pour la bordure `border-default-200/50` de la barre et du panneau.
  - `ServiceSection.tsx` : la classe du chip est `bg-[hsl(var(--v2-primary)/0.1)]` (dans `classNames.base`), la liste a `marker:text-[hsl(var(--v2-primary)/0.7)]`, l'image a `shrink-0`.
  - `GoogleReviews.tsx` n'est pas touché : ses 5 `flex-shrink-0` doivent devenir `shrink-0` dans la tâche 33.
  - `HomeView.tsx` : seul `md:flex-shrink-0` (ligne 95, hors FAQ) devient `md:shrink-0`.
  - Aucune classe du site ne doit plus lire `--heroui-*` (contrôlé par la tâche 37).
- **Couleurs disponibles** : `text-foreground` (#11181C, foreground v2), `bg-primary`, `text-primary`, `text-primary-foreground`, `bg-secondary`, `text-secondary-foreground`, `bg-default-50` à `bg-default-700` (et `text-`, `border-`), `bg-background` (#F6F8FF). Pour une opacité, écrire `bg-[hsl(var(--v2-primary)/0.1)]`, jamais `bg-primary/10`.
- **Effets du bloc de compatibilité sur `@heroui/styles`** : le CSS des composants HeroUI utilise `@apply text-foreground` (par exemple `.switch__content`, `.card__title`, `.surface`, `.label`) ; ces règles prennent donc le foreground v2 (`hsl(var(--v2-foreground))`), pas le `--foreground` v3. Le `@utility transition-transform` de l'étape 1 ne transitionne que `transform`, aussi dans les `@apply` de HeroUI. Les règles de survol de HeroUI sont écrites en `@media (hover: hover)` dans son propre CSS : le `@custom-variant hover` du site ne les change pas.
- **Variables v3 surchargées hors couche** (`:root`) : `--background: #F6F8FF`, `--border: #e5e7eb`, `--accent: #124FAA`. Les autres variables v3 (`--foreground`, `--muted`, `--focus`, `--surface`, `--default`...) gardent leur valeur v3.
- **Provider** : `src/app/providers.tsx` exporte toujours `Providers` ; il enveloppe le site dans `I18nProvider` (`@heroui/react`, réexport de `react-aria-components`) avec `locale="fr-BE"`. `layout.tsx` ne change pas.
- **Outils** (dossier des outils) : `css-compile.mjs`, `class-css-diff.mjs`, `layer-collisions.mjs`, `step2-static-checks.mjs`, cartes `maps\step2-*.json`, et `runs\step2-css\before\globals.css` (CSS de l'étape 1 compilé seul). `layer-collisions.mjs --known slider --known carousel` doit rester à 0 après chaque ajout de classe.
- **Chemins DOM** : le `div` de `HeroUIProvider` disparaît entre `body` et `main` ; les clés DOM des captures changent en conséquence.

### Risque signalé : poids du CSS et Lighthouse

`@import "@heroui/styles"` (spec 6.2) livre le CSS de tous les composants HeroUI : la feuille bloquante passe de 8 Ko à 44 Ko compressés (gzip). La mesure Lighthouse du prototype n'a pas permis de conclure (machine chargée par d'autres builds, médianes de la référence incohérentes d'une exécution à l'autre). Si la vérification de l'étape 2 trouve une performance hors du seuil de 3 points (spec 8.3), la parade est d'importer seulement les parties utilisées, à la place de la ligne `@import "@heroui/styles";` :

```css
@import "tw-animate-css";
@import "@heroui/styles/base" layer(base);
@import "@heroui/styles/themes/default" layer(theme);
@import "@heroui/styles/components/accordion.css" layer(components);
@import "@heroui/styles/components/avatar.css" layer(components);
@import "@heroui/styles/components/card.css" layer(components);
@import "@heroui/styles/components/chip.css" layer(components);
@import "@heroui/styles/components/switch.css" layer(components);
@import "@heroui/styles/utilities";
@import "@heroui/styles/variants";
```

Ces chemins sont des exports déclarés de `@heroui/styles` 3.2.6 (`./base`, `./themes/default`, `./components/*.css`, `./utilities`, `./variants`). Le prototype a compilé cette variante (91 Ko, 13 Ko compressés) mais ne l'a pas vérifiée visuellement : elle s'écarte de la spec 6.2 et devrait être soumise au propriétaire, puis vérifiée par la comparaison complète (un composant peut dépendre du CSS d'un autre, par exemple `label.css`). Elle supprimerait aussi la collision `.slider`.

---

### Task 24: Outils de la fondation de l'étape 2

**Files:**
- Create: `D:\Repos\macar-migration-tools\css-compile.mjs`
- Create: `D:\Repos\macar-migration-tools\class-css-diff.mjs`
- Create: `D:\Repos\macar-migration-tools\layer-collisions.mjs`
- Create: `D:\Repos\macar-migration-tools\step2-static-checks.mjs`
- Create: `D:\Repos\macar-migration-tools\maps\step2-v2-variables.json`
- Create: `D:\Repos\macar-migration-tools\maps\step2-dead-classes.json`
- Create: `D:\Repos\macar-migration-tools\maps\step2-shrink.json`
- Create (ignoré par git, dossier `runs`) : `D:\Repos\macar-migration-tools\runs\step2-css\before\globals.css`

**Interfaces:**
- Consumes: le dépôt à l'état final de l'étape 1 (HeroUI 2.8.8 installé, `hero.ts` présent, arbre propre) ; `replace-classes.mjs` et `css-rules.mjs` (partie 2, tâche 12) ; `runs\step1\classes.json` (partie 2, tâche 22).
- Produces:
  - `node css-compile.mjs --repo <dépôt> --out <dossier> [--input src/app/globals.css]` : compile la feuille du site avec le `postcss` et le `@tailwindcss/postcss` du dépôt, optimisée et minifiée, sans Next ; écrit `<dossier>/globals.css`.
  - `node class-css-diff.mjs --ref-css <dossier> --cur-css <dossier> [--classes <classes.json>]` : forme « par contenu » de la spec 8.2 ; pour chaque classe des utilitaires (ou d'une règle hors couche), compare les règles compilées ; affiche `CHANGED`, `NEW CSS` ou `NO CSS ANY MORE` ; code 1 s'il y a une différence.
  - `node layer-collisions.mjs --css <dossier> --classes <classes.json> [--known <classe>]...` : classes du DOM rendu stylées par une règle des couches `components` ou `base` (collisions avec les noms de classes de HeroUI v3) ; code 1 si une collision n'est pas déclarée `--known`.
  - `node step2-static-checks.mjs --repo <dépôt>` : les contrôles de source de la spec 8.3 « après l'étape 2 » ; code 1 si un contrôle échoue.
  - `runs\step2-css\before\globals.css` : le CSS de l'étape 1 compilé par `css-compile.mjs`, référence des tâches 26 et 28.

- [ ] **Step 1: Vérifier les préalables**

```bash
cd "D:/Repos/macar-next-site-prod" && git branch --show-current && git status --porcelain | wc -l && git log --oneline -1 && node -p 'require("./node_modules/@heroui/react/package.json").version' && ls hero.ts && cd "../macar-migration-tools" && ls replace-classes.mjs css-rules.mjs runs/step1/classes.json && df -h /d | tail -1
```

Attendu : `heroui-v3-migration`, `0`, le dernier commit de l'étape 1 (`Keep exact widths, gradient and focus outline under lightningcss`, ou un commit de fusion de `dev` si la PR de l'étape 1 a été mergée entre-temps), `2.8.8`, `hero.ts`, les trois fichiers d'outils, et au moins 3 Go libres (le build de la tâche 37 et ses caches en demandent environ 1 Go ; pendant le prototypage, le disque est tombé à 0 octet et un build a échoué en `ENOSPC`).

- [ ] **Step 2: Créer `css-compile.mjs`**

Contenu complet :

```js
// node css-compile.mjs --repo <repo dir> --out <dir> [--input <css file relative to the repo>]
// Compiles the site stylesheet with the repo's own postcss and @tailwindcss/postcss (optimised and
// minified as in a production build), without Next. Used while the build cannot run yet (step 2,
// before the HeroUI v3 components are migrated). Writes <out>/globals.css.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i < 0 ? undefined : argv[i + 1]; };
const repo = path.resolve(opt("repo") || ".");
const out = opt("out");
const input = path.join(repo, opt("input") || "src/app/globals.css");
if (!out) {
  console.error("usage: node css-compile.mjs --repo <repo dir> --out <dir> [--input src/app/globals.css]");
  process.exit(2);
}
const require = createRequire(path.join(repo, "package.json"));
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");

const css = fs.readFileSync(input, "utf8");
const result = await postcss([tailwind({ base: repo, optimize: { minify: true } })]).process(css, { from: input });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "globals.css"), result.css);
console.log(`compiled ${path.relative(repo, input)}: ${result.css.length} bytes -> ${path.join(out, "globals.css")}`);
```

- [ ] **Step 3: Compiler le CSS de l'étape 1 (référence des tâches suivantes)**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/before
```

Attendu : `compiled src\app\globals.css: 41976 bytes -> runs\step2-css\before\globals.css` (environ 42 000 octets). Node peut afficher avant un avertissement `MODULE_TYPELESS_PACKAGE_JSON` sur `hero.ts` : il est sans effet. Ce CSS n'est pas identique octet pour octet à celui de `next build` (Next minifie avec ses propres réglages) : il sert seulement de référence aux compilations faites par le même outil.

- [ ] **Step 4: Créer `class-css-diff.mjs` et le vérifier sur la référence elle-même**

Contenu complet :

```js
// node class-css-diff.mjs --ref-css <dir> --cur-css <dir> [--classes <classes.json>]...
// Spec 8.2, by content: for every class used in a selector of the utilities layer (or of an
// unlayered rule) in either build, compares the compiled rules that mention the class
// (at-rule path + selector + declarations). Prints the classes whose CSS differs, appears or
// disappears. With --classes (a JSON array, or the { all } object of capture.mjs), only
// those classes are compared. Exit 0 only if no class differs.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i < 0 ? undefined : argv[i + 1]; };
const all = (k) => argv.flatMap((v, i) => (v === `--${k}` ? [argv[i + 1]] : []));
const refDir = opt("ref-css"), curDir = opt("cur-css");
if (!refDir || !curDir) {
  console.error("usage: node class-css-diff.mjs --ref-css <dir> --cur-css <dir> [--classes <classes.json>]...");
  process.exit(2);
}

const unesc = (s) => s.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, "$1");

// Map class -> sorted list of "path >> selector { declarations }" for utility and unlayered rules.
function rulesByClass(dir) {
  const map = new Map();
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".css")).sort()) {
    const css = fs.readFileSync(path.join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const stack = [];
    let buf = "";
    for (const ch of css) {
      if (ch === "{") { stack.push(buf.trim()); buf = ""; }
      else if (ch === "}") {
        const body = buf.trim();
        const sel = stack[stack.length - 1] || "";
        const outer = stack.slice(0, -1);
        const layers = outer.filter((s) => s.startsWith("@layer"));
        const counted = layers.length === 0 || layers.every((s) => s === "@layer utilities");
        if (body && !sel.startsWith("@") && counted) {
          const re = /\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[a-zA-Z0-9_-])+)/g;
          let m;
          const rule = `${outer.join(" >> ")}${outer.length ? " >> " : ""}${sel} { ${body} }`;
          while ((m = re.exec(sel))) {
            const c = unesc(m[1]);
            if (!map.has(c)) map.set(c, []);
            map.get(c).push(rule);
          }
        }
        stack.pop();
        buf = "";
      } else if (ch === ";" && stack.length === 0) buf = "";
      else buf += ch;
    }
  }
  for (const v of map.values()) v.sort();
  return map;
}

const ref = rulesByClass(refDir);
const cur = rulesByClass(curDir);
let only = null;
for (const f of all("classes")) {
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  only ??= new Set();
  for (const c of Array.isArray(j) ? j : j.all) only.add(c);
}
const names = [...new Set([...ref.keys(), ...cur.keys()])].filter((c) => !only || only.has(c)).sort();
let diffs = 0;
for (const c of names) {
  const a = ref.get(c) || [], b = cur.get(c) || [];
  if (a.join("\n") === b.join("\n")) continue;
  diffs++;
  const state = !a.length ? "NEW CSS" : !b.length ? "NO CSS ANY MORE" : "CHANGED";
  console.log(`${state}: ${c}`);
  for (const r of a.filter((r) => !b.includes(r))) console.log(`  - ${r}`);
  for (const r of b.filter((r) => !a.includes(r))) console.log(`  + ${r}`);
}
console.log(`classes compared: ${names.length}, with a CSS difference: ${diffs}`);
process.exit(diffs ? 1 : 0);
```

Puis :

```bash
cd "D:/Repos/macar-migration-tools" && node class-css-diff.mjs --ref-css runs/step2-css/before --cur-css runs/step2-css/before; echo "exit $?"
```

Attendu : `classes compared: 438, with a CSS difference: 0` et `exit 0` (le nombre de classes peut varier de quelques unités ; la différence doit être 0).

- [ ] **Step 5: Créer `layer-collisions.mjs` et le lancer sur l'étape 1**

Contenu complet :

```js
// node layer-collisions.mjs --css <dir> --classes <classes.json> [--known <class>]...
// Name collisions between the HeroUI v3 stylesheet and the rendered site: lists every class of the
// rendered DOM (classes.json of capture.mjs, or a plain JSON array) that a rule of the "components"
// or "base" cascade layer styles. HeroUI v3 styles its components with plain class names (.slider,
// .card, .chip...), so a site or third-party element carrying the same class name picks up HeroUI
// styles. Exit 1 if a colliding class is not listed with --known (a collision already neutralised).
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i < 0 ? undefined : argv[i + 1]; };
const known = new Set(argv.flatMap((v, i) => (v === "--known" ? [argv[i + 1]] : [])));
const dir = opt("css"), classesFile = opt("classes");
if (!dir || !classesFile) {
  console.error("usage: node layer-collisions.mjs --css <dir> --classes <classes.json> [--known <class>]...");
  process.exit(2);
}
const j = JSON.parse(fs.readFileSync(classesFile, "utf8"));
const dom = new Set(Array.isArray(j) ? j : j.all);
const LAYERS = ["@layer components", "@layer base"];
const unesc = (s) => s.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, "$1");

const hits = new Map();
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".css")).sort()) {
  const css = fs.readFileSync(path.join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const stack = [];
  let buf = "";
  for (const ch of css) {
    if (ch === "{") {
      const sel = buf.trim();
      if (!sel.startsWith("@") && stack.some((s) => LAYERS.includes(s))) {
        const re = /\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[a-zA-Z0-9_-])+)/g;
        let m;
        while ((m = re.exec(sel))) {
          const c = unesc(m[1]);
          if (!dom.has(c)) continue;
          if (!hits.has(c)) hits.set(c, new Set());
          hits.get(c).add(sel.length > 120 ? sel.slice(0, 120) + "..." : sel);
        }
      }
      stack.push(sel);
      buf = "";
    } else if (ch === "}") { stack.pop(); buf = ""; }
    else if (ch === ";") buf = "";
    else buf += ch;
  }
}
let unknown = 0;
for (const [c, sels] of [...hits].sort()) {
  const tag = known.has(c) ? "known" : "NEW";
  if (!known.has(c)) unknown++;
  console.log(`${tag} ${c}: ${sels.size} selector(s), e.g. ${[...sels].slice(0, 3).join(" | ")}`);
}
console.log(`DOM classes styled in the components or base layer: ${hits.size}, not neutralised: ${unknown}`);
process.exit(unknown ? 1 : 0);
```

Puis :

```bash
cd "D:/Repos/macar-migration-tools" && node layer-collisions.mjs --css runs/step2-css/before --classes runs/step1/classes.json; echo "exit $?"
```

Attendu : `DOM classes styled in the components or base layer: 0, not neutralised: 0` et `exit 0` (Tailwind 4 seul ne stylise aucune classe du site dans ces couches).

- [ ] **Step 6: Créer `step2-static-checks.mjs` et le lancer sur l'étape 1 (il doit échouer)**

Contenu complet :

```js
// node step2-static-checks.mjs --repo <repo dir>
// Spec 8.3, "after step 2": source checks of the HeroUI v3 migration. Prints one line per check
// (ok / FAIL with the offending places). Exit 1 if any check fails.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const i = argv.indexOf("--repo");
const repo = path.resolve(i < 0 ? "." : argv[i + 1]);

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|css)$/.test(e.name)) files.push(p);
  }
};
walk(path.join(repo, "src"));
const read = (f) => fs.readFileSync(f, "utf8");
const rel = (f) => path.relative(repo, f).split(path.sep).join("/");

// Names that may be imported from @heroui/react once step 2 is done (compound components only).
const ALLOWED = new Set(["Accordion", "Avatar", "Card", "Chip", "I18nProvider", "Switch"]);

const results = [];
const check = (name, offenders) => results.push({ name, offenders });

check("hero.ts removed", fs.existsSync(path.join(repo, "hero.ts")) ? ["hero.ts"] : []);

const imported = [];
for (const f of files) {
  for (const m of read(f).matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']@heroui\/react["']/g)) {
    for (const n of m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
      if (!ALLOWED.has(n)) imported.push(`${rel(f)}: ${n}`);
    }
  }
}
check(`only ${[...ALLOWED].join(", ")} imported from @heroui/react`, imported);

const patterns = [
  ["no v2 prop classNames=", /\bclassNames=/],
  ["no v2 prop imgProps=", /\bimgProps=/],
  ["no v2 title= on an accordion item", /<Accordion(?:\.Item|Item)\b[^>]*\btitle=/s],
  ["no AccordionItem, CardHeader, CardBody, CardFooter element", /<(AccordionItem|CardHeader|CardBody|CardFooter)\b/],
  ["no heroui() plugin", /\bheroui\(/],
  ["no @heroui/theme", /@heroui\/theme/],
  ["no v2 plugin variable --heroui-*", /--heroui-/],
  ["no flex-shrink-* (renamed shrink-*)", /\bflex-shrink-/],
];
for (const [name, re] of patterns) {
  const offenders = [];
  for (const f of files) {
    const text = read(f);
    if (re.flags.includes("s")) {
      // Multi-line pattern (a JSX element spread over several lines): report the file.
      if (re.test(text)) offenders.push(rel(f));
    } else {
      text.split(/\r?\n/).forEach((line, n) => { if (re.test(line)) offenders.push(`${rel(f)}:${n + 1}`); });
    }
  }
  check(name, offenders);
}

let failed = 0;
for (const r of results) {
  if (r.offenders.length) failed++;
  console.log(`${r.offenders.length ? "FAIL" : "ok  "} ${r.name}${r.offenders.length ? `: ${r.offenders.slice(0, 8).join(", ")}${r.offenders.length > 8 ? ", ..." : ""}` : ""}`);
}
console.log(`${results.length} checks, ${failed} failed`);
process.exit(failed ? 1 : 0);
```

Puis :

```bash
cd "D:/Repos/macar-migration-tools" && node step2-static-checks.mjs --repo "../macar-next-site-prod"; echo "exit $?"
```

Attendu (contrôle négatif : l'outil détecte bien l'état v2) : `FAIL hero.ts removed`, `FAIL only Accordion, Avatar, Card, Chip, I18nProvider, Switch imported from @heroui/react: src/app/providers.tsx: HeroUIProvider, src/app/_components/HomeView.tsx: AccordionItem, src/app/_components/navbar.tsx: Navbar, ...`, des lignes `FAIL` pour `classNames=` (`HomeView.tsx:276`, `HomeView.tsx:291`, `navbar.tsx:74`, `ServiceSection.tsx:44`), `imgProps=` (`GoogleReviews.tsx:38`), `title=` (`HomeView.tsx`), les éléments `AccordionItem`/`CardHeader`/`CardBody`, `@heroui/theme` (le commentaire de `globals.css:3`), `--heroui-*` et `flex-shrink-*` ; seule la ligne `ok   no heroui() plugin` passe (`hero.ts` est hors de `src`). Dernière ligne : `10 checks, 9 failed`, puis `exit 1`.

- [ ] **Step 7: Créer les trois cartes de remplacement**

Contenu complet de `maps\step2-v2-variables.json` :

```json
[
  { "file": "src/app/_components/navbar.tsx", "from": "border-[hsl(var(--heroui-default-200)/0.5)]", "to": "border-[hsl(var(--v2-default-200)/0.5)]", "count": 2 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "bg-[hsl(var(--heroui-primary)/0.1)]", "to": "bg-[hsl(var(--v2-primary)/0.1)]", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "marker:text-[hsl(var(--heroui-primary)/0.7)]", "to": "marker:text-[hsl(var(--v2-primary)/0.7)]", "count": 1 },
  { "file": "src/app/_components/ServiceDetailBody.tsx", "from": "bg-[hsl(var(--heroui-default-50)/0.5)]", "to": "bg-[hsl(var(--v2-default-50)/0.5)]", "count": 2 },
  { "file": "src/app/_components/ServiceDetailBody.tsx", "from": "hover:bg-[hsl(var(--heroui-primary)/0.05)]", "to": "hover:bg-[hsl(var(--v2-primary)/0.05)]", "count": 2 },
  { "file": "src/app/services/page.tsx", "from": "bg-[hsl(var(--heroui-default-50)/0.5)]", "to": "bg-[hsl(var(--v2-default-50)/0.5)]", "count": 1 },
  { "file": "src/app/services/page.tsx", "from": "hover:bg-[hsl(var(--heroui-primary)/0.05)]", "to": "hover:bg-[hsl(var(--v2-primary)/0.05)]", "count": 1 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "bg-[hsl(var(--heroui-default-50)/0.5)]", "to": "bg-[hsl(var(--v2-default-50)/0.5)]", "count": 2 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "hover:bg-[hsl(var(--heroui-primary)/0.05)]", "to": "hover:bg-[hsl(var(--v2-primary)/0.05)]", "count": 2 },
  { "file": "src/components/ui/button.tsx", "from": "hover:bg-[hsl(var(--heroui-primary)/0.9)]", "to": "hover:bg-[hsl(var(--v2-primary)/0.9)]", "count": 1 },
  { "file": "src/components/ui/button.tsx", "from": "hover:bg-[hsl(var(--heroui-secondary)/0.8)]", "to": "hover:bg-[hsl(var(--v2-secondary)/0.8)]", "count": 1 }
]
```

Contenu complet de `maps\step2-dead-classes.json` (les deux classes de `ui/button.tsx` sont retirées par l'outil Edit à la tâche 28, car leurs deux occurrences se chevauchent pour le compteur de `replace-classes.mjs --check`) :

```json
[
  { "file": "src/app/_components/buttons.tsx", "from": "transition-all ease-in-out-quad", "to": "transition-all", "count": 3 },
  { "file": "src/app/_components/footer.tsx", "from": "transition-all ease-in-out-quad", "to": "transition-all", "count": 4 }
]
```

Contenu complet de `maps\step2-shrink.json` (les 5 `flex-shrink-0` de `GoogleReviews.tsx` sont laissés à la tâche 33) :

```json
[
  { "file": "src/app/_components/HomeView.tsx", "from": "md:flex-shrink-0", "to": "md:shrink-0", "count": 1 },
  { "file": "src/app/_components/ServiceDetailBody.tsx", "from": "flex-shrink-0", "to": "shrink-0", "count": 1 },
  { "file": "src/app/_components/ServiceSection.tsx", "from": "flex-shrink-0", "to": "shrink-0", "count": 1 },
  { "file": "src/app/services/page.tsx", "from": "flex-shrink-0", "to": "shrink-0", "count": 1 },
  { "file": "src/app/zones/[slug]/page.tsx", "from": "flex-shrink-0", "to": "shrink-0", "count": 1 }
]
```

- [ ] **Step 8: Vérifier les comptes des cartes sur le dépôt**

```bash
cd "D:/Repos/macar-migration-tools" && for m in step2-v2-variables step2-dead-classes step2-shrink; do node replace-classes.mjs --repo "../macar-next-site-prod" --map maps/$m.json --check | tail -n 1; done
```

Attendu, sans aucune ligne `FAIL` :

```
11 entries, 6 files checked
2 entries, 2 files checked
5 entries, 5 files checked
```

- [ ] **Step 9: Committer les outils**

```bash
cd "D:/Repos/macar-migration-tools" && git add css-compile.mjs class-css-diff.mjs layer-collisions.mjs step2-static-checks.mjs maps/step2-v2-variables.json maps/step2-dead-classes.json maps/step2-shrink.json && git commit -F - <<'EOF'
Add the step 2 foundation tools and class maps

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Attendu : `7 files changed`.

---

### Task 25: Dépendances HeroUI v3 (spec 6.1)

**Files:**
- Modify: `D:\Repos\macar-next-site-prod\package.json`
- Modify: `D:\Repos\macar-next-site-prod\package-lock.json`

**Interfaces:**
- Consumes: le dépôt à l'état final de l'étape 1.
- Produces: `@heroui/react` et `@heroui/styles` en `3.2.6` exact, `react-aria` déclaré en `^3.52.1`, HeroUI v2 et ses 239 sous-paquets retirés. À partir d'ici, le build ne passe plus jusqu'à la tâche 37 (voir « Ordre des commits »).

- [ ] **Step 1: Relever l'état du lockfile avant le changement**

```bash
cd "D:/Repos/macar-next-site-prod" && node -e 'const l=require("./package-lock.json");for(const k of ["@heroui/react","@heroui/styles","@heroui/theme","react-aria","react-aria-components","tailwind-variants","tailwind-merge","tailwindcss","@tailwindcss/oxide-linux-x64-gnu","lightningcss-linux-x64-gnu","framer-motion"]){const p=l.packages["node_modules/"+k];console.log(k+" "+(p?p.version:"absent"))};console.log("tailwindcss copies: "+Object.keys(l.packages).filter(k=>/(^|\/)node_modules\/tailwindcss$/.test(k)).length)'
```

Attendu : `@heroui/react 2.8.8`, `@heroui/styles absent`, `@heroui/theme absent` (il est imbriqué sous `@heroui/react`), `react-aria 3.48.0`, `tailwindcss 4.3.3`, `tailwindcss copies: 1`.

- [ ] **Step 2: Retirer HeroUI v2**

Ne pas installer la v3 directement : `npm install @heroui/react@3.2.6` échoue en `ERESOLVE` (« Conflicting peer dependency: react-aria@3.52.1 »), parce que `react-aria@3.48.0`, amené par les sous-paquets de la v2, est encore dans l'arbre. Ne jamais utiliser `--force` ni `--legacy-peer-deps` (spec 8.3).

```bash
cd "D:/Repos/macar-next-site-prod" && npm uninstall --no-audit --no-fund @heroui/react 2>&1 | grep -v allow-scripts | tail -n 2
```

Attendu : `removed 239 packages in ...s` (des lignes `npm warn allow-scripts` peuvent s'afficher : elles sont filtrées et sans effet).

- [ ] **Step 3: Installer HeroUI v3 en version fixe**

```bash
cd "D:/Repos/macar-next-site-prod" && npm install --save-exact --no-audit --no-fund @heroui/react@3.2.6 @heroui/styles@3.2.6 2>&1 | grep -v allow-scripts | tail -n 2
```

Attendu : `added 36 packages in ...s`, sans `ERESOLVE`. npm installe aussi les dépendances de pair de `@heroui/react` (`react-aria`, `react-aria-components`, `@react-aria/ssr`, `@react-aria/utils`, `@internationalized/date`).

- [ ] **Step 4: Déclarer `react-aria`**

```bash
cd "D:/Repos/macar-next-site-prod" && npm install --no-audit --no-fund react-aria@^3.52.1 2>&1 | grep -v allow-scripts | tail -n 2 && git diff package.json
```

Attendu : `up to date in ...s`, puis exactement ce diff :

```diff
   "dependencies": {
-    "@heroui/react": "^2.8.0",
+    "@heroui/react": "3.2.6",
+    "@heroui/styles": "3.2.6",
     "@radix-ui/react-label": "^2.0.2",
...
     "react": "^19.2.6",
+    "react-aria": "^3.52.1",
     "react-dom": "^19.2.6",
```

`framer-motion` reste (importé par `screen.tsx`, `cards.tsx` et `CookieConsent.tsx`, spec 6.1). `@heroui/theme` n'a jamais été ajouté en dépendance directe : rien à retirer.

- [ ] **Step 5: Contrôler le lockfile après le changement**

```bash
cd "D:/Repos/macar-next-site-prod" && node -e 'const l=require("./package-lock.json");for(const k of ["@heroui/react","@heroui/styles","@heroui/theme","react-aria","react-aria-components","tailwind-variants","tailwind-merge","tailwindcss","@tailwindcss/oxide-linux-x64-gnu","lightningcss-linux-x64-gnu","framer-motion"]){const p=l.packages["node_modules/"+k];console.log(k+" "+(p?p.version:"absent"))};console.log("tailwindcss copies: "+Object.keys(l.packages).filter(k=>/(^|\/)node_modules\/tailwindcss$/.test(k)).length)'
```

Attendu, ligne par ligne :

```
@heroui/react 3.2.6
@heroui/styles 3.2.6
@heroui/theme absent
react-aria 3.52.1
react-aria-components 1.21.1
tailwind-variants 3.3.1
tailwind-merge 3.7.0
tailwindcss 4.3.3
@tailwindcss/oxide-linux-x64-gnu 4.3.3
lightningcss-linux-x64-gnu 1.32.0
framer-motion 11.18.2
tailwindcss copies: 1
```

Une seule copie de Tailwind (spec 8.3) et les binaires Linux nécessaires à Vercel sont présents. Le lockfile contient aussi `@adobe/react-spectrum` (amené par `@react-types/color`, dépendance de `@heroui/react`) : il n'est jamais importé.

- [ ] **Step 6: Constater les erreurs de typage attendues**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo
```

Attendu, exactement ces six fichiers (17 erreurs), qui importent encore des noms ou des props v2 :

```
      2 src/app/_components/CookieConsent.tsx
      2 src/app/_components/HomeView.tsx
      2 src/app/_components/ServiceSection.tsx
      8 src/app/_components/navbar.tsx
      1 src/app/providers.tsx
      2 src/components/GoogleReviews.tsx
```

Pas de commit : le dépôt ne compile plus tant que les composants et la Navbar ne sont pas migrés (tâche 37).

---

### Task 26: `globals.css` final et retrait de `hero.ts` (spec 6.1, 6.2)

**Files:**
- Delete: `D:\Repos\macar-next-site-prod\hero.ts`
- Modify: `D:\Repos\macar-next-site-prod\src\app\globals.css`

**Interfaces:**
- Consumes: les paquets de la tâche 25 ; `runs\step2-css\before` (tâche 24).
- Produces: `globals.css` dans l'ordre de la spec 6.2 :
  1. `@import "tailwindcss" source(none);`
  2. `@import "@heroui/styles";`
  3. le `@theme` du site (repris de l'étape 1) ;
  4. le `@theme` de compatibilité v2 : variables `--v2-background`, `--v2-foreground`, `--v2-default-50` à `--v2-default-700`, `--v2-primary`, `--v2-primary-foreground`, `--v2-secondary`, `--v2-secondary-foreground` (canaux HSL) et couleurs `--color-foreground`, `--color-default-50` à `700`, `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground` ;
  5. le bloc `:root` hors couche (`--background`, `--border`, `--accent`, fond et couleur de la racine).

  Entre les blocs 4 et 5 : les `@utility` et le `@layer base` de l'étape 1, puis la remise à zéro `.carousel .slider`.

- [ ] **Step 1: Constater que l'ancienne configuration ne compile plus**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/after 2>&1 | grep -m 1 "Error"
```

Attendu : `TypeError: (0 , _react.heroui) is not a function` (`hero.ts` appelle le plugin `heroui()`, qui n'existe plus en v3).

- [ ] **Step 2: Retirer `hero.ts`**

```bash
cd "D:/Repos/macar-next-site-prod" && git rm -q hero.ts && git status --short hero.ts
```

Attendu : `D  hero.ts`.

- [ ] **Step 3: Écrire `src\app\globals.css`**

Contenu complet (outil Write) :

```css
@import "tailwindcss" source(none);
@import "@heroui/styles";

/* Same files as the Tailwind 3 `content` globs (no node_modules, no content/ articles). */
@source "../app/**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";

/* Tailwind 3 behaviour: hover also applies on touch devices. */
@custom-variant hover (&:hover);

/* Tailwind 3 selector of space-* and divide-*: every following visible sibling. */
@custom-variant sibling (& > :not([hidden]) ~ :not([hidden]));

/* Site theme (step 1). Declared after @heroui/styles, so it replaces the HeroUI keys of the same name. */
@theme inline {
  --color-background: #F6F8FF;
  --color-headings: #0E1435;
  --color-text: #474B64;
  --color-accent1: #124FAA;
  --color-cardbackground: #FFFFFF;
  --color-bordercard: #D8DBE9;

  --font-sans: var(--font-raptor);

  /* Tailwind 3 default palette, only the shades used by the site. */
  --color-amber-400: #fbbf24;
  --color-blue-100: #dbeafe;
  --color-blue-500: #3b82f6;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-500: #737373;
  --color-neutral-700: #404040;
  --color-red-500: #ef4444;
  --color-red-600: #dc2626;
  --color-red-700: #b91c1c;

  /* Tailwind 3 values that differ in Tailwind 4. */
  --radius-full: 9999px;
}

@theme {
  --default-ring-width: 3px;
  --default-ring-color: rgb(59 130 246 / 0.5);
}

/*
 * HeroUI v2 compatibility: the v2 colours still used by the site, with the values of the
 * v2 plugin variables in the reference build. As with the v2 plugin, the HSL channels are
 * used through var(), so the browser computes the same colours as before. Opacity variants
 * are written as arbitrary values, e.g. bg-[hsl(var(--v2-primary)/0.1)], because
 * bg-primary/10 would go through color-mix(in oklab) and change the pixels.
 */
@theme inline static {
  --v2-background: 0 0% 100%;
  --v2-foreground: 201.82 24.44% 8.82%;
  --v2-default-50: 0 0% 98.04%;
  --v2-default-100: 240 4.76% 95.88%;
  --v2-default-200: 240 5.88% 90%;
  --v2-default-300: 240 4.88% 83.92%;
  --v2-default-400: 240 5.03% 64.9%;
  --v2-default-500: 240 3.83% 46.08%;
  --v2-default-600: 240 5.2% 33.92%;
  --v2-default-700: 240 5.26% 26.08%;
  --v2-primary: 212.02 100% 46.67%;
  --v2-primary-foreground: 0 0% 100%;
  --v2-secondary: 270 66.67% 47.06%;
  --v2-secondary-foreground: 0 0% 100%;

  --color-foreground: hsl(var(--v2-foreground));
  --color-default-50: hsl(var(--v2-default-50));
  --color-default-100: hsl(var(--v2-default-100));
  --color-default-200: hsl(var(--v2-default-200));
  --color-default-300: hsl(var(--v2-default-300));
  --color-default-400: hsl(var(--v2-default-400));
  --color-default-500: hsl(var(--v2-default-500));
  --color-default-600: hsl(var(--v2-default-600));
  --color-default-700: hsl(var(--v2-default-700));
  --color-primary: hsl(var(--v2-primary));
  --color-primary-foreground: hsl(var(--v2-primary-foreground));
  --color-secondary: hsl(var(--v2-secondary));
  --color-secondary-foreground: hsl(var(--v2-secondary-foreground));
}

/* Tailwind 3 transition lists (Tailwind 4 adds outline-color, gradients, translate, scale, rotate). */
@utility transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
}

@utility transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
}

@utility transition-transform {
  transition-property: transform;
}

/* Tailwind 3 box-shadow stack: ring offset, ring, shadow (Tailwind 4 adds two inset layers). */
@utility shadow-xs {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@utility shadow-md {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@utility shadow-lg {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@utility ring-2 {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow, 0 0 #0000);
}

/* Former side effect of tailwindcss-animate (removed): these classes also set the animation timing. */
@utility duration-300 {
  animation-duration: 300ms;
}

@utility duration-500 {
  animation-duration: 500ms;
}

@utility ease-in-out {
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Exact values that lightningcss would round (33.3333%, 270deg): the var() keeps them as written. */
@utility w-third {
  width: calc(100% / var(--thirds, 3));
}

@utility w-two-thirds {
  width: calc(200% / var(--thirds, 3));
}

@utility w-review-card {
  width: calc((100% - 2rem) / var(--thirds, 3));
}

@utility bg-fade-left {
  background-image: linear-gradient(var(--fade-direction, to left), #F6F8FF, transparent);
}

/* Tailwind 3 preflight values that Tailwind 4 changed. Declared after @heroui/styles, so they also win over its base layer. */
@layer base {
  html {
    font-family: var(--font-raptor);
    -webkit-tap-highlight-color: initial;
  }

  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: #e5e7eb;
  }

  td,
  th {
    padding: 1px;
  }

  input::placeholder,
  textarea::placeholder {
    color: #9ca3af;
  }

  button,
  [role="button"] {
    cursor: pointer;
  }

  :disabled {
    cursor: default;
  }
}

/*
 * react-responsive-carousel (logo strip) names its track "slider", like the HeroUI v3 Slider.
 * Only the .slider declarations that the carousel stylesheet does not set itself are reset
 * (to their initial values); the carousel keeps its own display and width.
 */
@layer components {
  .carousel .slider {
    gap: normal;
    grid-template-columns: none;
    grid-template-areas: none;
  }
}

/*
 * Outside any layer, so it wins over the HeroUI v3 variables (declared in a sub-layer of theme).
 * Brings the v3 variables back to the current colours and repeats the root rule of the v2 plugin
 * (white canvas, v2 foreground as the inherited text colour).
 */
:root {
  --background: #F6F8FF;
  --border: #e5e7eb;
  --accent: #124FAA;
  background-color: hsl(var(--v2-background));
  color: hsl(var(--v2-foreground));
}
```

Points de vérification à la relecture : `@heroui/styles` importe lui-même `tailwindcss` sans `source(none)` ; le prototype a vérifié que la détection automatique des sources ne s'active pas pour autant (même liste d'utilitaires qu'à l'étape 1, à 3 classes près, toutes expliquées à l'étape 5) et que le préflight n'est émis qu'une fois.

- [ ] **Step 4: Compiler et contrôler les règles clés**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/after && node css-rules.mjs --css runs/step2-css/after --grep ":root { --background" --grep ".carousel .slider {" --grep ".text-foreground {" --grep ".bg-background {" --grep "border-color:#e5e7eb" --grep "--heroui-" --absent "@plugin" | cut -c1-200
```

Attendu : `compiled src\app\globals.css: 462058 bytes -> runs\step2-css\after\globals.css` (environ 462 000 octets : tout le CSS des composants HeroUI), puis :

```
grep ":root { --background": 1 rule(s)
  :root { --background:#f6f8ff;--border:#e5e7eb;--accent:#124faa;background-color:hsl(var(--v2-background));color:hsl(var(--v2-foreground)) }
grep ".carousel .slider {": 1 rule(s)
  @layer components >> .carousel .slider { grid-template-columns:none;grid-template-areas:none;gap:normal }
grep ".text-foreground {": 1 rule(s)
  @layer utilities >> .text-foreground { color:hsl(var(--v2-foreground)) }
grep ".bg-background {": 1 rule(s)
  @layer utilities >> .bg-background { background-color:#f6f8ff }
grep "border-color:#e5e7eb": 2 rule(s)
  @layer base >> *,:after,:before,::backdrop { border-color:#e5e7eb }
  @layer base >> ::file-selector-button { border-color:#e5e7eb }
grep "--heroui-": 10 rule(s)
...
absent "@plugin": ok
```

Les 10 règles `--heroui-` sont les classes de couleur avec opacité encore écrites avec les variables du plugin v2 ; elles n'ont plus de valeur et sont renommées à la tâche 28.

- [ ] **Step 5: Chercher les collisions de noms avec HeroUI v3**

```bash
cd "D:/Repos/macar-migration-tools" && node layer-collisions.mjs --css runs/step2-css/after --classes runs/step1/classes.json; echo "exit $?"; node layer-collisions.mjs --css runs/step2-css/after --classes runs/step1/classes.json --known slider --known carousel; echo "exit $?"
```

Attendu, première commande (échec voulu, qui montre la collision) :

```
NEW carousel: 1 selector(s), e.g. .carousel .slider
NEW slider: 35 selector(s), e.g. .slider | .slider [data-slot=label] | .slider .slider__output
DOM classes styled in the components or base layer: 2, not neutralised: 2
exit 1
```

`slider` est la piste de `react-responsive-carousel`, stylée par le composant Slider de HeroUI ; `carousel` n'apparaît que par la remise à zéro `.carousel .slider` de l'étape 3. Seconde commande : les deux lignes commencent par `known`, puis `not neutralised: 0` et `exit 0`. Sans la remise à zéro, le prototype a mesuré un `gap` de 4 px entre les logos et un titre d'accueil qui débordait en 390 px.

- [ ] **Step 6: Comparer le CSS par classe avec l'étape 1**

```bash
cd "D:/Repos/macar-migration-tools" && node class-css-diff.mjs --ref-css runs/step2-css/before --cur-css runs/step2-css/after > runs/step2-css/diff-task26.txt; echo "exit $?"; grep -v "^  " runs/step2-css/diff-task26.txt
```

Attendu : `exit 1`, puis exactement :

```
CHANGED: active:bg-default-100
CHANGED: bg-default-100
CHANGED: bg-primary
CHANGED: bg-secondary
CHANGED: border-default-200
CHANGED: data-[active=true]:bg-default-100
NEW CSS: ease-in-out-quad
NEW CSS: hover:bg-accent
NEW CSS: hover:text-accent-foreground
CHANGED: rounded-lg
CHANGED: rounded-md
CHANGED: rounded-sm
CHANGED: rounded-xl
CHANGED: scrollbar-none
CHANGED: text-default-500
CHANGED: text-default-600
CHANGED: text-default-700
CHANGED: text-foreground
CHANGED: text-primary
CHANGED: text-primary-foreground
CHANGED: text-secondary-foreground
classes compared: 441, with a CSS difference: 21
```

Lecture (voir le détail dans `diff-task26.txt`) :
- couleurs v2 (`bg-primary`, `text-default-700`...) : `hsl(var(--heroui-x) / 1)` devient `hsl(var(--v2-x))`, même couleur calculée (prototype : 0 différence de style) ;
- `rounded-sm`, `-md`, `-lg`, `-xl` : `var(--radius-lg)` devient `calc(var(--radius) * 1)` (thème HeroUI, `--radius: 0.5rem`), mêmes rayons calculés ;
- `scrollbar-none` : l'utilitaire de HeroUI ajoute `scrollbar-color: auto`, `scrollbar-gutter: auto` (valeurs initiales) et `-ms-overflow-style` (ignoré par les navigateurs actuels) : sans effet ;
- `ease-in-out-quad`, `hover:bg-accent`, `hover:text-accent-foreground` : classes mortes que le thème v3 active ; elles sont retirées à la tâche 28.

Pas de commit (voir « Ordre des commits »).

---

### Task 27: Provider React Aria (spec 6.3)

**Files:**
- Modify: `D:\Repos\macar-next-site-prod\src\app\providers.tsx`

**Interfaces:**
- Consumes: `I18nProvider`, réexporté par `@heroui/react` 3.2.6 depuis `react-aria-components` (`dist/index.js` : `export { ..., I18nProvider, ... } from 'react-aria-components'`).
- Produces: `Providers` (même nom, même signature), importé sans changement par `src/app/layout.tsx`.

- [ ] **Step 1: Constater l'erreur actuelle**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep providers; git restore tsconfig.tsbuildinfo
```

Attendu : `src/app/providers.tsx(2,10): error TS2305: Module '"@heroui/react"' has no exported member 'HeroUIProvider'.`

- [ ] **Step 2: Écrire `src\app\providers.tsx`**

Contenu complet (outil Write) :

```tsx
"use client";
import { I18nProvider } from "@heroui/react";

// React Aria locale for the HeroUI v3 components. Fixed on purpose: reading the
// request headers here would make every route dynamic.
export function Providers({ children }: { children: React.ReactNode }) {
    return <I18nProvider locale="fr-BE">{children}</I18nProvider>;
}
```

- [ ] **Step 3: Vérifier que seuls les composants v2 restent en erreur**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo; git diff --stat -- src/app/layout.tsx
```

Attendu, exactement (16 erreurs, plus aucune dans `providers.tsx`), et aucun changement de `layout.tsx` :

```
      2 src/app/_components/CookieConsent.tsx
      2 src/app/_components/HomeView.tsx
      2 src/app/_components/ServiceSection.tsx
      8 src/app/_components/navbar.tsx
      2 src/components/GoogleReviews.tsx
```

Pas de commit.

---

### Task 28: Classes dont le CSS change avec HeroUI v3 (spec 6.2, composants shadcn, et 5.3 reporté)

**Files:**
- Modify: `src\app\_components\navbar.tsx`, `src\app\_components\ServiceSection.tsx`, `src\app\_components\ServiceDetailBody.tsx`, `src\app\services\page.tsx`, `src\app\zones\[slug]\page.tsx`, `src\components\ui\button.tsx` (variables v2)
- Modify: `src\app\_components\buttons.tsx`, `src\app\_components\footer.tsx`, `src\components\ui\button.tsx` (classes mortes)
- Modify: `src\app\_components\HomeView.tsx`, `src\app\_components\ServiceDetailBody.tsx`, `src\app\_components\ServiceSection.tsx`, `src\app\services\page.tsx`, `src\app\zones\[slug]\page.tsx` (`shrink-0`)

(tous sous `D:\Repos\macar-next-site-prod\`)

**Interfaces:**
- Consumes: les cartes de la tâche 24, `globals.css` de la tâche 26.
- Produces: plus aucune classe `--heroui-*`, `ease-in-out-quad`, `hover:bg-accent` ni `hover:text-accent-foreground` dans `src` ; `flex-shrink-0` ne reste que dans `GoogleReviews.tsx` (5 occurrences, pour la tâche 33). Les lignes à connaître des parties suivantes sont dans « Ce que les parties suivantes doivent savoir ».

- [ ] **Step 1: Renommer les variables v2 des couleurs avec opacité**

```bash
cd "D:/Repos/macar-migration-tools" && node replace-classes.mjs --repo "../macar-next-site-prod" --map maps/step2-v2-variables.json | tail -n 1
```

Attendu : `11 entries, 6 files written` (16 occurrences).

- [ ] **Step 2: Retirer `ease-in-out-quad`**

```bash
cd "D:/Repos/macar-migration-tools" && node replace-classes.mjs --repo "../macar-next-site-prod" --map maps/step2-dead-classes.json | tail -n 1
```

Attendu : `2 entries, 2 files written` (7 occurrences).

- [ ] **Step 3: Retirer les survols `accent` des variantes shadcn (outil Edit)**

Dans `src\components\ui\button.tsx`, remplacer :

```tsx
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
```

par :

```tsx
          "border border-input bg-background",
```

puis remplacer :

```tsx
        ghost: "hover:bg-accent hover:text-accent-foreground",
```

par :

```tsx
        ghost: "",
```

Ces deux classes ne produisaient aucun CSS (spec 6.2 : « une classe qui ne produisait rien est retirée ») ; en v3, `--accent` vaut `#124FAA` et elles coloreraient le survol des variantes `outline` et `ghost`.

- [ ] **Step 4: Renommer `flex-shrink-0` hors de `GoogleReviews.tsx`**

```bash
cd "D:/Repos/macar-migration-tools" && node replace-classes.mjs --repo "../macar-next-site-prod" --map maps/step2-shrink.json | tail -n 1
```

Attendu : `5 entries, 5 files written`. À l'étape 1, ce renommage activait `shrink-0` sur des éléments internes de HeroUI v2 (séparateurs de la FAQ, interrupteur) ; les composants v3 ne posent que des classes BEM (`card`, `accordion__trigger`...), vérifié dans `@heroui/styles` (`*.styles.js` des composants utilisés).

- [ ] **Step 5: Contrôler les sources**

```bash
cd "D:/Repos/macar-next-site-prod" && grep -rnE -e "--heroui-|ease-in-out-quad|hover:bg-accent[^0-9]|hover:text-accent-foreground" src | wc -l; grep -rn "flex-shrink-0" src | cut -d: -f1,2
```

Attendu : `0`, puis exactement :

```
src/components/GoogleReviews.tsx:31
src/components/GoogleReviews.tsx:32
src/components/GoogleReviews.tsx:37
src/components/GoogleReviews.tsx:49
src/components/GoogleReviews.tsx:65
```

- [ ] **Step 6: Comparer de nouveau le CSS par classe avec l'étape 1**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/after | tail -n 1 && node class-css-diff.mjs --ref-css runs/step2-css/before --cur-css runs/step2-css/after > runs/step2-css/diff-task28.txt; echo "exit $?"; grep -v "^  " runs/step2-css/diff-task28.txt; node css-rules.mjs --css runs/step2-css/after --absent "--heroui-" --absent "ease-in-out-quad" --absent "hover\:bg-accent:hover"
```

Attendu : `exit 1`, puis exactement la liste ci-dessous (36 classes), et enfin trois lignes `absent ...: ok` :

```
CHANGED: active:bg-default-100
NO CSS ANY MORE: bg-[hsl(var(--heroui-default-50)/0.5)]
NO CSS ANY MORE: bg-[hsl(var(--heroui-primary)/0.1)]
NEW CSS: bg-[hsl(var(--v2-default-50)/0.5)]
NEW CSS: bg-[hsl(var(--v2-primary)/0.1)]
CHANGED: bg-default-100
CHANGED: bg-primary
CHANGED: bg-secondary
NO CSS ANY MORE: border-[hsl(var(--heroui-default-200)/0.5)]
NEW CSS: border-[hsl(var(--v2-default-200)/0.5)]
CHANGED: border-default-200
CHANGED: data-[active=true]:bg-default-100
CHANGED: flex-shrink-0
NO CSS ANY MORE: hover:bg-[hsl(var(--heroui-primary)/0.05)]
NO CSS ANY MORE: hover:bg-[hsl(var(--heroui-primary)/0.9)]
NO CSS ANY MORE: hover:bg-[hsl(var(--heroui-secondary)/0.8)]
NEW CSS: hover:bg-[hsl(var(--v2-primary)/0.05)]
NEW CSS: hover:bg-[hsl(var(--v2-primary)/0.9)]
NEW CSS: hover:bg-[hsl(var(--v2-secondary)/0.8)]
NO CSS ANY MORE: marker:text-[hsl(var(--heroui-primary)/0.7)]
NEW CSS: marker:text-[hsl(var(--v2-primary)/0.7)]
NO CSS ANY MORE: md:flex-shrink-0
NEW CSS: md:shrink-0
CHANGED: rounded-lg
CHANGED: rounded-md
CHANGED: rounded-sm
CHANGED: rounded-xl
CHANGED: scrollbar-none
NEW CSS: shrink-0
CHANGED: text-default-500
CHANGED: text-default-600
CHANGED: text-default-700
CHANGED: text-foreground
CHANGED: text-primary
CHANGED: text-primary-foreground
CHANGED: text-secondary-foreground
classes compared: 447, with a CSS difference: 36
```

Chaque ligne est expliquée : renommages `--heroui-` vers `--v2-` (même expression `hsl(var(...)/a)`, même couleur), renommage `shrink-0` (`flex-shrink-0` et `shrink-0` partagent la règle `flex-shrink:0`), couleurs v2 et rayons (écrits autrement, mêmes valeurs calculées), `scrollbar-none` (sans effet). `ease-in-out-quad` et les survols `accent` n'apparaissent plus. Ce fichier `diff-task28.txt` sert à la justification de la PR (spec 8.2).

- [ ] **Step 7: Typage**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo
```

Attendu : les cinq mêmes fichiers qu'à la tâche 27, étape 3 (16 erreurs).

Pas de commit. **Les tâches des parties 4 (Accordion, Switch, Chip, Card et Avatar) et 5 (Navbar) s'exécutent maintenant, sans commit, à partir de cet état.**

---

## Partie 4 : étape 2, composants HeroUI v3 (Accordion, Switch, Chip, Card, Avatar)

Cette partie couvre la section 6.4 de la spec : la FAQ (`HomeView.tsx`), les trois interrupteurs du bandeau cookies (`CookieConsent.tsx`), les chips des pages service (`ServiceSection.tsx`) et les cartes d'avis avec leur avatar (`GoogleReviews.tsx`). Elle travaille dans le dépôt `D:\Repos\macar-next-site-prod`, branche `heroui-v3-migration`, avec les outils du dossier `D:\Repos\macar-migration-tools` (parties 1 à 3).

**Place dans l'ordre d'exécution** (décision de la partie 3, « un seul commit de bascule ») :

- La tâche 29 crée deux outils dans le dossier des outils et y committe. Elle n'a besoin que de la partie 1 (référence `ref-site` et `baseline`) : on peut l'exécuter à tout moment avant la tâche 30.
- Les tâches 30 à 33 s'exécutent **après la tâche 28** (fondation) et **avant les tâches 35, 36 et 37**. Elles modifient l'arbre de travail **sans committer** : le build Next ne peut pas tourner tant que `navbar.tsx` importe encore la Navbar v2. Chaque tâche se vérifie donc par le typage (`tsc`, liste exacte des fichiers encore en erreur) et par la compilation seule du CSS (`css-compile.mjs` puis `class-css-diff.mjs`, outils de la partie 3).
- La tâche 38 s'exécute **après la tâche 37** (commit de bascule) : elle contrôle les composants sur le vrai build (captures, styles calculés, comportements, minutages). Les corrections qu'elle déclencherait font des commits séparés.

**Commandes** : les commandes `bash` se lancent dans l'outil Bash (Git Bash), les commandes `powershell` dans l'outil PowerShell. Les chemins contiennent une espace : ils sont toujours entre guillemets. Les fichiers dont le contenu complet est donné s'écrivent avec l'outil Write. Les modifications « remplacer ... par ... » se font avec l'outil Edit, avec exactement les textes donnés. Pas de heredoc ni de `sed` pour écrire du code : le prototype a constaté que l'outil Bash altère les barres obliques inverses d'un heredoc (`/\s+/` est devenu `/s+/` dans `GoogleReviews.tsx`, et le prérendu de `/` a planté). Les heredocs ne servent qu'aux messages de commit. Chaque commande `tsc` est suivie de `git restore tsconfig.tsbuildinfo` (fichier suivi que `tsc` réécrit).

### Résultats du prototype (à lire avant de commencer)

Le prototype a été mené dans un clone jetable du prototype de la fondation (`...\scratchpad\proto\components`, sur le disque `D:` par manque de place sur `C:`), à l'état exact des tâches 25 à 28. Pour pouvoir construire le site, et **seulement dans le prototype**, `navbar.tsx` importait la Navbar v2 depuis un alias npm `heroui-v2` (bouchon, pas dans le plan) : la barre restait donc identique à la référence, ce qui isole l'effet des composants. Le build de référence (`a37ed9e`) a été reconstruit dans un second clone pour les contrôles « avant ».

| Mesure | Résultat |
|---|---|
| Typage après chaque tâche | tâche 30 : `HomeView.tsx` sort de la liste ; tâche 31 : `CookieConsent.tsx` ; tâche 32 : `ServiceSection.tsx` ; tâche 33 : `GoogleReviews.tsx`. Il ne reste que `navbar.tsx` (8 erreurs) |
| `npm run build` (avec le bouchon Navbar) | `✓ Generating static pages (33/33)`, aucune route `ƒ`, chips présents dans `services/*.html` (Server Component), initiales des avis dans `index.html` |
| Captures du harnais contre la référence (`compare.mjs --allow allow-step2.json`) | 45 captures (avant l'ajout de la page 404) : **39 identiques, 6 différences autorisées** (`cookie-preferences` et `focus-switch` en 1280 et 390 : exception 1 ; `faq-open` en 1280 et 390 : exception 2), **0 échec** |
| Styles calculés (`style-diff.mjs --allow allow-step2.json`) | **0 élément différent** |
| Spécifications `STEP=2` (`faq`, `cookies`, `reviews`, `components`) | **27 tests passés** (6 + 8 + 5 + 8) |
| `tests/components.spec.mjs` sur la référence | `STEP=0` : 8 passés. `STEP=2` : 2 échecs attendus (flèche pivotée, interrupteur), 6 passés |
| `tests/components.spec.mjs` sur un build « mutant » sans les classes de neutralisation (déclencheur, carte, chip) | 4 échecs (survol, focus, chip, carte) : la spécification détecte bien les styles v3 par défaut |
| Minutage de la FAQ (`curve-diff.mjs`, écart maximal image par image) | ouverture : 4,1 px et 0,041 d'opacité ; fermeture : 6,2 px et 0,036. Deux enregistrements de la référence entre eux : 9,7 px et 0,066, puis 3,9 px et 0,061 |
| `record.mjs --ref` (dernier changement de chaque signal) | FAQ : ouverture `opacity` -58 ms **OUT**, `y` -24 ms, fermeture -32, -17 et +1 ms. Le OUT vient d'un artefact de la référence (voir l'écart 36) |
| Console du navigateur à l'hydratation (`/` et `/services/renovation`) | aucune erreur ni avertissement |

Défauts trouvés par le prototype, tous corrigés dans cette partie :

1. **Chip dans un Server Component.** `import { Chip } from "@heroui/react"` casse le build : `'client-only' cannot be imported from a Server Component module`, trace `react-aria-components/dist/exports/index.mjs` (ligne 69 : `import "client-only"`) puis `@heroui/react/dist/index.js` puis `ServiceSection.tsx`. Le point d'entrée racine de `@heroui/react` réexporte `react-aria-components`. Parade : l'export déclaré `@heroui/react/chip` (tâche 32), qui garde `ServiceSection.tsx` en Server Component.
2. **Glyphe rogné.** Le `overflow: clip` de `.accordion__panel` coupait le pixel d'anticrénelage gauche de la première lettre de la réponse en 390 px (2 pixels différents). Parade : `overflow-x-visible` sur `Accordion.Panel` (le découpage vertical, utile à l'animation de hauteur, reste).
3. **Ouverture de la FAQ en avance.** Sans délai, la hauteur et l'opacité démarrent dès l'image qui suit le clic ; en v2, framer-motion démarrait l'opacité environ 16 ms plus tard et la hauteur environ 30 ms plus tard (il mesure d'abord la hauteur). Écart mesuré : 22,5 px (OUT). Avec ces deux délais : 3,1 à 4,1 px, dans le bruit de la référence.
4. **Mot de commentaire compilé.** Le mot `ring` d'un commentaire de `CookieConsent.tsx` a généré l'utilitaire `.ring` (Tailwind lit aussi les commentaires). Les commentaires de cette partie évitent les noms d'utilitaires (`ring`, `shadow`, ...) ; `class-css-diff.mjs` le contrôle à chaque tâche.

### Écarts par rapport à la spec

Numérotation locale à cette partie ; dans le reste du plan, ces écarts sont cités par leur numéro global (liste en tête du plan).

1. **6.4 Chip, « Server Component »** : le Chip est importé de `@heroui/react/chip` (export déclaré du paquet : `Chip`, `ChipLabel`, `ChipRoot`, `chipVariants`), pas de `@heroui/react`. C'est la seule façon de garder `ServiceSection.tsx` en Server Component (défaut 1). La parade de la spec (section 11 : passer `ServiceSection.tsx` en composant client) n'est donc pas nécessaire. Le contrôle 8.3 (`step2-static-checks.mjs`) ne regarde que les imports de `@heroui/react` : il passe.
2. **6.4 Accordion, « gestionnaire `onKeyDown` sur chaque colonne »** : le gestionnaire est posé sur chaque `Accordion.Trigger` et retrouve sa colonne par `closest('[data-slot="accordion"]')`. `Accordion` (le `DisclosureGroup` de React Aria) ne transmet pas `onKeyDown` au DOM : `filterDOMProps` (react-aria 3.52.1, `dist/private/utils/filterDOMProps.mjs`) ne garde que les événements de pointeur, de souris, de défilement et d'animation. La v2 le posait aussi sur chaque bouton (`useReactAriaAccordionItem`). Le comportement est celui demandé : flèches, Début, Fin, sans boucler, `preventDefault`, focus déplacé sans ouvrir la réponse et sans faire défiler la page (`focus({ preventScroll: true })`, comme `focusSafely` en v2).
3. **6.4 Accordion, « séparateur `::after` remis à l'apparence de référence »** : le `::after` est retiré (`hideSeparator`) et un `<hr>` est rendu entre deux questions, comme dans la référence (5 `<hr>` pour 7 questions). C'est le même DOM, le même rôle `separator` exposé, et les mêmes boîtes : un `::after` dessiné dans la question changerait la hauteur des questions et l'appariement de `style-diff.mjs`.
4. **6.4 Accordion, flèche** : c'est le `svg` lui-même qui reçoit `Accordion.Indicator` et pivote (`rotate: -90deg`), avec une transition de `rotate` de 150 ms déclarée **dans tous les états** (décision du propriétaire du 2026-10-04 : la fermeture est animée aussi). Au repos, le `svg` ne diffère donc de la référence que par ses valeurs de `transition` (aucun effet visuel). L'entrée de l'exception 2 de `allow-step2.json` couvre `#faq button[aria-expanded] svg` dans tous les états de l'accueil dès la tâche 4 : aucune recapture de la référence n'est nécessaire. Les vérifications au repos du test de la flèche (tâche 29 : boîte de 16 x 16 px, couleur héritée du bouton, épaisseur de trait de 1,5 px) gardent sous test l'apparence de la flèche fermée.
5. **6.4 Accordion, animation du panneau** : durées de la spec (ouverture 300 ms pour la hauteur et 400 ms pour l'opacité, fermeture 300 ms), courbe `easeOut` de framer-motion (`cubic-bezier(0, 0, 0.58, 1)`, ajustée sur l'enregistrement : écart quadratique 0,01 d'opacité), ressort de hauteur sans rebond approché par `cubic-bezier(0.29, 0.48, 0.03, 1)` (écart maximal 2,3 % de la hauteur avec le ressort critique de 30,8 rad/s que framer-motion calcule pour 0,3 s). **Ajout** : à l'ouverture, délai de 30 ms pour la hauteur et de 16 ms pour l'opacité (défaut 3). La règle est l'utilitaire `faq-panel-transition` de `globals.css`.
6. **8.1, enregistrements comparés aux minutages de la référence** : `record.mjs --ref` signale l'ouverture de la FAQ en `opacity` OUT (environ -58 ms). Ce n'est pas un défaut : dans la référence, framer-motion met l'opacité de la réponse à 0 pendant une image vers 425 à 435 ms, puis à 1 (et à 1 pendant une image à la fin de la fermeture). Le « dernier changement » mesure cet artefact. La tâche 29 ajoute `curve-diff.mjs`, qui compare les courbes image par image en ignorant ces pics isolés ; c'est lui qui juge la FAQ (seuil 12 px, une image de mouvement, et 0,1 d'opacité).
7. **6.4 Accordion, attributs** : `Accordion.Panel` reçoit `role="region"` (React Aria met `group` par défaut) pour garder la région nommée par sa question, comme en v2. L'`aria-label` que la v2 posait sur la `div` de chaque question n'est pas repris : React Aria ne le transmet pas (`filterDOMProps` sans `labelable`), et sur une `div` sans rôle il n'est pas exposé. Le déclencheur porte `aria-controls` aussi quand la réponse est fermée (elle existe désormais, masquée : exception 4). Dans le HTML prérendu, les réponses fermées ont `hidden=""` ; React Aria passe à `hidden="until-found"` à l'hydratation.
8. **6.4 Accordion et Switch, état de focus** : sur le déclencheur, `outline: revert` rend la main à la feuille de style du navigateur (contour natif au clavier, rien à la souris) et `box-shadow: none` retire l'anneau v3. Sur l'interrupteur, le focus est sur un `input` visuellement caché : le contour natif est donc dessiné sur `Switch.Control` (`outline-style: auto`, `outline-width: 1px`, `outline-color: -webkit-focus-ring-color`, la règle de Chrome) quand `Switch.Content` porte `data-focus-visible`.
9. **6.4, détails de parité non listés dans la spec** : surlignage tactile (`-webkit-tap-highlight-color`) rendu à la valeur héritée sur le déclencheur et l'interrupteur (la v3 le met à `transparent`) ; `Card` garde `tabIndex={-1}` comme la Card v2 (focus au clic) ; l'avatar v3 n'a plus de `tabindex="-1"` (sans effet visible : le clic donne le focus à la carte) ; le Chip devient un `span` (une `div` en v2), sans effet de rendu.
10. **6.4 Avatar** : l'initiale (`Avatar.Fallback`) garde le style v3 par défaut (rond gris, texte de 12 px) : la référence n'affichait jamais de repli, l'exception 3 ne fixe pas son apparence. Le HTML prérendu ne contient plus d'`<img>` d'avatar (l'image n'apparaît qu'une fois chargée côté client : exception 3).

### Ce que les autres parties doivent savoir (produit par cette partie)

- **Fichiers modifiés sans commit** (à inclure dans le commit de la tâche 37, déjà couverts par `git add -A -- src`) : `src/app/_components/HomeView.tsx`, `src/app/_components/faqKeyboard.ts` (nouveau), `src/app/globals.css` (utilitaire `faq-panel-transition` inséré après `@utility bg-fade-left`), `src/app/_components/CookieConsent.tsx`, `src/app/_components/ServiceSection.tsx`, `src/components/GoogleReviews.tsx`.
- **Imports HeroUI après cette partie** : `Accordion` (HomeView), `Switch` (CookieConsent), `Card` et `Avatar` (GoogleReviews) depuis `@heroui/react` ; `Chip` depuis `@heroui/react/chip`. Plus aucun `flex-shrink-*` dans `src` hors Navbar (le contrôle de la tâche 37 passe pour `GoogleReviews.tsx`).
- **État des contrôles avant la Navbar** : `tsc` ne signale plus que `navbar.tsx` (8 erreurs) ; `step2-static-checks.mjs` ne signale plus que la Navbar (`only Accordion, ... imported` : les 7 noms `Navbar*`, et `classNames=` en `navbar.tsx:74`), soit `10 checks, 2 failed`.
- **`globals.css`** : la partie 5 ajoute ses keyframes ailleurs que juste après `@utility bg-fade-left` (cette partie y insère son bloc), ou bien adapte son ancre.
- **Outils ajoutés** (tâche 29) : `tests/components.spec.mjs` (8 tests, `STEP=0|1|2`) et `curve-diff.mjs` (`--ref`, `--cur`, `--max-y 12`, `--max-opacity 0.1`). La vérification complète de l'étape 2 doit juger la FAQ avec `curve-diff.mjs` plutôt qu'avec la ligne `faq open` de `record.mjs` (écart 36).
- **Collisions de noms** : le DOM de l'étape 2 contient 23 classes BEM de HeroUI v3 stylées dans la couche `components` (liste à la tâche 38, étape 7) ; ce sont les composants voulus.

---

### Task 29: Spécification de parité des composants et comparaison des courbes de la FAQ

**Files:**
- Create: `D:\Repos\macar-migration-tools\curve-diff.mjs`
- Create: `D:\Repos\macar-migration-tools\tests\components.spec.mjs`

**Interfaces:**
- Consumes: `tests/helpers.mjs` et `lib/common.mjs` (partie 1, tâches 3 et 8) ; `baseline/record/timings.json` et `runs/record-check/timings.json` (partie 1, tâche 11, étape 3) ; le build `ref-site` (partie 1, tâche 2).
- Produces:
  - `node curve-diff.mjs --ref <timings.json> --cur <timings.json> [--max-y 12] [--max-opacity 0.1]` : écart maximal image par image des courbes d'ouverture et de fermeture de la FAQ ; code 1 au-delà des seuils.
  - `BASE_URL=<url> STEP=0|1|2 npx playwright test tests/components.spec.mjs` : 8 tests de parité des composants (survol et focus de la FAQ, flèche, région de la réponse, console à l'hydratation, chips rendus côté serveur, cartes et avatar, focus de l'interrupteur).

- [ ] **Step 1: Vérifier que les outils n'existent pas encore**

```bash
cd "D:/Repos/macar-migration-tools" && ls curve-diff.mjs tests/components.spec.mjs; ls baseline/record/timings.json runs/record-check/timings.json ref-site/.next/BUILD_ID
```

Attendu : deux erreurs `No such file or directory` (les outils), puis les trois fichiers de la référence.

- [ ] **Step 2: Créer `curve-diff.mjs`**

Contenu complet (outil Write) :

```js
// node curve-diff.mjs --ref <timings.json> --cur <timings.json> [--max-y 12] [--max-opacity 0.1]
// Compares the FAQ opening and closing curves recorded by record.mjs (opacity of the first
// answer, position of the second question) frame by frame: the current recording is linearly
// interpolated at the reference sample times, over the first 600 ms. Isolated one-frame opacity
// spikes are removed on both sides first: framer-motion (HeroUI v2) sets the answer opacity to 0
// for one frame at the end of the opening, and back to 1 for one frame at the end of the closing.
// Prints the largest gap per signal; exit 1 above the limits (default 12 px, about one frame of
// movement, and 0.1 of opacity).
import fs from "node:fs";

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i < 0 ? d : argv[i + 1]; };
if (!opt("ref") || !opt("cur")) {
  console.error("usage: node curve-diff.mjs --ref <timings.json> --cur <timings.json> [--max-y 12] [--max-opacity 0.1]");
  process.exit(2);
}
const ref = JSON.parse(fs.readFileSync(opt("ref"), "utf8")).faq;
const cur = JSON.parse(fs.readFileSync(opt("cur"), "utf8")).faq;
const LIMITS = { y: Number(opt("max-y", 12)), opacity: Number(opt("max-opacity", 0.1)) };

// Samples of one signal, without the isolated spikes (a value 0.5 away from both neighbours).
function series(samples, key) {
  const pts = samples.filter((s) => typeof s[key] === "number").map((s) => [s.t, s[key]]);
  if (key !== "opacity") return pts;
  return pts.filter(([, v], i) => {
    const prev = pts[i - 1], next = pts[i + 1];
    return !(prev && next && Math.abs(v - prev[1]) > 0.5 && Math.abs(v - next[1]) > 0.5);
  });
}
function valueAt(pts, t) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [ta, va] = pts[i - 1], [tb, vb] = pts[i];
    if (t <= tb) return va + ((vb - va) * (t - ta)) / (tb - ta || 1);
  }
  return pts[pts.length - 1][1];
}

let failed = 0;
for (const phase of ["open", "close"]) {
  const parts = [];
  for (const key of ["y", "opacity"]) {
    const a = series(ref[phase].samples, key);
    const b = series(cur[phase].samples, key);
    let worst = { gap: 0, t: 0 };
    for (const [t, v] of a) {
      if (t > 600) continue;
      const gap = Math.abs(valueAt(b, t) - v);
      if (gap > worst.gap) worst = { gap, t };
    }
    const bad = worst.gap > LIMITS[key];
    if (bad) failed++;
    parts.push(`${key} max gap ${worst.gap.toFixed(key === "y" ? 1 : 3)} at ${worst.t} ms${bad ? " OUT" : ""}`);
  }
  console.log(`faq ${phase}: ${parts.join(", ")}`);
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 3: Contrôler `curve-diff.mjs` sur les deux enregistrements de la référence**

```bash
cd "D:/Repos/macar-migration-tools" && node curve-diff.mjs --ref baseline/record/timings.json --cur baseline/record/timings.json; echo "exit $?"; node curve-diff.mjs --ref baseline/record/timings.json --cur runs/record-check/timings.json; echo "exit $?"; node curve-diff.mjs --ref baseline/record/timings.json --cur runs/record-check/timings.json --max-y 1; echo "exit $?"
```

Attendu :
- première commande : `y max gap 0.0` et `opacity max gap 0.000` pour `faq open` et `faq close`, puis `exit 0` ;
- deuxième commande (deux enregistrements du même build) : des écarts sous les seuils, de l'ordre de ceux du prototype (`faq open: y max gap 9.7 at 53.7 ms, opacity max gap 0.066 at 34.1 ms`, `faq close: y max gap 3.9 at 55.1 ms, opacity max gap 0.061 at 55.1 ms`), puis `exit 0` ;
- troisième commande (contrôle négatif, seuil de 1 px) : au moins une ligne terminée par `OUT`, puis `exit 1`.

Si la deuxième commande dépasse 12 px, le bruit de la machine est plus fort que dans le prototype : refaire `record.mjs` sur `ref-site` avant de continuer, ne pas relever le seuil.

- [ ] **Step 4: Créer `tests/components.spec.mjs`**

Contenu complet (outil Write) :

```js
// Spec 6.4: parity details of the migrated components that the other specs do not cover
// (computed styles in interactive states, accessible region of an answer, server rendering of
// the chips). Every test passes on the reference (STEP=0) and after step 1 (STEP=1); STEP=2
// switches the expectations of the accepted changes (exceptions 1 and 2 of spec section 9).
import { test, expect } from "@playwright/test";
import { prepare, open, keyboardFocus, STEP, SEL } from "./helpers.mjs";

test.use({ viewport: { width: 1280, height: 800 } });

const styleOf = (locator, props) =>
  locator.evaluate((el, props) => {
    const cs = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
  }, props);

const triggers = (page) => page.locator(SEL.faqTriggers);
const ANSWER_1 = "Macar est une entreprise belge spécialisée";

test.describe("FAQ", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("survol d'une question : aucun fond", async ({ page }) => {
    await open(page, "/");
    const trigger = triggers(page).nth(1);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.hover();
    await page.waitForTimeout(300);
    expect(await styleOf(trigger, ["background-color"])).toEqual({ "background-color": "rgba(0, 0, 0, 0)" });
  });

  test("focus : contour natif au clavier, aucun contour à la souris, jamais d'anneau", async ({ page }) => {
    await open(page, "/");
    const first = triggers(page).nth(0);
    await first.scrollIntoViewIfNeeded();
    await first.click();
    expect(await styleOf(first, ["outline-style", "box-shadow"])).toEqual({ "outline-style": "none", "box-shadow": "none" });
    const second = triggers(page).nth(1);
    await keyboardFocus(page, second);
    expect(await styleOf(second, ["outline-style", "box-shadow"])).toEqual({ "outline-style": "auto", "box-shadow": "none" });
  });

  test("flèche : immobile au repos, -90 degrés quand la question est ouverte, retour animé (étape 2, exception 2)", async ({ page }) => {
    await open(page, "/");
    const rotation = () =>
      triggers(page).nth(0).locator("svg").evaluate((svg) => {
        const own = getComputedStyle(svg);
        const parent = getComputedStyle(svg.parentElement);
        return [own.rotate, own.transform, parent.rotate, parent.transform];
      });
    const REST = ["none", "none", "none", "none"];
    expect(await rotation()).toEqual(REST);
    const look = () =>
      triggers(page).nth(0).evaluate((button) => {
        const svg = button.querySelector("svg");
        const box = svg.getBoundingClientRect();
        return {
          size: [Math.round(box.width), Math.round(box.height)],
          svgColor: getComputedStyle(svg).color,
          buttonColor: getComputedStyle(button).color,
          strokeWidth: getComputedStyle(svg.querySelector("path")).strokeWidth,
        };
      });
    const rest = await look();
    expect(rest.size).toEqual([16, 16]);
    expect(rest.svgColor).toBe(rest.buttonColor);
    expect(rest.strokeWidth).toBe("1.5px");
    await triggers(page).nth(0).click();
    await page.waitForTimeout(500);
    expect(await rotation()).toEqual(STEP < 2 ? REST : ["-90deg", "none", "none", "none"]);
    await triggers(page).nth(0).click();
    if (STEP >= 2) {
      // The way back is animated too (owner decision of 2026-10-04): right after the closing click, a CSS transition on rotate is running.
      expect(await triggers(page).nth(0).locator("svg").evaluate((svg) => svg.getAnimations().some((a) => a.transitionProperty === "rotate"))).toBe(true);
    }
    await page.waitForTimeout(500);
    expect(await rotation()).toEqual(REST);
  });

  test("réponse ouverte : région nommée par sa question", async ({ page }) => {
    await open(page, "/");
    await triggers(page).nth(0).click();
    const region = page.getByRole("region", { name: "Qu'est-ce que Macar ?" });
    await expect(region).toBeVisible();
    await expect(region).toContainText(ANSWER_1);
  });
});

test("aucune erreur ni avertissement dans la console à l'hydratation (accueil, page service)", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL, { consent: false });
  const messages = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !m.text().startsWith("Failed to load resource")) messages.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => messages.push(e.message.slice(0, 200)));
  for (const url of ["/", "/services/renovation"]) {
    await open(page, url);
    await page.waitForTimeout(1000);
  }
  expect(messages).toEqual([]);
});

test("chips des pages service : rendus côté serveur, pilule de 24 px aux couleurs v2", async ({ page, context, baseURL, request }) => {
  await prepare(context, baseURL);
  const html = await (await request.get("/services/renovation")).text();
  expect(html).toContain(">Peinture intérieure et extérieure</span>");
  await open(page, "/services/renovation");
  const label = page.getByText("Peinture intérieure et extérieure", { exact: true });
  expect(await styleOf(label, ["color", "font-size", "font-weight", "padding-left", "padding-right"])).toEqual({
    color: "rgb(0, 111, 238)", "font-size": "16px", "font-weight": "500", "padding-left": "4px", "padding-right": "4px",
  });
  const chip = label.locator("xpath=..");
  expect(await styleOf(chip, ["background-color", "border-top-left-radius", "height", "padding-left", "white-space"])).toEqual({
    "background-color": "rgba(0, 111, 238, 0.1)", "border-top-left-radius": "9999px", height: "24px", "padding-left": "4px", "white-space": "nowrap",
  });
});

test("cartes d'avis : carrées, sans ombre ni padding propre, avatar rond de 32 px", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL);
  await open(page, "/");
  const photo = page.locator('img[referrerpolicy="no-referrer"]').first();
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toBeVisible();
  const card = page.locator("div.snap-start").first();
  expect(await styleOf(card, ["border-top-left-radius", "box-shadow", "padding-top", "padding-left", "background-color", "border-top-width", "overflow-x"])).toEqual({
    "border-top-left-radius": "0px", "box-shadow": "none", "padding-top": "0px", "padding-left": "0px",
    "background-color": "rgba(255, 255, 255, 0.8)", "border-top-width": "1px", "overflow-x": "hidden",
  });
  const avatar = photo.locator("xpath=..");
  expect(await styleOf(avatar, ["width", "height", "border-top-left-radius", "background-color"])).toEqual({
    width: "32px", height: "32px", "border-top-left-radius": "9999px", "background-color": "rgba(0, 0, 0, 0)",
  });
});

test("interrupteur au clavier : contour natif, sans anneau (case native avant l'étape 2)", async ({ page, context, baseURL }) => {
  await prepare(context, baseURL, { consent: false });
  await open(page, "/");
  await page.getByRole("button", { name: "Préférences", exact: true }).click();
  const input = page.getByRole("switch", { name: "Analytics Cookies" }).first();
  await keyboardFocus(page, input);
  const ring =
    STEP < 2 ? input : input.locator("xpath=ancestor::label[1]").locator('[data-slot="switch-control"]');
  await expect(ring).toHaveCount(1);
  expect(await styleOf(ring, ["outline-style", "box-shadow"])).toEqual({ "outline-style": "auto", "box-shadow": "none" });
});
```

- [ ] **Step 5: Servir la référence sur le port 3100**

Lancer en arrière-plan (outil Bash avec `run_in_background: true` et `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-migration-tools/ref-site" && npx next start -p 3100
```

Puis, au premier plan :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/services/renovation
```

Attendu : `200`.

- [ ] **Step 6: Lancer la spécification sur la référence (STEP=0, puis le contrôle négatif STEP=2)**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=0 npx playwright test tests/components.spec.mjs 2>&1 | tail -n 2; BASE_URL=http://localhost:3100 STEP=2 npx playwright test tests/components.spec.mjs 2>&1 | grep -E "^\s+x |passed|failed"
```

Attendu, première commande : `8 passed`. Seconde commande (les attentes de l'étape 2 appliquées au rendu v2 doivent échouer exactement sur les deux exceptions visibles) :

```
  x  3 tests\components.spec.mjs:42:3 › FAQ › flèche : immobile au repos, -90 degrés quand la question est ouverte, retour animé (étape 2, exception 2)
  x  8 tests\components.spec.mjs:134:1 › interrupteur au clavier : contour natif, sans anneau (case native avant l'étape 2)
    Error: expect(locator).toHaveCount(expected) failed
  2 failed
  6 passed
```

(les durées entre parenthèses en fin de ligne varient).

- [ ] **Step 7: Arrêter la référence**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`.

- [ ] **Step 8: Committer les outils**

```bash
cd "D:/Repos/macar-migration-tools" && git add curve-diff.mjs tests/components.spec.mjs && git commit -F - <<'EOF'
Add the component parity spec and the FAQ curve comparison

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Attendu : `2 files changed`.

---

### Task 30: Accordion de la FAQ (`HomeView.tsx`, spec 6.4)

**Files:**
- Create: `D:\Repos\macar-next-site-prod\src\app\_components\faqKeyboard.ts`
- Modify: `D:\Repos\macar-next-site-prod\src\app\_components\HomeView.tsx`
- Modify: `D:\Repos\macar-next-site-prod\src\app\globals.css`

**Interfaces:**
- Consumes: l'état après la tâche 28 (partie 3) ; `css-compile.mjs`, `class-css-diff.mjs`, `css-rules.mjs` et `runs/step2-css/after` (CSS compilé à la tâche 28, étape 6).
- Produces:
  - `onFaqTriggerKeyDown(event: KeyboardEvent<HTMLElement>)`, exporté par `faqKeyboard.ts` ;
  - le composant local `FaqAccordion({ items }: { items: FaqItem[] })` de `HomeView.tsx` (une colonne de FAQ) ;
  - l'utilitaire `faq-panel-transition` de `globals.css` ;
  - le DOM attendu par le harnais : `#faq button[aria-expanded]` (7), titres `h2`, `<hr>` entre les questions, réponses fermées en `hidden="until-found"` après l'hydratation, `svg` de la flèche avec `data-expanded="true"` quand la question est ouverte.

Rendu de référence reproduit (styles calculés de `baseline`, élément par élément) : racine `px-2` ; `h2` en bloc, police héritée ; déclencheur en `flex`, `py-4`, `gap-3`, centré verticalement, sans `px`, texte centré, police héritée (16 px, 400), transition `opacity` 150 ms, fond transparent, aucun anneau ; colonne du titre `flex-1 flex flex-col` ; titre `text-foreground text-sm sm:text-base text-left` ; `span` de la flèche avec `transition-transform` (150 ms) ; `svg` de 1em en couleur héritée ; réponse `pt-2 pb-4 text-sm text-left` en couleur héritée ; `<hr>` de 1 px `#e5e7eb` entre deux questions.

- [ ] **Step 1: Constater l'état de départ**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo; ls src/app/_components/faqKeyboard.ts
```

Attendu : les cinq fichiers de la fin de la tâche 28, dont `HomeView.tsx` (`Property 'title' does not exist on type 'IntrinsicAttributes & AccordionItemProps'`, lignes 275 et 290) :

```
      2 src/app/_components/CookieConsent.tsx
      2 src/app/_components/HomeView.tsx
      2 src/app/_components/ServiceSection.tsx
      8 src/app/_components/navbar.tsx
      2 src/components/GoogleReviews.tsx
```

puis `ls: cannot access 'src/app/_components/faqKeyboard.ts': No such file or directory`.

- [ ] **Step 2: Créer `src\app\_components\faqKeyboard.ts`**

Contenu complet (outil Write) :

```ts
import type { KeyboardEvent } from "react";

// Keyboard navigation of the HeroUI v2 accordion (useReactAriaAccordionItem), which the
// HeroUI v3 Accordion does not provide. ArrowDown and ArrowUp move the focus to the next or
// previous question of the same column, Home and End to the first or last one. No wrap-around,
// the answer does not open and the page does not scroll (v2 moved the focus without scrolling).
const NAVIGATION_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

export function onFaqTriggerKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!NAVIGATION_KEYS.includes(event.key)) return;
  event.preventDefault();
  const trigger = event.currentTarget;
  const column = trigger.closest('[data-slot="accordion"]');
  if (!column) return;
  const triggers = Array.from(
    column.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]:not(:disabled)'),
  );
  const index = triggers.indexOf(trigger);
  const target =
    event.key === "ArrowDown"
      ? triggers[index + 1]
      : event.key === "ArrowUp"
        ? triggers[index - 1]
        : event.key === "Home"
          ? triggers[0]
          : triggers[triggers.length - 1];
  target?.focus({ preventScroll: true });
}
```

`Accordion.Trigger` est le `Button` de React Aria : son `onKeyDown` arrête la propagation de l'événement, comme le bouton v2 (`useButton` avec `onKeyDown`).

- [ ] **Step 3: Remplacer l'import et ajouter la colonne de FAQ dans `HomeView.tsx`**

Dans `src\app\_components\HomeView.tsx`, remplacer :

```tsx
import { Accordion, AccordionItem } from "@heroui/react";

export type FaqItem = { question: string; answer: string };
```

par :

```tsx
import { Accordion } from "@heroui/react";
import { Fragment } from "react";
import { onFaqTriggerKeyDown } from "./faqKeyboard";

export type FaqItem = { question: string; answer: string };

// One FAQ column. The HeroUI v3 default styles are overridden by the classes below (utilities
// layer) to keep the HeroUI v2 rendering: h2 titles, <hr> separators between questions, same
// chevron, native focus outline, v2 opening and closing timings (faq-panel-transition).
function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion hideSeparator className="px-2 w-full max-w-full">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <hr />}
          <Accordion.Item className="static border-solid">
            <Accordion.Heading level={2} className="block">
              <Accordion.Trigger
                onKeyDown={onFaqTriggerKeyDown}
                className="flex flex-initial justify-normal items-center gap-3 w-full px-0 py-4 text-center [font-size:inherit] [line-height:inherit] [font-weight:inherit] bg-transparent transition-opacity [box-shadow:none] [outline:revert] [-webkit-tap-highlight-color:inherit]"
              >
                <div className="flex-1 flex flex-col">
                  <span className="text-foreground text-sm sm:text-base text-left">{item.question}</span>
                </div>
                <span aria-hidden="true" className="transition-transform">
                  <Accordion.Indicator className="ms-0 size-[1em] shrink text-inherit [transition:rotate_150ms_cubic-bezier(0.4,0,0.2,1)] data-[expanded=true]:-rotate-90">
                    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em">
                      <path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                  </Accordion.Indicator>
                </span>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel role="region" className="faq-panel-transition overflow-x-visible">
              <Accordion.Body className="px-0 pt-2 pb-4 text-sm text-left text-inherit">{item.answer}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Fragment>
      ))}
    </Accordion>
  );
}
```

Rôle de chaque classe ajoutée (toutes dans la couche `utilities`, qui l'emporte sur la couche `components` de `@heroui/styles`) :
- `Accordion` : `hideSeparator` retire le `::after` v3 ; les `<hr>` reprennent les séparateurs de la référence (préflight : 1 px, `#e5e7eb`).
- `Accordion.Item` : `static` et `border-solid` annulent `relative` et `border-none` de `.accordion__item`.
- `Accordion.Heading` : `level={2}` (défaut React Aria : `h3`), `block` annule le `flex` de `.accordion__heading`.
- `Accordion.Trigger` : `flex-initial` annule `flex-1`, `justify-normal` annule `justify-between`, `px-0` annule `px-4`, `text-center` annule `text-start`, les trois `[...:inherit]` annulent `text-sm font-medium`, `bg-transparent` annule le fond au survol, `transition-opacity` remet la transition de la référence, `[box-shadow:none]` retire l'anneau de `status-focused`, `[outline:revert]` rend le contour au navigateur, `[-webkit-tap-highlight-color:inherit]` annule `no-highlight`.
- `Accordion.Indicator` (posé sur le `svg`, que la v3 clone) : `ms-0`, `size-[1em]`, `shrink` et `text-inherit` annulent `ms-auto size-4 shrink-0 text-muted`, `[transition:rotate_150ms_cubic-bezier(0.4,0,0.2,1)]` remplace la transition v3 de 250 ms par celle de `transition-transform` en Tailwind 3 (150 ms, même courbe), déclarée dans tous les états pour que la flèche pivote à l'ouverture **et** revienne en douceur à la fermeture (décision du propriétaire du 2026-10-04, écart 34), et `data-[expanded=true]:-rotate-90` remplace la rotation de -180 degrés (exception 2).
- `Accordion.Panel` : `role="region"` (écart 37), `faq-panel-transition` (minutage v2, étape 5), `overflow-x-visible` (défaut 2 du prototype).
- `Accordion.Body` (la classe va sur la `div` interne) : `px-0 pt-2` annulent `px-4 pt-0`, `text-inherit` annule `text-muted`.

- [ ] **Step 4: Remplacer les deux colonnes de la FAQ**

Dans `src\app\_components\HomeView.tsx`, remplacer :

```tsx
          <Accordion className="max-w-full">
            {faq.slice(0, Math.ceil(faq.length / 2)).map((item, i) => (
              <AccordionItem
                key={i}
                aria-label={item.question}
                title={item.question}
                classNames={{
                  content: "text-sm text-font-gray pb-4 text-left",
                  title: "text-sm sm:text-base text-left",
                }}
              >
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>
          <Accordion className="max-w-full">
            {faq.slice(Math.ceil(faq.length / 2)).map((item, i) => (
              <AccordionItem
                key={Math.ceil(faq.length / 2) + i}
                aria-label={item.question}
                title={item.question}
                classNames={{
                  content: "text-sm text-font-gray pb-4 text-left",
                  title: "text-sm sm:text-base text-left",
                }}
              >
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>
```

par :

```tsx
          <FaqAccordion items={faq.slice(0, Math.ceil(faq.length / 2))} />
          <FaqAccordion items={faq.slice(Math.ceil(faq.length / 2))} />
```

Les deux colonnes restent indépendantes (une réponse ouverte au plus par colonne : `DisclosureGroup` n'autorise qu'une ouverture par défaut). Le JSON-LD `FAQPage` de `page.tsx` n'est pas touché.

- [ ] **Step 5: Ajouter le minutage v2 du panneau dans `globals.css`**

Dans `src\app\globals.css`, remplacer :

```css
@utility bg-fade-left {
  background-image: linear-gradient(var(--fade-direction, to left), #F6F8FF, transparent);
}
```

par :

```css
@utility bg-fade-left {
  background-image: linear-gradient(var(--fade-direction, to left), #F6F8FF, transparent);
}

/*
 * FAQ answers (HeroUI v3 Accordion.Panel): the HeroUI v2 (framer-motion) timings measured on the
 * reference. Opening: height 300 ms (spring without bounce, approximated by this cubic-bezier)
 * and opacity 400 ms, starting 30 ms and 16 ms later, as v2 did. Closing: height and opacity
 * 300 ms. cubic-bezier(0, 0, 0.58, 1) is the "easeOut" curve of framer-motion.
 */
@utility faq-panel-transition {
  transition: height 300ms cubic-bezier(0, 0, 0.58, 1), opacity 300ms cubic-bezier(0, 0, 0.58, 1);

  &[data-expanded="true"] {
    transition: height 300ms cubic-bezier(0.29, 0.48, 0.03, 1) 30ms, opacity 400ms cubic-bezier(0, 0, 0.58, 1) 16ms;
  }
}
```

À l'ouverture, React Aria règle `--disclosure-panel-height` sur la hauteur du contenu et la transition s'applique ; à la fermeture, il attend la fin des transitions (`getAnimations()`) pour poser `hidden="until-found"`. Les transitions de l'utilitaire l'emportent sur celles de `.accordion__panel` (200 ms) et sur son `motion-reduce:transition-none`, comme la v2 animait toujours.

- [ ] **Step 6: Typage**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo
```

Attendu, exactement (`HomeView.tsx` n'est plus en erreur) :

```
      2 src/app/_components/CookieConsent.tsx
      2 src/app/_components/ServiceSection.tsx
      8 src/app/_components/navbar.tsx
      2 src/components/GoogleReviews.tsx
```

- [ ] **Step 7: Compiler le CSS et contrôler les classes ajoutées**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/task30 | tail -n 1 && node class-css-diff.mjs --ref-css runs/step2-css/after --cur-css runs/step2-css/task30 | grep -v "^  "; node css-rules.mjs --css runs/step2-css/task30 --grep ".faq-panel-transition" --grep "outline:revert" --grep "rotate:-90deg" | cut -c1-200
```

Attendu : `compiled src\app\globals.css: ... bytes` (environ 462 800 octets, soit environ 1 000 de plus qu'à la tâche 28), puis exactement ces lignes (le total `classes compared` peut varier de quelques unités) :

```
NEW CSS: [-webkit-tap-highlight-color:inherit]
NEW CSS: [box-shadow:none]
NEW CSS: [font-size:inherit]
NEW CSS: [font-weight:inherit]
NEW CSS: [line-height:inherit]
NEW CSS: [outline:revert]
NEW CSS: [transition:rotate_150ms_cubic-bezier(0.4,0,0.2,1)]
NEW CSS: bg-transparent
NEW CSS: border-solid
NEW CSS: data-[expanded=true]:-rotate-90
NEW CSS: faq-panel-transition
NEW CSS: flex-initial
CHANGED: flex-shrink-0
NEW CSS: justify-normal
NEW CSS: ms-0
NEW CSS: shrink
CHANGED: shrink-0
NEW CSS: size-[1em]
NEW CSS: static
NEW CSS: text-inherit
classes compared: 457, with a CSS difference: 20
```

puis :

```
grep ".faq-panel-transition": 2 rule(s)
  @layer utilities >> .faq-panel-transition { transition:height .3s ease-out,opacity .3s ease-out }
  @layer utilities >> .faq-panel-transition[data-expanded=true] { transition:height .3s cubic-bezier(.29,.48,.03,1) 30ms,opacity .4s ease-out 16ms }
grep "outline:revert": 1 rule(s)
  @layer utilities >> .\[outline\:revert\] { outline:revert }
grep "rotate:-90deg": 1 rule(s)
  @layer utilities >> .data-\[expanded\=true\]\:-rotate-90[data-expanded=true] { rotate:-90deg }
```

Lecture : toutes les lignes `NEW CSS` sont des classes ajoutées par cette tâche. `CHANGED: flex-shrink-0` et `CHANGED: shrink-0` ne changent que le regroupement des sélecteurs (`.flex-shrink-0,.shrink-0 { flex-shrink:0 }` devient deux règles identiques, à cause du nouvel utilitaire `shrink`). lightningcss écrit `cubic-bezier(0, 0, 0.58, 1)` sous son nom CSS `ease-out` (même courbe). Si une autre ligne `NEW CSS` apparaît (par exemple un mot d'un commentaire), corriger le commentaire.

Pas de commit (tâche 37).

---

### Task 31: Interrupteurs du bandeau cookies (`CookieConsent.tsx`, spec 6.4)

**Files:**
- Modify: `D:\Repos\macar-next-site-prod\src\app\_components\CookieConsent.tsx`

**Interfaces:**
- Consumes: `Switch` de `@heroui/react` 3.2.6 (`Switch` > `Switch.Content` > `Switch.Control` > `Switch.Thumb`, structure imposée depuis la 3.2.0) ; `runs/step2-css/task30` (tâche 30).
- Produces: le composant local `CookieSwitch` (mêmes props que `Switch`, sans `children`) ; trois interrupteurs `role="switch"` dans un `label` (sélecteur `label:has(input[role="switch"])` de l'exception 1), avec `[data-slot="switch-control"]` vert `#17C964` quand ils sont activés, y compris au survol et à l'appui.

- [ ] **Step 1: Constater l'état de départ**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep CookieConsent | cut -c1-140; git restore tsconfig.tsbuildinfo
```

Attendu, deux erreurs (lignes 92 et 110) : `src/app/_components/CookieConsent.tsx(92,19): error TS2322: Type '{ defaultSelected: true; "aria-label": string; size: "sm"; color: string; }' is not assignable to type 'IntrinsicAttributes & SwitchRootProps'.` et la même en `(110,19)`. La v3 n'a plus de prop `color` sur `Switch`.

- [ ] **Step 2: Ajouter `CookieSwitch`**

Dans `src\app\_components\CookieConsent.tsx`, remplacer :

```tsx
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

const USER_CONSENT_COOKIE_KEY = "macar_cookie_consent_is_true";
const USER_CONSENT_COOKIE_EXPIRE_DATE = 365;
```

par :

```tsx
import { ComponentProps, MouseEvent, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

const USER_CONSENT_COOKIE_KEY = "macar_cookie_consent_is_true";
const USER_CONSENT_COOKIE_EXPIRE_DATE = 365;

// HeroUI v3 Switch (structure required since 3.2.0). Checked colour: the HeroUI v2 "success"
// green, also on hover and press. The v3 focus style is replaced by the browser's native focus
// outline, as on the native checkbox rendered before.
const CookieSwitch = (props: Omit<ComponentProps<typeof Switch>, "children">) => (
  <Switch
    {...props}
    className="[--switch-control-bg-checked:#17C964] [--switch-control-bg-checked-hover:#17C964] [-webkit-tap-highlight-color:inherit]"
  >
    <Switch.Content className="[-webkit-tap-highlight-color:inherit]">
      <Switch.Control className="[box-shadow:none] in-data-focus-visible:[outline-style:auto] in-data-focus-visible:[outline-width:1px] in-data-focus-visible:[outline-color:-webkit-focus-ring-color]">
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Content>
  </Switch>
);
```

Les deux variables sont posées sur l'élément `.switch` lui-même (couche `utilities`), qui les redéclare dans la couche `components` : `:root` n'aurait aucun effet. `--switch-control-bg-checked-hover` sert aussi à l'appui (`switch.css`, états `pressed`). Le contour natif est posé sur `Switch.Control` quand `Switch.Content` (le `label`) porte `data-focus-visible`, car le focus est sur un `input` visuellement caché.

- [ ] **Step 3: Remplacer l'interrupteur « Essentiels »**

Dans `src\app\_components\CookieConsent.tsx`, remplacer :

```tsx
                <Switch
                  defaultSelected
                  aria-label="Essential Cookies"
```

par :

```tsx
                <CookieSwitch
                  defaultSelected
                  aria-label="Essential Cookies"
```

Les props suivantes (`size="sm"`, `isSelected`, `isDisabled`) restent telles quelles.

- [ ] **Step 4: Remplacer les deux interrupteurs « Analytics Cookies »**

Dans `src\app\_components\CookieConsent.tsx`, avec l'outil Edit et `replace_all: true` (deux occurrences identiques), remplacer :

```tsx
                <Switch
                  defaultSelected
                  aria-label="Analytics Cookies"
                  size="sm"
                  color="success"
                />
```

par :

```tsx
                <CookieSwitch
                  defaultSelected
                  aria-label="Analytics Cookies"
                  size="sm"
                />
```

`color="success"` disparaît (prop supprimée en v3, remplacée par les variables de l'étape 2). Le doublon `aria-label="Analytics Cookies"` est conservé (spec 6.4, ticket séparé).

- [ ] **Step 5: Typage et sources**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo; grep -c "<CookieSwitch" src/app/_components/CookieConsent.tsx; grep -c 'color="success"' src/app/_components/CookieConsent.tsx; grep -c "<Switch" src/app/_components/CookieConsent.tsx
```

Attendu :

```
      2 src/app/_components/ServiceSection.tsx
      8 src/app/_components/navbar.tsx
      2 src/components/GoogleReviews.tsx
3
0
4
```

(trois appels à `CookieSwitch`, plus aucun `color="success"`, et les 4 balises `<Switch`, `<Switch.Content`, `<Switch.Control`, `<Switch.Thumb` de `CookieSwitch` seulement).

- [ ] **Step 6: Compiler le CSS et contrôler les classes ajoutées**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/task31 | tail -n 1 && node class-css-diff.mjs --ref-css runs/step2-css/task30 --cur-css runs/step2-css/task31 | grep -v "^  "; node css-rules.mjs --css runs/step2-css/task31 --grep "switch-control-bg-checked:#" --grep "outline-style:auto" | cut -c1-200
```

Attendu : environ 463 300 octets, puis exactement :

```
NEW CSS: [--switch-control-bg-checked-hover:#17C964]
NEW CSS: [--switch-control-bg-checked:#17C964]
NEW CSS: in-data-focus-visible:[outline-color:-webkit-focus-ring-color]
NEW CSS: in-data-focus-visible:[outline-style:auto]
NEW CSS: in-data-focus-visible:[outline-width:1px]
classes compared: 462, with a CSS difference: 5
grep "switch-control-bg-checked:#": 1 rule(s)
  @layer utilities >> .\[--switch-control-bg-checked\:\#17C964\] { --switch-control-bg-checked:#17c964 }
grep "outline-style:auto": 1 rule(s)
  @layer utilities >> :where([data-focus-visible]) .in-data-focus-visible\:\[outline-style\:auto\] { outline-style:auto }
```

Une ligne `NEW CSS: ring` signalerait le mot `ring` dans un commentaire (défaut 4 du prototype) : le retirer.

Pas de commit (tâche 37).

---

### Task 32: Chips des pages service (`ServiceSection.tsx`, Server Component, spec 6.4)

**Files:**
- Modify: `D:\Repos\macar-next-site-prod\src\app\_components\ServiceSection.tsx`

**Interfaces:**
- Consumes: l'export `./chip` de `@heroui/react` 3.2.6 (`dist/components/chip/index.js` : `Chip` composé, `ChipLabel`, `ChipRoot`, `chipVariants` ; `chip.js` est marqué `"use client"`) ; `runs/step2-css/task31`.
- Produces: `ServiceSection.tsx` toujours sans `"use client"` ; chaque chip est un `span.chip` (pilule de 24 px, fond `hsl(var(--v2-primary)/0.1)`) contenant un `span.chip__label` (`text-primary font-medium`), rendus dans le HTML prérendu des 4 pages service.

Rendu de référence reproduit (styles calculés de `baseline`, `services-renovation__1280__default`) : racine en `flex` (élément flexible), `relative`, `px-1`, rayon `9999px`, fond `rgba(0, 111, 238, 0.1)`, couleur, taille (16 px), interligne (24 px) et graisse (400) hérités, `justify-between`, `whitespace-nowrap`, `flex-shrink: 1`, `gap: normal` ; libellé `flex-1 px-1`, `#006FEE`, graisse 500.

- [ ] **Step 1: Constater l'état de départ, et pourquoi l'import change**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep ServiceSection | cut -c1-120; git restore tsconfig.tsbuildinfo; grep -n '^import "client-only"' node_modules/react-aria-components/dist/exports/index.mjs; node --input-type=module -e "const m = await import('@heroui/react/chip'); console.log(Object.keys(m).sort().join(' '))"
```

Attendu :

```
src/app/_components/ServiceSection.tsx(41,17): error TS2322: Type '"flat"' is not assignable to type '"secondary" | "primary" | "soft" | "tertiary" | undefined'.
src/app/_components/ServiceSection.tsx(42,17): error TS2322: Type '"primary"' is not assignable to type '"default" | "success" | "accent" | "danger" | "warning" | undefined'.
69:import "client-only";
Chip ChipLabel ChipRoot chipVariants
```

Le point d'entrée `@heroui/react` réexporte `react-aria-components`, dont l'index importe `client-only` : importé depuis un Server Component, il fait échouer `next build` (mesuré : `'client-only' cannot be imported from a Server Component module`). L'export `@heroui/react/chip` ne charge que le Chip.

- [ ] **Step 2: Changer l'import**

Dans `src\app\_components\ServiceSection.tsx`, remplacer :

```tsx
import { Chip } from "@heroui/react";
```

par :

```tsx
import { Chip } from "@heroui/react/chip";
```

- [ ] **Step 3: Remplacer les chips**

Dans `src\app\_components\ServiceSection.tsx`, remplacer :

```tsx
            {chips.map((label) => (
              <Chip
                key={label}
                variant="flat"
                color="primary"
                size="sm"
                classNames={{
                  base: "bg-[hsl(var(--v2-primary)/0.1)]",
                  content: "text-primary font-medium",
                }}
              >
                {label}
              </Chip>
            ))}
```

par :

```tsx
            {chips.map((label) => (
              <Chip
                key={label}
                className="relative inline-flex items-center justify-between whitespace-nowrap shrink w-auto gap-[normal] px-1 py-0 rounded-full bg-[hsl(var(--v2-primary)/0.1)] text-inherit [font-size:inherit] [line-height:inherit] [font-weight:inherit]"
              >
                <Chip.Label className="flex-1 px-1 text-primary font-medium">{label}</Chip.Label>
              </Chip>
            ))}
```

Sur la racine, `shrink`, `w-auto`, `gap-[normal]`, `py-0`, `rounded-full`, `text-inherit` et les trois `[...:inherit]` annulent `shrink-0 w-fit gap-0.5 py-0.5 rounded-2xl text-xs leading-5 font-medium` et la couleur `--chip-fg` de `.chip` ; `px-1` remplace `px-2`. Sur le libellé, `px-1` remplace `px-0.5`. Les props `variant`, `color` et `size` ne sont plus passées (aucune n'a d'équivalent utile : tout le style vient des classes).

- [ ] **Step 4: Typage et compilation du CSS**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo; head -n 1 src/app/_components/ServiceSection.tsx; cd "../macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/task32 | tail -n 1 && node class-css-diff.mjs --ref-css runs/step2-css/task31 --cur-css runs/step2-css/task32 | grep -v "^  "
```

Attendu :

```
      8 src/app/_components/navbar.tsx
      2 src/components/GoogleReviews.tsx
import Image from "next/image";
compiled src\app\globals.css: ... bytes -> runs\step2-css\task32\globals.css
NEW CSS: gap-[normal]
NEW CSS: w-auto
classes compared: 464, with a CSS difference: 2
```

La première ligne du fichier n'est pas `"use client"` : `ServiceSection.tsx` reste un Server Component. Le rendu côté serveur est vérifié par le build de la tâche 37 et par le test « chips des pages service » à la tâche 38.

Pas de commit (tâche 37).

---

### Task 33: Cartes d'avis et avatar (`GoogleReviews.tsx`, spec 6.4)

**Files:**
- Modify: `D:\Repos\macar-next-site-prod\src\components\GoogleReviews.tsx`

**Interfaces:**
- Consumes: `Card` (`Card.Header`, `Card.Content`) et `Avatar` (`Avatar.Image`, `Avatar.Fallback`, sur `@radix-ui/react-avatar` 1.2.6) de `@heroui/react` 3.2.6 ; `runs/step2-css/task32` ; `step2-static-checks.mjs` (partie 3).
- Produces: la fonction `getInitials(name: string)` (premières lettres des deux premiers mots, en majuscules, comme l'attend `tests/reviews.spec.mjs`) ; cartes `div.card` carrées sans ombre ; `img[referrerpolicy="no-referrer"][alt=<auteur>]` dans un `span.avatar` de 32 px, et `[data-slot="avatar-fallback"]` avec les initiales tant que la photo n'est pas chargée (exception 3). Plus aucun `flex-shrink-*` dans le fichier.

Rendu de référence reproduit (`baseline`, `home__1280__default`) : carte `relative`, `overflow: hidden`, couleur `#11181C`, bordure 1 px `neutral-100`, fond `rgba(255, 255, 255, 0.8)`, flou de 4 px, sans padding, sans `gap`, sans rayon ni ombre ; en-tête en ligne, centré, `gap-2`, `px-4 pt-4 pb-1`, `z-index: 10` ; contenu en colonne, `flex-1`, `relative`, `text-left`, `pt-0 pb-2 pr-4 pl-4` ; avatar de 32 px, rond, sans fond, image en `flex`, `object-cover`, transition d'opacité de 150 ms.

- [ ] **Step 1: Constater l'état de départ**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep GoogleReviews | cut -c1-120; git restore tsconfig.tsbuildinfo; grep -c "flex-shrink-0" src/components/GoogleReviews.tsx
```

Attendu :

```
src/components/GoogleReviews.tsx(3,16): error TS2305: Module '"@heroui/react"' has no exported member 'CardBody'.
src/components/GoogleReviews.tsx(34,11): error TS2322: Type '{ src: string; name: string; size: "sm"; className: string; imgProps: { referrerPolicy: string; }; }' is not assignable to type 'IntrinsicAttributes & AvatarRootProps'.
5
```

- [ ] **Step 2: Changer l'import**

Dans `src\components\GoogleReviews.tsx`, remplacer :

```tsx
import { Card, CardBody, CardHeader, Avatar } from "@heroui/react";
```

par :

```tsx
import { Card, Avatar } from "@heroui/react";
```

- [ ] **Step 3: Réécrire la carte d'avis**

Dans `src\components\GoogleReviews.tsx`, remplacer :

```tsx
const CARD_BODY_HEIGHT = "10rem"; /* hauteur fixe pour éviter le déplacement au "Voir plus" */

function ReviewCard({ review, expanded, onToggle }: { review: GoogleReview; expanded: boolean; onToggle: () => void }) {
  const needsExpand = review.text.length > 180;
  return (
    <Card className="border border-neutral-100 bg-[rgb(255_255_255/0.8)] backdrop-blur-xs flex-shrink-0 w-review-card min-w-[260px] max-w-[400px] snap-start flex flex-col">
      <CardHeader className="flex gap-2 px-4 pt-4 pb-1 flex-shrink-0">
        <Avatar
          src={review.authorPhotoUrl}
          name={review.authorName}
          size="sm"
          className="flex-shrink-0 w-8 h-8"
          imgProps={{ referrerPolicy: "no-referrer" }}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-semibold text-headings text-sm truncate">{review.authorName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRating rating={review.rating} />
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0 pb-2 pr-4 pl-4! flex-1 min-h-0 flex flex-col">
        <div
          className="flex flex-col flex-shrink-0"
          style={{ minHeight: CARD_BODY_HEIGHT, maxHeight: CARD_BODY_HEIGHT }}
        >
          {expanded ? (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-font-gray text-sm leading-relaxed whitespace-pre-line">
              {review.text}
            </div>
          ) : (
            <p className="text-font-gray text-sm leading-relaxed whitespace-pre-line line-clamp-3">
              {review.text}
            </p>
          )}
          {needsExpand && (
            <button
              type="button"
              onClick={onToggle}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-accent1 hover:underline flex-shrink-0"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Voir moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Voir plus
                </>
              )}
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
```

par :

```tsx
const CARD_BODY_HEIGHT = "10rem"; /* hauteur fixe pour éviter le déplacement au "Voir plus" */

// Initials shown by Avatar.Fallback while the photo loads, or instead of a photo that fails.
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

// HeroUI v3 Card and Avatar. Their v3 default styles are overridden by the classes below to
// keep the HeroUI v2 rendering: square cards with no elevation, the padding of the application
// and a 32 px round avatar.
function ReviewCard({ review, expanded, onToggle }: { review: GoogleReview; expanded: boolean; onToggle: () => void }) {
  const needsExpand = review.text.length > 180;
  return (
    <Card
      tabIndex={-1}
      className="p-0 gap-[normal] rounded-none [box-shadow:none] overflow-hidden text-foreground border border-neutral-100 bg-[rgb(255_255_255/0.8)] backdrop-blur-xs shrink-0 w-review-card min-w-[260px] max-w-[400px] snap-start flex flex-col"
    >
      <Card.Header className="flex flex-row items-center justify-start gap-2 px-4 pt-4 pb-1 shrink-0 z-10 w-full">
        <Avatar size="sm" className="shrink-0 w-8 h-8 rounded-full bg-transparent">
          <Avatar.Image
            src={review.authorPhotoUrl}
            alt={review.authorName}
            referrerPolicy="no-referrer"
            className="static flex object-cover w-full h-full aspect-auto inset-auto duration-150"
          />
          <Avatar.Fallback>{getInitials(review.authorName)}</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-semibold text-headings text-sm truncate">{review.authorName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRating rating={review.rating} />
          </div>
        </div>
      </Card.Header>
      <Card.Content className="relative w-full text-left gap-[normal] pt-0 pb-2 pr-4 pl-4! flex-1 min-h-0 flex flex-col">
        <div
          className="flex flex-col shrink-0"
          style={{ minHeight: CARD_BODY_HEIGHT, maxHeight: CARD_BODY_HEIGHT }}
        >
          {expanded ? (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-font-gray text-sm leading-relaxed whitespace-pre-line">
              {review.text}
            </div>
          ) : (
            <p className="text-font-gray text-sm leading-relaxed whitespace-pre-line line-clamp-3">
              {review.text}
            </p>
          )}
          {needsExpand && (
            <button
              type="button"
              onClick={onToggle}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-accent1 hover:underline shrink-0"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Voir moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Voir plus
                </>
              )}
            </button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
```

Rôle des classes ajoutées :
- `Card` : `p-0`, `gap-[normal]`, `rounded-none` et `[box-shadow:none]` annulent `p-4 gap-3`, le rayon de 24 px et `shadow-surface` de `.card` ; `overflow-hidden` remplace `overflow-visible` ; `text-foreground` et `tabIndex={-1}` reprennent la Card v2 ; le fond `bg-[rgb(255_255_255/0.8)]` l'emporte sur `bg-surface` de `.card--default`.
- `Card.Header` : `flex-row` remplace `flex-col` de `.card__header` (avatar à côté du nom) ; `items-center justify-start z-10 w-full` sont les classes v2 qui s'appliquaient dans la référence.
- `Card.Content` : `gap-[normal]` annule `gap-1` de `.card__content` ; `relative w-full text-left` sont les classes v2 qui s'appliquaient dans la référence.
- `Avatar` : `rounded-full` et `bg-transparent` annulent `rounded-2xl` (`avatar--sm`) et `bg-default` ; `size="sm"` donne 32 px et le texte de 12 px des initiales.
- `Avatar.Image` : `static`, `inset-auto`, `aspect-auto` et `flex` annulent `absolute inset-0 aspect-square` de `.avatar__image` ; `duration-150` remet la transition d'opacité de la référence (150 ms au lieu de 250). `referrerPolicy` est aussi transmis au préchargement de Radix (`image.referrerPolicy`), donc aucune requête vers `lh3.googleusercontent.com` n'envoie de `Referer`.
- Les 5 `flex-shrink-0` deviennent `shrink-0` (renommage 5.3 reporté par la partie 3).

- [ ] **Step 4: Typage, sources et contrôles 8.3**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -o "^src/[^(]*" | sort | uniq -c; git restore tsconfig.tsbuildinfo; grep -rn "flex-shrink-" src | wc -l; cd "../macar-migration-tools" && node step2-static-checks.mjs --repo "../macar-next-site-prod" | cut -c1-110; echo "exit $?"
```

Attendu : `      8 src/app/_components/navbar.tsx` (seul fichier encore en erreur), `0`, puis :

```
ok   hero.ts removed
FAIL only Accordion, Avatar, Card, Chip, I18nProvider, Switch imported from @heroui/react: src/app/_components
FAIL no v2 prop classNames=: src/app/_components/navbar.tsx:74
ok   no v2 prop imgProps=
ok   no v2 title= on an accordion item
ok   no AccordionItem, CardHeader, CardBody, CardFooter element
ok   no heroui() plugin
ok   no @heroui/theme
ok   no v2 plugin variable --heroui-*
ok   no flex-shrink-* (renamed shrink-*)
10 checks, 2 failed
exit 0
```

(le `exit 0` est celui de `cut`). Les deux `FAIL` ne concernent plus que `navbar.tsx` (les 7 noms `Navbar*` et `classNames=`) : ils disparaissent avec les tâches de la partie 5.

- [ ] **Step 5: Compiler le CSS, contrôler les classes et garder le diff complet des composants**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-css/task33 | tail -n 1 && node class-css-diff.mjs --ref-css runs/step2-css/task32 --cur-css runs/step2-css/task33 | grep -v "^  "; node class-css-diff.mjs --ref-css runs/step2-css/after --cur-css runs/step2-css/task33 > runs/step2-css/diff-components.txt; tail -n 1 runs/step2-css/diff-components.txt
```

Attendu : environ 463 500 octets, puis exactement :

```
NEW CSS: aspect-auto
NEW CSS: duration-150
NO CSS ANY MORE: flex-shrink-0
NEW CSS: inset-auto
NEW CSS: p-0
NEW CSS: rounded-none
classes compared: 469, with a CSS difference: 6
classes compared: 469, with a CSS difference: 32
```

`diff-components.txt` (32 classes : les 30 classes `NEW CSS` des tâches 30 à 33, `NO CSS ANY MORE: flex-shrink-0` et `CHANGED: shrink-0`, regroupement de sélecteurs seulement) sert à la justification 8.2 de la PR de l'étape 2.

Pas de commit. **Les tâches de la partie 5 s'exécutent maintenant, puis la tâche 37 (partie 6) fait le commit de bascule.**

---

## Partie 5 : étape 2, Navbar reconstruite sans HeroUI (spec 7)

Cette partie couvre la section 7 de la spec (7.1 à 7.4) et la part Navbar des contrôles 8.1, 8.3 et 8.4. Elle réécrit `src/app/_components/navbar.tsx` sans aucun composant HeroUI, déplace les keyframes du menu dans `src/app/globals.css`, et ajoute au dossier des outils un contrôle de parité propre à la Navbar.

**Ordre d'exécution** :

- **Tâche 34** : dossier des outils seulement (`D:\Repos\macar-migration-tools`), avec le site de référence `ref-site` (partie 1, tâche 2). Elle peut s'exécuter à tout moment après la partie 1, et doit précéder la tâche 39. Elle committe dans le dépôt des outils.
- **Tâches 35 et 36** : dans le dépôt `D:\Repos\macar-next-site-prod`, après la tâche 28 (fondation), **sans commit** : le commit unique de la bascule est celui de la tâche 37 (décision de la partie 3). Elles s'enchaînent sans autre tâche entre elles, parce que la tâche 36 compare le CSS compilé à celui que la tâche 35 a enregistré avant toute modification. Elles ne touchent pas aux fichiers des tâches 30 à 33, sauf `globals.css`, où elles ajoutent un bloc à un endroit précis.
- **Tâche 39** : après la tâche 37 (commit de bascule), sur le build de production du dépôt.

Dans ce plan, les tâches 35 et 36 s'exécutent après les tâches 30 à 33 : le CSS compilé est donc plus gros que dans le prototype de cette partie (composants v3 compris) et le nombre de « classes compared » plus grand, mais les listes de classes attendues ne changent pas, et `tsc` ne signale plus aucune erreur une fois la Navbar écrite.

**Commandes** : les commandes `bash` se lancent dans l'outil Bash (Git Bash), les commandes `powershell` dans l'outil PowerShell. Les chemins contiennent une espace : ils sont toujours entre guillemets. Les fichiers dont le contenu complet est donné s'écrivent avec l'outil Write (lire d'abord le fichier s'il existe), les modifications partielles avec l'outil Edit. `npx tsc --noEmit` réécrit `tsconfig.tsbuildinfo`, qui est versionné : chaque commande `tsc` est suivie de `git restore tsconfig.tsbuildinfo`. Un serveur Next s'arrête toujours par son port (commande PowerShell des tâches), jamais en tuant la tâche de fond.

### Séquence v2 mesurée (référence de la spec 7.3)

Mesurée sur un build de production du commit `a37ed9e` (clone jetable, mêmes fichiers CSS que la référence : `61f72beef2126a12.css`...) et sur la Navbar v2 posée sur la fondation v3 (prototype de la fondation), avec `record.mjs` (partie 1) et le nouvel outil `navbar-check.mjs` (tâche 34), qui fige toutes les animations de la page au même instant pour comparer des images de l'ouverture.

| Phase | Ce que fait la v2 | Mesure |
|---|---|---|
| Ouverture, montage | le panneau est inséré dans la div `#navbar-menu-portal` (fixe, `top: 4rem`, `z-index: 9999`), dans un `FocusScope restoreFocus` | lien présent 9 à 26 ms après le clic (une image) |
| Ouverture, liste | animation CSS `navbar-menu-in` sur la liste : `opacity` 0 vers 1 et `translateY(-10px)` vers 0, 250 ms, `ease-out` | fin de l'opacité 239 à 257 ms, fin du glissement 256 à 273 ms après le clic |
| Ouverture, fond | transition CSS `background-color 0.25s ease` de la div de portail, de `transparent` à `#F6F8FF` ; pendant le fondu, ce voile se voit à travers la liste encore translucide, et seul dans la bande de 10 px du bas que la liste ne couvre pas encore | sans ce voile, les images `open__390__t025` à `t249` diffèrent sur toute la surface du panneau (42 000 à 304 000 pixels, mesuré) |
| Ouverture, hauteur | framer-motion anime `height` de 0 à `calc(100vh - 4rem)` en 300 ms | masquée par `min-h-[calc(100dvh-4rem)]` : aucune image ne change (spec 4) |
| Fermeture | `aria-pressed`, `aria-label` et l'icône changent tout de suite ; le panneau reste affiché tel quel (opacité 1, même position), puis disparaît d'un coup ; la transition du fond vers `transparent` se fait sous la liste, invisible | disparition 275 à 284 ms après le clic (8 enregistrements : 275 ; 276,3 ; 276,8 ; 277,2 ; 278,1 ; 279,2 ; 279,5 ; 283,7 ms) : sortie `AnimatePresence` de 250 ms, qui démarre à l'image suivant le clic |
| Réouverture pendant la fermeture | `AnimatePresence` réutilise le même élément, sans rejouer l'animation d'entrée | même élément, aucune animation (sonde `probe-reopen`, v2 et nouvelle Navbar) |

### Résultats du prototype

Prototype dans un clone jetable de la fondation (`proto\navbar`, à partir de `proto\step2-foundation`, commit `8a907f0`). Les autres composants y restent en HeroUI v2 par le bouchon de prototype de la partie 3 (alias npm `heroui-v2`) : seule la Navbar change entre l'avant et l'après. Port 3105.

| Contrôle | Résultat |
|---|---|
| `navbar-check.mjs` contre le build `a37ed9e` | 19 images identiques au pixel près (barre à 10 largeurs de 320 à 1920 px, panneau ouvert à 390 et 320 px, 7 images de l'ouverture de 0 à 249 ms) ; toutes les propriétés calculées (477 par élément, pas seulement les 129 du harnais, sur 331 éléments) et toutes les boîtes identiques, sauf 4 propriétés d'animation de la div de fond (écart 43) ; avec `--ignore` sur ces 4 propriétés : `navbar identical (images, styles)` |
| `navbar-check.mjs` deux fois sur le même build | identique (déterministe) |
| Captures du harnais (45, avant l'ajout de la page 404) contre `a37ed9e`, `--allow allow-step2.json` | `identical: 45`, `failed: 0` |
| `style-diff.mjs` contre `a37ed9e` | 2 éléments dans 1 groupe : la div de fond des captures `home__390__menu-open` et `home__320__menu-open` (les 4 propriétés d'animation) |
| `record.mjs` (menu, 390 px), 12 enregistrements | ouverture : opacité 235 à 248 ms, glissement 252 à 265 ms, montage 6 à 18 ms ; fermeture : 276 à 279 ms (9 fois) et 294 ms (3 fois, une image plus tard) ; toujours dans la tolérance de 50 ms |
| `tests/navbar.spec.mjs` (12) et `tests/navbar-scrollbar.spec.mjs` (2), `STEP=2` | 14 passed (la v2 passe aussi les 14) |
| Suite complète, `STEP=1` (autres composants encore en v2) | 32 passed, 1 skipped |
| Contrôles négatifs (build muté : règle de la barre de défilement, `usePreventScroll` et `FocusScope` retirés, sortie à 0 ms) | 4 tests échouent comme attendu (barre de défilement, défilement bloqué, les 2 tests de retour du focus) et `record.mjs` signale `OUT` (fermeture à 29 ms) |
| Clavier (sonde) | même parcours qu'en v2 : après Entrée le focus reste sur le bouton ; Tab va au logo mobile ; Tab depuis le dernier lien du panneau revient à l'élément qui suit le bouton (gestion du Tab de `FocusScope`) ; Espace sur le bouton ferme ; Échap ne fait rien |
| Typage, dépendances réelles (fondation `7f1cf05` sans bouchon + nouvelle Navbar) | 0 erreur dans `navbar.tsx` ; restent 8 erreurs dans `CookieConsent.tsx`, `HomeView.tsx`, `ServiceSection.tsx` et `GoogleReviews.tsx` (2 chacun, tâches 30 à 33) |
| `step2-static-checks.mjs` | aucune ligne ne cite plus `navbar.tsx` |
| Build | 33 pages statiques, aucune route `ƒ` |
| Console du navigateur | aucune erreur nouvelle (une 404 de ressource existe avant et après) |

### Écarts par rapport à la spec et précisions

Numérotation locale à cette partie ; dans le reste du plan, ces écarts sont cités par leur numéro global (liste en tête du plan).

1. **7.2, bouton menu** : il utilise `useToggleButton` de `react-aria` (le hook du `NavbarMenuToggle` v2, `@react-aria/button`), en plus de `usePreventScroll` et `FocusScope` cités par la spec. Le bouton garde ainsi exactement les attributs rendus par la v2 (`type="button"`, `tabindex="0"`, `data-react-aria-pressable="true"`, `aria-label`, `aria-pressed`), le même déclenchement au clavier (Entrée, Espace) et la même prise de focus à l'appui, y compris sur Safari iOS où un `<button>` natif ne prend pas le focus au toucher (ce focus est la cible du retour de focus de `FocusScope`). Aucune dépendance ajoutée : `react-aria` est déjà déclaré par la tâche 25.
2. **7.1, HTML valide** : la v2 rendait `ul > button` (bouton menu) et `ul > div` (logos). Chaque groupe est désormais `ul > li`. Les styles calculés et les boîtes de tous les éléments visibles sont identiques (mesuré), mais l'arbre d'accessibilité gagne trois `listitem` (autour du bouton menu, du logo mobile et du logo desktop). Libellés, états, rôles des liens et du bouton, et textes alternatifs sont inchangés.
3. **7.3, fond du panneau** : la liste est enveloppée, comme en v2, dans une div fixe (`top: 4rem`, à gauche, à droite et en bas à 0, `z-index: 9999`, fond `#F6F8FF`), rendue dans `document.body` par `createPortal`. Cette div est montée et démontée avec le panneau (la v2 la gardait en permanence, vide et transparente). Son apparition en fondu, qui était une transition, devient une animation CSS `navbar-backdrop-in` (250 ms, `ease`, de `transparent` à `#F6F8FF`) : les images de l'ouverture sont identiques à chaque instant, mais `animation-name`, `animation-duration`, `transition-property` et `transition-duration` diffèrent sur cette div seulement. Sans elle, les images de 25 à 249 ms diffèrent de la référence sur toute la surface du panneau (42 000 à 304 000 pixels sur 390 x 844, mesuré sur un build sans cette div) : la liste est encore translucide et le voile qui apparaît derrière elle compte dans chaque pixel.
4. **7.3, durée de montage après fermeture** : constante `MENU_EXIT_MS = 265` (les 250 ms de la sortie v2, plus l'image dont framer-motion retarde son départ). Avec 250 ms, la disparition se mesurait entre 255 et 276 ms, plus tôt que la v2 ; avec 265 ms, entre 276 et 279 ms dans 9 enregistrements sur 12, et à 294 ms (une image plus tard) dans les 3 autres, contre 275 à 284 ms en v2. Un écart d'une image (17 ms) reste sous la tolérance de 50 ms et n'est pas perceptible.
5. **7.1, classes** : seules les classes qui produisaient du CSS dans la référence sont reprises, relevées une par une dans le CSS rendu (sonde du prototype). Ne sont pas reprises : `z-40` du `<header>`, `w-6` du bouton, `basis-0 flex-grow` et les variantes `data-[justify=...]` des listes, `h-auto` et `inset-x-0` de la barre, `font-regular`, `text-medium`, `text-large`, `list-none`, `box-border`, `bg-transparent`, `no-underline` (aucune ne générait de CSS : les écrire les activerait et changerait le rendu). Sont retirées sans effet sur les styles calculés : les `!` du panneau, `pointer-events-auto` (le panneau n'a plus de parent en `pointer-events: none`), `data-[active=true]:bg-default-100` (jamais actif), `[&_span]:hidden!` (le `span` `sr-only` du toggle v2 n'existe plus). `2xl:px-4` produisait bien du CSS dans la référence : il est gardé. `flex-nowrap` (liste de la spec 7.1) est gardé : c'est la valeur initiale.
6. **Outils ajoutés** (hors contrat du harnais) : `navbar-check.mjs`, parce que le harnais ne capture la barre qu'à 1280, 390 et 320 px, ne compare que 129 propriétés et ne fige pas les images de l'animation ; et `tests/navbar-scrollbar.spec.mjs`, parce que la règle de la barre de défilement (7.4) est automatisable : en retirant l'option `--hide-scrollbars` que Playwright passe à Chromium, la page sans tête a une vraie barre de défilement (la partie 1 la classait en contrôle manuel).
7. **`style-diff.mjs`** : contre la référence, la Navbar n'ajoute que le groupe de la div de fond (écart 43), à justifier dans la PR comme différence sans effet visuel. Contre l'avant de la même étape (classes identiques ailleurs), l'appariement par chemin DOM décale les liens desktop d'un rang (le logo est maintenant le premier `li` de la liste) et produit des groupes de boîtes décalées : ce n'est pas un écart de rendu (`navbar-check.mjs` apparie par `href` et texte), mais il ne faut donc comparer la Navbar qu'à `baseline`, pas à un état intermédiaire.

### Ce que les autres parties doivent savoir

- **Fichiers** : `src/app/_components/navbar.tsx` est entièrement réécrit (export `NavBar` inchangé, importé tel quel par `layout.tsx`) ; `src/app/globals.css` reçoit un bloc `@theme` (animations `--animate-navbar-menu-in` et `--animate-navbar-backdrop-in`, keyframes `navbar-menu-in` et `navbar-backdrop-in`), placé juste avant le commentaire du bloc `:root` final.
- **Imports de `navbar.tsx`** : `react`, `react-dom` (`createPortal`), `next/link`, `react-aria` (`FocusScope`, `usePreventScroll`, `useToggleButton`), `lucide-react`, `./buttons`, `./icons/logo`. Rien de `@heroui/react` : `step2-static-checks.mjs` ne cite plus `navbar.tsx`.
- **Classes** : la barre et le panneau utilisent `border-[hsl(var(--v2-default-200)/0.5)]` (tâche 28) et `z-100`, `z-9999`. Le CSS compilé gagne `animate-navbar-backdrop-in`, `animate-navbar-menu-in`, `flex-nowrap`, `h-[calc(100vh-4rem)]`, `top-16`, `z-9999`, et perd `[&_span]:hidden!`, `data-[active=true]:bg-default-100`, `fixed!`, `left-0!`, `pointer-events-auto`, `right-0!`, `top-16!`, `transform`, `w-full!`, `z-9999!` (liste exacte à la tâche 36).
- **Suite Playwright** : `tests/navbar-scrollbar.spec.mjs` s'ajoute à `npx playwright test` : 40 tests au lieu de 38 (2 de plus qui passent à toutes les étapes ; 38 depuis l'ajout des tests des points d'attention aux tâches 8 et 9).
- **Vérification complète de l'étape 2** : contre `baseline`, la Navbar ne doit produire aucune différence de `compare.mjs`, et un seul groupe de `style-diff.mjs` (la div de fond, 2 éléments, 4 propriétés d'animation, écart 43). Les lignes `menu` de `record.mjs` restent sans `OUT`.

---

### Task 34: Contrôle de parité de la Navbar et référence de la barre

**Files:**
- Create: `D:\Repos\macar-migration-tools\navbar-check.mjs`
- Create: `D:\Repos\macar-migration-tools\tests\navbar-scrollbar.spec.mjs`
- Create: `D:\Repos\macar-migration-tools\baseline\navbar\` (19 PNG, `styles.json`, `animations.json`)
- Create: `D:\Repos\macar-migration-tools\aria-step2.json`

**Interfaces:**
- Consumes: `lib/common.mjs` (`FREEZE_SCRIPT`, `CONSENT_COOKIE`, `routeNetwork`, `stabilize`, `settle`, `parkMouse`, `parseArgs`, `readJson`, `writeJson`, `SEL`) et `tests/helpers.mjs` (`prepare`, `open`, `markMenuLinks`, `SEL`) de la partie 1 ; le build `ref-site` (commit `a37ed9e`, partie 1, tâche 2).
- Produces:
  - `node navbar-check.mjs --base <url> --out <dir> [--ref <dir>] [--ignore <[clé:]propriété,...>]` : images `bar__<largeur>.png` (10 largeurs), `panel__390.png`, `panel__320.png`, `open__390__t<ms>.png` (7 instants), `styles.json` (toutes les propriétés calculées et la boîte des éléments de la barre, repérés par `href`, `aria-label` et texte, et du panneau : `panel`, ses `li` et ses liens, `backdrop`), `animations.json` ; avec `--ref`, comparaison stricte et code 0 seulement sans différence.
  - `tests/navbar-scrollbar.spec.mjs` : 2 tests de la règle de la barre de défilement (spec 7.4), lancés par `npx playwright test`.
  - `baseline/navbar` : la référence de la Navbar pour la tâche 39.
  - `aria-step2.json` : les différences attendues de l'arbre d'accessibilité à l'étape 2 (écart 42), pour `aria-diff.mjs --expect` (tâche 40).

- [ ] **Step 1: Vérifier les préalables**

```bash
cd "D:/Repos/macar-migration-tools" && ls lib/common.mjs tests/helpers.mjs tests/navbar.spec.mjs baseline/captures.json ref-site/.next/BUILD_ID && ls navbar-check.mjs tests/navbar-scrollbar.spec.mjs baseline/navbar 2>&1 | grep -c "No such file"
```

Attendu : les cinq fichiers existent, puis `3` (les fichiers de cette tâche n'existent pas encore).

- [ ] **Step 2: Créer `navbar-check.mjs`**

Contenu complet (outil Write) :

```js
// node navbar-check.mjs --base <url> --out <dir> [--ref <dir>] [--ignore <[key:]prop,...>]
// Navbar parity check (spec 7.1 and 7.3), independent of the DOM structure:
// - bar__<width>.png: the bar at 10 widths around the md, lg and 2xl breakpoints (the harness
//   captures only 1280, 390 and 320);
// - panel__<width>.png: the open mobile menu at 390 and 320 (viewport);
// - open__390__t<ms>.png: the opening sequence, every animation of the page paused and set to
//   the same time t (CSS animations and transitions), so frames are deterministic;
// - styles.json: every computed property (not only the harness list) and the box of the bar
//   elements (nav, header, and each link or button with its content, keyed by href, label and
//   text, not by DOM path) and of the panel (list, items, links, and the fixed backdrop around
//   the list); animations.json: the animations running when the menu opens.
// With --ref, compares with a previous output: images pixel by pixel, styles property by property.
// Exit 0 only if nothing differs. --ignore skips a property everywhere (prop) or on one element (key:prop).
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { chromium } from "@playwright/test";
import { FREEZE_SCRIPT, CONSENT_COOKIE, routeNetwork, stabilize, settle, parkMouse, parseArgs, readJson, writeJson, SEL } from "./lib/common.mjs";

const args = parseArgs();
if (!args.base || !args.out) {
  console.error("usage: node navbar-check.mjs --base <url> --out <dir> [--ref <dir>] [--ignore <[key:]prop,...>]");
  process.exit(2);
}
const BASE = args.base.replace(/\/$/, "");
const OUT = path.resolve(args.out);
const IGNORE = new Set(args.ignore ? String(args.ignore).split(",") : []);
const BAR_WIDTHS = [320, 390, 767, 768, 1023, 1024, 1280, 1535, 1536, 1920];
const PANEL_SIZES = { 390: 844, 320: 568 };
const FRAME_TIMES = [0, 25, 50, 100, 150, 200, 249];
fs.mkdirSync(OUT, { recursive: true });
// Only the files written by this tool are replaced (never the rest of the output folder).
for (const f of fs.readdirSync(OUT)) if (/^(bar|panel|open)__.*\.png$|^(styles|animations)\.json$/.test(f)) fs.rmSync(path.join(OUT, f));

async function openPage(browser, width, height) {
  const context = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: 1, locale: "fr-BE", timezoneId: "Europe/Brussels",
    colorScheme: "light", reducedMotion: "no-preference",
  });
  await context.addInitScript(FREEZE_SCRIPT);
  await context.addCookies([{ ...CONSENT_COOKIE, url: BASE }]);
  await routeNetwork(context, BASE);
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await stabilize(page, { scrollThrough: false });
  return { context, page };
}

// In-page: computed styles of the bar or of the open panel, keyed independently of wrappers.
function probe(kind) {
  const dump = (el) => {
    const cs = getComputedStyle(el);
    const s = {};
    for (let i = 0; i < cs.length; i++) if (!cs[i].startsWith("--")) s[cs[i]] = cs.getPropertyValue(cs[i]);
    const b = el.getBoundingClientRect();
    return { rect: [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 100) / 100), style: s };
  };
  const visible = (el) => el.checkVisibility({ visibilityProperty: true });
  const out = {};
  const subtree = (anchorKey, el) => {
    // Descendants keyed by tag and rank among same-tag siblings, relative to the anchor.
    const walk = (node, key) => {
      const counts = {};
      for (const child of node.children) {
        const tag = child.tagName.toLowerCase();
        counts[tag] = (counts[tag] || 0) + 1;
        if (!visible(child)) continue;
        const k = `${key} > ${tag}:${counts[tag]}`;
        out[k] = dump(child);
        walk(child, k);
      }
    };
    out[anchorKey] = dump(el);
    walk(el, anchorKey);
  };
  if (kind === "bar") {
    const nav = document.querySelector("nav");
    out.nav = dump(nav);
    out.header = dump(nav.querySelector("header"));
    const seen = {};
    for (const el of nav.querySelectorAll("a, button")) {
      if (!visible(el)) continue;
      const text = el.tagName === "BUTTON" ? "" : el.textContent.trim();
      const id = `${el.tagName.toLowerCase()}[${el.getAttribute("href") || el.getAttribute("aria-label") || ""}] "${text}"`;
      seen[id] = (seen[id] || 0) + 1;
      subtree(`${id}#${seen[id]}`, el);
    }
  } else {
    const fixed = (el) => getComputedStyle(el).position === "fixed";
    const fixedList = (a) => { let e = a; while (e && !(e.tagName === "UL" && fixed(e))) e = e.parentElement; return e; };
    const link = [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Nous recrutons" && fixedList(a));
    const list = fixedList(link);
    subtree("panel", list);
    const backdrop = list.parentElement;
    if (backdrop !== document.body && fixed(backdrop)) out.backdrop = dump(backdrop);
  }
  return out;
}

const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
const styles = {};

for (const width of BAR_WIDTHS) {
  const { context, page } = await openPage(browser, width, width < 768 ? 844 : 800);
  await parkMouse(page);
  await page.screenshot({ path: path.join(OUT, `bar__${width}.png`), clip: { x: 0, y: 0, width, height: 72 } });
  styles[`bar@${width}`] = await page.evaluate(probe, "bar");
  await context.close();
}

for (const [width, height] of Object.entries(PANEL_SIZES).map(([w, h]) => [Number(w), h])) {
  const { context, page } = await openPage(browser, width, height);
  await page.locator(SEL.menuButton).click();
  await parkMouse(page);
  await settle(page);
  await page.screenshot({ path: path.join(OUT, `panel__${width}.png`) });
  styles[`panel@${width}`] = await page.evaluate(probe, "panel");
  await context.close();
}

// Opening sequence: pause every finite animation as soon as the menu animation exists.
{
  const { context, page } = await openPage(browser, 390, 844);
  await page.evaluate(() => {
    window.__menuAnimations = new Promise((resolve) => {
      const poll = () => {
        const all = document.getAnimations();
        if (!all.some((a) => a.animationName === "navbar-menu-in")) return requestAnimationFrame(poll);
        const finite = all.filter((a) => a.effect && a.effect.getComputedTiming().endTime !== Infinity && a.playState !== "finished");
        for (const a of finite) a.pause();
        window.__paused = finite;
        const role = (el) => (el.tagName === "UL" ? "list" : el.querySelector && el.querySelector("ul") ? "backdrop" : el.tagName.toLowerCase());
        resolve(finite.map((a) => ({
          role: role(a.effect.target),
          type: a.constructor.name,
          name: a.animationName || a.transitionProperty,
          duration: a.effect.getTiming().duration,
          easing: a.effect.getTiming().easing,
          keyframes: a.effect.getKeyframes().map(({ computedOffset, ...k }) => k),
        })));
      };
      requestAnimationFrame(poll);
    });
  });
  await page.locator(SEL.menuButton).click();
  const animations = await page.evaluate(() => window.__menuAnimations);
  writeJson(path.join(OUT, "animations.json"), animations);
  await parkMouse(page);
  for (const t of FRAME_TIMES) {
    await page.evaluate(async (time) => {
      for (const a of window.__paused) a.currentTime = time;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, t);
    await page.screenshot({ path: path.join(OUT, `open__390__t${String(t).padStart(3, "0")}.png`) });
  }
  await context.close();
}
await browser.close();
writeJson(path.join(OUT, "styles.json"), styles);
console.log(`navbar check written to ${OUT}`);

if (args.ref) {
  const REF = path.resolve(args.ref);
  let failures = 0;
  for (const f of fs.readdirSync(REF).filter((n) => n.endsWith(".png")).sort()) {
    const cur = path.join(OUT, f);
    if (!fs.existsSync(cur)) { console.log(`MISSING ${f}`); failures++; continue; }
    const a = PNG.sync.read(fs.readFileSync(path.join(REF, f)));
    const b = PNG.sync.read(fs.readFileSync(cur));
    if (a.width !== b.width || a.height !== b.height) { console.log(`SIZE ${f}: ${a.width}x${a.height} -> ${b.width}x${b.height}`); failures++; continue; }
    let n = 0, x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let i = 0; i < a.data.length; i += 4) {
      if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2] || a.data[i + 3] !== b.data[i + 3]) {
        n++;
        const p = i / 4, x = p % a.width, y = Math.floor(p / a.width);
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
    }
    if (n) { console.log(`PIXELS ${f}: ${n} px differ in [${x0},${y0}]-[${x1},${y1}]`); failures++; }
  }
  const ref = readJson(path.join(REF, "styles.json"));
  for (const cap of Object.keys(ref)) {
    const A = ref[cap], B = styles[cap] || {};
    for (const key of Object.keys(A)) {
      if (!B[key]) { console.log(`STYLE ${cap} ${key}: element missing`); failures++; continue; }
      const diffs = [];
      if (A[key].rect.join() !== B[key].rect.join()) diffs.push(`box ${A[key].rect.join(",")} -> ${B[key].rect.join(",")}`);
      for (const p of Object.keys(A[key].style)) {
        if (IGNORE.has(p) || IGNORE.has(`${key}:${p}`)) continue;
        if (A[key].style[p] !== B[key].style[p]) diffs.push(`${p}: ${A[key].style[p]} -> ${B[key].style[p]}`);
      }
      if (diffs.length) { console.log(`STYLE ${cap} ${key}\n    ${diffs.join("\n    ")}`); failures++; }
    }
    for (const key of Object.keys(B)) if (!A[key]) { console.log(`STYLE ${cap} ${key}: element added`); failures++; }
  }
  console.log(`animations ref: ${JSON.stringify(readJson(path.join(REF, "animations.json")))}`);
  console.log(`animations cur: ${JSON.stringify(readJson(path.join(OUT, "animations.json")))}`);
  console.log(failures ? `${failures} difference(s)` : "navbar identical (images, styles)");
  process.exit(failures ? 1 : 0);
}
```

- [ ] **Step 3: Créer `tests/navbar-scrollbar.spec.mjs`**

Contenu complet (outil Write) :

```js
// Spec 7.4: the menu closes on any width change of the bar, except the change caused by the
// scrollbar appearing or disappearing (same rule as the HeroUI v2 navbar). Needs real scrollbars:
// Playwright starts Chromium with --hide-scrollbars, removed here.
import { test, expect } from "@playwright/test";
import { prepare, open, markMenuLinks, SEL } from "./helpers.mjs";

test.use({ viewport: { width: 700, height: 800 }, launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

const scrollbarWidth = (page) => page.evaluate(() => window.innerWidth - document.documentElement.clientWidth);
const navWidth = (page) => page.evaluate(() => document.querySelector("nav").offsetWidth);

test.describe("menu mobile et barre de défilement", () => {
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("le blocage du défilement à l'ouverture ne ferme pas le menu", async ({ page }) => {
    await open(page, "/");
    expect(await scrollbarWidth(page)).toBeGreaterThan(0);
    const before = await navWidth(page);
    await page.locator(SEL.menuButton).click();
    await expect.poll(() => markMenuLinks(page)).toBe(7);
    await page.waitForTimeout(500);
    await expect(page.locator(SEL.menuButton)).toHaveAttribute("aria-pressed", "true");
    expect(await navWidth(page)).toBe(before);
  });

  test("une barre de défilement qui apparaît menu ouvert est ignorée", async ({ page }) => {
    await open(page, "/");
    // No scrollbar before opening: the bar takes the whole viewport width.
    await page.evaluate(() => { document.documentElement.style.overflowY = "hidden"; });
    expect(await scrollbarWidth(page)).toBe(0);
    const full = await navWidth(page);
    await page.locator(SEL.menuButton).click();
    await expect.poll(() => markMenuLinks(page)).toBe(7);
    // The scrollbar appears: the bar loses exactly the scrollbar width.
    await page.evaluate(() => { document.documentElement.style.overflowY = "scroll"; });
    const sb = await scrollbarWidth(page);
    expect(sb).toBeGreaterThan(0);
    expect(await navWidth(page)).toBe(full - sb);
    await page.waitForTimeout(500);
    await expect(page.locator(SEL.menuButton)).toHaveAttribute("aria-pressed", "true");
    expect(await markMenuLinks(page)).toBe(7);
  });
});
```

- [ ] **Step 4: Servir la référence sur le port 3100**

Vérifier que le port est libre :

```powershell
"listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False` (sinon arrêter le serveur avec la commande de l'étape 8). Puis lancer en arrière-plan (outil Bash avec `run_in_background: true` et `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-migration-tools/ref-site" && npx next start -p 3100
```

Et au premier plan :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/
```

Attendu : `200`.

- [ ] **Step 5: Produire la référence de la Navbar et prouver son déterminisme**

```bash
cd "D:/Repos/macar-migration-tools" && node navbar-check.mjs --base http://localhost:3100 --out baseline/navbar && ls baseline/navbar | wc -l && node navbar-check.mjs --base http://localhost:3100 --out runs/navbar-ref-check --ref baseline/navbar | grep -v "^animations"; echo "exit ${PIPESTATUS[0]}"
```

Attendu (environ 30 s par exécution) : `navbar check written to D:\Repos\macar-migration-tools\baseline\navbar`, `21`, puis `navbar check written to ...\runs\navbar-ref-check`, `navbar identical (images, styles)` et `exit 0`.

- [ ] **Step 6: Lire les animations de la v2**

```bash
cd "D:/Repos/macar-migration-tools" && node -e "for (const a of require('./baseline/navbar/animations.json')) console.log(a.role, a.type, a.name, a.duration + ' ms', 'timing ' + a.easing, 'keyframes ' + a.keyframes[0].easing, JSON.stringify(a.keyframes.map(({ offset, easing, composite, ...v }) => v)))"
```

Attendu, exactement :

```
backdrop CSSTransition background-color 250 ms timing ease keyframes linear [{"backgroundColor":"rgba(0, 0, 0, 0)"},{"backgroundColor":"rgb(246, 248, 255)"}]
list CSSAnimation navbar-menu-in 250 ms timing linear keyframes ease-out [{"opacity":"0","transform":"translateY(-10px)"},{"opacity":"1","transform":"translateY(0px)"}]
```

C'est la séquence d'ouverture que la tâche 36 reproduit (la hauteur animée par framer-motion n'apparaît pas : elle est animée en JavaScript, et masquée par la hauteur minimale).

- [ ] **Step 7: Lancer la spécification de la barre de défilement sur la référence**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 npx playwright test tests/navbar-scrollbar.spec.mjs 2>&1 | tail -n 2
```

Attendu : `2 passed`. Ces deux tests décrivent la v2 : s'ils échouent sur la référence, c'est le test qui est faux. Ils vérifient eux-mêmes qu'une barre de défilement de largeur non nulle est bien affichée (`toBeGreaterThan(0)`), sans quoi ils ne prouveraient rien.

- [ ] **Step 8: Arrêter le serveur de référence**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`.

- [ ] **Step 9: Créer `aria-step2.json`**

La Navbar reconstruite change l'arbre d'accessibilité de deux façons, mesurées sur l'état complet de l'étape 2 (écart 42) : un `listitem` de plus par groupe visible de la barre (`ul > li`), et, menu ouvert, le panneau qui précède l'annonceur de route de Next (`alert` vide) au lieu de le suivre. Ce sont les seules différences attendues ; `aria-diff.mjs` compare ligne à ligne, la tâche 40 vérifie donc aussi leur nombre exact (77).

```json
[
  {
    "captures": ".",
    "change": "+",
    "line": "^- listitem:$",
    "reason": "Écart 42 : chaque groupe de la barre devient ul > li (HTML valide), un listitem de plus par groupe visible"
  },
  {
    "captures": "__menu-open$",
    "change": "+",
    "line": "^- alert$",
    "reason": "Écart 42 : menu ouvert, le panneau précède l'annonceur de route de Next (alert vide) au lieu de le suivre"
  },
  {
    "captures": "__menu-open$",
    "change": "-",
    "line": "^- alert$",
    "reason": "Écart 42 : menu ouvert, le panneau précède l'annonceur de route de Next (alert vide) au lieu de le suivre"
  }
]
```

Vérifier que le fichier se lit et qu'il ne masque rien sur la référence (sur une copie, pour ne rien écrire dans `baseline`) :

```bash
cd "D:/Repos/macar-migration-tools" && rm -rf runs/aria-self && mkdir -p runs/aria-self && cp -r baseline/aria runs/aria-self/ && node aria-diff.mjs --ref baseline --cur runs/aria-self --expect aria-step2.json; echo "exit $?"
```

Attendu : `aria differences: 0 unexpected, 0 expected`, trois lignes `expect entry never used: Écart 42 : ...` (normal sur la référence), la ligne `full report: ...`, puis `exit 0`.

- [ ] **Step 10: Committer**

```bash
cd "D:/Repos/macar-migration-tools" && git add navbar-check.mjs tests/navbar-scrollbar.spec.mjs baseline/navbar aria-step2.json && git commit -F - <<'EOF'
Add the navbar parity check, its reference and the expected accessibility differences

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
git status --porcelain | wc -l
```

Attendu : un commit de 24 fichiers, puis `0`.

---

### Task 35: Keyframes du menu mobile dans `globals.css` (spec 7.3)

**Files:**
- Modify: `D:\Repos\macar-next-site-prod\src\app\globals.css`

**Interfaces:**
- Consumes: `globals.css` écrit par la tâche 26 (partie 3) ; `css-compile.mjs` et `class-css-diff.mjs` (tâche 24).
- Produces: les utilitaires `animate-navbar-menu-in` (`navbar-menu-in 0.25s ease-out`) et `animate-navbar-backdrop-in` (`navbar-backdrop-in 0.25s ease`), utilisés par la tâche 36. Tant qu'aucune classe ne les emploie, Tailwind n'émet ni la variable ni les keyframes : le CSS compilé ne change pas.

- [ ] **Step 1: Constater l'état de départ et compiler le CSS de référence des tâches 35 et 36**

```bash
cd "D:/Repos/macar-next-site-prod" && grep -c "navbar-menu-in" src/app/globals.css src/app/_components/navbar.tsx; cd "../macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-navbar-css/before | tail -n 1
```

Attendu : `src/app/globals.css:0` et `src/app/_components/navbar.tsx:2` (les keyframes sont encore dans la balise `<style>` en ligne de la Navbar v2), puis `compiled src\app\globals.css: ... bytes -> runs\step2-navbar-css\before\globals.css` (environ 463 500 octets avec `@heroui/styles` et les composants v3).

- [ ] **Step 2: Ajouter le bloc `@theme` des animations (outil Edit)**

Dans `src\app\globals.css`, remplacer :

```css
/*
 * Outside any layer, so it wins over the HeroUI v3 variables (declared in a sub-layer of theme).
```

par :

```css
/*
 * Mobile menu of the navbar, same opening as the v2 menu: the list fades in and slides down,
 * the page colour fades in behind it (formerly a transition on the hand-made portal).
 */
@theme {
  --animate-navbar-menu-in: navbar-menu-in 0.25s ease-out;
  --animate-navbar-backdrop-in: navbar-backdrop-in 0.25s ease;

  @keyframes navbar-menu-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes navbar-backdrop-in {
    from {
      background-color: transparent;
    }
  }
}

/*
 * Outside any layer, so it wins over the HeroUI v3 variables (declared in a sub-layer of theme).
```

- [ ] **Step 3: Vérifier que le CSS compilé ne change pas encore**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-navbar-css/task35 | tail -n 1 && cmp runs/step2-navbar-css/before/globals.css runs/step2-navbar-css/task35/globals.css && echo "compiled CSS unchanged"; grep -c "navbar-menu-in" runs/step2-navbar-css/task35/globals.css
```

Attendu : `compiled ...`, `compiled CSS unchanged`, puis `0` : les animations de thème ne sont émises que si une classe `animate-navbar-*` les utilise (tâche 36). Le prototype a obtenu exactement le même fichier (461 736 octets) avant et après ce bloc.

Pas de commit (commit unique de la tâche 37).

---

### Task 36: Navbar sans HeroUI (spec 7.1 à 7.4)

**Files:**
- Modify (réécriture complète): `D:\Repos\macar-next-site-prod\src\app\_components\navbar.tsx`

**Interfaces:**
- Consumes: `NavLink` et `PrimaryButton` (`./buttons`, inchangés), `Logo` (`./icons/logo`, inchangé), `FocusScope`, `usePreventScroll` et `useToggleButton` de `react-aria` 3.52.1 (déclaré par la tâche 25), `createPortal` de `react-dom`, les utilitaires de la tâche 35, la classe `border-[hsl(var(--v2-default-200)/0.5)]` (tâche 28).
- Produces: l'export `NavBar` (même nom, sans props), rendu par `src/app/layout.tsx` sans changement. Structure : `<nav>` collant > `<header>` > 4 listes `ul > li` (bouton menu, logo mobile, logo et 6 liens desktop, « Demander un devis ») ; panneau monté dans `document.body` : div fixe de fond > `FocusScope restoreFocus` > `ul` fixe (6 liens et le devis).

- [ ] **Step 1: Constater les erreurs de la Navbar v2**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -c "^src/app/_components/navbar.tsx"; git restore tsconfig.tsbuildinfo; cd "../macar-migration-tools" && node step2-static-checks.mjs --repo "../macar-next-site-prod" | grep -c "navbar.tsx"
```

Attendu : `8` (imports `Navbar*` absents de la v3), puis `2` (lignes `FAIL` des contrôles « only Accordion, Avatar, Card, Chip, I18nProvider, Switch imported from @heroui/react » et « no v2 prop classNames= », qui citent `navbar.tsx`).

- [ ] **Step 2: Écrire `src\app\_components\navbar.tsx`**

Lire le fichier actuel, puis le remplacer en entier (outil Write) par :

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FocusScope, usePreventScroll, useToggleButton } from "react-aria";
import { Menu, X } from "lucide-react";
import { NavLink, PrimaryButton } from "./buttons";
import { Logo } from "./icons/logo";

const menuItems = [
    { name: "Accueil", href: "/" },
    { name: "Découvrez Macar", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/#faq" },
    { name: "Nous recrutons", href: "/job" },
];

// After closing, the panel stays on screen this long, then disappears at once, like the v2 menu:
// its 0.25 s exit animation was hidden by the min-height and started one frame after the click
// (v2 recordings: removed 275 to 284 ms after the click).
const MENU_EXIT_MS = 265;

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPanelMounted, setIsPanelMounted] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    if (isMenuOpen && !isPanelMounted) setIsPanelMounted(true);

    useEffect(() => {
        if (isMenuOpen || !isPanelMounted) return;
        const timer = window.setTimeout(() => setIsPanelMounted(false), MENU_EXIT_MS);
        return () => window.clearTimeout(timer);
    }, [isMenuOpen, isPanelMounted]);

    usePreventScroll({ isDisabled: !isMenuOpen });

    // Same rule as the v2 navbar: any width change of the bar closes the menu, except the
    // change caused by the scroll bar appearing or disappearing.
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        let prevWidth = nav.offsetWidth;
        const observer = new ResizeObserver(() => {
            const currentWidth = nav.offsetWidth;
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (currentWidth && currentWidth + scrollbarWidth === prevWidth) return;
            if (currentWidth !== prevWidth) {
                prevWidth = currentWidth;
                setIsMenuOpen(false);
            }
        });
        observer.observe(nav);
        return () => observer.disconnect();
    }, []);

    const label = isMenuOpen ? "Fermer le menu" : "Ouvrir le menu";
    const { buttonProps } = useToggleButton(
        { "aria-label": label },
        {
            isSelected: isMenuOpen,
            defaultSelected: false,
            setSelected: setIsMenuOpen,
            toggle: () => setIsMenuOpen(!isMenuOpen),
        },
        toggleRef,
    );
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav
            ref={navRef}
            className="sticky top-0 z-100 flex w-full min-h-0 items-center justify-center bg-background border-b border-[hsl(var(--v2-default-200)/0.5)]"
        >
            <header className="relative flex flex-row flex-nowrap items-center justify-between gap-4 w-full max-w-full md:max-w-[1600px] px-4 md:px-16 2xl:px-4 h-16">
                <ul className="flex flex-row items-center gap-4 h-full md:hidden">
                    <li className="flex h-full">
                        <button
                            {...buttonProps}
                            ref={toggleRef}
                            className="flex items-center justify-center h-full"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </li>
                </ul>

                <ul className="flex flex-row items-center gap-4 h-full md:hidden">
                    <li className="flex flex-row justify-start items-center whitespace-nowrap">
                        <Link href="/" onClick={closeMenu}>
                            <Logo iconOnly={false} width={120} />
                        </Link>
                    </li>
                </ul>

                <ul className="hidden md:flex flex-row items-center gap-6 h-full">
                    <li className="flex flex-row justify-start items-center whitespace-nowrap">
                        <Link href="/">
                            <Logo iconOnly={false} customClasses="hidden lg:inline" />
                            <Logo iconOnly={false} width={120} customClasses="inline lg:hidden" />
                        </Link>
                    </li>
                    {menuItems.map((item) => (
                        <li key={item.href} className="items-center whitespace-nowrap">
                            <NavLink href={item.href} content={item.name} />
                        </li>
                    ))}
                </ul>

                <ul className="hidden md:flex flex-row items-center gap-4 h-full">
                    <li className="whitespace-nowrap">
                        <PrimaryButton href="/#contact" content="Demander un devis" />
                    </li>
                </ul>
            </header>

            {isPanelMounted &&
                createPortal(
                    <div className="fixed top-16 right-0 bottom-0 left-0 z-9999 bg-background animate-navbar-backdrop-in">
                        <FocusScope restoreFocus>
                            <ul className="fixed top-16 right-0 bottom-0 left-0 z-9999 flex flex-col gap-1 w-full max-w-full h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] overflow-y-auto pt-4 pb-6 px-4 bg-background border-b border-[hsl(var(--v2-default-200)/0.5)] shadow-lg animate-navbar-menu-in">
                                {menuItems.map((item) => (
                                    <li key={item.href} className="min-h-[44px] py-0 rounded-lg">
                                        <Link
                                            className="flex items-center w-full min-h-[44px] px-4 text-base text-foreground hover:text-accent1 active:bg-default-100 rounded-lg transition-colors"
                                            href={item.href}
                                            onClick={closeMenu}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                                <li className="min-h-[44px] py-0 rounded-lg pt-2 mt-2 border-t border-default-200">
                                    <Link
                                        className="flex items-center justify-center w-full min-h-[44px] px-4 rounded-lg bg-accent1 text-background font-medium text-base active:opacity-90"
                                        href="/#contact"
                                        onClick={closeMenu}
                                    >
                                        Demander un devis
                                    </Link>
                                </li>
                            </ul>
                        </FocusScope>
                    </div>,
                    document.body,
                )}
        </nav>
    );
};
```

Repères de lecture (à vérifier contre la spec, pas à recopier) :
- **7.1** : classes de la barre et du `<header>` = classes qui produisaient du CSS dans la référence ; desktop : logo et 6 liens dans le même `ul` en `gap-6` ; mobile : bouton à gauche, logo de 120 px à droite (deux listes aux extrémités du `justify-between`).
- **7.2** : `useToggleButton` donne `aria-pressed`, `type="button"` et la gestion de l'appui de la v2 ; `aria-label` « Ouvrir le menu » ou « Fermer le menu » ; icônes `Menu` et `X` de 24 px.
- **7.3** : `createPortal` dans `document.body` ; panneau monté tant que le menu est ouvert, puis 265 ms après la fermeture ; liste `fixed top-16`, `flex flex-col gap-1`, `overflow-y-auto`, `max-w-full`, hauteur `calc(100vh - 4rem)` et minimum `calc(100dvh - 4rem)`, `pt-4 pb-6 px-4`, bordure basse, `shadow-lg`, `z-9999`.
- **7.4** : `usePreventScroll` tant que le menu est ouvert ; `FocusScope restoreFocus` sans `contain` ; fermeture au clic sur un lien du panneau et sur le logo mobile ; fermeture à tout changement de largeur de la barre, sauf la variation due à la barre de défilement (même calcul que `useNavbar` v2 : `currentWidth + scrollbarWidth === prevWidth` est ignoré, et `prevWidth` n'est alors pas mis à jour) ; aucune gestion d'Échap.

- [ ] **Step 3: Vérifier le typage et les contrôles de source**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit 2>&1 | grep -c "^src/app/_components/navbar.tsx"; git restore tsconfig.tsbuildinfo; grep -cE "@heroui|createElement|dangerouslySetInnerHTML|navbar-menu-portal|classNames" src/app/_components/navbar.tsx; grep -o "border-\[hsl(var(--v2-default-200)/0.5)\]" src/app/_components/navbar.tsx | wc -l; cd "../macar-migration-tools" && node step2-static-checks.mjs --repo "../macar-next-site-prod" | grep -c "navbar.tsx"
```

Attendu : `0` (plus aucune erreur de typage dans la Navbar ; les tâches 30 à 33 étant faites, `npx tsc --noEmit` ne signale plus aucune erreur dans le dépôt, et `node step2-static-checks.mjs` affiche `10 checks, 0 failed`), `0` (ni HeroUI, ni portail fait main, ni `<style>` en ligne), `2` (bordure de la barre et du panneau), puis `0` (aucun contrôle de la spec 8.3 ne cite plus la Navbar).

- [ ] **Step 4: Comparer le CSS compilé par classe avec l'avant (spec 8.2)**

```bash
cd "D:/Repos/macar-migration-tools" && node css-compile.mjs --repo "../macar-next-site-prod" --out runs/step2-navbar-css/task36 | tail -n 1 && node class-css-diff.mjs --ref-css runs/step2-navbar-css/before --cur-css runs/step2-navbar-css/task36 > runs/step2-navbar-css/diff-task36.txt; echo "exit $?"; grep -v "^  " runs/step2-navbar-css/diff-task36.txt
```

Attendu : `exit 1`, puis exactement ces 16 classes :

```
NO CSS ANY MORE: [&_span]:hidden!
NEW CSS: animate-navbar-backdrop-in
NEW CSS: animate-navbar-menu-in
NO CSS ANY MORE: data-[active=true]:bg-default-100
NO CSS ANY MORE: fixed!
NEW CSS: flex-nowrap
NEW CSS: h-[calc(100vh-4rem)]
NO CSS ANY MORE: left-0!
NO CSS ANY MORE: pointer-events-auto
NO CSS ANY MORE: right-0!
NEW CSS: top-16
NO CSS ANY MORE: top-16!
NO CSS ANY MORE: transform
NO CSS ANY MORE: w-full!
NEW CSS: z-9999
NO CSS ANY MORE: z-9999!
classes compared: 474, with a CSS difference: 16
```

(Le total `classes compared` est indicatif et peut varier de quelques unités ; la différence doit être 16.)

Justification (à reprendre dans la PR) : les classes `!` du panneau v2 sont remplacées par les mêmes classes sans `!` (plus de styles HeroUI à surcharger) ; `pointer-events-auto`, `data-[active=true]:bg-default-100` et `[&_span]:hidden!` n'ont plus d'objet (écart 45) ; `transform` n'était compilée que parce que le mot apparaissait dans la balise `<style>` en ligne de l'ancienne Navbar (aucun élément ne porte cette classe : `baseline/classes.json`) ; `flex-nowrap` est la valeur initiale ; `h-[calc(100vh-4rem)]` remplace la hauteur en ligne que posait framer-motion ; `top-16`, `z-9999` et les deux `animate-*` sont les classes du nouveau panneau. Le rendu de tous ces éléments est contrôlé par la tâche 39. Si l'une des tâches 30 à 33 s'est glissée entre la tâche 35 et cette étape, d'autres lignes apparaissent : refaire alors les tâches 35 (étape 1) et 36 (étape 4) dans l'ordre.

- [ ] **Step 5: Vérifier la portée des changements**

```bash
cd "D:/Repos/macar-next-site-prod" && git diff --stat -- src/app/_components/navbar.tsx | tail -n 1; grep -cE "navbar-menu-in|navbar-backdrop-in" src/app/globals.css
```

Attendu : `1 file changed, 121 insertions(+), 120 deletions(-)` pour `navbar.tsx` (réécriture complète par rapport au commit de l'étape 1), puis `4` (les deux variables et les deux keyframes de la tâche 35).

Pas de commit (commit unique de la tâche 37). La tâche 37 contrôle ensuite le typage complet, les contrôles 8.3, le build et les collisions de classes.

---

## Partie 6 : bascule, vérification complète et PR de l'étape 2

Cette partie réunit le commit unique de la bascule (tâche 37, décidé en partie 3), les contrôles des composants et de la Navbar sur ce commit (tâches 38 et 39, rédigés avec les parties 4 et 5), puis la vérification complète de l'étape 2 contre la référence (tâche 40 : spec 8.1 à 8.3) et la PR (tâche 41 : spec 8.4 et 8.5).

**Point de départ** : l'arbre de travail après la tâche 36, qui contient sans commit toutes les modifications des tâches 25 à 28, 30 à 33, 35 et 36.

**Attendus mesurés sur l'état complet.** Les tâches 38 et 39 ont été rédigées sur des prototypes partiels (Navbar v2 dans l'un, composants v2 dans l'autre). L'assembleur du plan a construit l'état complet à partir du code de ce plan et l'a mesuré contre la référence : les attendus des tâches 38 à 40 sont ceux de cette mesure. Différences avec les prototypes partiels : `style-diff.mjs` signale toujours le groupe de la `div` de fond du menu (écart 43), aussi à la tâche 38 ; la ligne `faq open: opacity` de `record.mjs` est à la limite de la tolérance (-50 ms mesuré, -58 ms sur un autre prototype), donc parfois `OUT` : c'est `curve-diff.mjs` qui juge la FAQ.

**Corrections** : une différence trouvée par les tâches 38 à 40 se corrige dans un commit séparé (qui compile), puis on relance la tâche qui l'a trouvée et la tâche 40 en entier.

### Task 37: Bascule complète : contrôles et commit unique (à exécuter après les tâches 30 à 33, 35 et 36)

**Files:**
- Commit (déjà modifiés par les tâches 25 à 36) : `package.json`, `package-lock.json`, `hero.ts` (supprimé), `src/app/globals.css`, `src/app/providers.tsx`, `src/app/_components/navbar.tsx`, `src/app/_components/HomeView.tsx`, `src/app/_components/faqKeyboard.ts` (créé), `src/app/_components/CookieConsent.tsx`, `src/app/_components/ServiceSection.tsx`, `src/components/GoogleReviews.tsx`, `src/app/_components/ServiceDetailBody.tsx`, `src/app/services/page.tsx`, `src/app/zones/[slug]/page.tsx`, `src/app/_components/buttons.tsx`, `src/app/_components/footer.tsx`, `src/components/ui/button.tsx`

**Interfaces:**
- Consumes: l'arbre de travail après la tâche 36 (tâches 25 à 28, 30 à 33, 35 et 36 appliquées, sans commit ; suppression de `hero.ts` déjà indexée par la tâche 26) ; `step2-static-checks.mjs` et `layer-collisions.mjs` (tâche 24).
- Produces: le premier commit de l'étape 2, qui compile ; il sert de point de départ à la vérification complète de l'étape 2 (spec 8.1 à 8.4) et à la PR.

- [ ] **Step 1: Contrôles de source de la spec 8.3**

```bash
cd "D:/Repos/macar-migration-tools" && node step2-static-checks.mjs --repo "../macar-next-site-prod"; echo "exit $?"
```

Attendu : dix lignes `ok`, `10 checks, 0 failed` et `exit 0`. Si la ligne `no flex-shrink-* (renamed shrink-*)` échoue sur `src/components/GoogleReviews.tsx`, remplacer dans chaque ligne citée la classe `flex-shrink-0` par `shrink-0` (outil Edit), puis relancer. Toute autre ligne `FAIL` renvoie à la tâche du composant concerné.

- [ ] **Step 2: Typage**

```bash
cd "D:/Repos/macar-next-site-prod" && npx tsc --noEmit; echo "tsc exit $?"; git restore tsconfig.tsbuildinfo
```

Attendu : aucune erreur, `tsc exit 0`.

- [ ] **Step 3: Lockfile**

```bash
cd "D:/Repos/macar-next-site-prod" && node -e 'const l=require("./package-lock.json");for(const k of ["@heroui/react","@heroui/styles","@heroui/theme","react-aria","react-aria-components","tailwind-variants","tailwind-merge","tailwindcss","@tailwindcss/oxide-linux-x64-gnu","lightningcss-linux-x64-gnu","framer-motion"]){const p=l.packages["node_modules/"+k];console.log(k+" "+(p?p.version:"absent"))};console.log("tailwindcss copies: "+Object.keys(l.packages).filter(k=>/(^|\/)node_modules\/tailwindcss$/.test(k)).length)'
```

Attendu, ligne par ligne :

```
@heroui/react 3.2.6
@heroui/styles 3.2.6
@heroui/theme absent
react-aria 3.52.1
react-aria-components 1.21.1
tailwind-variants 3.3.1
tailwind-merge 3.7.0
tailwindcss 4.3.3
@tailwindcss/oxide-linux-x64-gnu 4.3.3
lightningcss-linux-x64-gnu 1.32.0
framer-motion 11.18.2
tailwindcss copies: 1
```

(la même liste qu'après la tâche 25 : les tâches 30 à 36 n'ajoutent aucun paquet ; `react-aria` sert à `usePreventScroll` et `FocusScope` de la Navbar).

- [ ] **Step 4: Build de production**

```bash
cd "D:/Repos/macar-next-site-prod" && npm run build > ../macar-migration-tools/runs/step2-css/build.txt 2>&1; echo "build exit $?"; grep -E "Next.js|Compiled|rror|Generating static pages \(33/33\)" ../macar-migration-tools/runs/step2-css/build.txt; grep -c "ƒ" ../macar-migration-tools/runs/step2-css/build.txt
```

Attendu : `build exit 0`, `▲ Next.js 15.5.25`, `✓ Compiled successfully`, `✓ Generating static pages (33/33)`, puis `0` : aucune route dynamique (`ƒ`), la locale fixe de `providers.tsx` ne lit pas `headers()` (spec 6.3). Le prototype (fondation seule) donnait `/` à 63,9 kB et `/about` à 151 kB de premier chargement, comme l'étape 1.

- [ ] **Step 5: Collisions de noms dans le CSS de Next**

```bash
cd "D:/Repos/macar-migration-tools" && node layer-collisions.mjs --css "../macar-next-site-prod/.next/static/css" --classes runs/step1/classes.json --known slider --known carousel; echo "exit $?"
```

Attendu : `known carousel: 1 selector(s)...`, `known slider: 37 selector(s)...` (Next regroupe les sélecteurs autrement que `css-compile.mjs`), `not neutralised: 0` et `exit 0`.

- [ ] **Step 6: Préparer le commit**

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo && git add -A -- src package.json package-lock.json && git status --short
```

`hero.ts` n'est pas dans la liste : sa suppression est déjà indexée depuis la tâche 26 (`git rm`), et un chemin qui n'existe plus ni dans l'index ni sur le disque ferait échouer `git add` (`fatal: pathspec 'hero.ts' did not match any files`) sans rien indexer.

Attendu, exactement ces 17 lignes indexées (première colonne `M`, `A` ou `D`, deuxième colonne vide), dans l'ordre de git :

```
D  hero.ts
M  package-lock.json
M  package.json
M  src/app/_components/CookieConsent.tsx
M  src/app/_components/HomeView.tsx
M  src/app/_components/ServiceDetailBody.tsx
M  src/app/_components/ServiceSection.tsx
M  src/app/_components/buttons.tsx
A  src/app/_components/faqKeyboard.ts
M  src/app/_components/footer.tsx
M  src/app/_components/navbar.tsx
M  src/app/globals.css
M  src/app/providers.tsx
M  src/app/services/page.tsx
M  src/app/zones/[slug]/page.tsx
M  src/components/GoogleReviews.tsx
M  src/components/ui/button.tsx
```

Aucune ligne `??` ni ` M`. Si `D  hero.ts` manque, lancer `git rm -q --cached --ignore-unmatch hero.ts` puis relancer cette étape.

- [ ] **Step 7: Committer la bascule**

```bash
cd "D:/Repos/macar-next-site-prod" && git commit -F - <<'EOF'
Move to HeroUI v3 and rebuild the navbar without HeroUI

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
git log --oneline -1 && git status --porcelain | wc -l
```

Attendu : le commit `Move to HeroUI v3 and rebuild the navbar without HeroUI`, puis `0`. La vérification complète de l'étape 2 (captures et styles contre `runs/step1` et `baseline` avec `--allow allow-step2.json`, enregistrements, spécifications `STEP=2`, Lighthouse, clone propre) part de ce commit ; ses corrections font des commits séparés. Dans ce plan : tâches 38 et 39, puis tâche 40.

---

### Task 38: Contrôle des composants sur le build de la bascule (à exécuter après la tâche 37)

**Files:**
- Create (ignoré par git, dossier `runs`) : `D:\Repos\macar-migration-tools\runs\step2-components\` (captures), `runs\step2-components-record\` (enregistrements)
- Modify (seulement si une correction est nécessaire) : le fichier de `src` fautif, parmi `src/app/_components/HomeView.tsx`, `src/app/_components/CookieConsent.tsx`, `src/app/_components/ServiceSection.tsx`, `src/components/GoogleReviews.tsx` et `src/app/globals.css`

**Interfaces:**
- Consumes: le commit de bascule (tâche 37) et son build `.next` ; `baseline` et `allow-step2.json` (partie 1) ; `tests/components.spec.mjs` et `curve-diff.mjs` (tâche 29) ; `layer-collisions.mjs` (partie 3).
- Produces: la preuve que les composants respectent la spec 6.4 et la section 9 sur le vrai build. Toute correction est un commit séparé dans le dépôt, puis on relance cette tâche.

Valeurs attendues ci-dessous : mesurées d'abord sur le prototype de la partie 4 (Navbar encore en v2), puis par l'assembleur du plan sur l'état complet (composants et Navbar reconstruite) : mêmes captures, mêmes nombres de pixels, et en plus le groupe de styles de la `div` de fond du menu (écart 43, contrôlé par la tâche 39). Une différence qui ne touche que la barre (bande haute de 72 px) ou les états `navbar`, `menu-open` et `focus-menu-button` relève de la tâche 39 ; toute autre différence relève de la partie 4.

- [ ] **Step 1: Servir le build de la bascule sur le port 3100**

```bash
cd "D:/Repos/macar-next-site-prod" && git log --oneline -1 && git status --porcelain | wc -l && ls .next/BUILD_ID
```

Attendu : le commit `Move to HeroUI v3 and rebuild the navbar without HeroUI` (ou une correction ultérieure), `0`, `.next/BUILD_ID`. Si `.next` manque ou date d'avant le dernier commit, lancer d'abord `npm run build`.

Lancer en arrière-plan (outil Bash avec `run_in_background: true` et `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-next-site-prod" && npx next start -p 3100
```

Puis, au premier plan :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; curl -s http://localhost:3100/services/renovation | grep -c 'data-slot="chip-label"'
```

Attendu : `1` (une ligne de HTML prérendu contient les chips : le Chip est bien rendu côté serveur).

- [ ] **Step 2: Captures et comparaison au pixel près**

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/step2-components | tail -n 1 && node compare.mjs --ref baseline --cur runs/step2-components --allow allow-step2.json | tail -n 9
```

Attendu :

```
47 captures written to ...\runs\step2-components, 0 failure(s)
identical: 41
allowed differences only: 6
  ALLOWED home__1280__cookie-preferences 3464 px
  ALLOWED home__1280__faq-open 36 px
  ALLOWED home__1280__focus-switch 3863 px
  ALLOWED home__390__cookie-preferences 3464 px
  ALLOWED home__390__faq-open 36 px
  ALLOWED home__390__focus-switch 3863 px
failed: 0
```

(les nombres de pixels autorisés peuvent varier légèrement). Ouvrir `runs\step2-components\home__1280__cookie-preferences.png` et `home__1280__faq-open.png` : trois interrupteurs verts (« Essentiels » atténué, désactivé), la flèche de la question ouverte tournée vers le bas, les autres vers la gauche.

- [ ] **Step 3: Comparaison des styles calculés**

```bash
cd "D:/Repos/macar-migration-tools" && node style-diff.mjs --ref baseline --cur runs/step2-components --allow allow-step2.json | head -n 20
```

Attendu : `style differences: 2 element(s) in 1 class group(s)`, et ce seul groupe : `[2x]   =>  fixed top-16 right-0 bottom-0 left-0 z-9999 bg-background animate-navbar-backdrop-in` (captures `home__320__menu-open` et `home__390__menu-open`, propriétés `transition-property`, `transition-duration`, `animation-name`, `animation-duration`). C'est la `div` de fond du menu (écart 43, tâche 39) : aucun élément des composants ne diffère.

- [ ] **Step 4: Spécifications de comportement des composants**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=2 npx playwright test tests/faq.spec.mjs tests/cookies.spec.mjs tests/reviews.spec.mjs tests/components.spec.mjs 2>&1 | tail -n 2
```

Attendu : `32 passed`. Ces tests couvrent : h2 et colonnes de 4 et 3 questions, une réponse par colonne, réponses `hidden="until-found"`, flèches, Début et Fin sans boucler ni ouvrir, Tab, Entrée et Espace, recherche par fragment de texte (Ctrl+F, exception 4) ; bandeau, 3 interrupteurs, bascule à la souris et à l'espace, « Essentiels » verrouillé, vert `#17C964` au repos, au survol et à l'appui (exception 1) ; avatars (`alt`, `referrerpolicy`, aucun `Referer`, initiales sur photo en échec : exception 3), carrousel, « Voir plus » ; les points d'attention 2 à 5 (photo lente, clavier seul dans les deux colonnes, bandeau à 320 px, cookie inattendu, consentement gardé) ; et les 8 tests de parité de la tâche 29.

- [ ] **Step 5: Minutage de la FAQ**

```bash
cd "D:/Repos/macar-migration-tools" && node record.mjs --base http://localhost:3100 --out runs/step2-components-record --ref baseline/record/timings.json; node curve-diff.mjs --ref baseline/record/timings.json --cur runs/step2-components-record/timings.json; echo "curve-diff exit $?"
```

Attendu, pour les lignes de la FAQ de `record.mjs` (valeurs du prototype, à 15 ms près) :

```
faq open: opacity=391.8ms (ref 450.1ms, -58 OUT), y=326.2ms (ref 350.4ms, -24), present=10.2ms (ref 13.8ms, -4)
faq close: opacity=295.2ms (ref 326.9ms, -32), y=310.1ms (ref 326.9ms, -17), present=327.8ms (ref 326.9ms, +1)
```

La ligne `faq open: opacity` est à la limite de la tolérance (-58 ms sur le prototype de la partie 4, -50 ms sur l'état complet mesuré par l'assembleur) : `OUT` ou non, c'est attendu (écart 36, artefact d'une image de la référence) ; les lignes `menu` relèvent de la tâche 39. Puis `curve-diff.mjs` :

```
faq open: y max gap 4.1 at 66.8 ms, opacity max gap 0.041 at 34.1 ms
faq close: y max gap 6.2 at 55.1 ms, opacity max gap 0.036 at 26.7 ms
curve-diff exit 0
```

(écarts variables d'une exécution à l'autre, toujours sous 12 px et 0,1). Un `OUT` de `curve-diff.mjs` est un défaut : vérifier que `faq-panel-transition` est bien compilé (tâche 30, étape 7) et regarder `runs\step2-components-record\faq.webm` à côté de `baseline\record\faq.webm`.

- [ ] **Step 6: Console et HTML prérendu**

```bash
cd "D:/Repos/macar-next-site-prod" && grep -o 'data-slot="avatar-fallback">[A-Z]*<' .next/server/app/index.html | head -n 3; grep -o 'role="region"' .next/server/app/index.html | wc -l; grep -o '<h2 data-slot="accordion-heading"' .next/server/app/index.html | wc -l; grep -o '<hr/>' .next/server/app/index.html | wc -l
```

Attendu :

```
data-slot="avatar-fallback">NC<
data-slot="avatar-fallback">RN<
data-slot="avatar-fallback">MJ<
7
7
5
```

(initiales prérendues pour les avis de Nathalie Claus, Riny Nijenhof et Max Jauniaux ; 7 réponses en `role="region"` ; 7 titres `h2` ; 5 séparateurs). La Navbar reconstruite n'ajoute aucun `<hr/>` (mesuré sur l'état complet : 5).

- [ ] **Step 7: Collisions de noms dans le DOM de l'étape 2**

```bash
cd "D:/Repos/macar-migration-tools" && node layer-collisions.mjs --css "../macar-next-site-prod/.next/static/css" --classes runs/step2-components/classes.json --known slider --known carousel --known accordion --known accordion__body --known accordion__body-inner --known accordion__heading --known accordion__indicator --known accordion__item --known accordion__panel --known accordion__trigger --known avatar --known avatar--sm --known avatar__image --known card --known card--default --known card__content --known card__header --known chip --known chip--default --known chip__label --known switch --known switch--sm --known switch__content --known switch__control --known switch__thumb | tail -n 1; echo "exit ${PIPESTATUS[0]}"
```

Attendu : `DOM classes styled in the components or base layer: 25, not neutralised: 0` puis `exit 0`. Les 23 classes BEM déclarées sont celles des cinq composants migrés (voulues) ; une ligne `NEW` signalerait une classe du site ou d'une bibliothèque tierce qui porte le nom d'une classe HeroUI (comme `slider` à la partie 3).

- [ ] **Step 8: Arrêter le serveur**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`.

- [ ] **Step 9: Commit**

Rien à committer si toutes les étapes sont conformes (les dossiers `runs` sont ignorés par git). Si une étape a demandé une correction dans le dépôt, la committer seule, puis relancer cette tâche depuis l'étape 1 (après `npm run build`). Le message et la liste de `git add` ci-dessous ne valent que pour cet exemple (une correction de classe de la FAQ) : nommer les fichiers réellement corrigés, et écrire un message qui dit ce que la correction rétablit.

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo && git add src/app/_components/HomeView.tsx && git commit -F - <<'EOF'
Keep the HeroUI v2 rendering of the FAQ questions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 39: Vérification de la Navbar sur le commit de bascule (à exécuter après la tâche 37)

**Files:**
- Create (ignoré par git) : sorties dans `D:\Repos\macar-migration-tools\runs\step2-navbar\`.
- Modify (seulement si une correction est nécessaire) : `src/app/_components/navbar.tsx` ou `src/app/globals.css`.

**Interfaces:**
- Consumes: le commit `Move to HeroUI v3 and rebuild the navbar without HeroUI` (tâche 37) et son build `.next` ; `navbar-check.mjs`, `baseline/navbar` et `tests/navbar-scrollbar.spec.mjs` (tâche 34) ; `capture.mjs`, `compare.mjs`, `style-diff.mjs`, `record.mjs`, `allow-step2.json`, `baseline` et `tests/navbar.spec.mjs` (partie 1).
- Produces: la preuve de parité de la Navbar pour la PR de l'étape 2 (spec 8.1, 8.2 et 8.4 automatisables), et la liste des contrôles manuels de la Navbar sur la preview Vercel.

- [ ] **Step 1: Vérifier le point de départ**

```bash
cd "D:/Repos/macar-next-site-prod" && git log --oneline -1 && git status --porcelain | wc -l && test .next/BUILD_ID -nt src/app/_components/navbar.tsx && echo "build is newer than navbar.tsx"
```

Attendu : le commit `Move to HeroUI v3 and rebuild the navbar without HeroUI` (ou un commit de correction plus récent), `0`, puis `build is newer than navbar.tsx`. Sinon, relancer `npm run build` dans le dépôt avant de continuer.

- [ ] **Step 2: Servir le dépôt sur le port 3100**

```powershell
"listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False` (sinon arrêter le serveur avec la commande de l'étape 8). Puis lancer en arrière-plan (outil Bash avec `run_in_background: true` et `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-next-site-prod" && npx next start -p 3100
```

Et au premier plan :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/
```

Attendu : `200`.

- [ ] **Step 3: Parité visuelle et styles calculés de la barre et du panneau**

```bash
cd "D:/Repos/macar-migration-tools" && node navbar-check.mjs --base http://localhost:3100 --out runs/step2-navbar/check --ref baseline/navbar --ignore "backdrop:animation-name,backdrop:animation-duration,backdrop:transition-property,backdrop:transition-duration"; echo "exit $?"
```

Attendu : `navbar check written to ...`, puis les deux lignes `animations ref:` (la transition `background-color` de la v2 et l'animation `navbar-menu-in`) et `animations cur:` (l'animation `navbar-backdrop-in`, 250 ms, keyframes `ease`, de `rgba(0, 0, 0, 0)` à `rgb(246, 248, 255)`, et la même animation `navbar-menu-in`), puis `navbar identical (images, styles)` et `exit 0`. Les 4 propriétés ignorées sont l'écart 43 (fond animé par keyframes au lieu d'une transition) ; elles ne sont ignorées que sur la div de fond. Sans `--ignore`, la sortie liste exactement `STYLE panel@320 backdrop` et `STYLE panel@390 backdrop` avec ces 4 propriétés, et `2 difference(s)`.

Toute autre ligne `PIXELS`, `SIZE` ou `STYLE` est un défaut de la Navbar à corriger (image fautive dans `runs/step2-navbar/check`, référence dans `baseline/navbar`). Si une différence touche aussi une largeur non capturée par le harnais (767, 768, 1023, 1024, 1535, 1536, 1920 px) en dehors de la Navbar elle-même (par exemple le texte de la page sous le panneau dans les images `open__390__t000` à `t200`), comparer d'abord avec un build de l'étape 1 pour savoir si l'écart vient de l'étape 1.

- [ ] **Step 4: Comportements (spec 7.2 à 7.4)**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=2 npx playwright test tests/navbar.spec.mjs tests/navbar-scrollbar.spec.mjs 2>&1 | tail -n 2
```

Attendu : `16 passed` (14 dans `tests/navbar.spec.mjs`, dont les deux tests des points d'attention 1 et 4, et 2 dans `tests/navbar-scrollbar.spec.mjs`).

- [ ] **Step 5: Minutage du menu (spec 7.3 et 8.1)**

```bash
cd "D:/Repos/macar-migration-tools" && node record.mjs --base http://localhost:3100 --out runs/step2-navbar/record --ref baseline/record/timings.json | grep "^menu"
```

Attendu, deux lignes sans `OUT`, de la forme (valeurs du prototype contre sa propre référence `a37ed9e`) :

```
menu open: opacity=240.6ms (ref 239.7ms, +1), y=257ms (ref 257.2ms, +0), present=7.4ms (ref 9.2ms, -2), covers=7.4ms (ref 9.2ms, -2)
menu close: opacity=277.4ms (ref 277.2ms, +0), y=277.4ms (ref 277.2ms, +0), present=277.4ms (ref 277.2ms, +0), covers=277.4ms (ref 277.2ms, +0)
```

La fermeture se mesure entre 276 et 295 ms selon l'image où tombe le minuteur (v2 : 275 à 284 ms). Le code de sortie de `record.mjs` dépend aussi des lignes `faq`, qui relèvent des tâches 30 et 38 : seules les lignes `menu` sont jugées ici. Si une ligne `menu` porte `OUT`, relancer une fois (machine chargée) ; si elle reste `OUT`, comparer `runs/step2-navbar/record/menu.webm` à `baseline/record/menu.webm`.

- [ ] **Step 6: Captures du harnais limitées à la Navbar (spec 8.1 et 8.2)**

```bash
cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/step2-navbar/captures | tail -n 1 && node compare.mjs --ref baseline --cur runs/step2-navbar/captures --allow allow-step2.json > runs/step2-navbar/compare.txt; node style-diff.mjs --ref baseline --cur runs/step2-navbar/captures --allow allow-step2.json > runs/step2-navbar/style-diff.txt; cd runs/step2-navbar/captures && node -e "const r = require('./compare-report.json'); for (const n of ['home__320__navbar', 'home__390__menu-open', 'home__320__menu-open', 'home__390__focus-menu-button', 'home__320__focus-menu-button']) console.log(n, r.identical.includes(n) ? 'identical' : 'DIFF'); const bar = r.failed.filter((e) => !e.bbox || e.bbox.y < 66).map((e) => e.name); console.log('captures with a difference in the bar (y < 66): ' + (bar.join(', ') || 'none'));" && node -e "const g = require('./style-diff.json'); const nav = g.filter((x) => x.classes.includes('navbar') || x.samples.some((s) => s.includes('>nav:1>'))); for (const x of nav) console.log(x.count + 'x ' + x.classes + ' | ' + Object.keys(x.changes).join(', ')); console.log('navbar groups: ' + nav.length);"
```

Attendu (environ 2 min 30 de capture) : `47 captures written to ..., 0 failure(s)`, puis :

```
home__320__navbar identical
home__390__menu-open identical
home__320__menu-open identical
home__390__focus-menu-button identical
home__320__focus-menu-button identical
captures with a difference in the bar (y < 66): none
2x   =>  fixed top-16 right-0 bottom-0 left-0 z-9999 bg-background animate-navbar-backdrop-in | transition-property, transition-duration, animation-name, animation-duration
navbar groups: 1
```

La barre est collante en haut de chaque capture pleine page (y de 0 à 65) : aucune capture ne doit avoir de différence qui commence dans cette bande. Les autres différences de `compare.txt` et `style-diff.txt` relèvent des tâches 38 et 40. Le seul groupe Navbar de `style-diff.txt` est l'écart 43, à justifier dans la PR (aucune image ne change).

- [ ] **Step 7: Consigner les contrôles manuels de la Navbar pour la preview Vercel (spec 8.4)**

À reporter dans la description de la PR de l'étape 2, pour le propriétaire, sur un vrai iPhone et un vrai Android (liste reprise et complétée à la tâche 41, étape 4) :
- menu ouvert : la page ne défile pas (geste vertical sur le panneau et autour) ;
- fermeture au toucher d'un lien, du logo, et à la rotation du téléphone ;
- `/#faq` depuis le menu défile jusqu'à la FAQ ;
- le menu passe au-dessus du bandeau cookies (après suppression du cookie `macar_cookie_consent_is_true`) ;
- pas de défilement horizontal à 320 px (ou sur le plus petit téléphone disponible), menu fermé et ouvert ;
- avec un clavier (ou VoiceOver / TalkBack) : le bouton annonce « Ouvrir le menu », bouton bascule non enfoncé, puis « Fermer le menu », enfoncé ; à la fermeture depuis un lien, le focus revient au bouton menu.

- [ ] **Step 8: Arrêter le serveur**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`.

- [ ] **Step 9: Commit**

Si les étapes 3 à 6 donnent les résultats attendus, rien n'est à committer : le dépôt n'a pas changé et `runs/` est ignoré par git. Une correction de la Navbar trouvée ici se fait dans `navbar.tsx` (ou `globals.css`), suivie de `npx tsc --noEmit` (puis `git restore tsconfig.tsbuildinfo`), `npm run build`, des étapes 2 à 6, et d'un commit séparé. Le message et la liste de `git add` ci-dessous ne valent que pour cet exemple : nommer les fichiers réellement corrigés, et écrire un message qui dit ce que la correction rétablit.

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo && git add src/app/_components/navbar.tsx src/app/globals.css && git commit -F - <<'EOF'
Fix the rebuilt navbar to match the reference rendering

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 40: Vérification complète de l'étape 2 contre la référence (spec 8.1 à 8.3)

**Files:**
- Create (ignoré par git, dossier `runs`) : `D:\Repos\macar-migration-tools\runs\step2\` (captures, rapports, `states.json`, `state-diff.txt`, `aria-diff.txt`, `html-diff.txt`, `css-by-class.txt`, `behaviour-step2.txt`, `lighthouse.json`), `runs\step2-final-build.txt`
- Create (temporaire, supprimé à la fin de l'étape 3) : `D:\Repos\macar-migration-tools\runs\step2-clean-clone\`
- Modify (seulement si une correction est nécessaire) : le fichier de `src` fautif (n'importe lequel)

**Interfaces:**
- Consumes: le dernier commit de la branche (tâche 37, ou une correction des tâches 38 et 39) ; tous les outils des tâches 1 à 12, 24, 29 et 34 ; `baseline` (tâches 11 et 34) ; `runs\step2-css\diff-task28.txt` (tâche 28), `runs\step2-css\diff-components.txt` (tâche 33), `runs\step2-navbar-css\diff-task36.txt` (tâche 36).
- Produces: le critère de réussite de l'étape 2 : seules les différences de la section 9 dans les captures, un seul groupe de styles justifié (écart 43), aucune différence d'état forcé, seulement les différences d'accessibilité de l'écart 42, aucune erreur HTML nouvelle, minutages et comportements conformes, Lighthouse dans les seuils, contrôles 8.3 au vert ; `runs\step2\css-by-class.txt` pour la justification 8.2 de la PR.

- [ ] **Step 1: Build à jour du dernier commit**

```bash
cd "D:/Repos/macar-next-site-prod" && git branch --show-current && git status --porcelain | wc -l && git log --oneline -1 && npx tsc --noEmit; echo "tsc exit $?"; git restore tsconfig.tsbuildinfo; npm run build > ../macar-migration-tools/runs/step2-final-build.txt 2>&1; echo "build exit $?"; grep -E "Next.js|Compiled|rror|Generating static pages \(33/33\)" ../macar-migration-tools/runs/step2-final-build.txt; grep -c "ƒ" ../macar-migration-tools/runs/step2-final-build.txt
```

Attendu : `heroui-v3-migration`, `0`, le commit `Move to HeroUI v3 and rebuild the navbar without HeroUI` (ou la dernière correction), `tsc exit 0`, `build exit 0`, `▲ Next.js 15.5.25`, `✓ Compiled successfully`, `✓ Generating static pages (33/33)`, aucune ligne `rror`, puis `0` (aucune route dynamique).

- [ ] **Step 2: Contrôles de source et d'installation (spec 8.3, « après l'étape 2 »)**

```bash
cd "D:/Repos/macar-migration-tools" && node step2-static-checks.mjs --repo "../macar-next-site-prod" | tail -n 1; cd "../macar-next-site-prod" && grep -rnE "import[^;]*\b(Navbar[A-Za-z]*|CardBody|HeroUIProvider)\b" src | wc -l; grep -rnE "heroui\(|@heroui/theme" src postcss.config.js package.json | wc -l; ls hero.ts tailwind.config.ts 2>&1 | grep -c "No such file"; node -e 'const l=require("./package-lock.json");for(const k of ["@heroui/react","@heroui/styles","@heroui/theme","react-aria","react-aria-components","tailwindcss","@tailwindcss/postcss","@tailwindcss/oxide-linux-x64-gnu","@tailwindcss/oxide-linux-x64-musl","lightningcss-linux-x64-gnu","lightningcss-linux-x64-musl"]){const p=l.packages["node_modules/"+k];console.log(k+" "+(p?p.version:"absent"))};console.log("tailwindcss copies: "+Object.keys(l.packages).filter(k=>/(^|\/)node_modules\/tailwindcss$/.test(k)).length)'; npm ls tailwindcss --all 2>&1 | grep -o 'tailwindcss@[0-9.]*' | sort -u
```

Attendu, dans l'ordre :

```
10 checks, 0 failed
0
0
2
@heroui/react 3.2.6
@heroui/styles 3.2.6
@heroui/theme absent
react-aria 3.52.1
react-aria-components 1.21.1
tailwindcss 4.3.3
@tailwindcss/postcss 4.3.3
@tailwindcss/oxide-linux-x64-gnu 4.3.3
@tailwindcss/oxide-linux-x64-musl 4.3.3
lightningcss-linux-x64-gnu 1.32.0
lightningcss-linux-x64-musl 1.32.0
tailwindcss copies: 1
tailwindcss@4.3.3
```

Lecture : `step2-static-checks.mjs` couvre la forme composée seule (aucun `AccordionItem`, `CardHeader`, `CardBody`, `CardFooter`, seuls `Accordion`, `Avatar`, `Card`, `Chip`, `I18nProvider` et `Switch` importés), les props v2 (`classNames=`, `imgProps=`, `title=` sur un élément d'accordéon), `heroui()`, `@heroui/theme`, `--heroui-*` et `flex-shrink-*` ; les deux `grep` suivants donnent zéro import de `Navbar*`, `CardBody` ou `HeroUIProvider` et zéro référence à `heroui()` ou `@heroui/theme` hors de `src` ; `hero.ts` et `tailwind.config.ts` sont absents ; le lockfile contient les binaires Linux d'oxide et de lightningcss (build Vercel) et une seule copie de Tailwind ; `npm ls` ne trouve qu'une version de Tailwind dans l'arbre.

- [ ] **Step 3: Installation et build depuis un clone propre**

```bash
df -h /d | tail -1; cd "D:/Repos/macar-migration-tools/runs" && rm -rf step2-clean-clone && git clone -q "D:/Repos/macar-next-site-prod" step2-clean-clone && cd step2-clean-clone && git log --oneline -1 && npm ci --no-audit --no-fund 2>&1 | grep -E "ERESOLVE|added"; npm ls tailwindcss --all 2>&1 | grep -o 'tailwindcss@[0-9.]*' | sort -u; npm run build 2>&1 | grep -E "Compiled|rror|Generating static pages \(33/33\)"; cd .. && rm -rf step2-clean-clone; df -h /d | tail -1
```

Attendu : au moins 1,5 Go libres, le même commit qu'à l'étape 1, une ligne `added ... packages` sans `ERESOLVE` (sans `--force` ni `--legacy-peer-deps`), `tailwindcss@4.3.3`, `✓ Compiled successfully` et `✓ Generating static pages (33/33)`, puis l'espace libéré.

- [ ] **Step 4: Servir le build sur le port 3100 et préchauffer les images**

```powershell
"listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False` (sinon arrêter le serveur avec la commande de l'étape 11). Lancer en arrière-plan (outil Bash avec `run_in_background: true` et `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-next-site-prod" && npx next start -p 3100
```

Puis, au premier plan :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; cd "D:/Repos/macar-migration-tools" && node capture.mjs --base http://localhost:3100 --out runs/step2-warmup | tail -n 1 && rm -rf runs/step2-warmup
```

Attendu : `47 captures written to ..., 0 failure(s)`.

- [ ] **Step 5: Captures, comparaison au pixel près et styles calculés (spec 8.1 et 8.2)**

```bash
cd "D:/Repos/macar-migration-tools" && rm -rf runs/step2 && node capture.mjs --base http://localhost:3100 --out runs/step2 | tail -n 1 && node compare.mjs --ref baseline --cur runs/step2 --allow allow-step2.json > runs/step2/compare.txt; echo "compare exit $?"; grep -E '^(identical|allowed differences only|failed):|^  ALLOWED' runs/step2/compare.txt; node style-diff.mjs --ref baseline --cur runs/step2 --allow allow-step2.json > runs/step2/style-diff-out.txt; echo "style-diff exit $?"; sed -n 1p runs/step2/style-diff-out.txt; node -e "const g=require('./runs/step2/style-diff.json'); const ok = g.length === 1 && g[0].classes.trim() === '=>  fixed top-16 right-0 bottom-0 left-0 z-9999 bg-background animate-navbar-backdrop-in' && g[0].count === 2 && Object.keys(g[0].changes).sort().join(',') === 'animation-duration,animation-name,transition-duration,transition-property'; console.log(ok ? 'only the navbar backdrop group: yes' : 'UNEXPECTED style groups')"
```

Attendu (mesure de l'assembleur sur l'état complet ; les nombres de pixels autorisés peuvent varier légèrement) :

```
47 captures written to ...\runs\step2, 0 failure(s)
compare exit 0
identical: 41
allowed differences only: 6
  ALLOWED home__1280__cookie-preferences 3464 px
  ALLOWED home__1280__faq-open 36 px
  ALLOWED home__1280__focus-switch 3863 px
  ALLOWED home__390__cookie-preferences 3464 px
  ALLOWED home__390__faq-open 36 px
  ALLOWED home__390__focus-switch 3863 px
failed: 0
style-diff exit 1
style differences: 2 element(s) in 1 class group(s)
only the navbar backdrop group: yes
```

Lecture : les seules images différentes sont celles des exceptions 1 (interrupteurs, préférences et focus) et 2 (flèche ouverte). `style-diff.mjs` sort en code 1 à cause d'un seul groupe, attendu et justifié : la `div` de fond du menu, dont le fondu est une animation au lieu d'une transition (écart 43), dans `home__390__menu-open` et `home__320__menu-open` (images identiques). Toute autre ligne `DIFF` ou tout autre groupe est un défaut : ouvrir `runs/step2/diff/<nom>.png` et `runs/step2/style-diff.txt`, corriger dans un commit séparé, puis recommencer cette tâche depuis l'étape 1. L'étape 1 ayant donné zéro différence avec la référence (tâche 22), comparer à `baseline` revient à comparer à l'étape 1 (spec 8.2).

- [ ] **Step 6: États forcés, arbre d'accessibilité et HTML prérendu (spec 8.2 et section 1)**

```bash
cd "D:/Repos/macar-migration-tools" && node state-diff.mjs --base http://localhost:3100 --out runs/step2 | tail -n 1 && node state-diff.mjs --ref baseline --cur runs/step2 --allow allow-step2.json | head -n 20; echo "state-diff exit ${PIPESTATUS[0]}"; node aria-diff.mjs --ref baseline --cur runs/step2 --expect aria-step2.json | head -n 1; echo "aria-diff exit ${PIPESTATUS[0]}"; grep -c UNEXPECTED runs/step2/aria-diff.txt; node html-diff.mjs --ref-site ref-site --cur-site ../macar-next-site-prod --out runs/step2; echo "html-diff exit $?"
```

Attendu (mesure du relecteur sur l'état complet de l'assembleur) :

```
658 forced states written to ...\runs\step2\states.json, 0 failure(s)
state differences: 0
full report: ...\runs\step2\state-diff.txt
state-diff exit 0
aria differences: 0 unexpected, 77 expected
aria-diff exit 0
0
pages: 28 reference, 28 current
HTML errors: 127 reference, 8 current
new HTML errors: 0
fixed HTML errors: 119
html-diff exit 0
```

Lecture : sous survol, appui et focus forcés, aucune classe à variante d'état ne rend autrement (les classes réécrites de la FAQ, des interrupteurs, des avis et de la Navbar comprises). L'arbre d'accessibilité ne diffère que par l'écart 42 : 73 lignes `listitem` (1 par capture en 1280 px, 2 en 390 et 320 px) et 4 lignes `alert` dans les deux captures `menu-open` ; un autre nombre que 77, ou une ligne `UNEXPECTED` (libellé, état, texte alternatif perdu ou changé), est un défaut. Le HTML prérendu n'a aucune erreur nouvelle ; les 119 erreurs corrigées sont celles de la Navbar v2 (`ul > button`, `ul > div`), de la balise `<style>` de HeroUI et de l'`aria-label` posé sur la `div` des questions de la FAQ. Reporter les quatre résultats dans la section « Écarts sans effet visuel » de la PR (tâche 41).

- [ ] **Step 7: CSS compilé par classe (spec 8.2) : rassembler la justification**

```bash
cd "D:/Repos/macar-migration-tools" && { echo "Tâche 28 (fondation), CSS de l'étape 1 comparé à la fondation"; grep -v "^  " runs/step2-css/diff-task28.txt; echo; echo "Tâches 30 à 33 (composants)"; grep -v "^  " runs/step2-css/diff-components.txt; echo; echo "Tâche 36 (Navbar)"; grep -v "^  " runs/step2-navbar-css/diff-task36.txt; } > runs/step2/css-by-class.txt; grep -cE "^(CHANGED|NEW CSS|NO CSS ANY MORE):" runs/step2/css-by-class.txt; grep -c "^classes compared" runs/step2/css-by-class.txt
```

Attendu : `84` (36 classes à la tâche 28, 32 aux tâches 30 à 33, 16 à la tâche 36), puis `3`. Chaque ligne est expliquée dans sa tâche : renommages de variables (`--heroui-*` vers `--v2-*`), couleurs v2 et rayons écrits autrement avec les mêmes valeurs calculées, `scrollbar-none` sans effet, classes de neutralisation des composants v3, classes du nouveau panneau de la Navbar. Ce fichier est repris dans la PR.

- [ ] **Step 8: Minutages (spec 8.1) et parité de la Navbar**

```bash
cd "D:/Repos/macar-migration-tools" && node record.mjs --base http://localhost:3100 --out runs/step2/record --ref baseline/record/timings.json; node curve-diff.mjs --ref baseline/record/timings.json --cur runs/step2/record/timings.json; echo "curve-diff exit $?"; node navbar-check.mjs --base http://localhost:3100 --out runs/step2/navbar --ref baseline/navbar --ignore "backdrop:animation-name,backdrop:animation-duration,backdrop:transition-property,backdrop:transition-duration" | grep -v "^animations"; echo "navbar-check exit ${PIPESTATUS[0]}"
```

Attendu (mesure de l'assembleur ; écarts variables de quelques millisecondes) :

```
menu open: opacity=239.6ms (ref 238.2ms, +1), y=256.7ms (ref 254.6ms, +2), present=7.3ms (ref 9.9ms, -3), covers=7.3ms (ref 9.9ms, -3)
menu close: opacity=295.1ms (ref 276.9ms, +18), y=295.1ms (ref 276.9ms, +18), present=295.1ms (ref 276.9ms, +18), covers=295.1ms (ref 276.9ms, +18)
faq open: opacity=389.9ms (ref 440.2ms, -50), y=323.5ms (ref 340.1ms, -17), present=6ms (ref 6ms, +0)
faq close: opacity=294.2ms (ref 329.4ms, -35), y=311.9ms (ref 329.4ms, -17), present=311.9ms (ref 329.4ms, -17)
timings and videos written to ...\runs\step2\record
faq open: y max gap 6.1 at 72.8 ms, opacity max gap 0.033 at 72.8 ms
faq close: y max gap 2.7 at 28.8 ms, opacity max gap 0.041 at 94.8 ms
curve-diff exit 0
navbar check written to ...\runs\step2\navbar
navbar identical (images, styles)
navbar-check exit 0
```

Les deux lignes `menu` ne doivent porter aucun `OUT` (fermeture entre 276 et 295 ms, v2 entre 275 et 284 ms) ; si l'une en porte, relancer une fois, puis comparer `runs/step2/record/menu.webm` à `baseline/record/menu.webm`. La ligne `faq open: opacity` peut porter `OUT` (artefact d'une image de la référence, écart 36) : la FAQ est jugée par `curve-diff.mjs`, qui doit sortir en code 0 (écarts sous 12 px et 0,1 d'opacité). Le code de sortie de `record.mjs` n'est donc pas un critère.

- [ ] **Step 9: Spécifications de comportement avec STEP=2 (spec 8.4, partie automatisable)**

```bash
cd "D:/Repos/macar-migration-tools" && BASE_URL=http://localhost:3100 STEP=2 npx playwright test 2>&1 | tee runs/step2/behaviour-step2.txt | tail -n 2
```

Attendu : `48 passed` (environ une minute), aucun test ignoré : Navbar 14, barre de défilement 2, FAQ 7, cookies 11 (dont le vert `#17C964` de l'exception 1), avis 6 (dont les initiales de l'exception 3), composants 8. Un échec est un défaut : lire la trace dans `test-results/`, corriger dans un commit séparé, recommencer depuis l'étape 1.

- [ ] **Step 10: Lighthouse (médiane de 5, seuils de 8.3)**

```bash
cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out runs/step2 --ref baseline/lighthouse.json 2>&1 | grep -E "^/[a-z/]* (mobile|desktop):"; echo "lighthouse exit ${PIPESTATUS[0]}"
```

Attendu (environ 6 min) : quatre lignes terminées par `OK vs ref (...)` et `lighthouse exit 0` : accessibilité et CLS au moins égaux, performance à 3 points près au plus. Mesure de l'assembleur, même machine que sa référence : `/ mobile: perf 77, a11y 95`, `/ desktop: perf 98, a11y 95`, `/services/renovation mobile: perf 79, a11y 92`, `/services/renovation desktop: perf 99, a11y 91`, CLS 0,000 / 0,000 / 0,023 / 0,000 (référence : perf 79, 97, 71, 97 ; a11y 91, 91, 88, 87).

Si une ligne finit par `FAIL` **seulement sur la performance**, la référence a pu être mesurée dans d'autres conditions de charge (deux médianes de la référence elle-même ont différé de 4 points sur `/services/renovation` mobile). Mesurer alors de nouveau la référence, puis l'étape 2, dans la même session :

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Lancer en arrière-plan (outil Bash avec `run_in_background: true` et `timeout: 7200000`) :

```bash
cd "D:/Repos/macar-migration-tools/ref-site" && npx next start -p 3100
```

Puis :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out runs/lighthouse-ref-now 2>&1 | grep -E "^/[a-z/]* (mobile|desktop):"
```

Arrêter ce serveur avec la commande PowerShell ci-dessus, relancer le serveur du dépôt comme à l'étape 4 (sans le préchauffage), puis :

```bash
until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; cd "D:/Repos/macar-migration-tools" && node lighthouse.mjs --base http://localhost:3100 --out runs/step2-lighthouse-again --ref runs/lighthouse-ref-now/lighthouse.json 2>&1 | grep -E "^/[a-z/]* (mobile|desktop):"; echo "lighthouse exit ${PIPESTATUS[0]}"
```

Attendu : `lighthouse exit 0`. Si une ligne reste en `FAIL`, ou si l'accessibilité ou le CLS échouent dès la première mesure, ne pas élargir le seuil : arrêter la tâche et soumettre les deux rapports (`runs/step2/lighthouse.json`, `runs/step2-lighthouse-again/lighthouse.json`) au propriétaire, avec la variante d'imports sélectifs de `@heroui/styles` décrite dans la partie 3 (« Risque signalé : poids du CSS et Lighthouse »), qui ne s'applique qu'avec son accord et après une nouvelle vérification complète.

- [ ] **Step 11: Arrêter le serveur**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Start-Sleep 1; "listening: " + [bool](Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)
```

Attendu : `listening: False`.

- [ ] **Step 12: Commit**

Rien à committer si les étapes 1 à 11 donnent les résultats attendus : le dépôt n'a pas changé et `runs/` est ignoré par le dépôt des outils. Une correction se committe seule dans le dépôt. Le message et la liste de `git add` ci-dessous ne valent que pour cet exemple : nommer les fichiers réellement corrigés, et écrire un message qui dit ce que la correction rétablit.

```bash
cd "D:/Repos/macar-next-site-prod" && git restore tsconfig.tsbuildinfo && git add src/app/_components/CookieConsent.tsx && git commit -F - <<'EOF'
Keep the cookie banner switches inside the screen at 320 px

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

puis la tâche reprend à l'étape 1.

---

### Task 41: Publier la branche, faire valider la preview Vercel, ouvrir la PR de l'étape 2 vers dev

**Files:**
- Create: `D:\Repos\macar-migration-tools\runs\step2\pr-body.md`

**Interfaces:**
- Consumes: le commit de bascule (tâche 37) et ses éventuelles corrections, les résultats des tâches 38 à 40, la PR de l'étape 1 (tâche 23) mergée dans `dev` par un commit de fusion.
- Produces: la PR « étape 2 » de la spec, de `heroui-v3-migration` vers `dev`, ouverte après la validation visuelle de la preview par le propriétaire (spec 8.4 et 8.5).

- [ ] **Step 1: Vérifier que la PR de l'étape 1 est mergée et que la branche ne porte que l'étape 2**

```bash
cd "D:/Repos/macar-next-site-prod" && git fetch origin && git merge-base --is-ancestor "$(git log --format=%H -1 --grep='^Keep exact widths, gradient and focus outline under lightningcss$')" origin/dev && echo "step 1 merged in dev"; git log --oneline origin/dev..HEAD
```

Attendu : `step 1 merged in dev`, puis seulement les commits de l'étape 2 : `Move to HeroUI v3 and rebuild the navbar without HeroUI` et ses corrections éventuelles. Si la première ligne manque, la PR 1 n'est pas encore mergée : attendre, ne rien pousser (pousser maintenant ajouterait l'étape 2 à la PR 1 encore ouverte). Si la PR 1 a été mergée autrement que par un commit de fusion (squash ou rebase), `git log` liste aussi les commits de l'étape 1 : s'arrêter et demander au propriétaire comment rebaser la branche, sans réécrire l'historique de soi-même. En cas de repli (tâche 22, étape 2 : pas de PR 1), sauter cette étape : `git log --oneline origin/dev..HEAD` liste alors aussi les commits des tâches 13 à 20, ce qui est attendu.

- [ ] **Step 2: Demander l'accord du propriétaire, puis pousser la branche**

Pousser publie la branche sur GitHub et déclenche une preview Vercel : demander l'accord explicite du propriétaire, puis :

```bash
cd "D:/Repos/macar-next-site-prod" && git push origin heroui-v3-migration
```

Attendu : `heroui-v3-migration -> heroui-v3-migration`, sans `--force` (la branche ne fait qu'avancer depuis la PR 1).

- [ ] **Step 3: Récupérer l'adresse de la preview**

```bash
cd "D:/Repos/macar-next-site-prod" && sleep 120; gh api "repos/macar-sa/macar-next-site-prod/commits/$(git rev-parse HEAD)/statuses" --jq '.[] | select(.context | test("Vercel")) | "\(.state) \(.target_url)"' | head -n 3
```

Attendu : une ligne `success https://vercel.com/...` (page du déploiement, qui donne l'adresse de la preview). Si la liste est vide ou en `pending`, relancer deux minutes plus tard ; si elle reste vide, prendre l'adresse dans le tableau de bord Vercel du projet (onglet Deployments, branche `heroui-v3-migration`).

- [ ] **Step 4: Validation visuelle par le propriétaire, sur un vrai iPhone et un vrai Android (spec 8.4)**

Transmettre l'adresse au propriétaire avec cette liste, et rappeler les points « Tranché par le propriétaire » de la section des écarts en tête de ce plan (flèche animée dans les deux sens, délais d'ouverture, initiales, poids du CSS) pour qu'il les voie sur la preview :

- **Toutes les pages**, en desktop et en mobile : identiques au site actuel, en dehors des 4 différences acceptées.
- **Menu mobile** : la page ne défile pas menu ouvert (geste vertical sur le panneau et autour), et défile de nouveau à la fermeture, à la même position ; fermeture au toucher d'un lien, du logo, et à la rotation du téléphone ; le focus revient au bouton menu à la fermeture (clavier, ou VoiceOver et TalkBack : « Ouvrir le menu », bouton bascule non enfoncé, puis « Fermer le menu », enfoncé) ; `/#faq` depuis le menu défile jusqu'à la FAQ ; le menu passe au-dessus du bandeau cookies ; pas de défilement horizontal à 320 px (ou sur le plus petit téléphone disponible), menu fermé et ouvert.
- **FAQ** : une seule réponse ouverte par colonne ; flèches, Début, Fin, Tab et Entrée ; la flèche de la question ouverte pivote de -90° (exception 2) et revient en 150 ms à la fermeture ; ouverture et fermeture au même rythme qu'aujourd'hui ; Ctrl+F (ou « Rechercher dans la page ») trouve le texte d'une réponse fermée et ouvre la question (exception 4 ; sur un Safari trop ancien pour `hidden="until-found"`, la réponse n'est pas trouvée, comme aujourd'hui).
- **Cookies**, après suppression du cookie `macar_cookie_consent_is_true` : le bandeau apparaît ; « Préférences » montre trois interrupteurs verts (exception 1) ; les deux interrupteurs basculent au toucher et à la barre d'espace, et restent verts au survol et à l'appui ; « Essentiels » est verrouillé ; le curseur ne saccade pas (issue HeroUI #6874) ; après « Accepter Tout », le bandeau ne revient pas sur une autre page.
- **Avis** : défilement automatique et pause au survol ; « Voir plus » ; initiales le temps que les photos arrivent, sur une connexion lente (exception 3) ; pas d'en-tête `Referer` vers `lh3.googleusercontent.com` (outils de développement, onglet Réseau, en desktop).
- **Global** : animations framer-motion des sections et des cartes, carrousel de logos, formulaire de contact (bordures, focus, placeholders), surbrillance au toucher des liens et des boutons, canevas blanc au rebond de défilement iOS.

Attendre la réponse écrite du propriétaire. Toute remarque est un défaut : la corriger dans un commit séparé, refaire la tâche 40, pousser (étape 2), puis revenir à cette étape.

- [ ] **Step 5: Écrire la description de la PR**

Contenu complet de `runs\step2\pr-body.md` (outil Write). Avant d'écrire, comparer chaque nombre de la section « Vérifications » aux sorties de la tâche 40 et remplacer ceux qui diffèrent par la valeur mesurée.

```markdown
## Étape 2 de la migration HeroUI v3 : HeroUI 3.2.6 et Navbar reconstruite

Passage de HeroUI 2.8.8 à HeroUI 3.2.6 (`@heroui/react` et `@heroui/styles`), et réécriture de la Navbar sans HeroUI (la v3 n'a plus de Navbar). Le rendu et le comportement restent ceux du site actuel, en dehors des quatre différences acceptées.

### Différences visibles acceptées

1. Les interrupteurs du bandeau cookies sont de vrais interrupteurs HeroUI v3, verts quand ils sont activés, à la place des cases à cocher natives.
2. La flèche des questions de la FAQ pivote de -90° à l'ouverture et revient en douceur (150 ms) à la fermeture.
3. Les initiales de l'auteur s'affichent pendant le chargement de la photo d'un avis, et à sa place si elle ne charge pas.
4. La recherche dans la page trouve le texte des réponses fermées de la FAQ et ouvre la question.

### Dépendances

- `@heroui/react` et `@heroui/styles` en `3.2.6` (version fixe), `react-aria` en `^3.52.1` (dépendance de pair, utilisée directement par la Navbar).
- `hero.ts` et le plugin HeroUI v2 sont retirés. Une seule version de Tailwind (4.3.3) dans l'arbre ; binaires Linux d'oxide et de lightningcss dans le lockfile.

### Ce qui change dans le code

- `globals.css` : `@import "@heroui/styles"`, thème du site, couleurs v2 encore utilisées (`--v2-*`), variables v3 ramenées aux couleurs actuelles hors couche, remise à zéro de la collision `.slider` avec le carrousel de logos, minutage de la FAQ et animations du menu mobile.
- `providers.tsx` : `I18nProvider` en `fr-BE` à la place de `HeroUIProvider` (toutes les routes restent statiques).
- FAQ (`HomeView.tsx`, `faqKeyboard.ts`) : Accordion v3, titres `h2`, mêmes séparateurs, navigation au clavier de la v2 (flèches, Début, Fin), contour de focus natif, minutage d'ouverture et de fermeture de la v2.
- Bandeau cookies : Switch v3 en vert `#17C964`, contour de focus natif, props inchangées.
- Pages service : Chip v3 importé de `@heroui/react/chip`, pour que `ServiceSection.tsx` reste un Server Component.
- Avis : Card et Avatar v3, cartes carrées sans ombre, avatar rond de 32 px, initiales en repli, `referrerPolicy="no-referrer"`.
- Navbar : HTML et Tailwind, `usePreventScroll`, `FocusScope` (retour du focus) et `useToggleButton` de React Aria, même fermeture au changement de largeur que la v2, panneau monté dans `document.body` le temps mesuré sur la v2.
- Classes : variables `--heroui-*` renommées `--v2-*`, `flex-shrink-0` renommé `shrink-0`, classes mortes que la v3 activait retirées (`ease-in-out-quad`, `hover:bg-accent`, `hover:text-accent-foreground`).

### Écarts sans effet visuel (spec 8.2)

- Styles calculés : un seul groupe diffère de la référence, la `div` de fond du menu mobile (2 captures) : son fondu est une animation CSS au lieu d'une transition, avec les mêmes images à chaque instant (`navbar-check` identique).
- CSS compilé par classe : 84 lignes, toutes expliquées (renommages de variables, couleurs v2 et rayons écrits autrement avec les mêmes valeurs, classes de neutralisation des composants v3, classes du nouveau panneau). Liste complète ci-dessous.
- DOM : la `div` de `HeroUIProvider` disparaît ; la Navbar est en `ul > li` valides ; les réponses fermées de la FAQ sont présentes et masquées ; le Chip est un `span` ; `view-transition-name` de `html` passe de `root` à `none` (aucune transition de vue sur le site).
- Flèche de la FAQ : le `svg` porte au repos une transition de `rotate` de 150 ms (nécessaire pour animer la fermeture) que la référence n'a pas ; aucun effet visuel au repos ; couvert par l'entrée 2 de `allow-step2.json`.
- Arbre d'accessibilité (`aria-diff.mjs`, 47 captures) : libellés, états et textes alternatifs identiques ; seules différences, un `listitem` de plus par groupe visible de la barre et, menu ouvert, le panneau placé avant l'annonceur de route de Next (vide) au lieu d'après.
- HTML prérendu (`html-validate`, 28 pages) : aucune erreur nouvelle ; 119 erreurs de la référence disparaissent (`ul > button` et `ul > div` de la Navbar v2, balise `<style>` de HeroUI dans une `div`, `aria-label` sur une `div`).
- Classes à variante d'état (`state-diff.mjs`, survol, appui et focus forcés sur les 15 pages) : 0 différence.

### Vérifications

- 47 captures (15 pages, page 404 comprise, en 1280 et 390 px, Navbar en 320 px, menu, FAQ, cookies, focus clavier) : 41 identiques au pixel près à la référence `a37ed9e`, 6 différentes seulement dans les zones des exceptions 1 et 2.
- Barre et panneau de la Navbar à 10 largeurs, 7 images de l'ouverture du menu : identiques.
- Styles calculés sous survol, appui et focus forcés : identiques ; arbre d'accessibilité : seulement les différences ci-dessus ; HTML prérendu : aucune erreur de validité nouvelle.
- Minutages : menu dans la tolérance de 50 ms ; courbes d'ouverture et de fermeture de la FAQ à moins de 12 px et 0,1 d'opacité de la référence, image par image.
- 48 spécifications de comportement passées (menu, défilement au doigt, barre de défilement, FAQ au clavier, recherche dans la page, cookies, avis, photos lentes, 320 px).
- Lighthouse (médiane de 5) : accessibilité et CLS au moins égaux à la référence, performance à 3 points près au plus.
- `npx tsc --noEmit`, `npm run build` (33 pages statiques), `npm ci` sur un clone propre sans `--force`, contrôles de source de la spec (aucun `Navbar*`, `CardBody`, `HeroUIProvider`, `heroui()`, `@heroui/theme` ni prop v2).
- Preview Vercel validée par le propriétaire sur un vrai iPhone et un vrai Android.

### Points validés par le propriétaire

- Flèche de la FAQ animée dans les deux sens (150 ms à l'ouverture et à la fermeture).
- Poids du CSS : feuille bloquante de 8 Ko à 44 Ko compressés (`@import "@heroui/styles"`), Lighthouse dans les seuils.
- Délais d'ouverture de la FAQ (30 ms pour la hauteur, 16 ms pour l'opacité), qui reproduisent le départ retardé de la v2.
- Apparence des initiales (style par défaut de HeroUI v3).
```

Si le propriétaire a tranché autrement un point de la dernière section, réécrire cette section selon sa réponse (et appliquer sa décision avant d'ouvrir la PR, avec une nouvelle tâche 40). Puis ajouter la liste complète des classes et la ligne de fin :

```bash
cd "D:/Repos/macar-migration-tools" && { echo; echo "<details><summary>CSS compilé par classe (84 lignes)</summary>"; echo; echo '```'; cat runs/step2/css-by-class.txt; echo '```'; echo; echo "</details>"; echo; echo "🤖 Generated with [Claude Code](https://claude.com/claude-code)"; } >> runs/step2/pr-body.md && tail -n 3 runs/step2/pr-body.md
```

Attendu : `</details>`, une ligne vide, puis `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

- [ ] **Step 6: Ouvrir la PR vers dev**

```bash
cd "D:/Repos/macar-next-site-prod" && gh pr create --base dev --head heroui-v3-migration --title "Move to HeroUI v3 and rebuild the navbar without HeroUI" --body-file "../macar-migration-tools/runs/step2/pr-body.md"
```

Attendu : l'adresse de la PR, `https://github.com/macar-sa/macar-next-site-prod/pull/<n>`, où `<n>` est le numéro attribué par GitHub.

- [ ] **Step 7: Merge, par le propriétaire seulement**

La PR n'est mergée qu'après la validation de sa preview par le propriétaire (étape 4 ; si des commits ont été ajoutés depuis, la redemander), et par un commit de fusion. Si le propriétaire demande explicitement à l'agent de la merger :

```bash
cd "D:/Repos/macar-next-site-prod" && gh pr merge heroui-v3-migration --merge
```

Attendu : `Merged pull request #<n>` (le numéro de l'étape 6). La migration est terminée quand les deux PR sont mergées dans `dev` (spec, section 1).
