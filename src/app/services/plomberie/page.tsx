import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo/openGraph";
import ServiceDetailBody from "@/app/_components/ServiceDetailBody";
import { plomberieService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Plombier à Bruxelles : chauffage, sanitaire, fuites | Macar",
  description:
    "Macar, plombier à Bruxelles depuis 2002 : chauffage central, chaudière à condensation, sanitaires, détection de fuites. Devis gratuit, urgences en journée.",
  alternates: { canonical: "/services/plomberie" },
  openGraph: pageOpenGraph({ title: "Plombier à Bruxelles | Macar", description: "Plomberie sanitaire, chauffage, chaudière, détection de fuites à Bruxelles. Devis gratuit.", path: "/services/plomberie" }),
};

export default function PlomberiePage() {
  return (
    <ServiceDetailBody
      service={plomberieService}
      h1="Plombier à Bruxelles : chauffage, sanitaire, fuites"
      intro="Macar intervient à Bruxelles pour tous vos travaux de plomberie : canalisations, chaudière à condensation, chauffage central, boiler et eau chaude sanitaire, toilettes et lavabos, détection de fuites. Devis gratuit, urgences en journée, du lundi au vendredi."
    />
  );
}
