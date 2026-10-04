# HeroUI v3 natif : design

- Date : 2026-10-04
- Branche : `heroui-v3-native`, créée depuis `dev` (commit `6728cd3`)
- Statut : design validé en conversation, spec à relire par le propriétaire avant le plan
- Fait suite à : `superpowers/specs/2026-10-02-heroui-v3-migration-design.md` (migration à rendu identique, terminée)

## 1. Objectif et critère de réussite

La migration vers HeroUI v3 a été faite à rendu identique : chaque composant v3 a été déguisé en composant v2 par des classes qui annulent son style, et Tailwind 4 a été plié au comportement de Tailwind 3. Le propriétaire trouve que cela dénature HeroUI v3 et rend le site trop sur mesure.

**Objectif** : un site entièrement construit avec les composants HeroUI v3 tels qu'ils sont conçus, aux couleurs Macar, avec un code plus simple à maintenir.

**Ce qui change par rapport à la migration précédente** : l'apparence du site change, volontairement. La référence n'est plus l'ancien rendu au pixel près, mais le style natif de HeroUI v3, réglé par ses variables de thème.

**Réussite** :

- aucun composant v3 ne reçoit de classe qui modifie son style ; les classes Tailwind ne servent qu'à la mise en page autour (grille, espacement, largeur) ;
- les éléments faits main qui ont un équivalent v3 sont remplacés ;
- `globals.css` ne contient plus de bloc d'imitation de Tailwind 3 ni de couleurs v2 ;
- le propriétaire valide le nouveau rendu page par page sur la preview Vercel ;
- les contrôles de la section 7 sont au vert.

## 2. Décisions du propriétaire

- Étendue : **tout le site en v3** (composants existants, éléments faits main remplaçables, retrait des imitations de Tailwind 3).
- Thème : **thème v3 aux couleurs Macar**, par les variables officielles du thème, pas de surcharge composant par composant.
- Démarche : **une branche, une PR, avancée par zones**, un commit qui compile par zone.
- Menu mobile : icône aux trois lignes (`Button` v3 icône seule) qui ouvre un `Drawer` v3 glissant **depuis la gauche**.
- Aperçu validé : une page de démonstration des composants v3 au thème Macar a été montrée et acceptée avant cette spec.

## 3. Thème

Source : documentation HeroUI v3, page « Theming ».

`src/app/globals.css` se réduit à :

1. `@import "tailwindcss";` puis `@import "@heroui/styles";` ;
2. les lignes `@source` utiles (le site déclare ses sources explicitement : `src/app` et `src/components`) ;
3. un bloc `:root` qui fixe les variables v3 :

| Variable v3 | Valeur | Origine |
|---|---|---|
| `--accent` | `#124FAA` | ancienne couleur `accent1` |
| `--accent-foreground` | blanc | texte sur l'accent |
| `--background` | `#F6F8FF` | fond actuel |
| `--foreground` | `#0E1435` | ancienne couleur `headings` |
| `--muted` | `#474B64` | ancienne couleur `text` |
| `--surface` | `#FFFFFF` | ancienne couleur `cardbackground` |
| `--border` | `#D8DBE9` | ancienne couleur `bordercard` |
| `--focus`, `--link` | `var(--accent)` | |

Les rayons, ombres, espacements et durées restent ceux de la v3. Les polices ne changent pas (Open Sans pour le texte, Raptor pour les titres), elles sont branchées sur les variables de police.

**Supprimé de `globals.css`** : la palette Tailwind 3 en hexadécimal, la variante `sibling:`, la variante `hover` active au toucher, les utilitaires redéfinis (`transition`, `transition-colors`, `transition-transform`, `shadow-*`, `ring-2`, `duration-*`, `ease-in-out`), `w-third`, `w-two-thirds`, `w-review-card`, `bg-fade-left`, les règles de préflight Tailwind 3, les variables `--v2-*` et les couleurs `primary`, `secondary`, `default-*`, `foreground` v2, le minutage de la FAQ et les animations du menu. Le rendu par défaut de Tailwind 4 est accepté.

**Vocabulaire** : les noms de couleurs maison sont remplacés partout par les noms v3 : `text-headings` devient `text-foreground`, `text-text` devient `text-muted`, `bg-accent1` et `text-accent1` deviennent `bg-accent` et `text-accent`, `bg-cardbackground` devient `bg-surface`, `border-bordercard` devient `border-border`. Les classes à opacité arbitraire (`bg-[rgb(...)]`, `hsl(var(--v2-*))`) sont remplacées par les jetons v3 les plus proches (`bg-accent-soft`, `bg-default`, `border-separator`…).

**Mode sombre** : non activé, le site reste en clair.

## 4. Composants

