/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
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
    ];
  },
}

module.exports = nextConfig 