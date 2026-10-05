/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
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
