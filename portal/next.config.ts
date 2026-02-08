import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/tickets", destination: "/maintenance", permanent: true },
      { source: "/tickets/:id", destination: "/maintenance/:id", permanent: true },
      { source: "/sensors", destination: "/settings/devices", permanent: true },
      { source: "/gateways", destination: "/settings/gateways", permanent: true },
      { source: "/reports", destination: "/settings/reports", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
