import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript xatolarini e'tiborsiz qoldirish (Deploy uchun)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint xatolarini e'tiborsiz qoldirish
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Rasmlar uchun ruxsat
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;