import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, Geist } from 'next/font/google'
import { validateEnv } from '@/lib/env'
import './globals.css'
import { cn } from '@/lib/utils'

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
      className={cn(
        'h-full',
        'antialiased',
        plusJakartaSans.variable,
        inter.variable,
        'font-sans',
        geist.variable
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
