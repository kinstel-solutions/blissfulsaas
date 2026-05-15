import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.36', '192.168.1.34', '192.168.1.40'],
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
      {
        protocol: 'https',
        hostname: 'dhkzxjijiqapmdcgqtxs.supabase.co',
      },
    ],
  },
};

export default nextConfig;
