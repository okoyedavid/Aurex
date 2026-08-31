import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

function backendOrigin() {
  try {
    return process.env.NEXT_PUBLIC_BACKEND_URL
      ? new URL(process.env.NEXT_PUBLIC_BACKEND_URL).origin
      : null;
  } catch {
    return null;
  }
}

const connectSources = [
  "'self'",
  "https://api.cloudinary.com",
  backendOrigin(),
  ...(isDevelopment ? ["http:", "https:", "ws:", "wss:"] : []),
].filter(Boolean);

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  ...(isDevelopment
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/signin", destination: "/login", permanent: true },
      { source: "/signup", destination: "/register", permanent: true },
      {
        source: "/dashboard/businesses",
        destination: "/dashboard/business",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
