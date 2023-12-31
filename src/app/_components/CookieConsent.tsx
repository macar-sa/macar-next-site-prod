"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { Switch } from "@nextui-org/react";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { RevealWrapper, RevealList } from "next-reveal";
import { motion } from "framer-motion";

const USER_CONSENT_COOKIE_KEY = "macar_cookie_consent_is_true";
const USER_CONSENT_COOKIE_EXPIRE_DATE = 365;

const CookieConsent = () => {
  const [cookieConsentIsTrue, setCookieConsentIsTrue] = useState(true);
  const [prefIsTrue, setprefIsTrue] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [essentials, setEssentials] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functionnals, setFunctionnals] = useState(false);

  useEffect(() => {
    const consentIsTrue = Cookies.get(USER_CONSENT_COOKIE_KEY) === "true";
    setCookieConsentIsTrue(consentIsTrue);
  }, []);

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!cookieConsentIsTrue) {
      Cookies.set(USER_CONSENT_COOKIE_KEY, "true", {
        expires: USER_CONSENT_COOKIE_EXPIRE_DATE,
      });
      setCookieConsentIsTrue(true);
    }
  };

  if (cookieConsentIsTrue) {
    return null;
  } else {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 divide-y divide-font-gray fixed bottom-0 right-0 z-50 cardbackground border border-gray-300 cardbackground bg-white max-w-lg overflow-auto max-h-full"

      >
        {prefIsTrue && (
          <>
            <div className="px-6 py-6">
              <p className="text-xl font-medium text-font-lightergray mb-4">
                {" "}
                Préférences
              </p>
              <p className="text-sm font-ligt text-font-gray mb-4 max-w-prose leading-loose">
                Grâce à cette interface, vous avez la possibilité d'autoriser ou de refuser certains cookies.
                Notez que les cookies essentiels ne peuvent pas être refusés.
                Ils sont nécessaires au bon fonctionnement du site.
                <br />
                <br />
                Cliquez sur le nom de la catégorie pour en savoir plus sur les différents cookies utilisés sur notre site.
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="flex flex-row justify-between">
                <p className="text-sm font-medium text-font-lighter-gray mb-4">
                  {" "}
                  Essentiels{" "}
                </p>
                <Switch
                  defaultSelected
                  aria-label="Essential Cookies"
                  size="sm"
                  isSelected
                  isDisabled
                />
              </div>
              <p className="text-sm font-light text-font-gray">
                {" "}
                Éléments essentiels pour le bon fonctionnement des fonctionnalités du site.
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="flex flex-row justify-between">
                <p className="text-sm font-medium text-font-lighter-gray mb-4">
                  {" "}
                  Analytique{" "}
                </p>
                <Switch
                  defaultSelected
                  aria-label="Analytics Cookies"
                  size="sm"
                  color="success"
                />
              </div>
              <p className="text-sm font-light text-font-gray">
                {" "}
                Permettre d'obtenir des statistiques anonymes afin d'optimiser notre site et, par conséquent, votre expérience.
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="flex flex-row justify-between">
                <p className="text-sm font-medium text-font-lighter-gray mb-4">
                  {" "}
                  Les fonctionnalités{" "}
                </p>
                <Switch
                  defaultSelected
                  aria-label="Analytics Cookies"
                  size="sm"
                  color="success"
                />
              </div>
              <p className="text-sm font-light text-font-gray">
                {" "}
                Nécessaires pour le bon fonctionnement de certaines fonctionnalités.
              </p>
            </div>
          </>
        )}
        {!prefIsTrue && (
          <div className="px-6 py-6">
            <p className="text-xl font-medium text-font-lightergray mb-4">
              {" "}
              Cookies
            </p>
            <p className="text-sm font-ligt text-font-gray mb-4 max-w-prose leading-loose">
              Macar utilise des cookies pour améliorer votre expérience de navigation.
              Pour certains d'entre eux, votre consentement est nécessaire. Vous pouvez définir vos préférences via le bouton ci-dessous.
            </p>
          </div>
        )}
        <div className="grid grid-cols-3 divide-x divide-font-gray">
          <CookieButton content="Refuser Tout" onClick={onClick} />
          <CookieButton
            content="Préférences"
            onClick={() => {
              setprefIsTrue(!prefIsTrue);
            }}
          />
          <CookieButton
            content={!prefIsTrue ? "Accepter Tout" : "Accepter la Sélection"}
            onClick={onClick}
          />
        </div>
      </motion.div>
    );
  }
};

const CookieButton = ({
  content,
  onClick,
}: {
  content: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <div className="flex justify-center relative group cursor-pointer">
      <button
        onClick={onClick}
        className="relative text-sm z-10 px-2 py-4 w-full h-full text-font-gray group-hover:text-font-lighter-gray hover:bg-gray-100 transition-all duration-300 ease-in-out "
      >
        {content}
      </button>
      <div className="absolute bottom-0 h-0 -z-10 w-full bg-light-background/10 transition-all duration-500 ease-in-out group-hover:h-full"></div>
    </div>
  );
};

export default CookieConsent;
