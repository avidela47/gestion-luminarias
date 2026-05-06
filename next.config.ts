import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'itelsasas.com',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig