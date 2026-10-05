# HeroUI v3 sur tout le site : plan d'implémentation

> **Pour les agents :** sous-compétence REQUISE : superpowers:subagent-driven-development (recommandée) ou superpowers:executing-plans pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`) pour le suivi.

**Objectif :** remplacer les derniers éléments faits main du site (blog, pages légales, erreurs du formulaire, bord des avis, chiffres et atouts de l'accueil) par leurs composants HeroUI v3, sans classe qui modifie leur style.

**Architecture :** un commit par zone de la spec (section 3), chacun précédé de ses tests dans la suite native du dépôt d'outils (`D:\Repos\macar-migration-tools\native`), lancés d'abord en échec sur l'état courant, puis au vert après l'implémentation. Les composants serveur importent HeroUI par sous-chemin ; les liens React Aria du fil d'Ariane passent par le routeur Next.js grâce à un `RouterProvider` ajouté dans `providers.tsx`.

**Stack :** Next.js 15.5 (App Router), React 19, Tailwind 4.3, `@heroui/react` et `@heroui/styles` 3.2.6, lucide-react, Playwright 1.63 (dépôt d'outils local).

**Spec :** `superpowers/specs/2026-10-05-heroui-v3-site-wide-design.md` (autorité de référence ; ce plan en découle).

---

## Contraintes globales

- Branche `heroui-v3-site-wide` (de `dev` `23987cc`, plus le commit de spec `d2a6300`) ; une PR vers `dev`, fusion par commit de fusion après validation de la preview par le propriétaire.
- **Demander l'accord du propriétaire avant chaque `git push`.** Le dépôt d'outils `D:\Repos\macar-migration-tools` n'est jamais poussé.
- Message de commit : titre en anglais à l'impératif (ex. `Show the contact form errors in a v3 Alert`), explication facultative, ligne vide, puis `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, passé par heredoc (`git commit -F - <<'EOF'`).
- Fichiers ajoutés un par un (`git add <chemin>`, `git rm <chemin>` pour une suppression), jamais `git add -A` ni `git add .`.
- Après `npx tsc --noEmit`, toujours `git restore tsconfig.tsbuildinfo`.
- À chaque commit : `npm run lint` (0 erreur, seul avertissement attendu `src/lib/blog.ts` 64:13 `'body' is defined but never used`), `npx tsc --noEmit` et `npm run build` passent.
- Composants HeroUI v3 tels qu'ils sont conçus, variantes et tailles officielles. Classes permises sur un composant v3 : mise en page autour (grille, flex, wrap, alignement, marges, largeur, hauteur, position), jamais de couleur, bordure, rayon, police ou ombre.
- Vocabulaire de couleurs v3 seulement (`text-foreground`, `text-muted`, `text-accent`, `bg-surface`…), aucune couleur maison ni `--v2-*`.
- Composant serveur : HeroUI importé par sous-chemin (`@heroui/react/card`, `@heroui/react/chip`, `@heroui/react/breadcrumbs`, `@heroui/react/separator`, `@heroui/react/table`, `@heroui/react/scroll-shadow`) ; l'import `@heroui/react` complet y casse le build. Composant client : `@heroui/react`.
- Liens : `TextLink` et `ButtonLink` de `src/app/_components/links.tsx` ; option `underline` pour les liens du texte courant, option `navigation` pour les liens de navigation.
- Police inchangée : Raptor (`font-heading`) reste sur les grands titres, les titres de section et le blog, rien de plus.
- Doc v3 par le serveur MCP `heroui-react` (`get_component_docs`) avant de toucher un composant ; ne jamais se fier à HeroUI v2.
- Aucun tiret long ni demi-cadratin dans le code, les textes, les commits, la PR et ce plan.
- Captures et clones hors du dépôt, dans `D:\macar-migration`. Si `NEXT_PUBLIC_FORMSPREE_ENDPOINT` est défini en local, ne jamais envoyer le formulaire : la suite native bloque toute requête qui sort de `localhost`.

## Procédures communes

**Procédure A (contrôles et build)**, dans `D:\Repos\macar-next-site-prod`, serveur 3100 arrêté (Procédure C) :

```bash
npm run lint
npx tsc --noEmit
git restore tsconfig.tsbuildinfo
npm run build
```

Attendu : lint `✖ 1 problem (0 errors, 1 warning)`, tsc sans sortie, build `✓ Compiled successfully` puis `✓ Generating static pages (33/33)`, toutes les routes `○` ou `●` (aucune ne devient dynamique).

**Procédure B (servir la branche sur 3100)**, PowerShell :

```powershell
New-Item -ItemType Directory -Force D:\macar-migration\native-out | Out-Null
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx next start -p 3100 > D:\macar-migration\native-out\server-3100.log 2>&1" -WorkingDirectory "D:\Repos\macar-next-site-prod" -WindowStyle Hidden
Start-Sleep -Seconds 6
(Invoke-WebRequest -UseBasicParsing http://localhost:3100/).StatusCode
```

Attendu : `200`.

**Procédure C (arrêter un serveur)**, PowerShell (port 3100 ou 3101) :

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Procédure T (suite native)**, dans `D:\Repos\macar-migration-tools`, contre 3100 :

```bash
npx playwright test -c native/playwright.config.mjs <fichiers> --reporter=line 2>&1 | grep -E "^\s+[0-9]+\) |passed|failed"
```

Sans `<fichiers>`, toute la suite (43 tests au départ, 64 à la fin).

## Points d'attention de la revue

1. **Titre d'article long sur téléphone (375 px)** : le dernier élément du fil d'Ariane doit passer à la ligne, aucun élément ne doit sortir de l'écran. Test : `blog.spec.mjs`, « le fil d'Ariane passe à la ligne au lieu de déborder », tâche 1.
2. **Clic sur « Blog » dans le fil d'Ariane** : la liste s'ouvre sans rechargement complet (navigation Next.js, pas le lien React Aria brut). Test : `blog.spec.mjs`, « Blog dans le fil d'Ariane ouvre la liste sans recharger la page », tâche 1.
3. **Tableau des cookies sur téléphone** : c'est le `ScrollShadow` qui défile, pas la page, et il reste dans l'écran. Test : `legal.spec.mjs`, « le tableau défile dans le ScrollShadow, pas la page », tâche 3.
4. **Formulaire corrigé puis renvoyé** : l'`Alert` de récapitulatif disparaît et seule l'`Alert` d'erreur d'envoi reste (jamais deux alertes empilées). Test : `form.spec.mjs`, « champs corrigés puis renvoi », tâche 4.
5. **Survol du carrousel d'avis** : la pause au survol et la reprise à la sortie marchent toujours une fois le conteneur remplacé par le `ScrollShadow`. Test : `reviews.spec.mjs`, « le survol met en pause, la sortie relance », tâche 5.

## Ajustements par rapport à la spec (mesurés sur le prototype)

