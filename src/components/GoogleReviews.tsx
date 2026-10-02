"use client";

import { Card, CardBody, CardHeader, Avatar } from "@heroui/react";
import { SecondHeading, P } from "@/app/_components/textStyles";
import { Star, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { reviews, type GoogleReview } from "@/data/reviews";

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

  const pauseCarousel = useCallback(() => setIsPaused(true), []);
  const resumeCarousel = useCallback(() => setIsPaused(false), []);

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
            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-proximity md:snap-mandatory py-2 px-3 -mx-1 min-h-[180px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain overscroll-y-none"
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
