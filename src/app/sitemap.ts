import { MetadataRoute } from "next";

const baseUrl = "https://www.macar.be";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: baseUrl + "/", lastModified: now },
    { url: baseUrl + "/about", lastModified: now },
    { url: baseUrl + "/services", lastModified: now },
    { url: baseUrl + "/job", lastModified: now },
    { url: baseUrl + "/mentions-legales", lastModified: now },
    { url: baseUrl + "/politique-confidentialite", lastModified: now },
    { url: baseUrl + "/politique-cookies", lastModified: now },
  ];
}
