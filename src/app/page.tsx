import type { Metadata } from "next";
import HomeView from "./_components/HomeView";

export const metadata: Metadata = {
  title: "Macar — Rénovation, plomberie, électricité, toiture à Bruxelles",
  description:
    "Macar est une entreprise de rénovation, plomberie, installations électriques et toiture basée à Bruxelles (Belgique), active depuis 2002. Devis et accompagnement pour vos projets.",
};

const baseUrl = "https://www.macar.be";
const localBusinessId = baseUrl + "/#localbusiness";

const faq: { question: string; answer: string }[] = [
  {
    question: "Qu'est-ce que Macar ?",
    answer:
      "Macar est une entreprise belge spécialisée en rénovation, plomberie, installations électriques et toiture, basée à Bruxelles et active depuis 2002.",
  },
  {
    question: "Où est située l'entreprise Macar ?",
    answer:
      "Macar est située au 43, avenue Prudent Bols, B-1020 Bruxelles (Belgique). Nous intervenons à Bruxelles et en Belgique.",
  },
  {
    question: "Quels services propose Macar ?",
    answer:
      "Macar propose la rénovation intérieure et extérieure, la plomberie (chauffage, robinetterie, canalisations), les installations électriques (tableaux, éclairage, câblage) et les travaux de toiture (tuiles, charpente, velux, gouttières).",
  },
  {
    question: "Depuis quand Macar existe-t-elle ?",
    answer: "Macar a été fondée en 2002. L'équipe actuelle a repris les rênes en 2010 en préservant l'expertise et la confiance de la marque.",
  },
  {
    question: "Comment contacter Macar pour un devis ?",
    answer:
      "Vous pouvez contacter Macar par téléphone au +32 478 23 50 08, par email à info@macar.be, ou en remplissant le formulaire de contact sur le site. Nous répondons rapidement et proposons des devis personnalisés et gratuits.",
  },
  {
    question: "Macar intervient-elle uniquement à Bruxelles ?",
    answer:
      "Macar est basée à Bruxelles et intervient à Bruxelles et en Belgique. Notre zone d'intervention couvre la Belgique.",
  },
  {
    question: "Proposez-vous des travaux de toiture et de plomberie ?",
    answer:
      "Oui. Macar réalise les travaux de toiture (tuiles, charpente, velux, étanchéité, gouttières) et tous les travaux de plomberie (chauffage, chaudière, robinetterie, canalisations).",
  },
];

const services = [
  {
    name: "Rénovation intérieure et extérieure",
    description:
      "Carrelage de salle de bain, isolation intérieure et extérieure, isolation de façade avec crépi, pose de parquet flottant, abattage de murs porteurs.",
  },
  {
    name: "Plomberie",
    description:
      "Installation de robinetterie, remplacement de chauffe-eau et chaudière, installation complète de chauffage central, débouchage de canalisations, réparation de fuites.",
  },
  {
    name: "Installation Electrique",
    description:
      "Mise aux normes de tableaux électriques, installation de prises de terre, pose de détecteurs de fumée, installation d'éclairage LED, câblage réseau.",
  },
  {
    name: "Toiture",
    description:
      "Remplacement de tuiles, construction de nouvelle toitures et charpentes, étanchéité de toit-terrasse, isolation, pose de velux, construction/réparation/nettoyage/entretien de corniches et gouttières.",
  },
];

const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const servicesJsonLd = services.map((s) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: s.name,
  description: s.description,
  provider: { "@id": localBusinessId },
}));

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      {servicesJsonLd.map((json, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
      ))}
      <HomeView faq={faq} />
    </>
  );
}
