"use client";

import { useEffect } from "react";
import { onConsentChange, readConsent, type ConsentChangeDetail } from "@/lib/consent";
import { arrivalPageLocation } from "@/lib/origin";
import { removeCookies } from "@/lib/cookies";

// 13 months of 30 days, in seconds.
const COOKIE_EXPIRES = 33696000;

// Module-level on purpose: they survive remounts, so nothing is pushed or inserted twice.
let googleLoaded = false;
let initialized = false;

// Basic Consent Mode: the default is pushed once, before any choice is applied, and gtag.js
// is not inserted until Analytics is granted. Guarded by a flag, not by window.gtag, so that
// other code defining gtag first cannot skip the default; an existing dataLayer is kept.
function ensureGtag() {
  if (initialized) return;
  initialized = true;
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  window.gtag = function () {
    // gtag.js only understands the arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("set", "ads_data_redaction", true);
}

// Keyed on the current choice only (idempotent), so a refusal also clears cookies left over
// from an earlier visit, and a stored refusal is enforced again on load.
function withdraw({ current }: ConsentChangeDetail, gaId?: string) {
  if (!current.analytics) {
    if (gaId) window[`ga-disable-${gaId}`] = true;
    // "_ga_" (not "_ga") so that "_gac_" campaign cookies, which belong to Advertising, are left alone.
    removeCookies((name) => name === "_ga" || name.startsWith("_ga_"));
  }
  if (!current.marketing) {
    removeCookies((name) => name.startsWith("_gcl_") || name.startsWith("_gac_"));
  }
}

function apply({ current, previous }: ConsentChangeDetail, gaId?: string) {
  const gtag = window.gtag;
  if (!gtag) return;
  const ads = current.marketing ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: current.analytics ? "granted" : "denied",
  });
  withdraw({ current, previous }, gaId);
  if (current.analytics && gaId) {
    window[`ga-disable-${gaId}`] = false;
    if (!googleLoaded) {
      googleLoaded = true;
      gtag("js", new Date());
      // Granted after leaving the landing page: give GA4 the landing URL back, or the session
      // loses its campaign (and Google Ads its click). Click ids only with Advertising. It goes
      // on a one-off page_view, not on the config, whose parameters would stick to every later
      // event of the page load (page views, phone_click, generate_lead).
      const pageLocation = arrivalPageLocation(current.marketing);
      gtag("config", gaId, { cookie_expires: COOKIE_EXPIRES, ...(pageLocation && { send_page_view: false }) });
      if (pageLocation) gtag("event", "page_view", { page_location: pageLocation });
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
