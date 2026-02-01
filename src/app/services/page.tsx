import Image from "next/image";
import Link from "next/link";
import Screen from "../_components/screen";
import { MainHeading, P, SecondHeading } from "../_components/textStyles";
import { PrimaryButton } from "../_components/buttons";
import { Chip } from "@heroui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos services — Rénovation, plomberie, électricité, toiture | Macar",
  description:
    "Macar à Bruxelles : rénovation intérieure et extérieure, plomberie, installations électriques et toiture. Devis gratuit sur mesure.",
};

const baseUrl = "https://www.macar.be";
const localBusinessId = baseUrl + "/#localbusiness";

type DetailCategory = { title: string; items: string[] };
type ServiceItem = {
  id: string;
  title: string;
  image: string;
  summary: string;
  detail: string;
  detailIntro?: string;
  detailCategories?: DetailCategory[];
  chips: string[];
};

const renovationDetailCategories: DetailCategory[] = [
  {
    title: "Peinture",
    items: [
      "Peinture intérieure : murs, plafonds, portes, chambranles, plinthes (2 couches, primer)",
      "Peinture extérieure : façade, corniches, planche de rive, balustrades (primer, peinture spéciale façade)",
      "Peinture radiateurs et tuyaux de chauffage",
      "Peinture porte-fenêtre intérieur et extérieur, marche-pied bois, kit joint",
      "Peinture coffre-fort encastré, murs et plafonds (blanc, couleur sur référence client)",
    ],
  },
  {
    title: "Plafonds",
    items: [
      "Enlèvement faux plafond gyproc ou lattis, évacuation",
      "Pose plaques gyproc hydrofugées, bandes gyproc, découpe autour meubles",
      "Enduisage 1ère et 2ème couche, séchage, ponçage, primer, peinture 2 couches finales",
      "Coupoles, contours : cornières, plaques gyproc, enduisage, finitions",
    ],
  },
  {
    title: "Murs",
    items: [
      "Grattage zones abîmées, préparation surface, enduisage (1ère et 2ème couche), séchage, ponçage, primer, peinture",
      "Réparation fissures, fermeture trous, pose bande gyproc",
      "Béton contact, gitex (toile fibre de verre), cimentage, finitions",
      "Enlèvement papiers peints, préparation mur, enduisage, pose papiers peints, fixation plinthes",
      "Enlèvement plaintes, préparation pans de mur",
    ],
  },
  {
    title: "Carrelage",
    items: [
      "Préparation surface, pose carrelages sol et mur, pose joints et finitions",
      "Carrelage salle de bain, toilette, pied de douche",
      "Enlèvement carrelages existants, évacuation, chape ou béton coulé, pose nouveaux carrelages, joints, plinthes",
      "Carrelage terrasses et balcons, joints, plinthes",
    ],
  },
  {
    title: "Parquet et plinthes",
    items: [
      "Enlèvement ancien parquet, sous-couche, pose parquet flottant, plinthes et finitions",
      "Pose plinthes, finitions",
      "Ponçage parquet, vernis (sur zones abîmées)",
    ],
  },
  {
    title: "Isolation et façade",
    items: [
      "Installation chantier, protection sol et trottoir, pose échafaudages, bâches",
      "Isolation façade : laine de roche, gitex (toile fibre de verre), colle-ciment, cimentage (2ème couche), lissage",
      "Béton contact, primer, crépi sur toutes les surfaces",
      "Rejointoiement briques : enlèvement anciens joints, nettoyage haute pression, pose nouveaux joints et finitions",
      "Peinture façade : préparation surface, primer, peinture spéciale façade 2 couches finales",
      "Lattis PVC, découpe sur mesure",
    ],
  },
  {
    title: "Terrasses et étanchéité",
    items: [
      "Enlèvement ancien derbygum, panneaux ; pose panneaux OSB, sous-couche, derbygum, solins",
      "Isolation terrasses : laine de roche, polyisocyanurate rigide",
      "Gîtes bois : enlèvement, pose gîtes bois traité ; U profil zinc",
      "Chapes béton, béton coulé, armature ; carrelage terrasses, joints",
      "Peinture dessous terrasses, balustrades : grattage armature, antirouille, primer, peinture",
      "Nettoyage bankirai, ponçage radiateurs extérieur, primer, peinture",
    ],
  },
  {
    title: "Corniches et cheminée",
    items: [
      "Grattage corniche, réparation fissures (kit), primer, peinture blanc spécial extérieure",
      "Réparation cheminée : protection toit, enlèvement ciment, préparation surface, fermeture sortie, ciment, gitex, finitions",
      "Remise en état et peinture corniche façade",
    ],
  },
  {
    title: "Chantier et finitions",
    items: [
      "Installation chantier, protection sol, démontage/remontage prises, portes, meubles",
      "Pose kit joint, silicone receveur douche ; latte aluminium jonctions vinyle",
      "Évacuation déchets, mise en conteneur",
      "Pose ciment, kit joint murets ; enlèvement plantes (lierre), nettoyage débris",
    ],
  },
];

