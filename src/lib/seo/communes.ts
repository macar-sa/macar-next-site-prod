export type Commune = {
  slug: string;
  name: string;
  postal: string;
};

export const communes: Commune[] = [
  { slug: "uccle", name: "Uccle", postal: "1180" },
  { slug: "schaerbeek", name: "Schaerbeek", postal: "1030" },
  { slug: "ixelles", name: "Ixelles", postal: "1050" },
  { slug: "etterbeek", name: "Etterbeek", postal: "1040" },
  { slug: "saint-gilles", name: "Saint-Gilles", postal: "1060" },
  { slug: "forest", name: "Forest", postal: "1190" },
  { slug: "woluwe-saint-lambert", name: "Woluwe-Saint-Lambert", postal: "1200" },
  { slug: "anderlecht", name: "Anderlecht", postal: "1070" },
  { slug: "jette", name: "Jette", postal: "1090" },
  { slug: "molenbeek-saint-jean", name: "Molenbeek-Saint-Jean", postal: "1080" },
];

export function getCommune(slug: string): Commune | undefined {
  return communes.find((c) => c.slug === slug);
}