- **Fil d'Ariane** : `Breadcrumbs.Item` rend un lien React Aria, qui recharge toute la page sans routeur. `providers.tsx` ajoute donc `RouterProvider` (`navigate` vers `router.push` de Next.js). Le fil est dans un `<nav aria-label="Fil d'Ariane">` ; `flex-wrap` sur `Breadcrumbs` et `shrink` sur le dernier élément (mise en page) laissent un titre long passer à la ligne, car `.breadcrumbs__item` est `shrink-0` par défaut. Le lien « ← Tous les articles » disparaît (remplacé par le fil).
- **Tableau des cookies** : le `ScrollShadow` prend la place de `Table.ScrollContainer`. Autour du `Table`, il ne défilerait jamais (la racine du `Table` coupe le débordement et son conteneur interne défile seul), donc l'ombre ne s'afficherait pas. `Table.Content` reçoit `min-w-[600px]`, comme dans la doc, pour défiler sur téléphone au lieu d'écraser les colonnes.
- **Avis** : le `ScrollShadow` remplace le conteneur qui défile (le masque s'applique à l'élément qui défile) ; il reçoit la `ref` du défilement automatique et les gestionnaires de pause. `overflow-x-auto` et `scrollbar-none` sont remplacés par `orientation="horizontal"` et `hideScrollBar`.
- **Encart « Un projet en tête ? »** : son titre reste un `h2` en Raptor dans `Card.Header` (`Card.Title` est un `h3` sans Raptor) ; le texte passe en `Card.Description`, les boutons en `Card.Footer`.
- **Chiffres clés** : une colonne sous 640 px (`grid-cols-1 sm:grid-cols-3`) : à 320 px, trois `Card` côte à côte avec leur padding ne contiennent plus « Rénovation ». Coquille corrigée au passage : `'d   \'Expérience'` devient `d'Expérience`.
- **Alertes du formulaire** : chaque message est réparti entre `Alert.Title` et `Alert.Description` (même texte) ; `role="alert"` est posé sur l'`Alert` (le composant n'en met pas).
- **Atouts** : les cinq `Chip` sont dans une liste `ul`/`li` (`color="accent" variant="soft" size="lg"`, icône lucide `Check`).
- **Contenu MDX** : aucun article actuel ne contient de `hr` ; le `Separator` est branché pour les prochains, sans test visible possible aujourd'hui.

Validation légère du prototype (clone jetable, supprimé) : lint `0 errors, 1 warning`, tsc sans erreur, build `33/33` pages statiques avec tout le code de ce plan.

## Structure des fichiers

Dépôt du site `D:\Repos\macar-next-site-prod` :

| Fichier | Tâche | Changement |
|---|---|---|
| `src/app/providers.tsx` | 1 | `RouterProvider` autour de `I18nProvider` |
| `src/app/blog/page.tsx` | 1 | `PostCard` en `Card` + `Chip` |
| `src/app/blog/[slug]/page.tsx` | 1 | `Breadcrumbs` visible, `Chip`, `Card` pour l'encart et « À lire ensuite » |
| `src/app/blog/_components/MdxComponents.tsx` | 2 | `a` en `TextLink underline`, `hr` en `Separator` |
| `src/app/politique-cookies/page.tsx` | 3 | `Table` dans `ScrollShadow`, `Separator` entre sections |
| `src/app/mentions-legales/page.tsx` | 3 | `Separator` entre sections |
| `src/app/politique-confidentialite/page.tsx` | 3 | `Separator` entre sections |
| `src/components/contact_form.tsx` | 4 | deux `Alert` `danger` |
| `src/components/GoogleReviews.tsx` | 5 | `ScrollShadow` horizontal, dégradé supprimé |
| `src/components/Statistics.tsx` | 6 | trois `Card` (réécrit) |
| `src/app/_components/HomeView.tsx` | 6 | cinq `Chip` avec `Check` |
| `src/app/_components/checkMark.tsx` | 6 | supprimé |

Dépôt d'outils `D:\Repos\macar-migration-tools\native\tests` (local, jamais poussé) : `blog.spec.mjs` (créé, tâches 1 et 2), `legal.spec.mjs` (créé, tâche 3), `form.spec.mjs` (complété, tâche 4), `reviews.spec.mjs` (réécrit, tâche 5), `home.spec.mjs` (créé, tâche 6).

---

## Tâche 1 : blog, liste et article

**Fichiers :**
- Modifier : `src/app/providers.tsx` (réécrit), `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`
- Test : `D:\Repos\macar-migration-tools\native\tests\blog.spec.mjs` (créé)

**Interfaces :**
- Consomme : `TextLink`, `ButtonLink` (`src/app/_components/links.tsx`), `getAllPosts`, `formatPostDateFR` (`src/lib/blog.ts`), `Breadcrumbs` JSON-LD (`src/app/_components/jsonld`).
- Produit : `Providers` avec `RouterProvider` (toute navigation d'un lien React Aria passe par `router.push`) ; marqueurs de test `nav[aria-label="Fil d'Ariane"]`, `[data-slot="card"]`, `.chip`.

- [ ] **Étape 0 : versionner ce plan.** Sur `heroui-v3-site-wide`, `git status --short` ne montre que ce fichier :

```bash
git add superpowers/plans/2026-10-05-heroui-v3-site-wide.md
git commit -F - <<'EOF'
Add the implementation plan for HeroUI v3 across the rest of the site

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Étape 1 : écrire le test.** Créer `native/tests/blog.spec.mjs` :

```js
// Spec 2026-10-05, section 3 (blog): Card list, visible Breadcrumbs, Chip and Card on the article.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

const ARTICLE = "/blog/isolation-facade";
const TITLE = "Isolation de façade : techniques, TVA et où en sont les primes";
const LONG_ARTICLE = "/blog/degats-eaux-toiture-bruxelles-sinistre-assurance";
const trail = (page) => page.getByRole("navigation", { name: "Fil d'Ariane" });
const listCards = (page) => page.locator('main a[href^="/blog/"] > [data-slot="card"]');

test.describe("blog, 1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("liste : chaque article est une Card v3 cliquable avec une Chip de catégorie et un titre", async ({ page }) => {
    await open(page, "/blog");
    const n = await page.locator('main a[href^="/blog/"]').count();
    expect(n).toBeGreaterThan(0);
    await expect(listCards(page)).toHaveCount(n);
    await expect(listCards(page).locator(".chip.chip--accent.chip--soft.chip--sm")).toHaveCount(n);
    await expect(listCards(page).locator("h3")).toHaveCount(n);
  });

  test("article : fil d'Ariane Accueil / Blog / titre, le dernier non cliquable", async ({ page }) => {
    await open(page, ARTICLE);
    const items = trail(page).getByRole("listitem");
    await expect(items).toHaveCount(3);
    await expect(items.nth(0).getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/");
    await expect(items.nth(1).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    await expect(items.nth(2)).toHaveText(TITLE);
    await expect(items.nth(2).locator("a[href]")).toHaveCount(0);
    await expect(items.nth(2).locator('[aria-current="page"]')).toHaveText(TITLE);
  });

  // Review focus 2: React Aria links go through the Next.js router (RouterProvider).
  test("article : Blog dans le fil d'Ariane ouvre la liste sans recharger la page", async ({ page }) => {
    await open(page, ARTICLE);
    await page.evaluate(() => { window.__sansRechargement = true; });
    await trail(page).getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1, name: "Le blog Macar" })).toBeVisible();
    expect(await page.evaluate(() => window.__sansRechargement)).toBe(true);
  });

  test("article : catégorie et tags en Chip, encart et À lire ensuite en Card", async ({ page }) => {
    await open(page, ARTICLE);
    const article = page.locator("article");
    await expect(article.locator(".chip.chip--accent.chip--soft").first()).toHaveText("Rénovation");
    await expect(article.locator(".chip.chip--default").filter({ hasText: /^#/ }).first()).toBeVisible();
    const cta = article.locator('[data-slot="card"]').filter({ hasText: "Un projet en tête ?" });
    await expect(cta).toHaveCount(1);
    await expect(cta.getByRole("link", { name: "Demander un devis" })).toBeVisible();
    await expect(cta.getByRole("link", { name: "Voir nos services" })).toBeVisible();
    const related = page.locator("section").filter({ has: page.getByRole("heading", { name: "À lire ensuite" }) });
    await expect(related.locator('a[href^="/blog/"] > [data-slot="card"]')).toHaveCount(2);
  });
});

test.describe("blog, 375 px", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  // Review focus 1: .breadcrumbs__item is shrink-0, a long title must still wrap.
  test("le fil d'Ariane passe à la ligne au lieu de déborder", async ({ page }) => {
    await open(page, LONG_ARTICLE);
    const items = trail(page).getByRole("listitem");
    await expect(items).toHaveCount(3);
    const outside = await items.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().right).filter((right) => right > window.innerWidth));
    expect(outside).toEqual([]);
    await expect(items.nth(2)).toBeVisible();
  });
});
```

La catégorie de `isolation-facade` est `Rénovation` (frontmatter, ligne 7).

- [ ] **Étape 2 : constater l'échec.** Procédure C (3100), Procédure A, Procédure B, puis Procédure T avec `blog`.
Attendu : `5 failed` (pas de `Card` dans la liste, pas de fil d'Ariane, pas de `Chip`).

- [ ] **Étape 3 : `RouterProvider`.** Remplacer tout `src/app/providers.tsx` par :

```tsx
"use client";
import { I18nProvider, RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

// React Aria locale for the HeroUI v3 components. Fixed on purpose: reading the
// request headers here would make every route dynamic.
// RouterProvider: the React Aria links inside HeroUI components (the Breadcrumbs items) navigate
// with the Next.js router, without a full page reload.
export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return (
        <RouterProvider navigate={(href) => router.push(href)}>
            <I18nProvider locale="fr-BE">{children}</I18nProvider>
        </RouterProvider>
    );
}
```

- [ ] **Étape 4 : liste du blog.** Dans `src/app/blog/page.tsx`, remplacer :

```tsx
import Link from "next/link";
```

par :

```tsx
import NextLink from "next/link";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
```

Puis remplacer toute la fonction `PostCard` (de `function PostCard` à la fin du fichier) par :

```tsx
// A HeroUI v3 Card, with its own styles, that links to the article as a whole (same pattern as
// ServiceCard). Only the cover image has its own classes: size, rounded corners, zoom on hover.
function PostCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  return (
    <NextLink href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full">
        <div className="relative w-full aspect-video overflow-hidden rounded-2xl">
          <Image
            src={post.cover}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:transform-[scale(1.05)]"
          />
        </div>
        <div className="flex flex-row flex-wrap items-center gap-3 text-xs text-muted">
          <Chip color="accent" variant="soft" size="sm">
            {post.category}
          </Chip>
          <span>{formatPostDateFR(post.datePublished)}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min de lecture</span>
        </div>
        <Card.Header>
          <Card.Title>{post.title}</Card.Title>
          <Card.Description className="line-clamp-3">{post.description}</Card.Description>
        </Card.Header>
      </Card>
    </NextLink>
  );
}
```

- [ ] **Étape 5 : article, imports.** Dans `src/app/blog/[slug]/page.tsx`, remplacer :

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
```

