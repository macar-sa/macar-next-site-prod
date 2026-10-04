# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Consignes pour Claude

## Specs et plans

Les specs et les plans (skills superpowers ou autres) vont dans le dossier `superpowers/` à la racine du dépôt, jamais dans `docs/` (ignoré par git) :

- specs : `superpowers/specs/AAAA-MM-JJ-<sujet>-design.md`
- plans : `superpowers/plans/AAAA-MM-JJ-<sujet>.md`

Ces fichiers sont versionnés pour que toute l'équipe puisse les lire.

## Branches

Les branches de travail partent de `dev` et les PR visent `dev`. `dev` est ensuite fusionnée dans `main` (production, déployée sur Vercel).

## Rédaction du contenu

Pour tout texte destiné aux visiteurs (pages, articles, FAQ) :

- **Pas de tiret long** (— ni –) comme séparateur : virgule, deux-points, parenthèses, ou deux phrases.

Pour les articles du blog (`content/blog/`) en plus :

- **Aucun prix** : ni montant, ni fourchette, ni prix au m², ni « plusieurs milliers d'euros », ni comparaison de prix entre matériaux ou techniques. Dire plutôt ce qui fait varier le devis.
- **Aucun délai qu'on ne maîtrise pas** (durée des travaux, délais de l'assureur, versement d'une indemnité) : dire que cela dépend du chantier, de la météo ou de l'assureur.
- **Pas de « Bruxelles » ni d'année** dans les titres, les slugs et le texte, car Macar travaille aussi ailleurs en Belgique. Bruxelles reste quand le fait est régional (Renolution, règles de permis bruxelloises).
- **Ne nommer aucun tiers** : ni cabinet d'expertise, ni assureur, ni rue.
- **Faits Macar à reprendre tels quels** : paiement en 5 % à la signature, 40 % au début des travaux, 45 % en cours de chantier et 10 % à la fin ; devis valable 30 jours ; urgences en journée seulement ; échafaudage toujours chiffré à part.
- **Vérifier chaque affirmation.** Les premiers articles, rédigés avec de l'IA, décrivaient des prestations que Macar ne fait pas et des règles fausses ou périmées. Pour une technique, demander si Macar la pratique au lieu de le supposer. Pour une règle (TVA, primes, permis), vérifier sur fin.belgium.be ou renolution.brussels et ne jamais citer un chiffre de mémoire. Sur les sujets juridiques, rester prudent (« en principe ») et renvoyer aux conditions du contrat.

## Commandes

- `npm run dev` : serveur de développement (écoute sur `0.0.0.0`, port 3000)
- `npm run build` : build de production, qui vérifie aussi les types TypeScript
- `npm run lint` : ESLint (config plate `eslint.config.mjs`, presets `next/core-web-vitals` et `next/typescript`)
- `npx tsc --noEmit` : vérification des types seule, plus rapide qu'un build

Il n'y a pas de suite de tests. La vérification se fait par lint, build et contrôle visuel dans le navigateur.

Variables d'environnement (toutes facultatives en local, définies sur Vercel) : `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (formulaire de contact), `NEXT_PUBLIC_GOOGLE_ANALYTICS`, `NEXT_PUBLIC_GSC_TOKEN`, `NEXT_PUBLIC_BING_TOKEN`.

## Serveurs MCP

- **`heroui-react`** (déclaré dans `.mcp.json`) : documentation, code source et styles des composants HeroUI v3, ainsi que les variables du thème. À consulter pour tout changement apporté au site qui touche l'interface (nouveau composant, modification d'un composant existant, style, thème), avant d'écrire le code, afin de suivre la documentation de la v3 installée (3.2.6). Ne pas se fier aux souvenirs de HeroUI v2, dont l'API est différente (v3 : composants composés, pas de Provider, basé sur React Aria).
- **`playwright`** (déclaré dans `.mcp.json`) : pilote un navigateur. On s'en sert pour tester chaque changement sur le site (nouvelle fonctionnalité, retouche visuelle) avant de le considérer comme terminé :
  - lancer `npm run dev`, puis ouvrir `http://localhost:3000` sur la page concernée ;
  - **test fonctionnel** : cliquer, remplir, naviguer au clavier, vérifier que le comportement attendu se produit et que la console du navigateur ne montre pas d'erreur ;
  - **test visuel** : faire des captures en largeur mobile (375 px) et bureau (1440 px), et aux points de rupture touchés par le changement, puis les regarder pour repérer les décalages, débordements ou chevauchements ;
  - mettre les captures dans un dossier temporaire, jamais dans le dépôt ;
  - si `NEXT_PUBLIC_FORMSPREE_ENDPOINT` est défini en local, ne pas envoyer le formulaire de contact : chaque envoi est réellement transmis par Formspree.

## Architecture

Site vitrine statique de Macar (rénovation, plomberie, électricité, toiture), Next.js 15 App Router, React 19, en français (`fr-BE`). Pas de backend : le formulaire de contact poste vers Formspree.

- **Pages** dans `src/app/`. Les composants serveur portent les `metadata` et le JSON-LD, puis délèguent le rendu interactif à des vues client (ex. `page.tsx` passe la FAQ à `_components/HomeView.tsx`).
- **Composants** : `src/app/_components/` contient la mise en page et les briques propres au site (`Screen`, `textStyles`, `links` pour les liens au style HeroUI, `ServiceCard`, navbar, footer). `src/components/` contient les blocs réutilisés (formulaire de contact, avis Google, stats).
- **Données en TypeScript**, pas de CMS : contenu des services dans `src/lib/services.ts` (rendu par `ServiceDetailBody`), communes dans `src/lib/seo/communes.ts`, avis dans `src/data/reviews.ts`.
- **Pages de zones** `src/app/zones/[slug]` : générées statiquement depuis `communes.ts`. Le texte vient de `intros.ts`, avec un texte générique si la commune n'y figure pas.
- **Blog** : fichiers MDX dans `content/blog/` avec frontmatter (`title`, `description`, `slug`, `datePublished`, `dateModified`, `category`, `tags`, `cover`, `draft`). `src/lib/blog.ts` les lit avec `gray-matter` au build ; `draft: true` masque un article. Rendu par `next-mdx-remote/rsc` avec les composants de `src/app/blog/_components/MdxComponents.tsx`.
- **SEO** : le JSON-LD `LocalBusiness` (`src/lib/seo/localBusiness.ts`) est injecté dans `layout.tsx` ; les autres schémas y renvoient par `LOCAL_BUSINESS_ID`. `src/app/sitemap.ts` liste les pages à la main (une nouvelle page statique doit y être ajoutée) et inclut automatiquement communes et articles. `public/llms.txt` décrit le site pour les LLM et doit suivre les changements de services ou de zones.

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