const plomberieDetailCategories: DetailCategory[] = [
  {
    title: "Canalisations et évacuations",
    items: [
      "Réparation et remplacement des tuyaux de canalisation en grès par PVC orange (diam. 125 ou 160 mm), création ou remplacement de chambres de visite en PVC",
      "Remplacement de sterfput, pose tuyaux et coudes PVC orange, étanchéité autour des tuyaux et finitions",
      "Descente d'eau pluviale : enlèvement ancienne descente, pose nouvelle descente (zinc carré ou PVC gris), avaloir, raccordement dans l'avaloir",
      "Tuyau de décharge cuisine ou salle de bain : ouverture du mur, remplacement tuyau défectueux (cuivre/grès par PVC diam. 40–50 ou 70–80 mm), fermeture mur (blocs ytong, goldband ou panneaux bois marin)",
      "Raccordement décharge toilette et eaux usées vers égout, gaine technique, passage plafond, raccordement eau chaude et froide",
      "Remplacement tuyaux entre chambres de visite : ouverture sol béton, enlèvement tuyaux grès, pose PVC orange, remplacement chambres de visite, stabilisé et béton coulé",
      "Découpe et remplacement tuyau décharge toilette (diam. 90), manchon en T PVC, raccordement lave-linge et décharges",
      "Nettoyage égouts à haute pression de la chambre de visite vers la décharge de la ville",
    ],
  },
  {
    title: "Chaudière et chauffage central",
    items: [
      "Vidange de l'installation, démontage et enlèvement de l'ancienne chaudière, pose chaudière à condensation (Vaillant Ecotec plus, Ecotec pro, etc.), kit montage, adaptateur 80/125",
      "Tubage de la cheminée (cave jusqu'au toit), pose fumisterie (tuyaux PP 80 mm, coudes 90°, éléments droits), sortie sur le toit, finitions",
      "Filtre Fernox, vase d'expansion, thermostat (Vaillant VRT350, VRT380), mise à l'égout pour les condensats, accessoires départ et retour, tuyaux inox ou cuivre",
      "Radiateurs : démontage, fourniture et pose nouveaux radiateurs (dimensions sur mesure), kit de vannes, mise en conformité tuyaux départ et retour, remplissage et équilibrage, purge du circuit",
      "Réparation chaudière : remplacement thermostat (Junkers, Vaillant), remplacement échangeur de plaque sanitaire, entretien annuel périodique",
      "Transformation installation chaudière encastrée en apparente : tuyaux acier PLT, coudes, manchons, té, pose béton avec barres d'armature, dalles béton",
    ],
  },
  {
    title: "Eau chaude sanitaire (boiler, chauffe-eau)",
    items: [
      "Démontage et évacuation de l'ancien boiler ou chauffe-eau gaz ; fermeture du gaz si nécessaire",
      "Pose réservoir eau chaude sanitaire (Vaillant, Atlantic, Bulex, etc.), raccordement, réducteur de pression, soupape de sécurité, vase d'expansion, mise en service",
      "Boiler électrique : fourniture et pose (Atlantic 200 L, Bulex 15 L, etc.), groupe de sécurité, réducteur de pression 7 bar, raccordement et mise en service",
      "Accumulateur électrique thermodynamique (Atlantic, etc.), kit Unistor, accessoires raccordement, réducteur de pression 7 bar, groupe de sécurité, vase d'expansion sanitaire, vannes à bille",
    ],
  },
  {
    title: "Sanitaire – Toilettes et lavabos",
    items: [
      "Pose et raccordement toilette (cuvette au sol ou suspendue, réservoir Geberit, abattant softclose, sortie horizontale ou verticale), fixation, arrivée d'eau",
      "Fourniture et pose lave-mains (vasque, céramique), siphon (bouteille, surverse, bonde, rosace), mitigeur lavabo (Grohe Eurosmart, etc.), robinet flotteur universel",
      "Remplacement des siphons du lavabo et du bain, remplacement robinets (Schell, etc.)",
      "Détartrage chasse d'eau, remplacement petit robinet qui fuit (Schell)",
    ],
  },
  {
    title: "Sanitaire – Douche",
    items: [
      "Recherche de fuite d'eau, démontage mitigeur de douche, pose d'un nouveau mitigeur",
      "Renforcement du receveur douche par dessous (planche, gîtes bois), pose silicone autour du receveur",
      "Enlèvement carrelage paroi douche pour accès siphon ; joints carrelages décollés (joints liquides sans enlèvement carrelage)",
      "Nettoyage joints autour receveur douche, séchage, pose nouveau kit joint",
    ],
  },
  {
    title: "Cuisine",
    items: [
      "Remplacement tuyau de décharge évier encastré : ouverture mur (burin, marteau-piqueur), remplacement tuyau Ø 40–50 (PVC), fermeture mur, remise meubles, kit joint-colle plan de travail",
      "Remplacement évier (inox, bac, plan de travail), découpe plan de travail, démontage mitigeur existant et pose sur nouvel évier",
      "Joint silicone plan de travail côté mur, finitions",
    ],
  },
  {
    title: "Détection de fuites et étanchéité",
    items: [
      "Cimentage des chambres de visite suite rapport de détection de fuites (NDDetect, Polygon, etc.)",
      "Étanchéité mur extérieur : enlèvement terre, bande derbigum à chaud, gravier, solin en forme de Z, remise en place terre",
      "Réparation descente d'eau à l'intersection véranda : mise à nu tuyauteries, remplacement tuyaux et coudes encastrés dans béton, remise en place terre",
    ],
  },
  {
    title: "Chantier et finitions plomberie",
    items: [
      "Protection du sol, démontage meubles de cuisine élément par élément, pieds en bois provisoires pour sécuriser plan de travail en granit",
      "Évacuation et mise en conteneur des déchets (dalles, anciennes canalisations, chaudière, etc.)",
      "Ouverture et fermeture mur (blocs ytong, goldband, ou panneaux bois marin avec cadre et kit joint pour accès futur)",
      "Prestations en régie (tarif horaire par homme, déplacement par véhicule) pour travaux complexes ou imprévus",
    ],
  },
];

