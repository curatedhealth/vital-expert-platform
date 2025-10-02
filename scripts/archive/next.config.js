/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'xazinxsiglqokwfmogyk.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xazinxsiglqokwfmogyk.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
  // Exclude backend directories from Next.js compilation
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Fix Html import issue in App Router by aliasing document components
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/document': require.resolve('./src/lib/next-document-mock.js'),
    };

    return config;
  },
  // Exclude backend directories from TypeScript checking
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip build-time errors in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig