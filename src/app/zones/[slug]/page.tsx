import type { Metadata } from "next";
import { Separator } from "@heroui/react/separator";
import { notFound } from "next/navigation";
import Screen from "@/app/_components/screen";
import { MainHeading } from "@/app/_components/textStyles";
import { ButtonLink } from "@/app/_components/links";
import { CallButton } from "@/app/_components/CallButton";
import { ServiceCard } from "@/app/_components/ServiceCard";
import { Breadcrumbs } from "@/app/_components/jsonld";
import { communes, getCommune } from "@/lib/seo/communes";
import { services } from "@/lib/services";
import { LOCAL_BUSINESS_ID } from "@/lib/seo/localBusiness";
import { intros } from "./intros";
import { pageOpenGraph } from "@/lib/seo/openGraph";

const baseUrl = "https://www.macar.be";

export function generateStaticParams() {
  return communes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const commune = getCommune(slug);
  if (!commune) return {};
  return {
    title: `Rénovation, plomberie, électricité et toiture à ${commune.name} | Macar`,
    description: `Macar intervient à ${commune.name} (${commune.postal}) pour la rénovation, la plomberie, l'électricité et la toiture. Devis gratuit, équipe basée à Bruxelles depuis 2002.`,
    alternates: { canonical: `/zones/${commune.slug}` },
    openGraph: pageOpenGraph({
      title: `Rénovation à ${commune.name} | Macar`,
      description: `Rénovation, plomberie, électricité et toiture à ${commune.name}. Devis gratuit.`,
      path: `/zones/${commune.slug}`,
    }),
  };
}

export default async function ZonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const commune = getCommune(slug);
  if (!commune) notFound();

  const pageUrl = `${baseUrl}/zones/${commune.slug}`;
  // No generic fallback: a commune without its own text fails the static build.
  const body = intros[commune.slug];
  if (!body) throw new Error(`Texte manquant pour la commune ${commune.slug} (zones/[slug]/intros.ts)`);

  const localServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Rénovation, plomberie, électricité et toiture à ${commune.name}`,
    description: `Macar, entreprise de rénovation, plomberie, électricité et toiture intervenant à ${commune.name} et dans toute la Région de Bruxelles-Capitale.`,
    provider: { "@id": LOCAL_BUSINESS_ID },
    areaServed: { "@type": "City", name: commune.name },
    url: pageUrl,
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Accueil", url: `${baseUrl}/` },
          { name: "Zones", url: `${baseUrl}/zones` },
          { name: commune.name, url: pageUrl },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localServiceJsonLd) }}
      />
      <main className="flex min-h-screen flex-col">
        <Screen name="zone-hero" customClassesInner="text-left" animate={false}>
          <div className="lg:mt-16 max-w-3xl xl:max-w-4xl">
            <MainHeading>
              <h1 className="leading-tight">
                Rénovation, plomberie, électricité et toiture à {commune.name}
              </h1>
            </MainHeading>
            {/* Buttons before the long introduction, so a phone shows them in the first screen. */}
            <div className="mt-6 flex flex-wrap gap-4">
              <CallButton />
              <ButtonLink href="/#contact" variant="tertiary">Demander un devis gratuit</ButtonLink>
            </div>
            <p className="mt-8 text-base lg:text-lg text-muted leading-relaxed lg:leading-7">
              {body}
            </p>
          </div>
        </Screen>

        <Screen name="zone-services" customClassesInner="text-left">
          <div className="w-full max-w-full">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Nos services à {commune.name}</h2>
            <nav
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
              aria-label={`Services Macar à ${commune.name}`}
            >
              {services.map((s) => (
                <ServiceCard
                  key={s.id}
                  href={`/services/${s.id}`}
                  image={s.image}
                  title={s.title}
                  description={s.summary}
                  footer="Voir le détail"
                />
              ))}
            </nav>
          </div>
        </Screen>

        <Screen name="zone-other-zones" customClassesInner="text-left">
          <div className="w-full max-w-full pb-8">
            <Separator className="mb-8" />
            <h2 className="mb-4 text-sm font-medium text-muted">Autres zones desservies à Bruxelles</h2>
            <div className="flex flex-wrap gap-2">
              {communes
                .filter((c) => c.slug !== commune.slug)
                .map((c) => (
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
