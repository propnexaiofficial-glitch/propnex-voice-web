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
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["bcryptjs", "jsonwebtoken", "@prisma/client"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/users/:path*",
          destination: "http://200.234.34.240:3001/api/users/:path*",
        },
        {
          source: "/api/webhook/:path*",
          destination: "http://200.234.34.240:3001/api/webhook/:path*",
        },
        {
          source: "/api/calls/inbound",
          destination: "http://200.234.34.240:3001/api/users/calls/inbound",
        },
      ],
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://200.234.34.240:3001/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
