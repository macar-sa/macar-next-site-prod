import Image from "next/image";
import Link from "next/link";
import Screen from "./screen";
import { MainHeading, P } from "./textStyles";
import { PrimaryButton } from "./buttons";
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
            <p className="mt-4 text-base lg:text-lg text-default-600">
              {intro}
            </p>
            <div className="mt-8">
              <PrimaryButton
                href="/#contact"
                content="Demander un devis gratuit"
              />
            </div>
          </div>
        </Screen>

        <Screen name="service-detail" customClassesInner="text-left">
          <div className="w-full max-w-full">
            <ServiceSection {...service} />
          </div>
        </Screen>

        <Screen name="other-services" customClassesInner="text-left">
          <div className="w-full max-w-full border-t border-default-200 pt-8">
            <P customClasses="text-sm font-medium text-default-500 mb-4">
              <p>Nos autres services</p>
            </P>
            <nav
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              aria-label="Autres services"
            >
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-default-200 bg-default-50/50 px-4 py-3 text-sm font-medium text-default-700 transition-colors hover:border-accent1 hover:bg-primary/5 hover:text-accent1"
                >
                  <Image
                    src={s.image}
                    alt=""
                    width={24}
                    height={24}
                    className="flex-shrink-0 object-contain"
                    aria-hidden
                  />
                  <span className="min-w-0">{s.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </Screen>

        <Screen name="zones-cross-links" customClassesInner="text-left">
          <div className="w-full max-w-full border-t border-default-200 pt-8 pb-8">
            <P customClasses="text-sm font-medium text-default-500 mb-4">
              <p>Intervention à Bruxelles</p>
            </P>
            <div className="flex flex-wrap gap-2">
              {topCommunes.map((c) => (
                <Link
                  key={c.slug}
                  href={`/zones/${c.slug}`}
                  className="inline-flex items-center rounded-full border border-default-200 bg-default-50/50 px-3 py-1.5 text-sm text-default-700 transition-colors hover:border-accent1 hover:bg-primary/5 hover:text-accent1"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </Screen>
      </main>
    </>
  );
}
