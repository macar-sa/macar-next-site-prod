import type { Metadata } from "next";
import Screen from "@/app/_components/screen";
import { MainHeading } from "@/app/_components/textStyles";
import { ButtonLink } from "@/app/_components/links";
import { Breadcrumbs } from "@/app/_components/jsonld";
import { communes } from "@/lib/seo/communes";
import { pageOpenGraph } from "@/lib/seo/openGraph";

const baseUrl = "https://www.macar.be";
const TITLE = "Zones desservies par Macar : Bruxelles et toute la Belgique";
const DESCRIPTION =
  "Macar intervient partout en Belgique, et avant tout à Bruxelles : rénovation, plomberie, électricité et toiture dans chaque commune bruxelloise.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/zones" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/zones" }),
};

export default function ZonesPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Accueil", url: `${baseUrl}/` },
          { name: "Zones", url: `${baseUrl}/zones` },
        ]}
      />
      <main className="flex min-h-screen flex-col">
        <Screen name="zones-hero" customClassesInner="text-left" animate={false}>
          <div className="lg:mt-16 max-w-3xl xl:max-w-4xl">
            <MainHeading>
              <h1 className="leading-tight">Zones desservies par Macar</h1>
            </MainHeading>
            <p className="mt-6 text-base lg:text-lg text-muted leading-relaxed lg:leading-7">
              Macar intervient partout en Belgique, et avant tout à Bruxelles, où l&apos;entreprise est basée depuis 2002.
              Voici les 19 communes de la Région de Bruxelles-Capitale, avec les travaux que nous y menons en
              rénovation, plomberie, électricité et toiture.
            </p>
          </div>
        </Screen>
        <Screen name="zones-list" customClassesInner="text-left">
          <div className="w-full max-w-full pb-8">
            <h2 className="mb-4 text-sm font-medium text-muted">Communes de la Région de Bruxelles-Capitale</h2>
            <div className="flex flex-wrap gap-2">
              {communes.map((c) => (
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
