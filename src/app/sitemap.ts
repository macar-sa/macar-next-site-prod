import { MetadataRoute } from "next";
import { communes } from "@/lib/seo/communes";

const baseUrl = "https://www.macar.be";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/renovation`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/plomberie`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/electricite`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/toiture`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/job`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...communes.map((c) => ({
      url: `${baseUrl}/zones/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Phase 3: /blog, /realisations, /certifications — add when shipped.
    { url: `${baseUrl}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/politique-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/politique-cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
