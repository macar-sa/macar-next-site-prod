import { Separator } from "@heroui/react/separator";
import Screen from "./screen";
import { MainHeading } from "./textStyles";
import { ButtonLink } from "./links";
import { ServiceCard } from "./ServiceCard";
import ServiceSection from "./ServiceSection";
import { Breadcrumbs } from "./jsonld";
import { services, type ServiceItem } from "@/lib/services";
import { communes } from "@/lib/seo/communes";
import { LOCAL_BUSINESS_ID } from "@/lib/seo/localBusiness";

const baseUrl = "https://www.macar.be";

export default function ServiceDetailBody({
  service,
  h1,
  intro,
}: {
  service: ServiceItem;
  h1: string;
  intro: string;
}) {
  const pageUrl = `${baseUrl}/services/${service.id}`;
  const otherServices = services.filter((s) => s.id !== service.id);
  const topCommunes = communes.slice(0, 3);

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
            <div className="mt-8">
              <ButtonLink href="/#contact">Demander un devis gratuit</ButtonLink>
            </div>
          </div>
        </Screen>

        <Screen name="service-detail" customClassesInner="text-left">
          <div className="w-full max-w-full">
            <ServiceSection {...service} />
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
              {topCommunes.map((c) => (
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