par :

```tsx
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@heroui/react/breadcrumbs";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
```

Remplacer :

```tsx
import { Breadcrumbs } from "../../_components/jsonld";
import { ButtonLink, TextLink } from "../../_components/links";
```

par :

```tsx
import { Breadcrumbs as BreadcrumbsJsonLd } from "../../_components/jsonld";
import { ButtonLink } from "../../_components/links";
```

Et dans le JSX (le composant JSON-LD, juste après `<main ...>`), remplacer :

```tsx
      <Breadcrumbs
        items={[
```

par :

```tsx
      <BreadcrumbsJsonLd
        items={[
```

- [ ] **Étape 6 : article, fil d'Ariane et catégorie.** Remplacer :

```tsx
          <p className="mb-6 text-sm">
            <TextLink href="/blog">← Tous les articles</TextLink>
          </p>

          <div className="flex flex-row items-center gap-3 text-xs text-muted mb-4">
            <span className="inline-block rounded-full bg-accent-soft text-accent px-3 py-1 font-medium">
              {post.category}
            </span>
```

par :

```tsx
          {/* Visible trail, same items as the JSON-LD above. flex-wrap and shrink on the last item
              let a long title wrap on a phone instead of overflowing (layout classes only). */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <Breadcrumbs className="flex-wrap">
              <Breadcrumbs.Item href="/">Accueil</Breadcrumbs.Item>
              <Breadcrumbs.Item href="/blog">Blog</Breadcrumbs.Item>
              <Breadcrumbs.Item className="shrink">{post.title}</Breadcrumbs.Item>
            </Breadcrumbs>
          </nav>

          <div className="flex flex-row flex-wrap items-center gap-3 text-xs text-muted mb-4">
            <Chip color="accent" variant="soft" size="sm">
              {post.category}
            </Chip>
```

- [ ] **Étape 7 : article, encart et tags.** Remplacer :

```tsx
          <div className="mt-16 rounded-lg border border-border bg-surface p-8">
            <h2 className="font-heading text-2xl lg:text-3xl text-foreground mb-3">
              Un projet en tête ?
            </h2>
            <p className="text-sm lg:text-base text-muted leading-relaxed lg:leading-6 mb-6 max-w-prose">
              Macar accompagne particuliers et professionnels à Bruxelles et alentours depuis 2002. Demandez un devis gratuit et sans engagement.
            </p>
            <div className="flex flex-row flex-wrap gap-3">
              <ButtonLink href="/#contact">Demander un devis</ButtonLink>
              <ButtonLink href="/services" variant="tertiary">
                Voir nos services
              </ButtonLink>
            </div>
          </div>
```

par :

```tsx
          {/* The h2 keeps Raptor and the heading level (Card.Title is an h3). */}
          <Card className="mt-16">
            <Card.Header>
              <h2 className="font-heading text-2xl lg:text-3xl text-foreground mb-3">
                Un projet en tête ?
              </h2>
              <Card.Description className="max-w-prose">
                Macar accompagne particuliers et professionnels à Bruxelles et alentours depuis 2002. Demandez un devis gratuit et sans engagement.
              </Card.Description>
            </Card.Header>
            <Card.Footer className="flex-wrap gap-3">
              <ButtonLink href="/#contact">Demander un devis</ButtonLink>
              <ButtonLink href="/services" variant="tertiary">
                Voir nos services
              </ButtonLink>
            </Card.Footer>
          </Card>
```

Puis remplacer :

```tsx
                <span
                  key={tag}
                  className="inline-block rounded-full border border-border text-muted px-3 py-1 text-xs"
                >
                  #{tag}
                </span>
```

par :

```tsx
                <Chip key={tag} size="sm">
                  #{tag}
                </Chip>
```

- [ ] **Étape 8 : article, « À lire ensuite ».** Remplacer :

```tsx
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:border-accent"
                >
                  <span className="inline-block rounded-full bg-accent-soft text-accent px-3 py-1 text-xs font-medium mb-3">
                    {p.category}
                  </span>
                  <h3 className="text-base lg:text-lg text-foreground font-medium leading-snug lg:leading-7 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                </Link>
```

par :

```tsx
                <NextLink key={p.slug} href={`/blog/${p.slug}`} className="block h-full">
                  <Card className="h-full">
                    <Chip color="accent" variant="soft" size="sm">
                      {p.category}
                    </Chip>
                    <Card.Header>
                      <Card.Title>{p.title}</Card.Title>
                    </Card.Header>
                  </Card>
                </NextLink>
```

Contrôle : `grep -n "TextLink\|<Link\|rounded-full\|border-border" "src/app/blog/[slug]/page.tsx" src/app/blog/page.tsx` ne renvoie rien.

- [ ] **Étape 9 : contrôles, build et tests.** Procédure C, Procédure A, Procédure B, puis Procédure T avec `blog layout`.
Attendu : `blog` `5 passed` ; `layout` toujours vert (pas de débordement à 320 px).

- [ ] **Étape 10 : commit du site.**

