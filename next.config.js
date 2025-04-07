/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add support for static admin files
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/tables-basic.html',
      },
      {
        source: '/tables-basic.html',
        destination: '/tables-basic.html',
      },
      {
        source: '/assets/:path*',
        destination: '/assets/:path*',
      },
      {
        source: '/_next/image',
        destination: '/_next/image',
      },
    ];
  },
}

module.exports = nextConfig 