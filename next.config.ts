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
        destination: "http://200.234.34.240:3001/users/:path*", // Proxy to Auth Server
      },
      {
        source: "/api/webhook/:path*",
        destination: "http://200.234.34.240:3001/webhook/:path*", // Proxy to Webhook Server
      },
      {
        source: "/api/:path*",
        destination: "http://200.234.34.240:5000/:path*", // Proxy to propnex-server (Dashboard API)
      }
    ];
  },
};

export default nextConfig;