```bash
git add src/app/providers.tsx
git add src/app/blog/page.tsx
git add "src/app/blog/[slug]/page.tsx"
git commit -F - <<'EOF'
Render the blog cards, trail and chips with HeroUI v3

The article list and the related articles become v3 Cards, categories and tags v3 Chips, the
call to action a v3 Card, and the article gets a visible v3 Breadcrumbs trail. A RouterProvider
sends the React Aria links through the Next.js router.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Étape 11 : commit des tests** (dépôt d'outils) :

```bash
cd D:/Repos/macar-migration-tools
git add native/tests/blog.spec.mjs
git commit -F - <<'EOF'
blog spec: Card list, Breadcrumbs trail, Chip and Card on the article

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Laisser le serveur 3100 lancé : la tâche 2 commence par lui.

---

## Tâche 2 : contenu MDX du blog

**Fichiers :**
- Modifier : `src/app/blog/_components/MdxComponents.tsx`
- Test : `native/tests/blog.spec.mjs` (complété)

**Interfaces :**
- Consomme : `TextLink` avec `underline` (`src/app/_components/links.tsx`), `Separator` (`@heroui/react/separator`).
- Produit : liens d'article avec la classe `link` (v3) et `underline` ; `hr` rendu en `hr[data-slot="separator"]`.

- [ ] **Étape 1 : écrire le test.** Ajouter à la fin de `native/tests/blog.spec.mjs` :

```js
test.describe("contenu MDX", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  test("liens du texte : style Link v3 souligné, les externes dans un nouvel onglet", async ({ page }) => {
    await open(page, ARTICLE);
    const internal = page.locator('.prose-macar a[href="/services/renovation"]').first();
    await expect(internal).toHaveClass(/(^|\s)link(\s|$)/);
    await expect(internal).toHaveClass(/(^|\s)underline(\s|$)/);
    await expect(internal).not.toHaveAttribute("target", "_blank");
    const external = page.locator('.prose-macar a[href="https://renolution.brussels/fr/les-primes-renolution"]').first();
    await expect(external).toHaveClass(/(^|\s)link(\s|$)/);
    await expect(external).toHaveClass(/(^|\s)underline(\s|$)/);
    await expect(external).toHaveAttribute("target", "_blank");
    await expect(external).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

- [ ] **Étape 2 : constater l'échec.** Serveur 3100 de la tâche 1 lancé, Procédure T avec `blog`.
Attendu : `1 failed` (le lien n'a pas la classe `link`), `5 passed`.

- [ ] **Étape 3 : implémenter.** Dans `src/app/blog/_components/MdxComponents.tsx`, remplacer :

```tsx
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
```

par :

```tsx
import Image from "next/image";
import { Separator } from "@heroui/react/separator";
import type { ComponentPropsWithoutRef } from "react";
import { TextLink } from "../../_components/links";
```

Remplacer toute l'entrée `a:` (de `  a: ({ href, children, ...rest }` jusqu'au `  },` qui la ferme, avant `  blockquote:`) par :

```tsx
  // Links in running text: the v3 Link look, always underlined (TextLink underline). External
  // links open in a new tab.
  a: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) => {
    if (isInternalHref(href)) {
      return (
        <TextLink underline href={href ?? "#"}>
          {children}
        </TextLink>
      );
    }
    return (
      <TextLink {...rest} underline href={href ?? "#"} target="_blank" rel="noopener noreferrer">
        {children}
      </TextLink>
    );
  },
```

Remplacer :

```tsx
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr {...props} className="my-12 border-border" />
  ),
```

par :

```tsx
  hr: () => <Separator className="my-12" />,
```

- [ ] **Étape 4 : contrôles, build et tests.** Procédure C, Procédure A, Procédure B, Procédure T avec `blog`.
Attendu : `6 passed`.

- [ ] **Étape 5 : commits.**

```bash
git add src/app/blog/_components/MdxComponents.tsx
git commit -F - <<'EOF'
Use the v3 Separator and link style in blog articles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
cd D:/Repos/macar-migration-tools
git add native/tests/blog.spec.mjs
git commit -F - <<'EOF'
blog spec: v3 link style in the article body

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 3 : pages légales

**Fichiers :**
- Modifier : `src/app/politique-cookies/page.tsx`, `src/app/mentions-legales/page.tsx`, `src/app/politique-confidentialite/page.tsx`
- Test : `native/tests/legal.spec.mjs` (créé)

**Interfaces :**
- Consomme : `Table`, `ScrollShadow`, `Separator` par sous-chemin.
- Produit : tableau `role="grid"` nommé « Cookies utilisés » ; `hr[role="separator"]` entre les sections (7, 7 et 3).

- [ ] **Étape 1 : écrire le test.** Créer `native/tests/legal.spec.mjs` :

```js
// Spec 2026-10-05, section 3 (legal pages): cookie Table in a horizontal ScrollShadow,
// Separator between sections instead of bottom borders.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

const COLUMNS = ["Cookie", "Émetteur", "Finalité", "Durée"];
const ROWS = ["_ga", "_ga_*", "Vercel Analytics", "macar_cookie_consent_is_true"];
const cookieTable = (page) =>
  page.getByRole("grid", { name: "Cookies utilisés" }).or(page.getByRole("table", { name: "Cookies utilisés" }));

for (const width of [1440, 375]) {
  test.describe(`politique cookies, ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

    test("Table v3 : en-têtes et lignes attendus", async ({ page }) => {
      await open(page, "/politique-cookies");
      const table = cookieTable(page);
      await expect(table).toBeVisible();
      await expect(table.getByRole("columnheader")).toHaveText(COLUMNS);
      const rows = table.getByRole("row");
      await expect(rows).toHaveCount(ROWS.length + 1);
      for (const [i, name] of ROWS.entries()) await expect(rows.nth(i + 1)).toContainText(name);
    });
  });
}

test.describe("politique cookies, 375 px, défilement", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  // Review focus 3: on a phone the ScrollShadow scrolls, inside the screen.
  test("le tableau défile dans le ScrollShadow, pas la page", async ({ page }) => {
    await open(page, "/politique-cookies");
    const shadow = page.locator('[data-slot="table"] [data-slot="scroll-shadow"]');
    await expect(shadow).toHaveAttribute("data-orientation", "horizontal");
    await expect(shadow.locator("table")).toHaveCount(1);
    const box = await shadow.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth, right: el.getBoundingClientRect().right }));
    expect(box.scroll).toBeGreaterThan(box.client);
    expect(box.right).toBeLessThanOrEqual(375);
  });
});

test.describe("pages légales, Separator entre les sections", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ context, baseURL }) => prepare(context, baseURL));

  for (const [path, count] of [["/mentions-legales", 7], ["/politique-confidentialite", 7], ["/politique-cookies", 3]]) {
    test(`${path} : ${count} Separator v3, plus de bordure basse`, async ({ page }) => {
      await open(page, path);
      await expect(page.locator("main").getByRole("separator")).toHaveCount(count);
      const bordered = await page.locator("main section section").evaluateAll((els) =>
        els.filter((el) => parseFloat(getComputedStyle(el).borderBottomWidth) > 0).length);
      expect(bordered).toBe(0);
    });
  }
});
```

- [ ] **Étape 2 : constater l'échec.** Serveur 3100 de la tâche 2 lancé, Procédure T avec `legal`.
Attendu : `6 failed` (tableau sans nom ni rôle `grid`, pas de `ScrollShadow`, aucun `Separator`).

- [ ] **Étape 3 : politique cookies, imports et données.** Dans `src/app/politique-cookies/page.tsx`, remplacer :

```tsx
import type { Metadata } from "next";
```

par :

```tsx
import type { Metadata } from "next";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Separator } from "@heroui/react/separator";
import { Table } from "@heroui/react/table";
```

Remplacer :

```tsx
const sectionGrid = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 py-10 border-b border-separator";
```

par :

```tsx
const sectionGrid = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 py-10";

