'use client'

/**
 * src/components/catalog/CatalogTabs.tsx
 * Shared pill tabs component untuk /menu dan /menu/paket
 *
 * Posisi: antara Page Header dan Filter Bar
 * usePathname() untuk active state
 * navigate antar route (BUKAN switch konten dalam 1 page)
 */

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UtensilsCrossed, Package } from 'lucide-react'

const TABS = [
  { label: 'Menu Pilihan', icon: UtensilsCrossed, href: '/menu' },
  { label: 'Paket Bundling', icon: Package, href: '/menu/paket' },
] as const

export default function CatalogTabs() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    // /menu/paket hanya aktif di /menu/paket
    // /menu aktif di /menu atau /menu/[id] kecuali /menu/paket/*
    if (href === '/menu/paket') {
      return pathname === '/menu/paket' || pathname.startsWith('/menu/paket/')
    }
    if (href === '/menu') {
      return (
        pathname === '/menu' ||
        (pathname.startsWith('/menu/') && !pathname.startsWith('/menu/paket'))
      )
    }
    return pathname === href
  }

  return (
    <div className="flex justify-center mb-8 mt-2">
      <div className="inline-flex p-1 bg-gray-100/70 backdrop-blur-xs rounded-full border border-gray-200/50 shadow-inner max-w-full">
        {TABS.map((tab) => {
          const active = isActive(tab.href)
          const Icon = tab.icon
          return (
            <button
              key={tab.href}
              onClick={() => {
                if (!active) router.push(tab.href)
              }}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 px-6 sm:px-8 py-2 rounded-full h-9 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap outline-none',
                active
                  ? 'bg-brand-primary text-white shadow-[0_4px_12px_rgba(77,175,72,0.25)] pointer-events-none'
                  : 'text-neutral-mid hover:text-brand-primary cursor-pointer active:scale-95'
              )}
            >
              <Icon
                className={cn('w-4 h-4 transition-transform duration-200', active && 'scale-110')}
              />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
