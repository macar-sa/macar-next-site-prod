import { Phone } from "lucide-react";
import { ButtonLink } from "./links";

// Macar's mobile number. The tel: links are counted as phone_click by ConversionTracking's
// delegated listener (any Macar number, anywhere on the page), nothing to wire here.
export const PHONE_HREF = "tel:+32478235008";
export const PHONE_LABEL = "0478 23 50 08";

// Call button of the first screens (service, commune and home pages).
export function CallButton({ variant = "primary" }: { variant?: "primary" | "tertiary" }) {
  return (
    <ButtonLink href={PHONE_HREF} variant={variant}>
      <Phone aria-hidden size={16} />
      Appeler le {PHONE_LABEL}
    </ButtonLink>
  );
}
