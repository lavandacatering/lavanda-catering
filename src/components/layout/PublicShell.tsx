'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingWAButton from './FloatingWAButton'
import CartBar from '../order/CartBar'
import CartDrawer from '../order/CartDrawer'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Exclude Navbar, Footer, and Floating WhatsApp Button on admin panel and maintenance pages
  const isAdmin = pathname?.startsWith('/admin')
  const isMaintenance = pathname === '/maintenance'
  const isCheckout = pathname === '/pesan'

  if (isAdmin || isMaintenance) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="grow flex flex-col">{children}</main>

      {/* Hide Cart elements on the checkout page */}
      {!isCheckout && (
        <>
          <CartBar onOpenDrawer={() => setIsDrawerOpen(true)} />
          <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
      )}

      <Footer />
      <FloatingWAButton />
    </>
  )
}
