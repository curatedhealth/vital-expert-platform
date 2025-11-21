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
  // Exclude Node.js modules from client bundle
  turbopack: {},
  
  // Webpack configuration for compatibility (if webpack is used instead of Turbopack)
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        cluster: false,
        dns: false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
      
      // Ignore prom-client in client bundle
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^prom-client$/,
        }),
        // Ignore server-only services in client bundle
        new webpack.IgnorePlugin({
          resourceRegExp: /redis-cache-service/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /agent-selector-service/,
        })
      );
    }
    return config;
  },

  // Skip build-time errors in development
  onDemandEntries: {
    maxInactiveAge: 25 * 60 * 1000,
    pagesBufferLength: 2,
  },

  // External packages for server components (moved from experimental)
  // These packages are excluded from client bundle and marked as server-only
  serverExternalPackages: [
    '@supabase/supabase-js',
    '@supabase/realtime-js', 
    'prom-client',
    'ioredis',
    '@pinecone-database/pinecone',
    'better-sqlite3',
    'import-in-the-middle',
    'require-in-the-middle',
  ],

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