// Cookies listed in the table: name, issuer, purpose, lifetime.
const COOKIES = [
    { name: "_ga", issuer: "Google Analytics 4", purpose: "Distinguer les utilisateurs (mesure d'audience)", duration: "13 mois" },
    { name: "_ga_*", issuer: "Google Analytics 4", purpose: "Conserver l'état de la session", duration: "13 mois" },
    { name: "Vercel Analytics", issuer: "Vercel", purpose: "Mesure d'audience anonyme côté serveur (sans cookie persistant)", duration: "Session" },
    { name: "macar_cookie_consent_is_true", issuer: "Macar", purpose: "Mémoriser votre choix concernant les cookies", duration: "12 mois" },
];
```

- [ ] **Étape 4 : politique cookies, tableau.** Remplacer le bloc qui va de `<section className="py-10 border-b border-separator">` jusqu'au `</div>` qui ferme `<div className="overflow-x-auto">` (inclus, juste avant `<p className="mt-4 text-muted text-xs">`) par :

```tsx
                    <section className="py-10">
                        <ThirdHeading customClasses="mb-6">
                            <h2>Cookies utilisés</h2>
                        </ThirdHeading>
                        {/* HeroUI v3 Table. The ScrollShadow takes the place of Table.ScrollContainer: it is
                            the element that scrolls on a phone, so its fade shows that more columns follow. */}
                        <Table>
                            <ScrollShadow orientation="horizontal">
                                <Table.Content aria-label="Cookies utilisés" className="min-w-[600px]">
                                    <Table.Header>
                                        <Table.Column isRowHeader>Cookie</Table.Column>
                                        <Table.Column>Émetteur</Table.Column>
                                        <Table.Column>Finalité</Table.Column>
                                        <Table.Column>Durée</Table.Column>
                                    </Table.Header>
                                    <Table.Body>
                                        {COOKIES.map((cookie) => (
                                            <Table.Row key={cookie.name} id={cookie.name}>
                                                <Table.Cell>{cookie.name}</Table.Cell>
                                                <Table.Cell>{cookie.issuer}</Table.Cell>
                                                <Table.Cell>{cookie.purpose}</Table.Cell>
                                                <Table.Cell>{cookie.duration}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Content>
                            </ScrollShadow>
                        </Table>
```

Puis, après chacune des trois lignes `                    </section>` du fichier, ajouter une ligne `                    <Separator />` à la même indentation. Résultat attendu pour la première :

```tsx
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
```

Contrôle : `grep -c "<Separator />" src/app/politique-cookies/page.tsx` donne `3`, `grep -c "border-b\|<table\|<td" src/app/politique-cookies/page.tsx` donne `0`.

- [ ] **Étape 5 : mentions légales et confidentialité.** Les deux fichiers reçoivent le même changement : import de `Separator`, `border-b border-separator` retiré de `sectionGrid`, un `<Separator />` après chacune des 7 sections. Script exact, à enregistrer hors du dépôt dans `D:\macar-migration\legal-separators.cjs` puis lancer depuis la racine du dépôt :

```js
// Legal pages: Separator v3 between sections instead of the bottom border of each section.
const fs = require("fs");
for (const [file, count] of [
  ["src/app/mentions-legales/page.tsx", 7],
  ["src/app/politique-confidentialite/page.tsx", 7],
]) {
  const raw = fs.readFileSync(file, "utf8");
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  let s = raw.replace(/\r\n/g, "\n");
  const before = ' py-10 border-b border-separator";';
  if (!s.includes(before)) throw new Error(`${file}: sectionGrid not found`);
  s = s.replace(before, ' py-10";');
  s = s.replace('import type { Metadata } from "next";\n', 'import type { Metadata } from "next";\nimport { Separator } from "@heroui/react/separator";\n');
  const parts = s.split("                    </section>\n");
  if (parts.length - 1 !== count) throw new Error(`${file}: ${parts.length - 1} sections, expected ${count}`);
  s = parts.join("                    </section>\n                    <Separator />\n");
  fs.writeFileSync(file, s.replace(/\n/g, eol));
  console.log(`${file}: ${count} Separator`);
}
```

```bash
node D:/macar-migration/legal-separators.cjs
```

Attendu : `src/app/mentions-legales/page.tsx: 7 Separator` puis `src/app/politique-confidentialite/page.tsx: 7 Separator`. `git diff --stat` ne montre que ces deux fichiers et la politique cookies (le script garde les fins de ligne du fichier). Supprimer ensuite le script.

- [ ] **Étape 6 : contrôles, build et tests.** Procédure C, Procédure A, Procédure B, Procédure T avec `legal layout`.
Attendu : `legal` `6 passed`, `layout` vert.

- [ ] **Étape 7 : commits.**

```bash
git add src/app/politique-cookies/page.tsx
git add src/app/mentions-legales/page.tsx
git add src/app/politique-confidentialite/page.tsx
git commit -F - <<'EOF'
Show the cookie table and legal page dividers with HeroUI v3

The cookie table becomes a v3 Table that scrolls in a horizontal ScrollShadow, and v3
Separators replace the bottom borders between the sections of the three legal pages.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
cd D:/Repos/macar-migration-tools
git add native/tests/legal.spec.mjs
git commit -F - <<'EOF'
legal spec: cookie Table in a ScrollShadow, Separators between sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 4 : formulaire de contact

**Fichiers :**
- Modifier : `src/components/contact_form.tsx`
- Test : `native/tests/form.spec.mjs` (complété)

**Interfaces :**
- Consomme : `Alert` de `@heroui/react` (composant client), `TextLink underline`.
- Produit : `[data-slot="alert-root"][role="alert"].alert--danger` pour le récapitulatif et pour l'erreur d'envoi ; les textes « Le formulaire contient des erreurs » et « Oups » restent (tests existants).

- [ ] **Étape 1 : écrire le test.** Ajouter à la fin de `native/tests/form.spec.mjs` :

```js
// Spec 2026-10-05: the summary and the sending error are HeroUI v3 Alerts, status danger.
const alerts = (page) => form(page).locator('[data-slot="alert-root"]');

test("envoi vide : récapitulatif dans une Alert v3 danger (indicateur, titre, description)", async ({ page }) => {
  await submit(page).click();
  const alert = alerts(page).filter({ hasText: "Le formulaire contient des erreurs" });
  await expect(alert).toBeVisible();
  await expect(alert).toHaveAttribute("role", "alert");
  await expect(alert).toHaveClass(/alert--danger/);
  await expect(alert.locator(".alert__indicator")).toHaveCount(1);
  await expect(alert.locator(".alert__title")).toHaveText("Le formulaire contient des erreurs.");
  await expect(alert.locator(".alert__description")).toHaveText("Veuillez corriger les champs indiqués.");
});

// Review focus 4: once the fields are fixed, the summary goes and only the sending error stays.
test("champs corrigés puis renvoi : le récapitulatif disparaît, seule l'Alert d'erreur d'envoi reste", async ({ page }) => {
  await submit(page).click();
  await expect(alerts(page).filter({ hasText: "Le formulaire contient des erreurs" })).toBeVisible();
  await field(page, "Nom et Prénom").fill("Jeanne Test");
  await field(page, "Email").fill("jeanne@example.com");
  await field(page, "Téléphone").fill("0470000000");
  await field(page, "Message").fill("Bonjour");
  await submit(page).click();
  await expect(alerts(page)).toHaveCount(1);
  await expect(alerts(page)).toContainText("Oups");
  await expect(alerts(page)).toHaveClass(/alert--danger/);
  await expect(alerts(page).getByRole("link", { name: "info@macar.be" })).toBeVisible();
});
```

- [ ] **Étape 2 : constater l'échec.** Serveur 3100 de la tâche 3 lancé, Procédure T avec `form`.
Attendu : `2 failed`, `4 passed`. Le `afterEach` du fichier vérifie qu'aucune requête n'est partie vers Formspree.

- [ ] **Étape 3 : implémenter.** Dans `src/components/contact_form.tsx`, remplacer :

```tsx
import { Button, Card, FieldError, Form, Input, Label, Spinner, TextArea, TextField } from "@heroui/react";
```

par :

```tsx
import { Alert, Button, Card, FieldError, Form, Input, Label, Spinner, TextArea, TextField } from "@heroui/react";
```

Remplacer :

```tsx
              <p className="text-sm text-danger" role="alert" aria-live="polite" aria-atomic="true">
                Le formulaire contient des erreurs. Veuillez corriger les champs indiqués.
              </p>
```

par :

```tsx
              <Alert status="danger" role="alert" aria-atomic="true">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Le formulaire contient des erreurs.</Alert.Title>
                  <Alert.Description>Veuillez corriger les champs indiqués.</Alert.Description>
                </Alert.Content>
              </Alert>
```

Remplacer :

```tsx
              <p className="text-sm text-danger" role="alert" aria-live="assertive" aria-atomic="true">
                Oups quelque chose s&apos;est mal passé, contactez-nous par email à{" "}
                <TextLink underline href="mailto:info@macar.be">info@macar.be</TextLink>
              </p>
```

par :

```tsx
              <Alert status="danger" role="alert" aria-atomic="true">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Oups quelque chose s&apos;est mal passé</Alert.Title>
                  <Alert.Description>
                    Contactez-nous par email à{" "}
                    <TextLink underline href="mailto:info@macar.be">info@macar.be</TextLink>
                  </Alert.Description>
                </Alert.Content>
              </Alert>
```

- [ ] **Étape 4 : contrôles, build et tests.** Procédure C, Procédure A, Procédure B, Procédure T avec `form`.
Attendu : `6 passed`.

- [ ] **Étape 5 : commits.**

```bash
git add src/components/contact_form.tsx
git commit -F - <<'EOF'
Show the contact form errors in a v3 Alert

The error summary and the sending error become HeroUI v3 Alerts with the danger status. The
messages of each field stay in their FieldError.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
cd D:/Repos/macar-migration-tools
git add native/tests/form.spec.mjs
git commit -F - <<'EOF'
form spec: v3 Alert for the summary and the sending error

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 5 : avis Google

**Fichiers :**
- Modifier : `src/components/GoogleReviews.tsx`
- Test : `native/tests/reviews.spec.mjs` (réécrit)

**Interfaces :**
- Consomme : `ScrollShadow` de `@heroui/react` (composant client ; accepte `ref` et les props d'un `div`).
- Produit : le carrousel est `#reviews [data-slot="scroll-shadow"]` (l'ancien sélecteur `#reviews div.overflow-x-auto` ne marche plus).

- [ ] **Étape 1 : écrire le test.** Remplacer tout `native/tests/reviews.spec.mjs` par :

```js
// Spec 7 (2026-10-04) and spec 2026-10-05: the reviews auto-scroll moves on, loops back to the
// start and pauses on hover, inside a HeroUI v3 horizontal ScrollShadow. Native v3 Card and Avatar.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

const carousel = (page) => page.locator('#reviews [data-slot="scroll-shadow"]');
const left = (page) => carousel(page).evaluate((el) => el.scrollLeft);

for (const width of [1440, 375]) {
  test.describe(`avis, largeur ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });

    test.beforeEach(async ({ page, context, baseURL }) => {
      await prepare(context, baseURL);
      await open(page, "/");
      await carousel(page).scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);
    });

    test("le carrousel est un ScrollShadow v3 horizontal, sans dégradé fait main", async ({ page }) => {
      await expect(carousel(page)).toHaveAttribute("data-orientation", "horizontal");
      await expect(carousel(page)).toHaveClass(/scroll-shadow--hide-scrollbar/);
      await expect(page.locator("#reviews .bg-linear-to-l")).toHaveCount(0);
    });

    test("défile tout seul d'au moins 30 px en 2,5 s", async ({ page }) => {
      const start = await left(page);
      await expect.poll(async () => (await left(page)) - start, { timeout: 2500, intervals: [100] }).toBeGreaterThanOrEqual(30);
    });

    test("repart au début après la fin de la liste", async ({ page }) => {
      const jump = await carousel(page).evaluate((el) => {
        const max = el.scrollWidth - el.clientWidth;
        el.scrollLeft = max - 2;
        return { max, after: el.scrollLeft };
      });
      expect(jump.after).toBeGreaterThan(jump.max - 50);
      await expect.poll(() => left(page), { timeout: 1000, intervals: [50] }).toBeLessThan(100);
    });

    // Review focus 5: the pause handlers still reach the scrolling element.
    test("le survol met en pause, la sortie relance", async ({ page }) => {
      const box = await carousel(page).boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(800);
      const paused = await left(page);
      await page.waitForTimeout(600);
      expect(await left(page)).toBe(paused);
      await page.mouse.move(1, 1);
      await expect.poll(async () => (await left(page)) - paused, { timeout: 2500, intervals: [100] }).toBeGreaterThanOrEqual(10);
    });
  });
}

