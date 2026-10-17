"use client";

import { useEffect } from "react";
import { MACAR_PHONES, normalizePhone, trackEvent } from "@/lib/analytics";

// Invisible. Counts clicks on Macar's phone numbers wherever they appear (delegated listener,
// so footer and HomeView keep their plain links). Never prevents the call.
export default function ConversionTracking() {
  useEffect(() => {
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
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
