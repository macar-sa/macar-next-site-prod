import type { Metadata } from "next";
import ServiceDetailBody from "@/app/_components/ServiceDetailBody";
import { electriciteService } from "@/lib/services";

export const metadata: Metadata = {
  title:
    "Électricien à Bruxelles — Macar | Tableau, conformité RGIE, câblage",
  description:
    "Macar, électricien à Bruxelles depuis 2002 : tableau électrique, mise en conformité RGIE, saignées et câblage, prises, éclairage. Devis gratuit.",
  alternates: { canonical: "/services/electricite" },
  openGraph: {
    title: "Électricien à Bruxelles — Macar",
    description:
      "Tableau électrique, mise en conformité RGIE, câblage, prises et éclairage à Bruxelles. Devis gratuit.",
    url: "https://www.macar.be/services/electricite",
    type: "website",
  },
};

export default function ElectricitePage() {
  return (
    <ServiceDetailBody
      service={electriciteService}
      h1="Électricien à Bruxelles — Tableau, conformité RGIE, câblage"
      intro="Macar réalise vos installations électriques à Bruxelles : remplacement et mise en conformité du tableau électrique (RGIE), saignées et câblage, prises et interrupteurs, spots et éclairage, fibre optique. Devis gratuit, équipe expérimentée."
    />
  );
}
