import type { Metadata } from "next";
import ServiceDetailBody from "@/app/_components/ServiceDetailBody";
import { toitureService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Couvreur à Bruxelles — Macar | Tuiles, toit plat, velux",
  description:
    "Macar, couvreur à Bruxelles depuis 2002 : couverture en tuiles, toit plat Derbigum/EPDM, velux et lucarnes, corniches et gouttières zinc. Devis gratuit.",
  alternates: { canonical: "/services/toiture" },
  openGraph: {
    title: "Couvreur à Bruxelles — Macar",
    description:
      "Toiture en tuiles, toit plat Derbigum/EPDM, velux, corniches et gouttières zinc à Bruxelles. Devis gratuit.",
    url: "https://www.macar.be/services/toiture",
    type: "website",
  },
};

export default function ToiturePage() {
  return (
    <ServiceDetailBody
      service={toitureService}
      h1="Couvreur à Bruxelles — Tuiles, toit plat, velux, corniches"
      intro="Macar intervient à Bruxelles pour tous vos travaux de toiture : couverture en tuiles, toit plat Derbigum et EPDM, velux et lucarnes, corniches et gouttières en zinc naturel, descentes d'eau pluviale. Devis gratuit, échafaudage compris."
    />
  );
}
