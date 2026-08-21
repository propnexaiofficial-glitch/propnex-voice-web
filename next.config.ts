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
    return [
      // NOTE: /api/users/signup and /api/users/signin are handled by Next.js API route handlers
      // (src/app/api/users/signup/route.ts and src/app/api/users/signin/route.ts)
      // and talk directly to MongoDB Atlas — no VPS proxy needed for auth.
      {
        source: "/api/users/:path*",
        destination: "http://200.234.34.240:3002/api/users/:path*", // Non-auth user routes (me, billing, etc.)
      },
      {
        source: "/api/webhook/:path*",
        destination: "http://200.234.34.240:3002/api/webhook/:path*",
      },
      {
        // Route inbound calls through backend server (proper per-company filtering)
        source: "/api/calls/inbound",
        destination: "http://200.234.34.240:3002/api/users/calls/inbound",
      },
      {
        source: "/api/:path*",
        destination: "http://200.234.34.240:3002/api/:path*",
      },
    ];
  },
};

export default nextConfig;
