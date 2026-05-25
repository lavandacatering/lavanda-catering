'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Track page scroll to toggle background glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Cek Pesanan', href: '/cek-pesanan' },
    { label: 'Kontak', href: '/#kontak' },
  ]

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-300 border-b',
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-gray-100 shadow-sm'
            : 'bg-white border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg
                className="w-5 h-5 text-brand-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-extrabold text-lg text-neutral-dark tracking-tight group-hover:text-brand-primary transition-colors">
              Lavanda Catering
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-semibold transition-all duration-200 relative py-2',
                    active ? 'text-brand-primary' : 'text-neutral-mid hover:text-brand-primary'
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-fade-in-up" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/pesan"
              className="hidden md:inline-flex items-center justify-center px-5 py-2 rounded-lg bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent text-white font-bold text-xs shadow-sm hover:brightness-105 hover:shadow-md transition-all active:scale-[0.98]"
            >
              Pesan Sekarang
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-neutral-dark"
              aria-label="Toggle navigation menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between relative">
                <span
                  className={cn(
                    'w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left',
                    isOpen ? 'rotate-45 translate-y-[2px] translate-x-[2px]' : ''
                  )}
                />
                <span
                  className={cn(
                    'w-full h-0.5 bg-current rounded-full transition-all duration-200',
                    isOpen ? 'opacity-0 scale-x-0' : ''
                  )}
                />
                <span
                  className={cn(
                    'w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left',
                    isOpen ? '-rotate-45 translate-y-[-2px] translate-x-[2px]' : ''
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 md:hidden transition-all duration-300 backdrop-blur-xs',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={cn(
          'fixed top-20 left-0 right-0 bg-white border-b border-gray-100 z-40 md:hidden shadow-lg p-6 flex flex-col gap-6 transition-all duration-300 transform origin-top',
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-base font-semibold py-2 px-3 rounded-lg transition-all',
                  active
                    ? 'text-brand-primary bg-brand-primary/5'
                    : 'text-neutral-mid hover:text-brand-primary hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
        <Link
          href="/pesan"
          onClick={() => setIsOpen(false)}
          className="w-full py-3 rounded-lg bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent text-white font-bold text-sm text-center shadow-card hover:brightness-105 transition-all"
        >
          Pesan Sekarang
        </Link>
      </div>
      {/* Spacer to push content below fixed navbar */}
      <div className="h-20 w-full" />
    </>
  )
}
