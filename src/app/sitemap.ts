import { MetadataRoute } from "next";
import { communes } from "@/lib/seo/communes";
import { getAllPosts } from "@/lib/blog";

const baseUrl = "https://www.macar.be";

// Only articles carry a lastmod: their dateModified is real. Static pages have no reliable
// date, and changefreq / priority are ignored by Google.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const page = (path: string) => ({ url: `${baseUrl}${path}` });

  return [
    page("/"),
    page("/about"),
    page("/services"),
    page("/services/renovation"),
    page("/services/plomberie"),
    page("/services/electricite"),
    page("/services/toiture"),
    page("/job"),
    page("/zones"),
    ...communes.map((c) => page(`/zones/${c.slug}`)),
    page("/blog"),
    ...posts.map((p) => ({ url: `${baseUrl}/blog/${p.slug}`, lastModified: new Date(p.dateModified) })),
    page("/mentions-legales"),
    page("/politique-confidentialite"),
    page("/politique-cookies"),
  ];
}
