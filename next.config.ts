import { withSentryConfig } from '@sentry/nextjs'
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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

// Konfigurasi Sentry Next.js
const sentryOptions = {
  silent: true,
  org: 'lavanda-catering',
  project: 'lavanda-nextjs',
  hideSourceMaps: true,
  widenClientBounds: true,
  tunnelRoute: '/monitoring',
  // Nonaktifkan pencarian token / upload jika tidak ada token di env
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
}

export default withSentryConfig(nextConfig, sentryOptions)
