import type { Metadata } from "next";
import ServiceDetailBody from "@/app/_components/ServiceDetailBody";
import { plomberieService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Plombier à Bruxelles — Macar | Chauffage, sanitaire, fuites",
  description:
    "Macar, plombier à Bruxelles depuis 2002 : chauffage central, chaudière à condensation, sanitaires, détection de fuites. Devis gratuit, intervention rapide.",
  alternates: { canonical: "/services/plomberie" },
  openGraph: {
    title: "Plombier à Bruxelles — Macar",
    description:
      "Plomberie sanitaire, chauffage, chaudière, détection de fuites à Bruxelles. Devis gratuit.",
    url: "https://www.macar.be/services/plomberie",
    type: "website",
  },
};

export default function PlomberiePage() {
  return (
    <ServiceDetailBody
      service={plomberieService}
      h1="Plombier à Bruxelles — Chauffage, sanitaire, fuites"
      intro="Macar intervient à Bruxelles pour tous vos travaux de plomberie : canalisations, chaudière à condensation, chauffage central, boiler et eau chaude sanitaire, toilettes et lavabos, détection de fuites. Devis gratuit, intervention rapide."
    />
  );
}
