import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Vercel build ke waqt typescript errors ko ignore karne ke liye
    ignoreBuildErrors: true,
  },
  eslint: {
    // Build ke waqt ESLint errors ko ignore karne ke liye
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;