const electriciteDetailCategories: DetailCategory[] = [
  {
    title: "Tableau électrique et mise en conformité",
    items: [
      "Remplacement total du tableau électrique avec mise en conformité : interrupteurs différentiels (IV 40A 0,3A, 0,03A ou 30 mA, 300 mA), disjoncteurs (20A III ou 25A pour cuisine, 16A ou 20A pour circuits), fourniture et pose du tableau",
      "Saignée depuis le tableau vers le sol, vers le faux plafond dans le hall et mur et plafond dans chaque pièce, fermeture des saignées avec finitions",
      "Réalisation, plan du circuit et mise en conformité par un organisme agréé ; certificat de conformité (à la charge du client si précisé)",
      "Vérification de plusieurs points : interrupteurs, prises et petit tableau électrique dans la toilette ou les pièces",
    ],
  },
  {
    title: "Saignées et câblage",
    items: [
      "Saignée au sol depuis le tableau vers les prises (2 tubes ou plus), saignées au niveau du plan de travail pour les doubles-prises avec encastrement des blochets 80x80x50",
      "Saignée depuis une prise à proximité avec remontée vers une nouvelle prise et blochet 80x80",
      "Pose de gaines avec tire-fil pour câble de fibre optique (point de départ et de fin à déterminer sur place)",
      "Fourniture et pose du câblage relatif aux différents postes (cuisine, bureau, hall, chambres, living, salle de bain)",
      "Démontage des prises électriques et interrupteur, allongement des fils électriques, remise en place des prises et interrupteur",
    ],
  },
  {
    title: "Cuisine",
    items: [
      "Ajout d'une alimentation pour lave-vaisselle + prise, ajout d'une alimentation pour machine à laver + prise",
      "Installation de doubles-prises pour plan de travail (côté gauche et droit), remplacement de prises existantes",
      "Pose d'un câble électrique pour le raccordement des luminaires en-dessous de l'armoire ou au plafond",
      "Installation d'une prise en bas derrière la porte côté droit, câble 5G 4 carrés pour taque électrique",
      "Remplacement d'interrupteurs et de prises doubles, pose de nouvelles prises sous interrupteur",
    ],
  },
  {
    title: "Pièces et éclairage",
    items: [
      "Rallongement des fils électriques, pose des socquets simples avec ampoule, vérification des interrupteurs dans les chambres et le couloir",
      "Pose de spots au plafond et d'appliques (spots) au mur et au plafond",
      "Pose d'un câble pour lustre sur le plafond, installation alimentation pour lampes au plafond",
      "Remplacement d'interrupteurs (simple, double, poussoir), remplacement de prises (simples, doubles, triples), déplacement d'interrupteur de l'autre côté du mur",
      "Ajout de prises : prises aux coins des pièces avec récupération du circuit sur une prise existante, doubles prises de chaque côté du lit, prises living, suppression de prises et prises péritel",
      "Remplacement d'interrupteurs dans le couloir et d'interrupteurs poussoirs, hall d'entrée : interrupteur double (poussoir et normal)",
    ],
  },
  {
    title: "Salle de bain et toilette",
    items: [
      "Pose d'un interrupteur sur la paroi de douche, interrupteur dans la toilette, interrupteur et prise à l'entrée",
      "Pose de prises côté radiateur, remplacement de l'interrupteur, pose d'un câble pour lustre sur le plafond",
      "Pose de prises côté miroir, remplacement de l'interrupteur, câble lustre plafond",
      "Raccordement radiateur (plomberie) et placements d'appliques spots mur et plafond en salle de bain",
    ],
  },
  {
    title: "Hall et entrée",
    items: [
      "Sonnette sans fil ni pile porte d'entrée (SP44 bouton autonome), prise hall d'entrée",
      "Ajout d'une prise pour aspirateur, saignée depuis une prise à proximité avec remontée vers nouvelle prise et blochet 80x80",
      "Remplacement d'un interrupteur, ajout de prises",
    ],
  },
  {
    title: "Bureau et chambres",
    items: [
      "Bureau : remplacement de prises, remplacement d'interrupteur, saignée avec remontée vers nouvelle prise et blochet",
      "Chambre : remplacement de prises doubles, pose de nouvelles prises sous interrupteur ; chambres : ajout de prises aux coins ou de chaque côté du lit, remplacement d'interrupteur, câble lustre plafond selon pièce",
    ],
  },
  {
    title: "Prises TV, fibre et équipements",
    items: [
      "Démontage de prises électriques et de prise TV ; fourniture et pose de prises avec plaques de recouvrement (triples et simples), fourniture et pose d'une prise TV/FM ADSL Interkabel avec cache prise TV/FM",
      "Installation d'une prise et remplacement d'un néon",
      "Raccordement de la climatisation à l'électricité, pose d'une prise électrique extérieure hydrofuge",
      "Enlèvement de l'ancien câble de téléphone sur les murs (suppression)",
    ],
  },
  {
    title: "Chantier et remarques",
    items: [
      "Installation du chantier et protection du sol (et des mobiliers) ; finitions autour des interrupteurs, prises, appliques et autres non comprises dans le prix (à préciser au devis)",
      "Vu l'état de l'installation électrique, les réparations ne sont pas couvertes par une garantie (mention possible au devis)",
    ],
  },
];

