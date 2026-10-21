# Mention du nom commercial et de l'entité juridique sur macar.be

> Plan de passation (handoff), rédigé le 21/10/2026. Steps use checkbox (`- [ ]`) syntax.
> Branche à créer depuis `dev`, PR vers `dev` (voir CLAUDE.md).

**But :** que le site dise clairement que « Macar » est le nom commercial de la société **M.A. Construction Assistance Rénovation SA** (abrégé M.A.C.A.R.), avec les mentions légales exactes, pour que Google puisse relier la fiche « Macar - Construction, Assistance, Rénovation » à l'entité inscrite à la BCE.

## Contexte : pourquoi maintenant

- Le 21/10/2026, l'étape « Immatriculation de l'entreprise » du compte Google Annonces Local Services (client 930-021-7750) est en **échec** : « Les informations figurant sur le certificat d'immatriculation de votre entreprise ne correspondent pas aux détails de l'établissement ». Tant qu'elle échoue, les annonces ne sont pas diffusées.
- Google lit le registre à partir du n° de TVA BE0477451024 et trouve un autre nom que celui du compte :

| Source | Nom | Adresse |
|---|---|---|
| VIES (TVA) | SA M.A. CONSTRUCTION ASSISTANCE RENOVATION | Avenue Prudent Bols 43-45, 1020 Bruxelles |
| BCE (KBO public) | M.A. Construction Assistance Renovation, abréviation M.A.C.A.R., SA (NV), aucun nom commercial enregistré | Prudent Bolslaan 43-45, 1020 Brussel (siège depuis le 02/03/2018) |
| Fiche Google et compte Google Ads | Macar - Construction, Assistance, Rénovation | Av. Prudent Bols 43, 1020 Bruxelles |
| Site actuel | « Macar SA » (mentions légales, confidentialité, JSON-LD `legalName`) | Avenue Prudent Bols, 43 |

