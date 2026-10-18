import { Separator } from "@heroui/react/separator";
import { Phone } from "lucide-react";
import Screen from "./screen";
import { MainHeading, SecondHeading } from "./textStyles";
import { ButtonLink, TextLink } from "./links";
import { ServiceCard } from "./ServiceCard";
import ServiceSection from "./ServiceSection";
import { Breadcrumbs } from "./jsonld";
import { services, type ServiceItem } from "@/lib/services";
import { pickCommunes } from "@/lib/seo/communes";
import { LOCAL_BUSINESS_ID } from "@/lib/seo/localBusiness";
import { ContactForm } from "@/components/contact_form";

const baseUrl = "https://www.macar.be";

// Macar's mobile number. The tel: links are counted as phone_click by ConversionTracking's
// delegated listener (any Macar number, anywhere on the page), nothing to wire here.
const PHONE_HREF = "tel:+32478235008";
const PHONE_LABEL = "0478 23 50 08";

// Communes linked at the bottom of a service page, in this order: Bruxelles-Ville first
// (headquarters in Laeken), then pages with a written introduction.
const DEFAULT_ZONE_SLUGS = ["bruxelles-ville", "uccle", "schaerbeek", "ixelles"] as const;

// Service pages are Google Ads landing pages: a call button at the top and the contact form on
// the page itself (id "contact", so the page's own #contact links stay on the page).
export default function ServiceDetailBody({
  service,
  h1,
  intro,
  zoneSlugs = DEFAULT_ZONE_SLUGS,
}: {
  service: ServiceItem;
  h1: string;
  intro: string;
  zoneSlugs?: readonly string[];
}) {
  const pageUrl = `${baseUrl}/services/${service.id}`;
  const otherServices = services.filter((s) => s.id !== service.id);
  const linkedCommunes = pickCommunes(zoneSlugs);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    provider: { "@id": LOCAL_BUSINESS_ID },
    areaServed: { "@type": "City", name: "Bruxelles" },
    url: pageUrl,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
    },
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Accueil", url: `${baseUrl}/` },
          { name: "Services", url: `${baseUrl}/services` },
          { name: service.title, url: pageUrl },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <main className="flex min-h-screen flex-col">
        <Screen name="service-hero" customClassesInner="text-left">
          <div className="lg:mt-16 max-w-3xl xl:max-w-4xl">
            <MainHeading>
              <h1 className="leading-tight">{h1}</h1>
            </MainHeading>
            <p className="mt-4 text-base lg:text-lg text-muted">
              {intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href={PHONE_HREF}>
                <Phone aria-hidden size={16} />
                Appeler le {PHONE_LABEL}
              </ButtonLink>
              <ButtonLink href="#contact" variant="tertiary">Demander un devis gratuit</ButtonLink>
            </div>
          </div>
        </Screen>

        <Screen name="service-detail" customClassesInner="text-left">
          <div className="w-full max-w-full">
            <ServiceSection {...service} />
          </div>
        </Screen>

        <Screen name="service-contact" id="contact" customClassesInner="text-left">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <SecondHeading>
                <h2>Demander un devis gratuit</h2>
              </SecondHeading>
              <p className="mt-6 text-base text-muted leading-relaxed">
                Décrivez votre projet dans le formulaire, nous revenons vers vous pour en parler.
              </p>
              <p className="mt-6 text-base">
                Vous préférez appeler ?{" "}
                <TextLink href={PHONE_HREF}>{PHONE_LABEL}</TextLink>
              </p>
              <p className="mt-1 text-sm text-muted">Du lundi au vendredi, de 8 h à 17 h.</p>
            </div>
            <div className="md:col-span-3">
              <ContactForm />
            </div>
          </div>
        </Screen>

        <Screen name="other-services" customClassesInner="text-left">
          <div className="w-full max-w-full">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Nos autres services</h2>
            <nav
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              aria-label="Autres services"
            >
              {otherServices.map((s) => (
                <ServiceCard key={s.id} href={`/services/${s.id}`} image={s.image} title={s.title} />
              ))}
            </nav>
          </div>
        </Screen>

        <Screen name="zones-cross-links" customClassesInner="text-left">
          <div className="w-full max-w-full pb-8">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Intervention à Bruxelles</h2>
            <div className="flex flex-wrap gap-2">
              {linkedCommunes.map((c) => (
                <ButtonLink key={c.slug} href={`/zones/${c.slug}`} variant="tertiary" size="sm">
                  {c.name}
                </ButtonLink>
              ))}
            </div>
          </div>
        </Screen>
      </main>
    </>
  );
}
