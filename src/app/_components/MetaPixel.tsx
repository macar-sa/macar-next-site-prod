"use client";

import { useEffect } from "react";
import { onConsentChange, readConsent } from "@/lib/consent";
import { grantMeta, revokeMeta } from "@/lib/meta";

// Loads the Meta Pixel when Advertising is granted, stops it when withdrawn. Without a pixel ID
// in the build, it does nothing.
export default function MetaPixel({ pixelId }: { pixelId?: string }) {
  useEffect(() => {
    if (!pixelId) return;
    const apply = (marketing: boolean) => (marketing ? grantMeta(pixelId) : revokeMeta());
    const stored = readConsent();
    if (stored) apply(stored.marketing);
    return onConsentChange(({ current }) => apply(current.marketing));
  }, [pixelId]);
  return null;
}
