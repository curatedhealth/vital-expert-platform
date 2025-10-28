/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['vital.expert'],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
