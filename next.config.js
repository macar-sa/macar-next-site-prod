/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    // AVIF first (smaller), WebP for browsers without AVIF; optimised images kept a month.
    // Images are referenced by path: to replace a photo or a logo, give the new file a new name,
    // otherwise browsers may keep the old one for up to a month.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
  },
  // No Content-Security-Policy yet: Google, Meta, Formspree and Vercel Analytics need an
  // allow-list first (start with Content-Security-Policy-Report-Only).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/sevices/:path*", destination: "/services/:path*", permanent: true },
      // Article renamed without "bruxelles" (blog rule: no city in slugs), old address kept.
      {
        source: "/blog/degats-eaux-toiture-bruxelles-sinistre-assurance",
        destination: "/blog/degats-eaux-toiture-sinistre-assurance",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
