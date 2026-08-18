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
        destination: "http://200.234.34.240:5000/users/:path*", // Auth server on port 5000
      },
      {
        source: "/api/webhook/:path*",
        destination: "http://200.234.34.240:5000/webhook/:path*", // Webhooks also on port 5000
      },
      {
        // Route inbound calls through backend server (proper per-company filtering)
        source: "/api/calls/inbound",
        destination: "http://200.234.34.240:5000/users/calls/inbound",
      },
      {
        source: "/api/:path*",
        destination: "http://200.234.34.240:3001/api/:path*", // Live remote Main dashboard API
      }
    ];
  },
};

export default nextConfig;