test.describe("cartes d'avis", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
  });

  test("Card et Avatar v3 sans surcharge : coins arrondis, avatar de taille sm", async ({ page }) => {
    const card = page.locator('#reviews [data-slot="card"]').first();
    expect(await card.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(0);
    await expect(card.locator(".avatar")).toHaveClass(/avatar--sm/);
  });

  // "Voir plus" on a long review, now a v3 Button.
  test("Voir plus ouvre le texte, devient Voir moins, sans changer la hauteur de la carte", async ({ page }) => {
    const cards = page.locator('#reviews [data-slot="card"]');
    const index = await cards.evaluateAll((els) => els.findIndex((el) => el.textContent.includes("Voir plus")));
    const card = cards.nth(index);
    const h0 = (await card.boundingBox()).height;
    await card.getByRole("button", { name: "Voir plus" }).click();
    await expect(card.getByRole("button", { name: "Voir moins" })).toBeVisible();
    expect((await card.boundingBox()).height).toBe(h0);
    await card.getByRole("button", { name: "Voir moins" }).click();
    await expect(card.getByRole("button", { name: "Voir plus" })).toBeVisible();
  });
});
```

- [ ] **Étape 2 : constater l'échec.** Serveur 3100 de la tâche 4 lancé, Procédure T avec `reviews`.
Attendu : `8 failed` (les 4 tests du carrousel, aux deux largeurs : pas de `ScrollShadow`), `2 passed`.

- [ ] **Étape 3 : implémenter.** Dans `src/components/GoogleReviews.tsx`, remplacer :

```tsx
import { Avatar, Button, Card } from "@heroui/react";
```

par :

```tsx
import { Avatar, Button, Card, ScrollShadow } from "@heroui/react";
```

Remplacer :

```tsx
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-proximity md:snap-mandatory py-2 px-3 -mx-1 min-h-[180px] scrollbar-none touch-pan-x overscroll-x-contain overscroll-y-none"
            onMouseEnter={pauseCarousel}
            onMouseLeave={resumeCarousel}
            onTouchStart={pauseCarousel}
            onTouchEnd={resumeCarousel}
            style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
          >
            {reviews.map((review, i) => (
              <ReviewCard
                key={i}
                review={review}
                expanded={!!expandedCards[i]}
                onToggle={() => toggleCard(i)}
              />
            ))}
          </div>
          {/* Dégradé uniquement sur le carousel, pas sur le texte en dessous */}
          <div
            className="absolute top-0 right-0 bottom-0 w-20 sm:w-28 pointer-events-none bg-linear-to-l from-background to-transparent z-10"
            aria-hidden
          />
        </div>
