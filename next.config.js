/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["byten.store", "api.byten.store", "192.168.0.105:3000"]
};

module.exports = nextConfig;
