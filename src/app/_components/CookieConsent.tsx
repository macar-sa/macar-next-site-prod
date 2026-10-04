"use client";

import Cookies from "js-cookie";
import { Button, Card, Description, Label, Separator, Switch } from "@heroui/react";
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";

const USER_CONSENT_COOKIE_KEY = "macar_cookie_consent_is_true";
const USER_CONSENT_COOKIE_EXPIRE_DATE = 365;

const CATEGORIES = [
  {
    label: "Essentiels",
    description: "Éléments essentiels pour le bon fonctionnement des fonctionnalités du site.",
    isLocked: true,
  },
  {
    label: "Analytique",
    description:
      "Permettre d'obtenir des statistiques anonymes afin d'optimiser notre site et, par conséquent, votre expérience.",
    isLocked: false,
  },
  {
    label: "Les fonctionnalités",
    description: "Nécessaires pour le bon fonctionnement de certaines fonctionnalités.",
    isLocked: false,
  },
];

// Cookie banner: HeroUI v3 Card, Switch and Button with their own styles. Behaviour unchanged:
// any choice records the consent cookie and closes the banner (GDPR handling is out of scope).
const CookieConsent = () => {
  const [cookieConsentIsTrue, setCookieConsentIsTrue] = useState(true);
  const [prefIsTrue, setPrefIsTrue] = useState(false);

  useEffect(() => {
    setCookieConsentIsTrue(Cookies.get(USER_CONSENT_COOKIE_KEY) === "true");
  }, []);

  const recordConsent = () => {
    Cookies.set(USER_CONSENT_COOKIE_KEY, "true", { expires: USER_CONSENT_COOKIE_EXPIRE_DATE });
    setCookieConsentIsTrue(true);
  };

  if (cookieConsentIsTrue) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-4 left-4 right-4 sm:left-auto z-50 max-w-lg"
    >
      <Card className="max-h-[calc(100dvh-2rem)] overflow-auto">
        <Card.Content className="flex flex-col gap-4">
        {prefIsTrue ? (
          <>
            <p className="text-xl font-medium text-foreground">Préférences</p>
            <p className="text-sm text-muted leading-loose max-w-prose">
              Grâce à cette interface, vous avez la possibilité d&apos;autoriser ou de refuser certains cookies.
              Notez que les cookies essentiels ne peuvent pas être refusés.
              Ils sont nécessaires au bon fonctionnement du site.
            </p>
            <p className="text-sm text-muted leading-loose max-w-prose">
              Cliquez sur le nom de la catégorie pour en savoir plus sur les différents cookies utilisés sur notre site.
            </p>
            {CATEGORIES.map((category) => (
              <Fragment key={category.label}>
                <Separator />
                <Switch
                  size="sm"
                  defaultSelected
                  isDisabled={category.isLocked}
                  className="w-full"
                >
                  <Switch.Content className="w-full justify-between">
                    <Label>{category.label}</Label>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
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
              Macar utilise des cookies pour améliorer votre expérience de navigation.
              Pour certains d&apos;entre eux, votre consentement est nécessaire. Vous pouvez définir vos préférences via le bouton ci-dessous.
            </p>
          </>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="tertiary" onPress={recordConsent}>
            Refuser Tout
          </Button>
          <Button variant="secondary" onPress={() => setPrefIsTrue(!prefIsTrue)}>
            Préférences
          </Button>
          <Button onPress={recordConsent}>
            {prefIsTrue ? "Accepter la Sélection" : "Accepter Tout"}
          </Button>
        </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default CookieConsent;