```

par :

```tsx
        {/* HeroUI v3 ScrollShadow: it is the scrolling row, and its fade marks the edge where more
            reviews follow. The auto-scroll moves its scrollLeft. */}
        <ScrollShadow
          ref={scrollRef}
          orientation="horizontal"
          hideScrollBar
          className="flex gap-4 overflow-y-hidden snap-x snap-proximity md:snap-mandatory py-2 px-3 -mx-1 min-h-[180px] touch-pan-x overscroll-x-contain overscroll-y-none"
          onMouseEnter={pauseCarousel}
          onMouseLeave={resumeCarousel}
          onTouchStart={pauseCarousel}
          onTouchEnd={resumeCarousel}
          style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
        >
          {reviews.map((review, i) => (
            <ReviewCard
              key={i}
              review={review}
              expanded={!!expandedCards[i]}
              onToggle={() => toggleCard(i)}
            />
          ))}
        </ScrollShadow>
```

Le `useEffect` du défilement automatique ne change pas : `scrollRef` (un `useRef<HTMLDivElement>`) pointe maintenant sur le `div` du `ScrollShadow`.

- [ ] **Étape 4 : contrôles, build et tests.** Procédure C, Procédure A, Procédure B, Procédure T avec `reviews layout`.
Attendu : `reviews` `10 passed`, `layout` vert.

- [ ] **Étape 5 : commits.**

```bash
git add src/components/GoogleReviews.tsx
git commit -F - <<'EOF'
Fade the reviews row with the v3 ScrollShadow

The horizontal ScrollShadow becomes the scrolling row of the reviews and replaces the hand-made
gradient on its right edge. Auto-scroll, pause and loop are unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
cd D:/Repos/macar-migration-tools
git add native/tests/reviews.spec.mjs
git commit -F - <<'EOF'
reviews spec: ScrollShadow carousel, pause on hover

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tâche 6 : accueil, chiffres clés et atouts

**Fichiers :**
- Modifier : `src/components/Statistics.tsx` (réécrit), `src/app/_components/HomeView.tsx`
- Supprimer : `src/app/_components/checkMark.tsx`
- Test : `native/tests/home.spec.mjs` (créé)

**Interfaces :**
- Consomme : `Card` (`@heroui/react/card`), `Chip` (`@heroui/react`, `HomeView` est un composant client), `Raptor` (`src/app/_components/textStyles.tsx`), `Check` (lucide-react).
- Produit : trois `[data-slot="card"]` contenant un `h4` ; cinq `#contact .chip` avec `svg.lucide-check`.

- [ ] **Étape 1 : écrire le test.** Créer `native/tests/home.spec.mjs` :

```js
// Spec 2026-10-05, section 3 (home): key figures in three v3 Cards, strengths in five v3 Chips.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../../tests/helpers.mjs";

const STRENGTHS = ["Réponse rapide", "Devis personnalisé et gratuit", "Experts Engagés", "Transparence", "Qualité"];
const statCards = (page) => page.locator('main [data-slot="card"]').filter({ has: page.locator("h4") });

test.describe("accueil, 1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
  });

  test("chiffres clés : trois Card v3, chiffre et libellé", async ({ page }) => {
    await expect(statCards(page).locator("h4")).toHaveText(["+6000", "24 ans", "+95%"]);
    await expect(statCards(page).locator(".card__description")).toHaveText(["Projets de Rénovation", "d'Expérience", "Taux de Réussite des Projets"]);
  });

  test("atouts : cinq Chip v3 avec une coche", async ({ page }) => {
    const chips = page.locator("#contact .chip");
    await expect(chips).toHaveText(STRENGTHS);
    for (let i = 0; i < STRENGTHS.length; i++) await expect(chips.nth(i).locator("svg.lucide-check")).toHaveCount(1);
  });
});

test.describe("accueil, 320 px", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("chiffres clés : chaque Card contient son texte", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
    await expect(statCards(page)).toHaveCount(3);
    const overflowing = await statCards(page).evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth).length);
    expect(overflowing).toBe(0);
  });
});
```

- [ ] **Étape 2 : constater l'échec.** Serveur 3100 de la tâche 5 lancé, Procédure T avec `home`.
Attendu : `3 failed`.

- [ ] **Étape 3 : chiffres clés.** Remplacer tout `src/components/Statistics.tsx` par :

```tsx
import { Card } from "@heroui/react/card";
import { Raptor } from "@/app/_components/textStyles";

const STATS = [
    { number: "+6000", text: "Projets de Rénovation" },
    { number: "24 ans", text: "d'Expérience" },
    { number: "+95%", text: "Taux de Réussite des Projets" },
];

// Key figures of the home page: three HeroUI v3 Cards, the figure in Raptor as before.
// One column on phones: three padded Cards side by side do not fit at 320 px.
const Statistics = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-10">
            {STATS.map((stat) => (
                <Card key={stat.text} className="items-center text-center">
                    <Raptor>
                        <h4 className="text-lg lg:text-5xl 2xl:text-6xl">{stat.number}</h4>
                    </Raptor>
                    <Card.Description>{stat.text}</Card.Description>
                </Card>
            ))}
        </div>
    );
};

export default Statistics;
```

- [ ] **Étape 4 : atouts.** Dans `src/app/_components/HomeView.tsx`, supprimer la ligne :

```tsx
import { CheckMark } from "./checkMark";
```

Remplacer `import { Star, ExternalLink } from "lucide-react";` par `import { Check, Star, ExternalLink } from "lucide-react";` et `import { Accordion } from "@heroui/react";` par `import { Accordion, Chip } from "@heroui/react";`.

Remplacer :

```tsx
export type FaqItem = { question: string; answer: string };
```

par :

```tsx
export type FaqItem = { question: string; answer: string };

// Strengths listed next to the contact form, each one a HeroUI v3 Chip with a check icon.
const STRENGTHS = ["Réponse rapide", "Devis personnalisé et gratuit", "Experts Engagés", "Transparence", "Qualité"];
```

Remplacer :

```tsx
            <div className="flex flex-col items-start md:flex-row md:justify-start flex-wrap gap-6 mt-12">
              <CheckMark content="Réponse rapide" />
              <CheckMark content="Devis personnalisé et gratuit" />
              <CheckMark content="Experts Engagés" />
              <CheckMark content="Transparence" />
              <CheckMark content="Qualité" />
            </div>
```

par :

```tsx
            <ul className="flex flex-wrap gap-3 mt-12">
              {STRENGTHS.map((label) => (
                <li key={label}>
                  <Chip color="accent" variant="soft" size="lg">
                    <Check aria-hidden size={14} />
                    <Chip.Label>{label}</Chip.Label>
                  </Chip>
                </li>
              ))}
            </ul>
```

- [ ] **Étape 5 : supprimer `checkMark.tsx`.**

```bash
git rm src/app/_components/checkMark.tsx
grep -rn "checkMark\|CheckMark" src
```

Attendu : `rm 'src/app/_components/checkMark.tsx'`, puis aucune ligne trouvée.

- [ ] **Étape 6 : contrôles, build et tests.** Procédure C, Procédure A, Procédure B, Procédure T avec `home form layout`.
Attendu : `home` `3 passed`, `form` et `layout` verts.

- [ ] **Étape 7 : commits.**

```bash
git add src/components/Statistics.tsx
git add src/app/_components/HomeView.tsx
git commit -F - <<'EOF'
Show the home figures and strengths as v3 Cards and Chips

The three key figures become HeroUI v3 Cards, one column on phones, and the five strengths next
to the contact form become v3 Chips with a check icon. CheckMark is removed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
cd D:/Repos/macar-migration-tools
git add native/tests/home.spec.mjs
git commit -F - <<'EOF'
home spec: key figures in Cards, strengths in Chips

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

`git rm` a déjà indexé la suppression de `checkMark.tsx`, elle part dans ce commit.

---

## Tâche 7 : vérification complète

**Fichiers :** aucun dans le dépôt du site. Clone de référence et captures dans `D:\macar-migration`.

- [ ] **Étape 1 : contrôles du dépôt.** Procédure C (3100), Procédure A. Puis :

```bash
git status --short
git log --oneline dev..HEAD
node -e "const d=require('child_process').execSync('git diff dev -- src',{encoding:'utf8'});const m=d.split('\n').filter(l=>l.startsWith('+')&&/[\u2013\u2014]/.test(l));console.log(m.length?m.join('\n'):'aucun tiret long')"
git diff dev -- src | grep -E "^\+" | grep -E "headings|accent1|cardbackground|bordercard|--v2-|bg-primary|default-[0-9]"
```

Attendu : `git status` vide ; 8 commits (spec, plan, puis les 6 zones) ; `aucun tiret long` ; le dernier `grep` ne trouve rien.

- [ ] **Étape 2 : suite native complète.** Procédure B, Procédure T sans fichier.
Attendu : `64 passed` (43 de départ, plus 6 `blog`, 6 `legal`, 2 `form`, 4 `reviews`, 3 `home`).

- [ ] **Étape 3 : référence `dev` sur 3101.**

```bash
git -C D:/Repos/macar-next-site-prod fetch origin
git -C D:/Repos/macar-next-site-prod rev-parse --short dev origin/dev
```

Attendu : deux fois `23987cc` (sinon demander au propriétaire). Puis :

```bash
git clone -b dev D:/Repos/macar-next-site-prod D:/macar-migration/sitewide-ref
cd D:/macar-migration/sitewide-ref && npm ci && npm run build
```

Attendu : `✓ Generating static pages (33/33)`. Servir (PowerShell) :

```powershell
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx next start -p 3101 > D:\macar-migration\native-out\server-3101.log 2>&1" -WorkingDirectory "D:\macar-migration\sitewide-ref" -WindowStyle Hidden
Start-Sleep -Seconds 6
(Invoke-WebRequest -UseBasicParsing http://localhost:3101/).StatusCode
```

Attendu : `200`.

- [ ] **Étape 4 : console sans nouvelle erreur.** Dans `D:\Repos\macar-migration-tools` :

```bash
node native/console.mjs --base http://localhost:3100 --ref http://localhost:3101
echo "exit=$?"
```

Attendu : `exit=0` (la branche n'ajoute aucune erreur de console ni de page).

- [ ] **Étape 5 : captures avant et après, 375 et 1440 px.**

```bash
node native/shots.mjs --base http://localhost:3101 --out D:/macar-migration/sitewide-shots/before
node native/shots.mjs --base http://localhost:3100 --out D:/macar-migration/sitewide-shots/after
node native/compare-page.mjs --dir D:/macar-migration/sitewide-shots
```

Attendu : 39 captures par dossier, puis `D:\macar-migration\sitewide-shots\index.html`. Ouvrir les captures des pages touchées (`home`, `home (form-errors)`, `blog`, `blog-isolation-facade`, `mentions-legales`, `politique-confidentialite`, `politique-cookies`) et les regarder une à une : pas de décalage, débordement ni chevauchement ; police Raptor toujours sur les titres ; cartes du blog et des chiffres clés alignées ; fil d'Ariane sur deux lignes à 375 px pour un titre long.

- [ ] **Étape 6 : ménage.** Procédure C sur 3100 et 3101. Supprimer le clone de référence (PowerShell) :

```powershell
New-Item -ItemType Directory -Force D:\macar-migration\empty | Out-Null
robocopy D:\macar-migration\empty D:\macar-migration\sitewide-ref /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
Remove-Item -Recurse -Force D:\macar-migration\sitewide-ref, D:\macar-migration\empty
Test-Path D:\macar-migration\sitewide-ref
(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3100,3101 } | Measure-Object).Count
```

Attendu : `False`, puis `0`. Garder `D:\macar-migration\sitewide-shots` pour le propriétaire.

---

## Tâche 8 : push, preview Vercel et PR

- [ ] **Étape 1 : demander l'accord du propriétaire** pour pousser `heroui-v3-site-wide`, en lui donnant le chemin de `D:\macar-migration\sitewide-shots\index.html`. Ne rien pousser sans un oui explicite.

- [ ] **Étape 2 : push** (après accord) :

```bash
git push -u origin heroui-v3-site-wide
```

Attendu : `branch 'heroui-v3-site-wide' set up to track 'origin/heroui-v3-site-wide'`. Vercel construit la preview de la branche ; le propriétaire en récupère l'adresse sur Vercel ou dans la PR.

- [ ] **Étape 3 : texte de la PR**, hors du dépôt, dans `D:\macar-migration\pr-heroui-v3-site-wide.md` :

```markdown
## HeroUI v3 sur tout le site

Suite de la PR #10 (HeroUI v3 natif) : les derniers éléments faits main passent aux composants HeroUI v3, sans classe qui modifie leur style. Spec : `superpowers/specs/2026-10-05-heroui-v3-site-wide-design.md`, plan : `superpowers/plans/2026-10-05-heroui-v3-site-wide.md`.

### Changements par zone
- **Blog, liste** : chaque article est une `Card` cliquable avec image, `Chip` de catégorie, titre et extrait.
- **Blog, article** : fil d'Ariane `Breadcrumbs` visible (Accueil / Blog / titre), catégorie et tags en `Chip`, encart « Un projet en tête ? » et « À lire ensuite » en `Card`. Les liens du fil passent par le routeur Next.js (`RouterProvider`), sans rechargement.
- **Contenu des articles** : liens au style v3 soulignés, `Separator` pour les traits.
- **Pages légales** : tableau des cookies en `Table` dans un `ScrollShadow` horizontal, `Separator` entre les sections.
- **Formulaire de contact** : récapitulatif d'erreurs et erreur d'envoi en `Alert` (statut danger).
- **Avis Google** : `ScrollShadow` horizontal à la place du dégradé fait main ; défilement automatique, pause et retour au début inchangés.
- **Accueil** : chiffres clés en trois `Card` (une colonne sur téléphone), atouts en cinq `Chip` avec coche.

### Vérifications
- `npm run lint`, `npx tsc --noEmit` et `npm run build` à chaque commit (33 pages statiques).
- Suite de comportement native : 64 tests au vert, dont 21 nouveaux (fil d'Ariane, tableau des cookies, alertes du formulaire, avis avec `ScrollShadow`, accueil).
- Aucune nouvelle erreur de console par rapport à `dev`.
- Captures avant et après en 375 et 1440 px, hors du dépôt.

### À valider sur la preview
Blog (liste et un article), politique cookies sur téléphone, formulaire envoyé vide, carrousel d'avis, chiffres clés et atouts de l'accueil.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Contrôle : `node -e "const t=require('fs').readFileSync('D:/macar-migration/pr-heroui-v3-site-wide.md','utf8');console.log(/[\u2013\u2014]/.test(t)?'tiret long trouvé':'ok')"` affiche `ok`.

- [ ] **Étape 4 : ouverture de la PR par le propriétaire** (`gh` n'est pas installé). Lui donner le lien https://github.com/macar-sa/macar-next-site-prod/compare/dev...heroui-v3-site-wide?expand=1 et le fichier `D:\macar-migration\pr-heroui-v3-site-wide.md` à coller. Il vérifie la preview Vercel, puis fusionne par « Create a merge commit ».
