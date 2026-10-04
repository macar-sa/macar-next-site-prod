"use client";

import { Card, Avatar } from "@heroui/react";
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
    // Scroll-snap would catch each 1 px step and bring it back to the snap point, so snapping
    // and smooth scrolling are off while the carousel runs and restored on pause and unmount.
    el.style.scrollSnapType = "none";
    el.style.scrollBehavior = "auto";
    const id = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      // At the end of the list, loop back to the start.
      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollLeft = 0;
        return;
      }
      el.scrollLeft += CAROUSEL_SCROLL_STEP;
    }, CAROUSEL_INTERVAL_MS);
    return () => {
      clearInterval(id);
      el.style.scrollSnapType = "";
      el.style.scrollBehavior = "smooth";
    };
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
            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-proximity md:snap-mandatory py-2 px-3 -mx-1 min-h-[180px] scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain overscroll-y-none"
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
            className="absolute top-0 right-0 bottom-0 w-20 sm:w-28 pointer-events-none bg-fade-left z-10"
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
