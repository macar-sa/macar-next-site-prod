"use client";

import { Avatar, Button, Card, ScrollShadow } from "@heroui/react";
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
          className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-separator"}`}
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
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join("");
}

// HeroUI v3 Card and Avatar with their own styles; the classes only size and place the card
// in the scrolling row.
function ReviewCard({ review, expanded, onToggle }: { review: GoogleReview; expanded: boolean; onToggle: () => void }) {
  const needsExpand = review.text.length > 180;
  return (
    <Card className="shrink-0 w-[calc((100%-2rem)/3)] min-w-[260px] max-w-[400px] snap-start">
      <Card.Header>
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <Avatar.Image src={review.authorPhotoUrl} alt={review.authorName} referrerPolicy="no-referrer" />
            <Avatar.Fallback>{getInitials(review.authorName)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{review.authorName}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col" style={{ minHeight: CARD_BODY_HEIGHT, maxHeight: CARD_BODY_HEIGHT }}>
          {expanded ? (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-muted text-sm leading-relaxed whitespace-pre-line">
              {review.text}
            </div>
          ) : (
            <p className="text-muted text-sm leading-relaxed whitespace-pre-line line-clamp-3">
              {review.text}
            </p>
          )}
          {needsExpand && (
            <Button variant="ghost" size="sm" onPress={onToggle} className="mt-2 self-start shrink-0">
              {expanded ? (
                <>
                  <ChevronUp aria-hidden /> Voir moins
                </>
              ) : (
                <>
                  <ChevronDown aria-hidden /> Voir plus
                </>
              )}
            </Button>
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
        <p className="mt-2 text-right text-sm text-muted flex items-center justify-end gap-1">
          <span>Plus d&apos;avis</span>
          <ChevronRight className="w-4 h-4 text-accent" aria-hidden />
        </p>
      </div>
    </div>
  );
}
