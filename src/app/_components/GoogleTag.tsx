"use client";

import { useEffect } from "react";
import { onConsentChange, readConsent, type ConsentChangeDetail } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

// 13 months of 30 days, in seconds.
const COOKIE_EXPIRES = 33696000;

// Module-level on purpose: they survive remounts, so nothing is pushed or inserted twice.
let googleLoaded = false;

// Basic Consent Mode: the default is pushed once, before any choice is applied, and gtag.js
// is not inserted until Analytics is granted.
function ensureGtag() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // gtag.js only understands the arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("set", "ads_data_redaction", true);
}

function apply({ current }: ConsentChangeDetail, gaId?: string) {
  const gtag = window.gtag;
  if (!gtag) return;
  const ads = current.marketing ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: current.analytics ? "granted" : "denied",
  });
  if (current.analytics && gaId) {
    window[`ga-disable-${gaId}`] = false;
    if (!googleLoaded) {
      googleLoaded = true;
      gtag("js", new Date());
      gtag("config", gaId, { cookie_expires: COOKIE_EXPIRES });
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);
    }
  }
}

export default function GoogleTag({ gaId }: { gaId?: string }) {
  useEffect(() => {
    ensureGtag();
    const stored = readConsent();
    if (stored) apply({ current: stored, previous: null }, gaId);
    return onConsentChange((detail) => apply(detail, gaId));
  }, [gaId]);
  return null;
}
