import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/experience",
        destination: "/about",
        permanent: true, // 308 redirect - preserves SEO value
      },
    ];
  },
};

export default nextConfig;
