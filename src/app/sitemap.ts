import { MetadataRoute } from "next";

const baseUrl = "https://www.macar.be";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl + "/", lastModified: new Date() },
    { url: baseUrl + "/about", lastModified: new Date() },
    { url: baseUrl + "/services", lastModified: new Date() },
    { url: baseUrl + "/job", lastModified: new Date() },
  ];
}
