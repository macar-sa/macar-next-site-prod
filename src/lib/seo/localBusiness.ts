import { communes } from "./communes";

export const LOCAL_BUSINESS_ID = "https://www.macar.be/#localbusiness";

// Single source of truth for the aggregate rating shown in the JSON-LD,
// the Review schema in page.tsx, and the rating badge in the hero.
// Update these two numbers when refreshing with real Google Business Profile totals.
export const RATING = { value: "5.0", count: 9 } as const;

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@id": LOCAL_BUSINESS_ID,
  "@type": [
    "GeneralContractor",
    "Plumber",
    "Electrician",
    "RoofingContractor",
    "HomeAndConstructionBusiness",
    "LocalBusiness",
  ],
  name: "Macar",
  // TODO confirm legal form (SRL / SPRL / SA) before shipping to prod.
  legalName: "Macar",
  description:
    "Macar est une entreprise belge de rénovation, plomberie, installations électriques et toiture, basée à Bruxelles, active depuis 2002 et sous la direction actuelle depuis 2010.",
  disambiguatingDescription:
    "Entreprise fondée en 2002 ; reprise et redirigée par l'équipe actuelle en 2010. Plus de 6 000 projets de rénovation réalisés dans la Région de Bruxelles-Capitale.",
  keywords:
    "rénovation Bruxelles, plombier Bruxelles, électricien Bruxelles, couvreur Bruxelles, isolation façade Bruxelles, primes Renolution, mise en conformité RGIE, toit plat Derbigum, EPDM, sinistre toiture Bruxelles, dégâts des eaux",
  url: "https://www.macar.be",
  logo: "https://www.macar.be/opengraph/OpengraphSmall.png",
  image: [
    "https://www.macar.be/opengraph/OpengraphLarge.png",
    "https://www.macar.be/landpage_pics/construction-tool.webp",
  ],
  telephone: "+32478235008",
  email: "info@macar.be",
  vatID: "BE0477451024",
  taxID: "BE0477.45.10.24",
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Bank transfer",
  foundingDate: "2002",
  slogan: "Votre partenaire pour toute rénovation à Bruxelles",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenue Prudent Bols, 43",
    addressLocality: "Bruxelles",
    postalCode: "1020",
    addressRegion: "Région de Bruxelles-Capitale",
    addressCountry: "BE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 50.877796,
    longitude: 4.3408706,
  },
  hasMap:
    "https://www.google.com/maps/place/Macar+-+Construction,+Assistance,+R%C3%A9novation/@50.877796,4.3408706,17z/data=!3m1!4b1!4m6!3m5!1s0x47c3c3b79029f705:0xf83dc2c32ee6c273!8m2!3d50.877796!4d4.3408706!16s%2Fg%2F11lcp66xw1",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Bruxelles" },
    ...communes.map((c) => ({ "@type": "City" as const, name: c.name })),
    { "@type": "AdministrativeArea", name: "Région de Bruxelles-Capitale" },
  ],
  knowsAbout: [
    "Rénovation intérieure",
    "Rénovation extérieure",
    "Isolation de façade",
    "Isolation par l'extérieur (ITE)",
    "Insufflation mur creux",
    "Aides à la rénovation Bruxelles-Capitale",
    "Primes Renolution",
    "Plomberie sanitaire",
    "Chauffage central",
    "Chaudière à condensation",
    "Détection de fuites",
    "Installation électrique résidentielle",
    "Mise en conformité RGIE",
    "Tableau électrique",
    "Toiture en tuiles",
    "Toiture en ardoises",
    "Toiture plate Derbigum / EPDM",
    "Velux et lucarnes",
    "Corniches et gouttières zinc",
    "Sinistres toiture et dégâts des eaux",
    "Travaux suite à rapport d'expert d'assurance",
  ],
  sameAs: [
    "https://www.facebook.com/profile.php?id=61552507283765",
    "https://www.google.com/maps/place/Macar+-+Construction,+Assistance,+R%C3%A9novation/@50.877796,4.3408706,17z/data=!3m1!4b1!4m6!3m5!1s0x47c3c3b79029f705:0xf83dc2c32ee6c273!8m2!3d50.877796!4d4.3408706!16s%2Fg%2F11lcp66xw1",
    // TODO add LinkedIn / Instagram if present.
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: RATING.value,
    reviewCount: String(RATING.count),
    bestRating: "5",
    worstRating: "1",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services Macar",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Rénovation intérieure et extérieure",
          url: "https://www.macar.be/services/renovation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Plomberie",
          url: "https://www.macar.be/services/plomberie",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Installation électrique",
          url: "https://www.macar.be/services/electricite",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Toiture",
          url: "https://www.macar.be/services/toiture",
        },
      },
    ],
  },
};
