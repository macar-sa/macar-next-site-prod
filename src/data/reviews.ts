import { LOCAL_BUSINESS_ID } from "@/lib/seo/localBusiness";

export type GoogleReview = {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;
  relativeTime: string;
  text: string;
  ownerResponse?: string;
};

export const reviews: GoogleReview[] = [
  {
    authorName: "Nathalie Claus",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocJ2n_6DtDwxGp6UuJTkt8_6pcHfq12n8Plw4ShUjPRnTsikGA=w72-h72-p-rp-mo-br100",
    rating: 5,
    relativeTime: "Il y a un jour",
    text: "Nous travaillons avec la société depuis 11 ans suite à des dégâts de cheminée dû à la foudre. L'assurance avait fait appel à MACAR. Le travail bien fait, le respect des horaires, la propreté, les conseils, la disponibilité et la sympathie de la direction et des ouvriers font que nous faisons systématiquement confiance à cette entreprise. Nous avons déjà pû profiter de plusieurs de leurs expertises.\nMacar est devenu Notre Entrepreneur.",
  },
  {
    authorName: "Riny Nijenhof",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjU3OsvtkeU5ASUB8ItLwLQWk_TYs3TY0O5BqE_IU114IwPrIGc=w72-h72-p-rp-mo-br100",
    rating: 5,
    relativeTime: "Il y a un mois",
    text: "Macar-Construction m'avait été conseillé par ma voisine après une rénovation approfondie par cette firme de son appartement. J'ai pu constater et admirer l'excellence des travaux exécutés et bien que, comparé à ma voisine, ma demande d'intervention de la société Macar était bien plus modeste, (remplacement d'une vitre cassée), les sympathiques et compétentes collaborateurs de Macar se sont acquitté à mon entière satisfaction du travail de remplacement avec diligence et grand soin. Aussi, je recommande de tout cœur et avec grand plaisir la société Macar pour tous travaux de construction, rénovation et réparation.",
  },
  {
    authorName: "Max Jauniaux",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjWVJAoX2DOKVBR3ri_8-FeM6Nd_hdsKADCxRdvwrWstD4no5UeA=w72-h72-p-rp-mo-br100",
    rating: 5,
    relativeTime: "Il y a 9 mois",
    text: "Rapide, ponctuel, sympathique et professionnel.\nJe les ait contacté pour un travail de rénovation des jointures des tuiles d'un muret sur le toit, j'ai rapidement eu un retour et on s'est arrangé pour une visite afin d'établir un devis, nous avons été satisfait par la proposition, ils ont pu venir qq jours plus tard qd ca m'arrangeait, très pratique, et ont effectué le travail rapidement et professionnellement, en expliquant ensuite la marche à suivre et ce à quoi il fallait faire attention.\nC'était une longue phrase.\nJe suis satisfait et je recommande cette entreprise.",
  },
  {
    authorName: "WIKLOX YTB",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjWP41kLN5euWsJFgfBs2okUkUEup48zCv9oisPfmTK_cZVRRWP9=w72-h72-p-rp-mo-br100",
    rating: 5,
    relativeTime: "Il y a un mois",
    text: "Des vrais pros. Travail soigné et rapide. Très content.\nJamal",
  },
  {
    authorName: "Gym Byke",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocL0rvaQjF-QGwY5GtcQfbj_k4vlz09G6eWjWgaUNhfL5GcZFg=w72-h72-p-rp-mo-ba4-br100",
    rating: 5,
    relativeTime: "Il y a un an",
    text: "Une équipe de professionnels que nous connaissons depuis dix ans. Elle nous a été recommandée par un courtier d'assurances après que nous ayons eu un sinistre.\nNous n'avons jamais eu de problèmes avec cette société.\nJusqu'à présent les prix ont été honnêtes et le travail a toujours été très bien fait.\nNous espérons qu'ils continueront toujours ainsi.\n\n(Traduit de l'italien)",
  },
  {
    authorName: "Pascale APPELMANS",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocIpQCnfgOYVUYHEOTGzA2xq1wuYnRELaqi79yvxz3hdwDuIog=w72-h72-p-rp-mo-br100",
    rating: 5,
    relativeTime: "Il y a un an",
    text: "Respect des horaires, grande gentillesse, disponibilité, rapidité, efficacité et travail impeccable !\nEntreprise à recommander à 100% !",
  },
  {
    authorName: "anne-marie knaepen",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjVmxRNyxnAS6rFmaj5I4vb4v3vTHqj34xxNQw1CvsV6lY07-98K=w72-h72-p-rp-mo-br100",
    rating: 5,
    relativeTime: "Il y a un an",
    text: "Services impeccables travaux parfait, ouvriers très gentils et propres\nMa salle de bain est magnifique. Entreprise à recommander.\nMerci beaucoup",
  },
  {
    authorName: "Nathalie Cassiers",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocLctuS2e-RPWwEC4T3PI6Y4SLiURKN0mIX0_O0cvlNeM3k2ZA=w72-h72-p-rp-mo-br100",
    rating: 5,
    relativeTime: "Il y a un an",
    text: "Excellent travail. Je recommande cette entreprise.",
  },
  {
    authorName: "Mehmet Emin Özel (GAMALI)",
    authorPhotoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocKD4JArw830aMgmv1O5GoXx8fsFd6BkbhABO4A2khEQdOX6Yy8=w72-h72-p-rp-mo-ba3-br100",
    rating: 5,
    relativeTime: "Il y a 5 mois",
    text: "",
  },
];

// Reviews with empty reviewBody fail Google Rich Results validation,
// so we filter them out of the JSON-LD (the card still shows in the carousel).
export const reviewsJsonLd = reviews
  .filter((r) => r.text.trim().length > 0)
  .map((r) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@id": LOCAL_BUSINESS_ID },
    author: { "@type": "Person", name: r.authorName },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: r.text,
  }));
