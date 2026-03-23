/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/unsubscribe",
        destination: "/unsubscribed",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
