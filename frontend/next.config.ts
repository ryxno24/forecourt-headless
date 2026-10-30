import type { NextConfig } from "next";

const wordpress = process.env.WORDPRESS_URL ? new URL(process.env.WORDPRESS_URL) : null;
const wordpressIsLocal = wordpress !== null && ["localhost", "127.0.0.1"].includes(wordpress.hostname);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  agentRules: false,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: wordpressIsLocal,
    remotePatterns: wordpress
      ? [
          {
            protocol: wordpress.protocol.replace(":", "") as "http" | "https",
            hostname: wordpress.hostname,
            port: wordpress.port,
            pathname: "/wp-content/uploads/**",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
