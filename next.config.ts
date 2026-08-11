import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/webhooks/:path*",
        destination: "https://propnexai-main-server-mh95.onrender.com/api/webhooks/:path*", // Proxy to Main Webhook Server
      },
    ];
  },
};

export default nextConfig;
