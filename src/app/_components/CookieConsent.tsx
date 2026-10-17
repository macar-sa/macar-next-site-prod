"use client";

import { Button, Card, Description, Label, Separator, Switch } from "@heroui/react";
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  clearLegacyConsent,
  onConsentPreferencesRequest,
  readConsent,
  writeConsent,
  type ConsentCategory,
  type ConsentChoice,
} from "@/lib/consent";
import { TextLink } from "./links";

const NONE: ConsentChoice = { analytics: false, marketing: false };
const ALL: ConsentChoice = { analytics: true, marketing: true };

const OPTIONAL_CATEGORIES: { key: ConsentCategory; label: string; description: string }[] = [
  {
    key: "analytics",
    label: "Analytique",
    description: "Statistiques de fréquentation du site, pour l'améliorer (Google Analytics).",
  },
  {
    key: "marketing",
    label: "Publicité",
    description: "Mesurer l'efficacité de nos publicités et vous en montrer de plus pertinentes.",
  },
];

type View = "hidden" | "first" | "prefs";

// Cookie banner: two levels (quick choice, then one switch per category). Every button records
// the real choice through the consent module; nothing is pre-ticked and closing decides nothing.
const CookieConsent = () => {
  const [view, setView] = useState<View>("hidden");
  const [draft, setDraft] = useState<ConsentChoice>(NONE);
  const [canCancel, setCanCancel] = useState(false);

  // Read the cookie after mount, never during render, to avoid a hydration mismatch.
  useEffect(() => {
    clearLegacyConsent();
    setView(readConsent() ? "hidden" : "first");
  }, []);

  // "Gérer mes cookies" reopens the banner on the preferences level with the saved choice.
  useEffect(
    () =>
      onConsentPreferencesRequest(() => {
        const saved = readConsent();
        setDraft(saved ? { analytics: saved.analytics, marketing: saved.marketing } : NONE);
        setCanCancel(saved !== null);
        setView("prefs");
      }),
    [],
  );

  // Escape closes the reopened preferences without changing anything; on a first visit it does nothing.
  useEffect(() => {
    if (!canCancel || view !== "prefs") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setView("hidden");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canCancel, view]);

  const choose = (choice: ConsentChoice) => {
    writeConsent(choice);
    setView("hidden");
  };

  if (view === "hidden") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-4 left-4 right-4 sm:left-auto z-50 max-w-lg"
    >
      <section aria-label="Consentement aux cookies">
        <Card className="max-h-[calc(100dvh-5rem)] overflow-auto">
          <Card.Content className="flex flex-col gap-4">
            {view === "prefs" ? (
              <>
                <p className="text-xl font-medium text-foreground">Préférences</p>
                <p className="text-sm text-muted leading-loose max-w-prose">
                  Choisissez les cookies que vous acceptez. Les cookies essentiels ne peuvent pas être refusés : ils
                  mémorisent votre choix.
                </p>
                <Separator />
                <Switch size="sm" isSelected isDisabled className="w-full">
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label>Essentiels</Label>
                  </Switch.Content>
                  <Description>Mémorisent votre choix concernant les cookies.</Description>
                </Switch>
                {OPTIONAL_CATEGORIES.map((category) => (
                  <Fragment key={category.key}>
                    <Separator />
                    <Switch
                      size="sm"
                      isSelected={draft[category.key]}
                      onChange={(isSelected) => setDraft((current) => ({ ...current, [category.key]: isSelected }))}
                      className="w-full"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <Label>{category.label}</Label>
                      </Switch.Content>
                      <Description>{category.description}</Description>
                    </Switch>
                  </Fragment>
                ))}
              </>
            ) : (
              <>
                <p className="text-xl font-medium text-foreground">Cookies</p>
                <p className="text-sm text-muted leading-loose max-w-prose">
                  Nous utilisons des cookies pour mesurer la fréquentation du site et l&apos;efficacité de nos
                  publicités, uniquement avec votre accord. Vous pouvez changer d&apos;avis à tout moment.{" "}
                  <TextLink href="/politique-cookies" underline>
                    En savoir plus
                  </TextLink>
                </p>
              </>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              {view === "prefs" && canCancel && (
                <Button variant="tertiary" onPress={() => setView("hidden")}>
                  Annuler
                </Button>
              )}
              <Button variant="primary" onPress={() => choose(NONE)}>
                Tout refuser
              </Button>
              {view === "prefs" ? (
                <Button variant="secondary" onPress={() => choose(draft)}>
                  Enregistrer mes choix
                </Button>
              ) : (
                <Button
                  variant="tertiary"
                  onPress={() => {
                    setDraft(NONE);
                    setCanCancel(false);
                    setView("prefs");
                  }}
                >
                  Personnaliser
                </Button>
              )}
              <Button variant="primary" onPress={() => choose(ALL)}>
                Tout accepter
              </Button>
            </div>
          </Card.Content>
        </Card>
      </section>
    </motion.div>
  );
};

export default CookieConsent;
