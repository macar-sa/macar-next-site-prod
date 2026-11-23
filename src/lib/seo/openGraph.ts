const SITE_URL = "https://www.macar.be";

// Shared by the layout and every page: a page's openGraph replaces the layout's instead of
// extending it, so each page must carry the images itself.
export const DEFAULT_OG_IMAGES = [
  { url: "/opengraph/OpengraphSmall.png", width: 800, height: 600 },
  { url: "/opengraph/OpengraphLarge.png", width: 1800, height: 1600 },
];

export function pageOpenGraph({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}) {
  return {
    title,
    description,
    url: `${SITE_URL}${path}`,
    siteName: "Macar",
    locale: "fr_BE",
    type: type as "website" | "article",
    images: DEFAULT_OG_IMAGES,
  };
}
