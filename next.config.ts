import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // BC5: Wajib pakai remotePatterns (bukan domains)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/duu3mfobk/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
