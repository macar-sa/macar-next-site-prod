/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      { source: "/sevices/:path*", destination: "/services/:path*", permanent: true },
    ];
  },
};

module.exports = nextConfig;
