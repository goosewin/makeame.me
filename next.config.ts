import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // This will also ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgflip.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      }
    ],
  },
  outputFileTracingIncludes: {
    "/api/generateCaption": ["./public/fonts/**/*"]
  },
  // Ensure static assets are copied to the build
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(fnt|png)$/,
      type: 'asset/resource'
    });
    return config;
  }
}

export default nextConfig;
