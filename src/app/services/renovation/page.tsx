import type { Metadata } from "next";
import ServiceDetailBody from "@/app/_components/ServiceDetailBody";
import { renovationService } from "@/lib/services";

export const metadata: Metadata = {
  title:
    "Rénovation intérieure et extérieure à Bruxelles — Macar",
  description:
    "Macar, entreprise de rénovation à Bruxelles depuis 2002 : peinture, plafonds, carrelage, parquet, isolation de façade et crépi. Devis gratuit sur mesure.",
  alternates: { canonical: "/services/renovation" },
  openGraph: {
    title: "Rénovation intérieure et extérieure à Bruxelles — Macar",
    description:
      "Peinture, plafonds, carrelage, isolation de façade : rénovation intérieure et extérieure à Bruxelles. Devis gratuit.",
    url: "https://www.macar.be/services/renovation",
    type: "website",
  },
};

export default function RenovationPage() {
  return (
    <ServiceDetailBody
      service={renovationService}
      h1="Rénovation intérieure et extérieure à Bruxelles"
      intro="Macar accompagne vos chantiers de rénovation à Bruxelles : peinture, plafonds en gyproc, carrelage, parquet flottant, isolation de façade et crépi, terrasses et étanchéité. Équipe locale, devis gratuit sur mesure."
    />
  );
}
