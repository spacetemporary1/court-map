import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Supabase Storage and common avatar providers
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
