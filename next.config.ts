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
        source: "/api/users/:path*",
        destination: "http://200.234.34.240:3002/api/users/:path*", // Auth server on port 3002
      },
      {
        source: "/api/webhook/:path*",
        destination: "http://200.234.34.240:3002/api/webhook/:path*", // Webhooks also on port 3002
      },
      {
        // Route inbound calls through backend server (proper per-company filtering)
        source: "/api/calls/inbound",
        destination: "http://200.234.34.240:3002/api/users/calls/inbound",
      },
      {
        source: "/api/:path*",
        destination: "http://200.234.34.240:3002/api/:path*", // Live remote Main dashboard API
      }
    ];
  },
};

export default nextConfig;
