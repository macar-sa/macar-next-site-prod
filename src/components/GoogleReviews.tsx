"use client";

import { Card, CardBody, CardHeader, Avatar } from "@heroui/react";
import { SecondHeading, P } from "@/app/_components/textStyles";
import { Star, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

export type GoogleReview = {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;
  relativeTime: string;
  text: string;
  ownerResponse?: string;
};

const reviews: GoogleReview[] = [
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

const CAROUSEL_SCROLL_STEP = 1;
const CAROUSEL_INTERVAL_MS = 30;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} étoiles`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

const CARD_BODY_HEIGHT = "10rem"; /* hauteur fixe pour éviter le déplacement au "Voir plus" */

function ReviewCard({ review, expanded, onToggle }: { review: GoogleReview; expanded: boolean; onToggle: () => void }) {
  const needsExpand = review.text.length > 180;
  return (
    <Card className="border border-neutral-100 bg-cardbackground/80 backdrop-blur-sm flex-shrink-0 w-[calc((100%-2rem)/3)] min-w-[260px] max-w-[400px] snap-start flex flex-col">
      <CardHeader className="flex gap-2 px-4 pt-4 pb-1 flex-shrink-0">
        <Avatar
          src={review.authorPhotoUrl}
          name={review.authorName}
          size="sm"
          className="flex-shrink-0 w-8 h-8 min-w-8 min-h-8"
          imgProps={{ referrerPolicy: "no-referrer" }}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-semibold text-headings text-sm truncate">{review.authorName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRating rating={review.rating} />
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0 pb-2 pr-4 !pl-4 flex-1 min-h-0 flex flex-col">
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

export default function GoogleReviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleCard = useCallback((index: number) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  useEffect(() => {
    if (isPaused || !scrollRef.current) return;
    const el = scrollRef.current;
    const id = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (el.scrollLeft >= maxScroll) return;
      el.scrollLeft += CAROUSEL_SCROLL_STEP;
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  return (
    <div className="w-full">
      <SecondHeading>
        <h2>Avis Google</h2>
      </SecondHeading>
      <P customClasses="mt-4 max-w-prose">
        <p>Découvrez ce que nos clients disent de leur expérience avec nous.</p>
      </P>
      <div className="w-full mt-6">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory py-2 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ scrollBehavior: "smooth" }}
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
            className="absolute top-0 right-0 bottom-0 w-20 sm:w-28 pointer-events-none bg-gradient-to-l from-background to-transparent z-10"
            aria-hidden
          />
        </div>
        <p className="mt-2 text-right text-sm text-font-gray flex items-center justify-end gap-1">
          <span>Plus d&apos;avis</span>
          <ChevronRight className="w-4 h-4 text-accent1" aria-hidden />
        </p>
      </div>
    </div>
  );
}
