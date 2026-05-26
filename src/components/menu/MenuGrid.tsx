'use client'

/**
 * src/components/menu/MenuGrid.tsx
 * Client wrapper untuk grid menu dengan filter client-side
 * - Menerima data server-fetched
 * - Filter by kategori + search (client-side, no re-fetch)
 * - Skeleton loading state
 * - Empty state
 * - Grid responsive: 2-col mobile / 3-col tablet / 4-col desktop
 */

import { useState, useEffect, useCallback } from 'react'
import MenuCard, { MenuCardData } from '@/components/menu/MenuCard'
import SearchBar from '@/components/menu/SearchBar'
import CategoryFilter from '@/components/menu/CategoryFilter'
import { UtensilsCrossed } from 'lucide-react'

interface Kategori {
  id: string
  nama: string
  urutan: number
}

interface MenuGridProps {
  initialMenu: MenuCardData[]
  kategoriList: Kategori[]
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

export default function MenuGrid({ initialMenu, kategoriList }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [menu, setMenu] = useState<MenuCardData[]>(initialMenu)

  // Saat kategori/search berubah, fetch dari server (untuk FTS server-side yang lebih akurat)
  // Tetap ada client-side filter sebagai optimistic UI
  const fetchMenu = useCallback(async (kategori: string, search: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (kategori && kategori !== 'Semua') params.set('kategori', kategori)
      if (search) params.set('search', search)
      params.set('per_page', '50')

      const res = await fetch(`/api/v1/menu?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setMenu(json.data ?? [])
      }
    } catch (err) {
      console.error('[MenuGrid] fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Debounce fetch dari server — triggered oleh kategori dan search
    const timer = setTimeout(() => {
      fetchMenu(activeCategory, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [activeCategory, searchQuery, fetchMenu])

  // Client-side filter sebagai optimistic display
  const filtered = menu

  const handleCategoryChange = (kategori: string) => {
    setActiveCategory(kategori)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleReset = () => {
    setActiveCategory('Semua')
    setSearchQuery('')
  }

  return (
    <div>
      {/* Sticky Search & Filter Bar (Glassmorphism layout) */}
      <div className="sticky top-[64px] z-40 bg-white/90 backdrop-blur-md py-4 border-b border-gray-100/80 shadow-xs px-4 md:px-0 -mx-4 md:mx-0 transition-all mb-8">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Category Chips (Left) */}
          <div className="w-full md:w-auto overflow-x-auto grow">
            <CategoryFilter
              kategoriList={kategoriList}
              activeCategory={activeCategory}
              onChange={handleCategoryChange}
            />
          </div>

          {/* Search Input (Right) */}
          <div className="w-full md:w-auto md:min-w-[320px] shrink-0">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Cari menu favorit..."
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed className="w-16 h-16 text-neutral-300 mb-4 stroke-[1.5]" />
          <h2 className="text-xl font-bold text-neutral-dark mb-2">Menu belum tersedia</h2>
          <p className="text-neutral-mid mb-6">Coba ubah filter atau cari kata lain</p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-lg border-[1.5px] border-brand-primary text-brand-primary font-semibold text-sm hover:bg-[#F0FDF4] transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <MenuCard key={item.id} menu={item} />
          ))}
        </div>
      )}
    </div>
  )
}
