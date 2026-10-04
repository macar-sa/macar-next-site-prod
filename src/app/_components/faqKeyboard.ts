import type { KeyboardEvent } from "react";

// Keyboard navigation of the HeroUI v2 accordion (useReactAriaAccordionItem), which the
// HeroUI v3 Accordion does not provide. ArrowDown and ArrowUp move the focus to the next or
// previous question of the same column, Home and End to the first or last one. No wrap-around,
// the answer does not open and the page does not scroll (v2 moved the focus without scrolling).
// The data-faq-column and data-faq-trigger markers are ours, so a HeroUI update cannot break it.
const NAVIGATION_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

export function onFaqTriggerKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!NAVIGATION_KEYS.includes(event.key)) return;
  event.preventDefault();
  const trigger = event.currentTarget;
  const column = trigger.closest('[data-faq-column]');
  if (!column) return;
  const triggers = Array.from(
    column.querySelectorAll<HTMLElement>('[data-faq-trigger]:not(:disabled)'),
  );
  const index = triggers.indexOf(trigger);
  const target =
    event.key === "ArrowDown"
      ? triggers[index + 1]
      : event.key === "ArrowUp"
        ? triggers[index - 1]
        : event.key === "Home"
          ? triggers[0]
          : triggers[triggers.length - 1];
  target?.focus({ preventScroll: true });
}
