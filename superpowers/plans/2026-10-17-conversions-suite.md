# Conversions, suite (améliorations et pages légales) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Apply the post-review improvements (attribution after navigation, click id for offline conversions, Meta pixel, small fixes) and describe Google Ads, GA4 and Meta in the legal pages.

**Architecture:** `src/lib/origin.ts` stays the single owner of the arrival (now with the click id and the original query); `GoogleTag` asks it for a `page_location`; a new `src/lib/meta.ts` + `MetaPixel` mirror `GoogleTag` for Meta, gated on the Advertising consent; legal pages follow.

**Tech Stack:** Next.js 15, React 19, TypeScript, gtag, Meta Pixel (`fbevents.js`), Playwright.

**Spec:** `superpowers/specs/2026-10-17-conversions-design.md`, section 6.

## Global Constraints

- Nothing pushed to `fbq` or loaded from Meta without `readConsent()?.marketing`. Click ids only stored or sent with `marketing`.
- `CONSENT_VERSION = 2`; `e2e/helpers.mjs` default version follows.
- Visitor-facing copy: no em or en dash; durations 90 jours for `_gcl_au`, `_gcl_aw`, `_fbp`, `_fbc`.
- Every test that needs a build variable skips without it; CI builds with `NEXT_PUBLIC_FACEBOOK_PIXEL_ID: "000000000000000"`.

## Review Focus

1. Withdrawal of Publicité after the pixel loaded: `revoke` pushed, `_fbp`/`_fbc` removed, no `Lead`/`Contact` afterwards.
2. Re-acceptance in the same page: `grant` again, no second `init` nor second script.
3. Analytics granted, Publicité denied, arrival with `gclid`: `page_location` without the click id, and no `gclid` in the Formspree body.
4. A crafted `gclid` (spaces, `<script>`, 500 chars): ignored, `ad` still true.
5. `page_location` must not be sent when the visitor is still on the landing page (the gtag reads the URL itself).

### Task 1: Origin refinements and small fixes
Files: `src/lib/origin.ts`, `src/lib/analytics.ts`, `src/components/contact_form.tsx` (payload type), `e2e/playwright.config.mjs`, `e2e/tests/conversions.spec.mjs`.
- [ ] Tests: referrer labels (Bing, Facebook, site tiers, own host), UTM cleaned and cut, national phone counted, click id joined with Publicité and absent without, crafted gclid ignored. Run, watch them fail.
- [ ] `Arrival` gains `click?: { type: "gclid" | "gbraid" | "wbraid"; value: string }` and `referrer_host` (replaces `referrer`); memory also keeps the original `search` (never persisted). `describeOrigin()` returns `{ origine, page }` plus `[click.type]: click.value` when marketing is granted.
- [ ] `normalizePhone`: `00` → `+`, leading `0` → `+32`. `fileURLToPath` in the Playwright config.
- [ ] Green, lint, types, commit.

### Task 2: page_location after navigation
Files: `src/lib/origin.ts` (`arrivalPageLocation(includeClickId: boolean): string | undefined`), `src/app/_components/GoogleTag.tsx`, `e2e/tests/conversions.spec.mjs`.
- [ ] Tests (skip without GA id): arrival with `gclid&utm_source`, menu to `/`, accept all → `config` third arg has `page_location` with both; Analytique only → without `gclid`; accept on landing page → no `page_location`.
- [ ] Implement, green (with consent-mode suite), commit.

### Task 3: Meta pixel and consent version 2
Files: `src/lib/meta.ts`, `src/app/_components/MetaPixel.tsx`, `src/app/layout.tsx`, `src/lib/cookies.ts` (shared `removeCookies`, used by `GoogleTag` too), `src/lib/consent.ts` (`CONSENT_VERSION = 2`), `src/app/_components/CookieConsent.tsx` (Publicité description), `src/components/contact_form.tsx`, `src/app/_components/ConversionTracking.tsx`, `.github/workflows/e2e.yml`, `e2e/helpers.mjs`, `e2e/tests/meta-pixel.spec.mjs`, `e2e/tests/cookies.spec.mjs`.
- [ ] Tests: no `fbq` and no Meta request without Publicité; with it, queue `consent grant`, `init <id>`, `track PageView`, one script request; accept on page; withdraw → `revoke`, cookies gone; re-accept → `grant`, one `init`; `Contact` on phone click, `Lead` on form success; version 2 stored and shown.
- [ ] Implement, green, commit.

### Task 4: Legal pages and docs
Files: `src/app/politique-confidentialite/page.tsx`, `src/app/politique-cookies/page.tsx`, `e2e/tests/legal.spec.mjs`, `CLAUDE.md`.
- [ ] Test: cookie table rows `_ga`, `_ga_*`, `_gcl_au`, `_gcl_aw`, `_fbp`, `_fbc`, `Vercel Analytics`, `macar_consent`, `macar_origine`; privacy page names Google Ads, Meta Platforms Ireland Limited and links to policies.google.com/technologies/partner-sites.
- [ ] Texts per spec 6.2; CLAUDE.md per spec 6.1.5 and env list; full suite; visual check 375/1440; commit.
