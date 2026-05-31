import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for optimal deployment
  output: "standalone",

  // Security & performance headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",          value: "DENY" },
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },

  // Compress output
  compress: true,

  // Enable React strict mode
  reactStrictMode: true,
};

export default nextConfig;
