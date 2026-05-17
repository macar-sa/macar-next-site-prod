"use client";
import Image from "next/image";
import Screen from "./screen";
import { MainHeading, P, Raptor, SecondHeading } from "./textStyles";
import { Card } from "./cards";
import { PrimaryButton, SecondaryButton } from "./buttons";
import { contact_form } from "@/components/contact_form";
import Link from "next/link";
import { CheckMark } from "./checkMark";
import { LogoCarousel } from "./logocarousel";
import Statistics from "@/components/Statistics";
import GoogleReviews from "@/components/GoogleReviews";
import { Star, ExternalLink } from "lucide-react";
import { RATING } from "@/lib/seo/localBusiness";
import { Accordion, AccordionItem } from "@heroui/react";

export type FaqItem = { question: string; answer: string };

export default function HomeView({ faq }: { faq: FaqItem[] }) {
  return (
    <main className="flex min-h-screen flex-col">
      <Screen name="landing page">
        <div className="lg:mt-16 grid lg:grid-cols-5 gap-8 text-left">
          <div className="col-span-3">
            <MainHeading>
              <h1 className="leading-tight">
                Rénovation, plomberie, électricité et toiture à Bruxelles
              </h1>
            </MainHeading>
            <p className="mt-3 text-base text-font-gray max-w-prose">
              Macar est une entreprise de rénovation, plomberie, installations
              électriques et toiture basée à Bruxelles (Belgique), active depuis
              2002.
            </p>
            <Link
              href="/#reviews"
              className="mt-4 inline-flex items-center gap-2 text-sm text-font-gray hover:text-headings transition-colors"
              aria-label={`Note ${RATING.value.replace(".", ",")} sur 5 — ${RATING.count} avis Google`}
            >
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </span>
              <span className="font-medium text-headings">
                {RATING.value.replace(".", ",")}
              </span>
              <span>— {RATING.count} avis Google</span>
            </Link>
            <div className="mt-4">
              <Raptor>
                <h5 className="mb-4 text-sm lg:text-base 2xl:text-lg">
                  &nbsp;&nbsp;Ils nous ont fait confiance
                </h5>
              </Raptor>
              <LogoCarousel />
            </div>
          </div>
          <div className="col-span-2">
            <P
              customClasses="mt-6 mb-6"
              content="Depuis 2002, notre équipe dédiée excelle dans la rénovation, la plomberie, les installations électriques et la toiture."
            />
            <div className="flex space-x-4">
              <PrimaryButton href="/#contact" content="Commencez votre projet !" />
              <SecondaryButton href="/#services" content="Services" />
            </div>
          </div>
        </div>
        <div className="relative w-full mt-10 h-40 md:h-[400px]">
          <Image
            src="/landpage_pics/construction-tool.webp"
            alt="Chantier de rénovation — Macar, Bruxelles"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1280px"
            className="object-cover"
          />
        </div>
      </Screen>

      <Screen name="Stats">
        <Statistics />
      </Screen>

      <Screen name="Avis Google" id="reviews">
        <GoogleReviews />
      </Screen>

      <Screen name="Nos Services" id="services">
        <div className="md:flex md:items-start justify-between">
          <div className="md:flex-shrink-0 md:w-1/3">
            <SecondHeading>
              <h2>Nos Services</h2>
            </SecondHeading>
            <P customClasses="mt-4">
              <p className="leading-loose">
                Chez Macar, notre engagement envers nos clients est clair :
                nous croyons en la
                <span className="text-accent1"> confiance</span>, la
                <span className="text-accent1"> transparence</span>, et la
                <span className="text-accent1"> qualité </span>
                à chaque étape de notre travail.
              </p>
            </P>
            <p className="mt-4 text-sm text-default-600">
              Retrouvez le détail des prestations par domaine sur notre{" "}
              <Link
                href="/services"
                className="font-medium text-accent1 hover:underline"
              >
                page Services
              </Link>
              .
            </p>
            <div className="mt-10 flex flex-col gap-3 w-fit">
              <PrimaryButton
                content="Commencez votre projet !"
                href="/#contact"
                customClasses="w-full"
              />
              <SecondaryButton
                href="/services"
                content="Voir le détail des services"
                customClasses="w-full"
              />
            </div>
          </div>
          <div className="md:w-2/3 md:pl-10 mt-10 md:mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4">
              <Link href="/services/renovation" className="block group h-full">
                <Card
                  title="Rénovation intérieure et extérieure"
                  description="Carrelage de salle de bain, isolation intérieure et extérieure, isolation de façade avec crépi, pose de parquet flottant, abattage de murs porteurs."
                  customClasses="h-full"
                >
                  <Image
                    src="/services/renovation.png"
                    alt="Rénovation intérieure et extérieure — Macar"
                    width={100}
                    height={100}
                  />
                </Card>
              </Link>
              <Link href="/services/plomberie" className="block group h-full">
                <Card
                  title="Plomberie"
                  description="Installation de robinetterie, remplacement de chauffe-eau et chaudière, installation complète de chauffage central, débouchage de canalisations, réparation de fuites."
                  customClasses="h-full"
                >
                  <Image
                    src="/services/plomberie.png"
                    alt="Plomberie — Macar"
                    width={100}
                    height={100}
                  />
                </Card>
              </Link>
              <Link href="/services/electricite" className="block group h-full">
                <Card
                  title="Installation Electrique"
                  description="Mise aux normes de tableaux électriques, installation de prises de terre, pose de détecteurs de fumée, installation d'éclairage LED, câblage réseau."
                  customClasses="h-full"
                >
                  <Image
                    src="/services/installation-electrique.png"
                    alt="Installation électrique — Macar"
                    width={100}
                    height={100}
                  />
                </Card>
              </Link>
              <Link href="/services/toiture" className="block group h-full">
                <Card
                  title="Toiture"
                  description="Remplacement de tuiles, construction de nouvelle toitures et charpentes, étanchéité de toit-terrasse, isolation, pose de velux, construction/réparation/nettoyage/entretien de corniches et gouttières."
                  customClasses="h-full"
                >
                  <Image
                    src="/services/toiture.png"
                    alt="Toiture — Macar"
                    width={100}
                    height={100}
                  />
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </Screen>

      <Screen name="Contact" id="contact">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <SecondHeading>
              <h2>Votre projet, notre mission!</h2>
            </SecondHeading>
            <P customClasses="mt-10">
              <p className="leading-loose">
                Macar est prêt à écouter et à mettre en action vos projets de
                rénovation. Remplissez ce formulaire et découvrez comment nous
                pouvons donner vie à vos idées avec efficacité et savoir-faire.
              </p>
            </P>
            <div className="flex flex-col items-start md:flex-row md:justify-start flex-wrap gap-6 mt-12">
              <CheckMark content="Réponse rapide" />
              <CheckMark content="Devis personnalisé et gratuit" />
              <CheckMark content="Experts Engagés" />
              <CheckMark content="Transparence" />
              <CheckMark content="Qualité" />
            </div>
            <div className="flex flex-col md:flex-col items-start gap-6 mt-12">
              <div>
                <P customClasses="font-medium">Téléphone</P>
                <Link href="tel:+32478235008">
                  <P customClasses="text-font-gray hover:text-font-lighter-gray">
                    {" "}
                    +32 478 23 50 08
                  </P>
                </Link>
              </div>
              <div>
                <P customClasses="font-medium">Email</P>
                <Link href="mailto:info@macar.be">
                  <P customClasses="text-font-gray hover:text-font-lighter-gray">
                    {" "}
                    info@macar.be
                  </P>
                </Link>
              </div>
              <div>
                <P customClasses="font-medium">Adresse</P>
                <P customClasses="text-font-gray">
                  {" "}
                  Avenue Prudent Bols, 43 <br />
                  B-1020 Bruxelles/Brussel
                </P>
                <a
                  href="https://www.google.com/maps/place/Macar+-+Construction,+Assistance,+R%C3%A9novation/@50.877796,4.3408706,17z/data=!3m1!4b1!4m6!3m5!1s0x47c3c3b79029f705:0xf83dc2c32ee6c273!8m2!3d50.877796!4d4.3408706!16s%2Fg%2F11lcp66xw1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-accent1 hover:underline"
                >
                  Voir sur Google Maps
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                </a>
              </div>
              <div>
                <P customClasses="font-medium">Horaires</P>
                <P customClasses="text-font-gray">
                  Lun – Ven · 08:00 – 17:00 <br />
                  Sam – Dim · Fermé
                </P>
              </div>
            </div>
          </div>

          <div className="col-span-3">{contact_form()}</div>
        </div>
      </Screen>

      <Screen name="FAQ" id="faq">
        <SecondHeading customClasses="text-left">
          <h2>Questions fréquentes</h2>
        </SecondHeading>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Accordion className="max-w-full">
            {faq.slice(0, Math.ceil(faq.length / 2)).map((item, i) => (
              <AccordionItem
                key={i}
                aria-label={item.question}
                title={item.question}
                classNames={{
                  content: "text-sm text-font-gray pb-4 text-left",
                  title: "text-sm sm:text-base text-left",
                }}
              >
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>
          <Accordion className="max-w-full">
            {faq.slice(Math.ceil(faq.length / 2)).map((item, i) => (
              <AccordionItem
                key={Math.ceil(faq.length / 2) + i}
                aria-label={item.question}
                title={item.question}
                classNames={{
                  content: "text-sm text-font-gray pb-4 text-left",
                  title: "text-sm sm:text-base text-left",
                }}
              >
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Screen>
    </main>
  );
}
