import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, Geist } from 'next/font/google'
import { validateEnv } from '@/lib/env'
import './globals.css'
import { cn } from '@/lib/utils'
import PublicShell from '@/components/layout/PublicShell'
import { GoogleAnalytics } from '@next/third-parties/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

// Validasi semua env var wajib saat server start (TASK-016)
validateEnv()

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://lavandacatering.id'),
  title: 'Lavanda Catering | Sajian Istimewa untuk Momen Berharga',
  description:
    'Layanan catering pernikahan, acara keluarga, dan event korporat premium. Menyediakan menu prasmanan, nasi box, dan gubukan berkualitas.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Lavanda Catering | Sajian Istimewa untuk Momen Berharga',
    description: 'Layanan catering pernikahan, acara keluarga, dan event korporat premium.',
    url: 'https://lavandacatering.id',
    siteName: 'Lavanda Catering',
    images: [
      {
        url: '/brand/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lavanda Catering Logo',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        plusJakartaSans.variable,
        inter.variable,
        'font-sans',
        geist.variable
      )}
    >
      <head>
        {/* Material Symbols Outlined — icon font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* FontAwesome V6 — icon font */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <PublicShell>{children}</PublicShell>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  )
}
