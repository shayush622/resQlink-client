import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
  },
  async rewrites() {
    return [
      {
         source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  }
};

export default nextConfig;
