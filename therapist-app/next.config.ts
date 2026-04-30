import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.34', '192.168.1.40'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
};

export default nextConfig;