const toitureDetailCategories: DetailCategory[] = [
  {
    title: "Chantier et échafaudage",
    items: [
      "Installation du chantier : pose d'un échafaudage (avant, arrière, colonnes), lift (monte-charge), conteneur (déchets normaux ou asbest), toilette de chantier",
      "Pose d'échafaudages tubulaires multidirectionnels partant du sol avec filet au dernier palier",
      "Démarches administratives auprès de la commune-police (réservation emplacement, interdiction stationnement, autorisation échafaudages sur trottoir) à la charge du client",
    ],
  },
  {
    title: "Couverture en tuiles",
    items: [
      "Démontage et évacuation de la couverture existante (tuiles, roofing, asbest), mise en conteneur",
      "Fourniture et pose d'un pare-vapeur (Vallint T100 SK², etc.), fourniture et pose d'isolation IKO Enertherm ALU TG (120 mm, 140 mm, R = 5,45 ou 6,35)",
      "Fourniture et pose d'une sous-toiture, contre-lattes (30x50 ou 50x30 traité vert), lattes à panne (25x40 pin du Nord traitées et calibrées)",
      "Fourniture et pose de tuiles (terre cuite rouge, KORAMIC 993 rouge ou noir, TBF Renaissance, tuiles plates pottelbergh), tuiles de rive, sous-faîtière ventilée, tuiles faîtières demi-ronde 230 mm fixation vis INOX",
      "Planche de rive (méranti, SLS 38/235, ALU blanc, noir ou anthracite), bavette en zinc au pied de la toiture",
      "Nettoyage de la toiture en tuiles à haute pression, remplacement des tuiles cassées, remise en place des arrêtiers",
    ],
  },
  {
    title: "Corniches et gouttières",
    items: [
      "Rectification du pied de toiture : démontage des lattes de la sous-toiture et des contre-lattes, remontage dans les règles de l'art",
      "Fourniture et pose d'une planche de face en méranti, fourniture et pose de gouttières adéquates en zinc naturel + accessoires",
      "Démontage et évacuation de la gouttière existante et de la planche de face ; fourniture et pose d'un cheneau en zinc naturel (0,8 mm), joints de dilatation",
      "Bavette en zinc naturel raccord toiture-gouttière ; corniche : nouvelle étanchéité (derbygum), grattage, ponçage et mise en peinture des planches de rive méranti",
      "Réparation des corniches : ponçage, réparation des parties détériorées, primer, joints souples, deux couches peinture Trimetal Permaline Décor Satin",
      "Remplacement corniche : démontage et évacuation, réalisation d'une nouvelle corniche d'ossature bois, cheneau en zinc, revêtement en ALU (couleur à déterminer) ou Operal Eternit",
      "Cartouches : enlèvement lattis PVC, découpe zinc et derbygum, remplacement boiserie abîmée (voliges, cartouches), fabrication et pose cartouches, derbygum et bourrelet zinc",
      "Avaloires : suppression anciennes avaloires, fourniture et pose de nouvelles avaloires et finitions",
    ],
  },
  {
    title: "Toit plat et étanchéité",
    items: [
      "Nettoyage et préparation de l'étanchéité existante (conservation comme pare-vapeur) pour la pose d'isolation",
      "Fourniture et pose d'isolation IKO Enertherm ALU TG 140 mm (rainuré-languette) R = 6,35 ; fourniture et pose d'un primer et d'une sous-couche bitumineuse (Mapei Polyglass Spider)",
      "Fourniture et pose d'une étanchéité en Derbigum (SP-FR 4 mm collée à froid, recouvrements à chaud) ou EPDM Resitrix",
      "Application de relevée en Derbigum ou EPDM collée à chaud en adhérence totale ; fourniture et pose d'un avaloir (diam. 70 mm, 80 mm)",
      "Réalisation d'un acrotère (rehausse autour de la toiture) avec gîtes 7/15 ou 7x18 traité vert ; profil de finition en zinc naturel ou ALU sur acrotères",
      "Fourniture et pose de solins en zinc + joint souple en silicone ; planche de rive en méranti",
      "Plate-forme : enlèvement étanchéité existante (plomb, derbygum), pose sous-couche, pose derbygum ou EPDM, solin zinc forme U, nouvel avaloir",
    ],
  },
  {
    title: "Velux et lucarnes",
    items: [
      "Ouverture du toit (réalisation d'un emplacement pour velux), fourniture et pose de velux (GGL 2070 MK04 78x98, SK06 114x118, UK08 140x134) + raccord tuiles (EDW 0000)",
      "Dépose et pose des velux existants ; fourniture et pose d'un store occultant DKL",
      "Réparation autour du velux : enlèvement des tuiles ou ardoises côté gauche et droite, pose de plomb, remise en place des tuiles ou ardoises, remplacement des endommagées",
      "Joue de lucarne : fourniture et pose d'ardoises Alterna gris foncé, revêtement en zinc naturel ou ALU sur les joues de lucarne",
      "Réalisation d'un chien-assis (lucarne) ; jonction joue lucarne et versant : noquets en plomb tuile par tuile",
      "Les finitions intérieures des velux ne sont pas comprises dans le prix",
    ],
  },
  {
    title: "Noues, arêtiers et jonctions",
    items: [
      "Noue : fourniture et pose de voliges (3/4/10 traité vert) support pour noue en zinc, fourniture et pose de noues en zinc naturel, réalisation d'une noue en tuiles",
      "Arêtiers : enlèvement des anciens arêtiers et faîtières, pose des voliges, sous-faîtières ventilées, tuiles d'arêtier ou arêtiers demi-ronde fixation vis INOX, jonction 3D",
      "Jonction avec le voisin : fourniture et pose des noquets en plomb tuile par tuile et solin en zinc ; rive en ardoise (séparation avec le toit des voisins)",
      "Pignon : noquets en plomb, solins en zinc, cimentage sur tuile de faîtière si nécessaire",
    ],
  },
  {
    title: "Cheminée et solins",
    items: [
      "Cheminée : fermeture de la sortie cheminée, pose d'une couche de ciment, gitex, 2ème couche ciment et finitions",
      "Fourniture et pose d'une étanchéité autour de la cheminée (plombage + solin en zinc) ; pose du solin sur le coin de la cheminée sur le toit",
      "Remplacement du solin de la terrasse du dernier étage ; pose du solin en forme de U sur le bord de la corniche (zinc naturel)",
      "Cimentage des cheminées : fermeture des trous (briques et ciment), béton contact, treillis gitex, cimentage et finitions",
    ],
  },
  {
    title: "Plomb, zinc et solins",
    items: [
      "Enlèvement du plomb sur toit mitoyen, pose du nouveau plomb (fixations fix all) et finitions",
      "Démontage du solin existant, découpe EPDM ou derbygum endommagé, remplacement par EPDM Resitrix ; pose du nouveau solin en zinc naturel, fixation et kit joint",
      "Pose du zinc naturel en forme de U sur le bord de la corniche (tout le long avec arrondis) ; pose du plomb sur un couvre-mur (geste commercial possible)",
    ],
  },
  {
    title: "Descentes d'eau pluviale",
    items: [
      "Fourniture et pose d'une descente d'eau pluviale en zinc naturel diam. 80 (ronde) ou en PVC jusqu'au trottoir",
      "Raccordement de la nouvelle avaloire sur la descente d'eau existante ; pose d'une nouvelle avaloire côté gauche ou droit de l'entrée",
      "Ouverture-découpe de dalles sur le trottoir, pose d'une gargouille (fonte ou sur mesure), pose d'un dauphin et mise en peinture",
    ],
  },
  {
    title: "Coupoles et verrières",
    items: [
      "Fourniture et pose d'une nouvelle coupole (sortie de toiture) Skylux ou coupole toit plat avec dôme double parois bombé acrylique (PVC 20/00 Energy Profit, OUVRANT manuel avec manivelle)",
      "Fourniture et pose de verrières en polycarbonate ; enlèvement des plexis existants, pose de nouveaux plexis polyclear à 4 parois",
      "Habillage intérieur des coupoles non compris",
    ],
  },
  {
    title: "Réparations et pied de toit",
    items: [
      "Réparation au pied du toit suite infiltrations : enlèvement des tuiles (rangées concernées), renforcement provisoire des chevrons (poutre et étançons), démontage sablière abîmée, pose nouvelle sablière et fixation, repose des tuiles et finitions",
      "Réparation autour du velux : découpe des tuiles existantes et fixation avec fil en fer sur latte à panne, vérification et remplacement des lattes à panne si nécessaire",
      "Remise en état des faîtières : ciment des faîtières, cimentage partiel ; enlèvement d'une rangée de tuiles des deux côtés du velux, découpe et remise en place",
    ],
  },
];

