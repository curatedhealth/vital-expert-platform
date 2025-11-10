/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,

  // Performance optimizations for large codebase
  experimental: {
    // Re-enable Turbopack for faster dev builds (Next.js 16 has fixed many issues)
    turbo: {
      resolveAlias: {
        // Add common aliases to speed up resolution
        '@': './src',
      },
    },
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion'],
  },

  // Speed up development server
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce memory usage in development
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      // Only include source maps in development for faster rebuilds
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Proxy AI Engine requests to avoid CORS issues
  async rewrites() {
    const aiEngineUrl = process.env.PYTHON_AI_ENGINE_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/mode1/:path*',
        destination: `${aiEngineUrl}/api/mode1/:path*`,
      },
      {
        source: '/api/mode2/:path*',
        destination: `${aiEngineUrl}/api/mode2/:path*`,
      },
      {
        source: '/api/mode3/:path*',
        destination: `${aiEngineUrl}/api/mode3/:path*`,
      },
      {
        source: '/api/mode4/:path*',
        destination: `${aiEngineUrl}/api/mode4/:path*`,
      },
    ];
  },
}

export default nextConfig
