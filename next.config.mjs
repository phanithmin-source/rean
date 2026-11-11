/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@electric-sql/pglite",
      "pg",
      "bcryptjs",
      "sanitize-html",
    ],
  },
};

export default nextConfig;
