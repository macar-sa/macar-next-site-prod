import Image from "next/image";
import Link from "next/link";
import Screen from "../_components/screen";
import { MainHeading, P } from "../_components/textStyles";
import { PrimaryButton } from "../_components/buttons";
import { Breadcrumbs } from "../_components/jsonld";
import { services } from "@/lib/services";
import { LOCAL_BUSINESS_ID } from "@/lib/seo/localBusiness";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos services — Rénovation, plomberie, électricité, toiture | Macar",
  description:
    "Macar à Bruxelles : rénovation intérieure et extérieure, plomberie, installations électriques et toiture. Devis gratuit sur mesure.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Nos services — Macar",
    description:
      "Rénovation, plomberie, électricité et toiture à Bruxelles. Quatre domaines, une seule équipe locale.",
    url: "https://www.macar.be/services",
    type: "website",
  },
};

const baseUrl = "https://www.macar.be";

const servicesPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      name: "Nos services",
      description:
        "Liste des domaines d'activité de Macar : rénovation intérieure et extérieure, plomberie, installation électrique, toiture.",
      numberOfItems: services.length,
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.title,
        url: `${baseUrl}/services/${s.id}`,
      })),
    },
    ...services.map((s) => ({
      "@type": "Service" as const,
      name: s.title,
      description: s.summary,
      provider: { "@id": LOCAL_BUSINESS_ID },
      url: `${baseUrl}/services/${s.id}`,
    })),
  ],
};

const hashRedirectScript = `
(function(){
  var h = window.location.hash.replace('#','');
  var allowed = ['renovation','plomberie','electricite','toiture'];
  if (allowed.indexOf(h) !== -1) {
    window.location.replace('/services/' + h);
  }
})();
`.trim();

export default function ServicesIndexPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Accueil", url: `${baseUrl}/` },
          { name: "Services", url: `${baseUrl}/services` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesPageJsonLd) }}
      />
      <script dangerouslySetInnerHTML={{ __html: hashRedirectScript }} />
      <main className="flex min-h-screen flex-col">
        <Screen name="services" customClassesInner="text-left">
          <div className="lg:mt-16 max-w-3xl xl:max-w-4xl">
            <MainHeading>
              <h1 className="leading-tight">
                Services de rénovation, plomberie, électricité et toiture à
                Bruxelles
              </h1>
            </MainHeading>
            <p className="mt-4 text-base lg:text-lg text-default-600">
              Quatre domaines, une seule équipe locale. Chaque service est
              détaillé sur sa propre page : prestations, exemples concrets et
              demande de devis.
            </p>
            <div className="mt-8">
              <PrimaryButton
                href="/#contact"
                content="Demander un devis gratuit"
              />
            </div>
          </div>
        </Screen>

        <Screen name="services-grid" customClassesInner="text-left">
          <div className="w-full max-w-full border-t border-default-200 pt-8 pb-4">
            <P customClasses="text-sm font-medium text-default-500 mb-4">
              <p>Nos domaines</p>
            </P>
            <nav
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
              aria-label="Liste des services"
            >
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="group flex flex-col gap-3 rounded-lg border border-default-200 bg-default-50/50 p-5 transition-colors hover:border-accent1 hover:bg-primary/5"
                >
                  <Image
                    src={s.image}
                    alt=""
                    width={48}
                    height={48}
                    className="flex-shrink-0 object-contain"
                    aria-hidden
                  />
                  <h2 className="text-base font-semibold text-headings group-hover:text-accent1">
                    {s.title}
                  </h2>
                  <p className="text-sm text-default-600">{s.summary}</p>
                  <span className="mt-auto text-sm font-medium text-accent1">
                    Voir le détail →
                  </span>
                </Link>
              ))}
            </nav>
            <p className="mt-6 text-sm text-default-500">
              Les prestations listées sur chaque page sont non exhaustives ;
              chaque projet fait l'objet d'un devis sur mesure.
            </p>
          </div>
        </Screen>
      </main>
    </>
  );
}
