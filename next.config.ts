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
        // IMPORTANT: /api/users/* local routes (me, signin, signup, etc.) are handled
        // by Next.js route files in src/app/api/users/ - do NOT proxy those.
        // Only proxy webhook which has no local implementation.
        {
          source: "/api/webhook/:path*",
          destination: "http://200.234.34.240:3001/api/webhook/:path*",
        },
        // Proxy specific user routes that don't have local implementations
        {
          source: "/api/users/remind-admin",
          destination: "http://200.234.34.240:3001/api/users/remind-admin",
        },
        {
          source: "/api/users/request-number",
          destination: "http://200.234.34.240:3001/api/users/request-number",
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