| Élément | Aujourd'hui | En v3 |
|---|---|---|
| Boutons d'action qui sont des liens (« Demander un devis », « Services »…) | `PrimaryButton`, `SecondaryButton` (`buttons.tsx`) | `Link` de Next stylé par `buttonVariants` de `@heroui/react` : variante `primary` pour l'action principale, `tertiary` pour la secondaire. Le lien reste un vrai lien (SEO, accessibilité) |
| Vrais boutons (formulaire, cookies, « Voir plus ») | faits main, shadcn | `Button` v3 |
| Liens de navigation et du pied de page | `NavLink` | `Link` v3 |
| Cartes de services (accueil, page Services) | `cards.tsx`, halo animé | `Card` v3 ; le halo disparaît |
| Cartes d'avis et avatars | `Card` et `Avatar` v3 neutralisés | `Card` et `Avatar` v3 sans surcharge |
| Chips des pages service | `Chip` neutralisé | `Chip` v3, variante `soft`, couleur `accent` |
| FAQ | `Accordion` v3 neutralisé, flèche v2 | `Accordion` v3 natif (sa flèche, son survol, son style). `faqKeyboard.ts` et les marqueurs `data-faq-column` / `data-faq-trigger` sont gardés |
| Formulaire de contact | champs shadcn | `Form`, `TextField`, `Label`, `Input`, `TextArea`, `FieldError`, `Button` v3. La validation `zod` et l'envoi à Formspree ne changent pas |
| Bandeau cookies | bloc fait main, `Switch` v3 à couleur forcée | `Surface`, `Switch` et `Button` v3 natifs ; comportement inchangé (le RGPD reste hors périmètre) |
| Séparateurs | `<hr>`, bordures | `Separator` v3 |

**Supprimé** : `src/app/_components/buttons.tsx` et `cards.tsx` une fois remplacés, `src/components/ui/` (shadcn), `components.json`, et les dépendances `class-variance-authority`, `@radix-ui/react-label`, `@radix-ui/react-slot` si plus rien ne les importe.

**Inchangé** (pas d'équivalent v3) : titres et textes (`textStyles.tsx`, police Raptor), sections (`screen.tsx` et ses animations framer-motion), carrousel de logos, défilement automatique des avis, pages du blog et composants MDX. Ils passent seulement aux noms de couleurs v3.

## 5. Navigation

HeroUI v3 n'a pas de Navbar : la barre reste une structure HTML (`nav`, `header`, listes), mais tout son contenu est en v3.

- **Desktop** : barre collante, logo, les 6 liens en `Link` v3, « Demander un devis » en `buttonVariants` primaire.
- **Mobile** : à gauche, un `Button` v3 `isIconOnly` avec l'icône lucide `Menu` et `aria-label="Ouvrir le menu"` ; le logo à droite. Le bouton ouvre un `Drawer` v3 placé à gauche, qui contient les 6 liens, un `Separator` et « Demander un devis ». Choisir un lien ferme le Drawer.
- **Comportements apportés par le Drawer et acceptés** : fermeture par Échap, par la croix et par un clic sur le fond, focus gardé dans le panneau, page bloquée derrière.
- **Supprimé** : le portail fait main, `usePreventScroll`, `FocusScope`, `useToggleButton`, la surveillance de la largeur, la durée de démontage et les keyframes `navbar-menu-in` / `navbar-backdrop-in`.
- **Pied de page** : `Link` v3 et `Separator` v3, mise en page inchangée.

## 6. Livraison

Branche `heroui-v3-native`, une PR vers `dev`, merge par commit de fusion après validation de la preview par le propriétaire. Un commit par zone, chacun passe `npm run lint`, `npx tsc --noEmit` et `npm run build` :

1. thème et `globals.css` ;
2. composants v3 déjà en place sans surcharge (FAQ, interrupteurs, chips, cartes d'avis, avatars) ;
3. boutons et liens ;
4. cartes de services ;
5. formulaire de contact ;
6. bandeau cookies ;
7. navigation et pied de page ;
8. ménage : dépendances, `components/ui`, `components.json`, fichiers devenus inutiles.

## 7. Vérification

Il n'y a plus de comparaison au pixel avec l'ancien rendu. Avant la PR :

- **Captures avant et après** de chaque page, en 375 px et 1440 px (règle du `CLAUDE.md`), dans un dossier temporaire hors du dépôt, rassemblées dans une page de comparaison que le propriétaire valide page par page.
- **Tests de comportement** (outils de `D:\Repos\macar-migration-tools`, adaptés au nouveau design) :
  - FAQ : une question ouverte par colonne, flèches, Début, Fin ;
  - menu mobile : ouverture, fermeture par un lien, par Échap et par la croix, page bloquée derrière, aucun défilement horizontal à 320 px ;
  - cookies : le bandeau apparaît sans cookie de consentement, se ferme après « Accepter tout », les interrupteurs basculent, « Essentiels » est verrouillé ;
  - avis : le défilement automatique avance et repart au début ;
  - formulaire : saisie dans chaque champ, messages d'erreur de validation, aucun envoi réel.
- **Lighthouse** (médiane de 5, `/` et `/services/renovation`, mobile et desktop) comparé au `dev` actuel : accessibilité au moins égale, performance à 3 points près au plus, CLS au plus égal.
- **Console** du navigateur sans erreur, **HTML** prérendu sans nouvelle erreur de validité.
- `npm run lint` sans erreur.

## 8. Hors périmètre

- RGPD du bandeau cookies (reporté par le propriétaire).
- Police Raptor (reste telle quelle).
- Mode sombre.
- Contenu des articles du blog (seulement les noms de couleurs dans les composants MDX).

## 9. Ménage

L'aperçu jetable (`D:\macar-migration\v3-preview`, `D:\macar-migration\v3-preview-shots`, serveur sur le port 3001) est supprimé une fois cette spec validée.
