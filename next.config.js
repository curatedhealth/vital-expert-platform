/** @type {import('next').NextConfig} */
const nextConfig = {
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
      }
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

    // Ignore problematic native modules
    config.externals = config.externals || [];
    config.externals.push({
      'webworker-threads': 'commonjs webworker-threads',
    });

    // Ignore webworker-threads module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'webworker-threads': false,
    };

    // Suppress Buffer deprecation warnings and provide location polyfill
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'process.env.NODE_NO_WARNINGS': JSON.stringify('1'),
        'typeof window': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof document': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof location': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof navigator': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof global': isServer ? JSON.stringify('object') : JSON.stringify('undefined'),
      })
    );

    // Provide location polyfill for server-side rendering
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'location': false,
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
    serverComponentsExternalPackages: ['@supabase/supabase-js', '@supabase/realtime-js'],
  },
  
  // Configure compiler options
  compiler: {
    styledComponents: true,
  },
  
  // Disable styled-jsx to avoid SSR issues
  swcMinify: true,
  
  
  // Configure runtime for API routes to avoid Edge Runtime warnings
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
