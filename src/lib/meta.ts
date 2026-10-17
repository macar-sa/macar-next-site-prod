import { readConsent } from "@/lib/consent";
import { removeCookies } from "@/lib/cookies";

// Meta Pixel, under the Advertising consent only. Nothing from Meta is loaded before that
// consent; on withdrawal the pixel is told to stop (consent revoke) and its cookies go.

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";
// Module-level on purpose: survives remounts, so init and the script happen once per page load.
let loaded = false;

// Meta's base code without its inline script: a queue that fbevents.js replays once loaded.
function createStub(): Fbq {
  const fbq = function () {
    // As in Meta's base code: before fbevents.js loads, the arguments objects are queued and
    // replayed by it; after, calls go straight to its callMethod.
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    if (fbq.callMethod) fbq.callMethod(...Array.from(args));
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  return fbq;
}

// The pixel tracks the app's page changes itself (history events), so PageView is sent once here.
export function grantMeta(pixelId: string): void {
  if (loaded) {
    window.fbq?.("consent", "grant");
    return;
  }
  loaded = true;
  const fbq = window.fbq ?? createStub();
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  fbq("consent", "grant");
  fbq("init", pixelId);
  fbq("track", "PageView");
  const script = document.createElement("script");
  script.async = true;
  script.src = SCRIPT_SRC;
  document.head.appendChild(script);
}

// Idempotent, so a stored refusal also clears cookies left over from an earlier visit.
export function revokeMeta(): void {
  if (loaded) window.fbq?.("consent", "revoke");
  removeCookies((name) => name === "_fbp" || name === "_fbc");
}

// Standard Meta event (Lead, Contact), only with the Advertising consent. Never throws.
export function trackMetaEvent(name: string, params?: Record<string, string | number | boolean>): void {
  try {
    if (typeof window === "undefined" || !loaded || !window.fbq) return;
    if (!readConsent()?.marketing) return;
    if (params) window.fbq("track", name, params);
    else window.fbq("track", name);
  } catch {
    // Measurement is best effort.
  }
}
