"use client";

import { Button } from "@heroui/react";
import { openConsentPreferences } from "@/lib/consent";
import { textLinkClassName } from "./links";

// Reopens the cookie banner on its preferences level. "link" looks like the footer links,
// "button" is the HeroUI secondary button used in the cookie policy.
export default function ManageCookiesButton({ appearance }: { appearance: "link" | "button" }) {
  if (appearance === "button") {
    return (
      <Button variant="secondary" onPress={openConsentPreferences}>
        Gérer mes cookies
      </Button>
    );
  }
  return (
    <button type="button" className={textLinkClassName({ navigation: true })} onClick={openConsentPreferences}>
      Gérer mes cookies
    </button>
  );
}
