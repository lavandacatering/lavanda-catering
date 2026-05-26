'use client'

/**
 * src/components/menu/CategoryFilter.tsx
 * Chip horizontal scroll filter kategori
 * - "Semua" chip pertama
 * - Horizontal scroll no-scrollbar mobile
 * - Active: bg brand-primary text white
 * - Inactive: bg white border text neutral-mid
 */

import { cn } from '@/lib/utils'

interface Kategori {
  id: string
  nama: string
  urutan: number
}

interface CategoryFilterProps {
  kategoriList: Kategori[]
  activeCategory: string
  onChange: (kategori: string) => void
  className?: string
}

export default function CategoryFilter({
  kategoriList,
  activeCategory,
  onChange,
  className,
}: CategoryFilterProps) {
  const allChips = [{ id: 'semua', nama: 'Semua', urutan: -1 }, ...kategoriList]

  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-1',
        // Hide scrollbar cross-browser
        '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none',
        className
      )}
      role="group"
      aria-label="Filter kategori menu"
    >
      {allChips.map((chip) => {
        const isActive = activeCategory === chip.nama
        return (
          <button
            key={chip.id}
            onClick={() => onChange(chip.nama)}
            aria-pressed={isActive}
            className={cn(
              'shrink-0 h-9 px-4 rounded-full text-sm font-semibold transition-all duration-150 whitespace-nowrap',
              isActive
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white border border-border text-neutral-mid hover:border-brand-primary hover:text-brand-primary hover:bg-[#F0FDF4]'
            )}
          >
            {chip.nama}
          </button>
        )
      })}
    </div>
  )
}
