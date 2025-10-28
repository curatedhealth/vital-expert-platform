/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,

  // Image configuration (using remotePatterns, domains is deprecated)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'xazinxsiglqokwfmogyk.supabase.co',
        pathname: '/storage/**',
      }
    ],
  },

  // TypeScript checking enabled for production safety
  typescript: {
    ignoreBuildErrors: false,
  },

  // Turbopack configuration (Next.js 16 default bundler)
  // Empty config silences the webpack warning
  turbopack: {},

  // Skip build-time errors in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // External packages for server components (moved from experimental)
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/realtime-js'],

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // Configure compiler options
  compiler: {
    styledComponents: true,
    // Disable styled-jsx (Next.js 16 uses styled-jsx 5.1.6+ which fixes SSR bug)
    styledJsx: false,
  },

  // Configure runtime for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'x-runtime',
            value: 'nodejs',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