- Aujourd'hui **aucune source ne fait le lien** entre « Macar » et la SA : la BCE n'a pas de nom commercial, le site présente « Macar SA » comme raison sociale (ce n'est pas le nom légal) et ne montre le n° de TVA que sous une forme mal découpée (`BE0477.45.10.24` au lieu de `BE 0477.451.024`).
- Un courrier a été envoyé à Google (Monia Saadi, Annonces locales) pour savoir quel document ils acceptent. Ce changement sur le site est utile dans tous les cas : c'est une preuve publique du lien, et ce sont des mentions qu'une société doit de toute façon afficher sur son site (dénomination, forme légale, siège, numéro d'entreprise, RPM et tribunal ; voir DNS Belgium, « Obligatory company website »).

Sources consultées le 21/10/2026 :
- BCE : https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=0477451024&actionLu=Rechercher
- VIES : https://ec.europa.eu/taxation_customs/vies/rest-api/ms/BE/vat/0477451024
- DNS Belgium : https://www.dnsbelgium.be/en/news/obligatory-company-website

## Valeurs à utiliser

| Champ | Valeur |
|---|---|
| Nom commercial | Macar |
| Dénomination légale | M.A. Construction Assistance Rénovation SA (abrégé M.A.C.A.R.) |
| Forme légale | Société anonyme (SA) |
| Siège social (BCE) | Avenue Prudent Bols 43-45, 1020 Bruxelles |
| Adresse d'exploitation (fiche Google) | Avenue Prudent Bols 43, 1020 Bruxelles, à garder telle quelle dans le JSON-LD pour rester identique à la fiche Google |
| Numéro d'entreprise | 0477.451.024 |
| TVA | BE 0477.451.024 |
| RPM | « RPM Bruxelles » + division (francophone ou néerlandophone) : **à confirmer** sur un acte au Moniteur belge ou un document officiel de la société avant de l'écrire |

À vérifier avant de coder : l'orthographe exacte de la dénomination en français sur la BCE (accent sur « Rénovation » ; la BCE affiche la version néerlandaise sans accent et signale une dénomination française depuis le 23/04/2002).

Phrase de référence, à reprendre telle quelle (pas de tiret long, cf. CLAUDE.md) :

> Macar est le nom commercial de M.A. Construction Assistance Rénovation SA (M.A.C.A.R.), siège social Avenue Prudent Bols 43-45, 1020 Bruxelles, numéro d'entreprise et TVA BE 0477.451.024.

## Global Constraints

- Texte visiteur : pas de tiret long (ni — ni –), voir CLAUDE.md.
- Ne pas changer le nom affiché de la marque (« Macar ») dans la navigation, les titres, le copyright ou les pages de service : seul le nom légal est corrigé là où le site parle de l'entité juridique.
- Ne pas modifier l'adresse d'exploitation du JSON-LD ni celle du pied de page sans accord : elles doivent rester identiques à la fiche Google (une adresse différente peut relancer la validation de la fiche).
- Pas de nouvelle dépendance, pas de changement de style : uniquement du texte dans des composants existants.

## Review Focus

1. La dénomination légale et le numéro d'entreprise apparaissent sur `/mentions-legales`, `/politique-confidentialite` et dans le pied de page de toutes les pages.
2. Plus aucune occurrence de « Macar SA » utilisée comme raison sociale, ni de `BE0477.45.10.24`.
3. Le JSON-LD reste valide (Rich Results Test ou validateur schema.org) et garde `name: "Macar"`.
4. Le pied de page tient à 320 px sans défilement horizontal (test existant dans `layout.spec.mjs`).

### Task 1 : Mentions légales
Files: `src/app/mentions-legales/page.tsx`, `e2e/tests/legal.spec.mjs`.
- [ ] Test : adapter « l'éditeur est Macar SA » : la page contient « M.A. Construction Assistance Rénovation SA », « 0477.451.024 » et « nom commercial », ne contient ni « SRL », ni « Macar SA », ni « BE0477.45.10.24 ». Lancer, le voir échouer.
- [ ] Section « Éditeur du site » : remplacer le bloc par la phrase de référence (ou un bloc équivalent : nom commercial, dénomination, forme, siège social 43-45, numéro d'entreprise, TVA, RPM une fois confirmé), puis téléphone et email inchangés.
- [ ] Sections « Directeur de la publication », « Propriété intellectuelle », « Responsabilité » : remplacer « Macar SA » par « M.A. Construction Assistance Rénovation SA » à la première occurrence de chaque section, « Macar » ensuite si la phrase s'y prête.
- [ ] Mettre à jour « Dernière mise à jour ».
- [ ] Vert, lint, types, commit.

### Task 2 : Politique de confidentialité
Files: `src/app/politique-confidentialite/page.tsx`, `e2e/tests/legal.spec.mjs`.
- [ ] Test : même contrôle que la tâche 1 sur `/politique-confidentialite`.
- [ ] Phrase d'introduction : « M.A. Construction Assistance Rénovation SA, qui exerce sous le nom commercial Macar (« Macar », « nous »), ... ».
- [ ] Bloc « Responsable du traitement » : dénomination légale, siège social 43-45, numéro d'entreprise / TVA `BE 0477.451.024`, email.
- [ ] Vert, commit.

### Task 3 : Pied de page
Files: `src/app/_components/footer.tsx`, `e2e/tests/footer.spec.mjs` (ou un nouveau test dans `legal.spec.mjs`).
- [ ] Test : sur `/` à 1440 px et 375 px, le pied de page contient « M.A. Construction Assistance Rénovation SA » et « BE 0477.451.024 ».
- [ ] Dans la liste « Contact », remplacer `<li>TVA: BE0477.45.10.24</li>` par deux lignes courtes, par exemple `M.A. Construction Assistance Rénovation SA (nom commercial Macar)` puis `BCE / TVA : BE 0477.451.024`. Garder le copyright « Macar ».
- [ ] Vérifier 320, 375 et 1440 px (pas de débordement), suite `footer.spec.mjs` et `layout.spec.mjs` au vert, commit.

### Task 4 : Données structurées et llms.txt
Files: `src/lib/seo/localBusiness.ts`, `public/llms.txt`.
- [ ] `legalName: "M.A. Construction Assistance Rénovation SA"` ; ajouter `alternateName: ["M.A.C.A.R.", "Macar - Construction, Assistance, Rénovation"]` ; `taxID: "0477.451.024"` ; garder `name: "Macar"`, `vatID: "BE0477451024"` et l'adresse d'exploitation.
- [ ] `public/llms.txt` ligne `TVA : BE0477.45.10.24` : remplacer par la phrase de référence (nom commercial, dénomination, BCE / TVA `BE 0477.451.024`).
- [ ] Valider le JSON-LD (build puis validateur), commit.

### Task 5 : Vérification et livraison
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e`.
- [ ] Contrôle visuel Playwright à 375 et 1440 px des trois zones touchées (captures hors du dépôt).
- [ ] PR vers `dev` avec le contexte ci-dessus ; après fusion dans `main` et déploiement, vérifier sur https://www.macar.be/mentions-legales que le texte est en ligne, puis le signaler à Ardonis (preuve à donner à Google si besoin).

## Hors périmètre (suivi ailleurs)

- Nom de la fiche Google : on garde « Macar - Construction, Assistance, Rénovation ».
- Dolibarr : l'émetteur des factures s'appelle « MA CAR S.A » ; à changer dans la configuration de la société (décision de Shkelzen), pour que chaque facture porte la dénomination légale et le nom commercial.
- Enregistrer « Macar » comme nom commercial à la BCE (guichet d'entreprises, payant) : seulement si Google refuse les autres preuves.
