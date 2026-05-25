'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingWAButton from './FloatingWAButton'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Exclude Navbar, Footer, and Floating WhatsApp Button on admin panel and maintenance pages
  const isAdmin = pathname?.startsWith('/admin')
  const isMaintenance = pathname === '/maintenance'

  if (isAdmin || isMaintenance) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="grow flex flex-col">{children}</main>
      <Footer />
      <FloatingWAButton />
    </>
  )
}
