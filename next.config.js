/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  headers: async () => {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  redirects: async () => {
    return [];
  },
  
  rewrites: async () => {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
