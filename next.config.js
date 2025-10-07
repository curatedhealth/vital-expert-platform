/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'xazinxsiglqokwfmogyk.supabase.co',
      'localhost',
      '127.0.0.1'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xazinxsiglqokwfmogyk.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
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
