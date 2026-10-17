"use client";

import { useEffect } from "react";
import { MACAR_PHONES, normalizePhone, trackEvent } from "@/lib/analytics";
import { onConsentChange } from "@/lib/consent";
import { trackMetaEvent } from "@/lib/meta";
import { persistArrival, rememberArrival } from "@/lib/origin";

// Invisible. Remembers where the visitor arrived from, and counts clicks on Macar's phone
// numbers wherever they appear (delegated listener, so footer and HomeView keep their plain
// links). Never prevents the call.
export default function ConversionTracking() {
  useEffect(() => {
    rememberArrival();
    persistArrival();
    const offConsent = onConsentChange(() => persistArrival());
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (!anchor) return;
      const phone = normalizePhone(anchor.getAttribute("href") ?? "");
      if (!(MACAR_PHONES as readonly string[]).includes(phone)) return;
      trackEvent("phone_click", {
        phone_number: phone,
        link_location: anchor.closest("footer") ? "pied_de_page" : "page",
      });
      trackMetaEvent("Contact");
    };
    document.addEventListener("click", onClick);
    return () => {
      offConsent();
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}
