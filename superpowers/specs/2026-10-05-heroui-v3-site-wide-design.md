# HeroUI v3 sur tout le site : design

- Date : 2026-10-05
- Branche : `heroui-v3-site-wide`, créée depuis `dev` (commit `23987cc`)
- Statut : design validé en conversation, spec à relire avant le plan
- Fait suite à : `superpowers/specs/2026-10-04-heroui-v3-native-design.md` (HeroUI v3 natif, PR #10) et à la PR #11 (liens de navigation en sombre)

## 1. Objectif

Le propriétaire veut que les fonctionnalités déjà présentes sur le site utilisent les composants HeroUI v3 partout où un équivalent existe. Le design natif (PR #10) a converti les composants principaux ; il reste des éléments faits main (blog, pages légales, erreurs du formulaire, bord des avis, chiffres et atouts de l'accueil).

**Réussite** : chaque élément listé en section 3 est rendu par son composant v3, sans classe qui modifie le style du composant ; le propriétaire valide le rendu sur la preview Vercel ; les contrôles de la section 5 sont au vert.

## 2. Règles (inchangées depuis la spec du 2026-10-04)

- Composants HeroUI v3 tels qu'ils sont conçus, variantes et tailles officielles. Les classes Tailwind ne servent qu'à la mise en page autour (grille, espacement, largeur, position).
- Thème v3 aux couleurs Macar par les variables de `globals.css`, vocabulaire de couleurs v3.
- Composants serveur : import de chaque composant par son chemin propre (`@heroui/react/card`…), comme dans `CLAUDE.md`.
- Liens : `TextLink` et `ButtonLink` (`src/app/_components/links.tsx`) ; liens dans le texte courant soulignés ; liens de navigation en sombre (option `navigation`).
- **Police inchangée** : Raptor reste sur les grands titres, les titres de section et le blog ; rien de plus (décision du propriétaire du 2026-10-05 après aperçu).

## 3. Éléments à convertir

| Zone | Fichier | Aujourd'hui | En v3 |
|---|---|---|---|
| Blog, liste | `src/app/blog/page.tsx` | carte d'article faite main (lien bordé, image 16/9, pastille de catégorie, date et durée, titre, extrait) | `Card` entièrement cliquable (lien Next.js autour) avec image, `Chip` de catégorie (`color="accent" variant="soft" size="sm"`), titre en `Card.Title`, extrait en `Card.Description` ; date et durée en texte |
| Blog, article | `src/app/blog/[slug]/page.tsx` | lien « ← Tous les articles » | `Breadcrumbs` v3 visible : Accueil / Blog / titre de l'article (le dernier élément n'est pas un lien) |
| Blog, article | idem | pastille de catégorie, tags `#tag` | `Chip` (catégorie : `accent` `soft` ; tags : variante neutre) |
| Blog, article | idem | encart « Un projet en tête ? » et cartes « À lire ensuite » | `Card` v3 (contenu et boutons inchangés) |
| Blog, contenu MDX | `src/app/blog/_components/MdxComponents.tsx` | `hr`, liens `a` faits main | `Separator` ; liens au style v3 (`TextLink` souligné pour les liens internes, même style pour les externes, qui gardent `target` et `rel`) |
| Politique cookies | `src/app/politique-cookies/page.tsx` | `<table>` fait main dans un conteneur à défilement | `Table` v3 (en-tête et lignes en dur, mêmes données), dans un `ScrollShadow` horizontal |
| Mentions légales, confidentialité | `src/app/mentions-legales/page.tsx`, `src/app/politique-confidentialite/page.tsx` | bordures basses entre sections | `Separator` entre sections |
| Formulaire de contact | `src/components/contact_form.tsx` | récapitulatif d'erreurs et erreur d'envoi en texte rouge | `Alert` v3 statut `danger` (indicateur, titre, description) ; les messages par champ restent des `FieldError` |
| Avis Google | `src/components/GoogleReviews.tsx` | dégradé fait main sur le bord droit du carrousel | `ScrollShadow` horizontal autour du conteneur ; défilement automatique, pause et retour au début inchangés |
| Accueil, chiffres clés | `src/components/Statistics.tsx` | trois chiffres en grille | trois `Card` v3 (chiffre en Raptor comme aujourd'hui, libellé) |
| Accueil, atouts | `src/app/_components/HomeView.tsx`, `src/app/_components/checkMark.tsx` | cinq lignes avec coche faite main et bordure | cinq `Chip` v3 avec icône de coche (lucide `Check`) ; `checkMark.tsx` supprimé s'il n'est plus utilisé |

## 4. Restent faits main

Pas d'équivalent v3 : typographie des articles (titres, paragraphes, listes, `blockquote`, `code`, `pre`), étoiles des avis, carrousel de logos, listes à puces des services, du recrutement et des pages légales, date et durée de lecture, grilles de communes (déjà des `ButtonLink`).

## 5. Vérification et livraison

- Un commit par zone (blog liste et article, contenu MDX, pages légales, formulaire, avis, accueil), chacun passe `npm run lint`, `npx tsc --noEmit` et `npm run build`.
- Suite de comportement native (outils de `D:\Repos\macar-migration-tools`) à jour et verte, avec des tests ajoutés : fil d'Ariane de l'article (3 éléments, le dernier non cliquable), tableau des cookies (rôle `grid` ou `table`, en-têtes et lignes attendus), alerte du formulaire (rôle `alert`, apparaît sur une soumission invalide), défilement des avis toujours actif avec le `ScrollShadow`.
- Captures avant et après des pages touchées en 375 et 1440 px, hors du dépôt.
- Lighthouse non requis (changements de composants locaux) ; aucune nouvelle erreur de console.
- Branche `heroui-v3-site-wide`, une PR vers `dev`, merge par commit de fusion après validation de la preview par le propriétaire ; demander avant chaque `git push`.

## 6. Hors périmètre

RGPD du bandeau cookies (reporté), police Raptor (inchangée), mise en production `dev` vers `main`, ménage des branches.
