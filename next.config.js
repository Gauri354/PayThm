/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Allow backend API calls
  async rewrites() {
    return [
      {
        source: "/api/:path*",        // frontend → backend
        destination: "http://localhost:8088/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