const services: ServiceItem[] = [
  {
    id: "renovation",
    title: "Rénovation intérieure et extérieure",
    image: "/services/Renovation.png",
    summary:
      "Carrelage de salle de bain, isolation intérieure et extérieure, isolation de façade avec crépi, pose de parquet flottant, abattage de murs porteurs.",
    detail: "",
    detailIntro:
      "Macar réalise à Bruxelles et en Belgique l'ensemble des prestations listées ci-dessous, issues de nos chantiers de rénovation intérieure et extérieure. Chaque prestation peut faire l'objet d'un devis gratuit sur mesure.",
    detailCategories: renovationDetailCategories,
    chips: [
      "Peinture intérieure et extérieure",
      "Plafonds en gyproc",
      "Carrelage et joints",
      "Isolation de façade et crépi",
      "Parquet flottant et plinthes",
      "Papier peint et réparation de fissures",
      "Terrasses et étanchéité",
    ],
  },
  {
    id: "plomberie",
    title: "Plomberie",
    image: "/services/Plomberie.png",
    summary:
      "Canalisations et chambres de visite, chaudière et chauffage central, boiler et eau chaude sanitaire, toilettes et lavabos, douche et cuisine, détection de fuites et étanchéité.",
    detail: "",
    detailIntro:
      "Macar réalise à Bruxelles et en Belgique l'ensemble des prestations listées ci-dessous, issues de nos chantiers de plomberie. Chaque prestation peut faire l'objet d'un devis gratuit sur mesure.",
    detailCategories: plomberieDetailCategories,
    chips: [
      "Canalisations et chambres de visite",
      "Chaudière et chauffage central",
      "Boiler et eau chaude sanitaire",
      "Toilettes, lavabos et douche",
      "Cuisine et décharge évier",
      "Détection de fuites et étanchéité",
    ],
  },
  {
    id: "electricite",
    title: "Installation électrique",
    image: "/services/Installation Electrique.png",
    summary:
      "Tableau électrique et mise en conformité, saignées et câblage, prises et interrupteurs, spots et éclairage, cuisine et salle de bain, fibre optique et prise TV.",
    detail: "",
    detailIntro:
      "Macar réalise à Bruxelles et en Belgique l'ensemble des prestations listées ci-dessous, issues de nos chantiers d'installation électrique. Chaque prestation peut faire l'objet d'un devis gratuit sur mesure.",
    detailCategories: electriciteDetailCategories,
    chips: [
      "Tableau électrique et conformité",
      "Saignées et câblage",
      "Prises et interrupteurs",
      "Spots et éclairage",
      "Cuisine et salle de bain",
      "Fibre optique et prise TV",
    ],
  },
  {
    id: "toiture",
    title: "Toiture",
    image: "/services/Toiture.png",
    summary:
      "Couverture tuiles et ardoises, toit plat et étanchéité Derbigum/EPDM, corniches et gouttières zinc, velux et lucarnes, noues et arêtiers, cheminée et solins, descentes d'eau pluviale, coupoles.",
    detail: "",
    detailIntro:
      "Macar réalise à Bruxelles et en Belgique l'ensemble des prestations listées ci-dessous, issues de nos chantiers de toiture. Chaque prestation peut faire l'objet d'un devis gratuit sur mesure.",
    detailCategories: toitureDetailCategories,
    chips: [
      "Couverture tuiles et ardoises",
      "Toit plat et étanchéité",
      "Corniches et gouttières",
      "Velux et lucarnes",
      "Noues et arêtiers",
      "Cheminée et solins",
      "Descentes d'eau pluviale",
    ],
  },
];

const servicesPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "name": "Nos services",
      "description":
        "Liste des domaines d'activité de Macar : rénovation intérieure et extérieure, plomberie, installation électrique, toiture. Prestations non exhaustives, devis sur mesure.",
      "numberOfItems": services.length,
      "itemListElement": services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.title,
        url: `${baseUrl}/services#${s.id}`,
      })),
    },
    ...services.map((s) => ({
      "@type": "Service" as const,
      name: s.title,
      description: s.summary,
      provider: { "@id": localBusinessId },
      url: `${baseUrl}/services#${s.id}`,
    })),
  ],
};

function ServiceSection({
  id,
  title,
  image,
  summary,
  detail,
  detailIntro,
  detailCategories,
  chips,
}: ServiceItem) {
  const hasDetailCategories =
    detailCategories && detailCategories.length > 0;

  return (
    <section id={id} className="scroll-mt-24">
      <div className="lg:grid lg:grid-cols-[1.1fr_1.25fr] lg:gap-x-12 xl:gap-x-16 lg:items-start">
        {/* Colonne gauche : titre, résumé, chips, lien */}
        <div className="lg:sticky lg:top-28">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={image}
              alt=""
              width={40}
              height={40}
              className="flex-shrink-0 object-contain"
              aria-hidden
            />
            <SecondHeading customClasses="text-left text-xl lg:text-2xl mt-0">
              <h2>{title}</h2>
            </SecondHeading>
          </div>
          <p className="text-sm text-default-600 mb-4">{summary}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map((label) => (
              <Chip
                key={label}
                variant="flat"
                color="primary"
                size="sm"
                classNames={{
                  base: "bg-primary/10",
                  content: "text-primary font-medium",
                }}
              >
                {label}
              </Chip>
            ))}
          </div>
          <Link
            href="/#contact"
            className="text-sm font-medium text-accent1 hover:underline"
          >
            Demander un devis pour ce service →
          </Link>
        </div>
        {/* Colonne droite : paragraphe ou listes par catégorie (GEO) */}
        <div className="mt-6 lg:mt-0">
          {hasDetailCategories ? (
            <div className="space-y-6">
              <p className="text-sm lg:text-base text-default-700 leading-relaxed">
                {detailIntro}
              </p>
              <div className="space-y-5">
                {detailCategories!.map((cat) => (
                  <div key={cat.title}>
                    <h3 className="text-sm font-semibold text-headings mb-2">
                      {cat.title}
                    </h3>
                    <ul className="text-sm text-default-700 leading-relaxed space-y-1 list-disc list-inside marker:text-primary/70">
                      {cat.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm lg:text-base text-default-700 leading-relaxed">
              {detail}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesPageJsonLd),
        }}
      />
      <main className="flex min-h-screen flex-col">
        {/* Hero — court, plus large sur grand écran */}
      <Screen name="services" customClassesInner="text-left">
        <div className="lg:mt-16 max-w-3xl xl:max-w-4xl">
          <MainHeading>
            <h1 className="leading-tight">Nos services</h1>
          </MainHeading>
          <p className="mt-4 text-base lg:text-lg text-default-600">
            Rénovation, plomberie, électricité et toiture à Bruxelles et en
            Belgique.
          </p>
          <p className="mt-2 text-sm text-default-500">
            Les prestations listées ci-dessous sont non exhaustives ; chaque
            projet fait l'objet d'un devis sur mesure.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/#contact" content="Demander un devis gratuit" />
          </div>
        </div>
      </Screen>

      {/* Sommaire — ancres, utilise toute la largeur du container */}
      <Screen name="Sommaire" customClassesInner="text-left">
        <div className="w-full max-w-full border-t border-default-200 pt-8 pb-2">
          <p className="text-sm font-medium text-default-500 mb-4">
            Nos domaines
          </p>
          <nav
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4"
            aria-label="Navigation des services"
          >
            {services.map((s) => (
              <Link
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-default-200 bg-default-50/50 px-4 py-3 xl:px-5 xl:py-3.5 text-sm font-medium text-default-700 transition-colors hover:border-accent1 hover:bg-primary/5 hover:text-accent1"
              >
                <Image
                  src={s.image}
                  alt=""
                  width={24}
                  height={24}
                  className="flex-shrink-0 object-contain"
                  aria-hidden
                />
                <span className="min-w-0">{s.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </Screen>

      {/* 4 sections — une par service, utilise toute la largeur du container */}
      <Screen name="Contenu" customClassesInner="text-left">
        <div className="w-full max-w-full space-y-16 lg:space-y-20">
          {services.map((s) => (
            <ServiceSection key={s.id} {...s} />
          ))}
        </div>
      </Screen>
      </main>
    </>
  );
}
