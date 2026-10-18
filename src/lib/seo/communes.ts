export type Commune = {
  slug: string;
  name: string;
  postal: string;
};

// Bruxelles-Ville first: Macar's headquarters is in Laeken (1020).
export const communes: Commune[] = [
  { slug: "bruxelles-ville", name: "Bruxelles-Ville", postal: "1000, 1020, 1120, 1130" },
  { slug: "uccle", name: "Uccle", postal: "1180" },
  { slug: "schaerbeek", name: "Schaerbeek", postal: "1030" },
  { slug: "ixelles", name: "Ixelles", postal: "1050" },
  { slug: "etterbeek", name: "Etterbeek", postal: "1040" },
  { slug: "saint-gilles", name: "Saint-Gilles", postal: "1060" },
  { slug: "forest", name: "Forest", postal: "1190" },
  { slug: "woluwe-saint-lambert", name: "Woluwe-Saint-Lambert", postal: "1200" },
  { slug: "woluwe-saint-pierre", name: "Woluwe-Saint-Pierre", postal: "1150" },
  { slug: "anderlecht", name: "Anderlecht", postal: "1070" },
  { slug: "jette", name: "Jette", postal: "1090" },
  { slug: "evere", name: "Evere", postal: "1140" },
  { slug: "molenbeek-saint-jean", name: "Molenbeek-Saint-Jean", postal: "1080" },
  { slug: "ganshoren", name: "Ganshoren", postal: "1083" },
  { slug: "koekelberg", name: "Koekelberg", postal: "1081" },
  { slug: "berchem-sainte-agathe", name: "Berchem-Sainte-Agathe", postal: "1082" },
];

export function getCommune(slug: string): Commune | undefined {
  return communes.find((c) => c.slug === slug);
}

// The communes of the given slugs, in that order. An unknown slug fails the build instead of
// silently dropping a link.
export function pickCommunes(slugs: readonly string[]): Commune[] {
  return slugs.map((slug) => {
    const commune = getCommune(slug);
    if (!commune) throw new Error(`Commune inconnue : ${slug}`);
    return commune;
  });
}
