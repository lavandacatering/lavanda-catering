'use client'

import { useCart } from '@/hooks/useCart'
import { cn, formatRupiah } from '@/lib/utils'

interface CartBarProps {
  onOpenDrawer: () => void
}

export default function CartBar({ onOpenDrawer }: CartBarProps) {
  const { items, getTotal, getItemCount, isMounted } = useCart()

  if (!isMounted || items.length === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-45',
        'bg-neutral-dark text-white rounded-full px-6 py-3.5',
        'shadow-cart flex items-center gap-4 min-w-[280px] justify-between cursor-pointer',
        'animate-slide-up hover:scale-[1.02] transition-all duration-300'
      )}
      onClick={onOpenDrawer}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-neutral-dark">
            {getItemCount()}
          </span>
        </div>
        <span className="text-xs md:text-sm font-semibold tracking-wide text-gray-200">
          {getItemCount()} menu · {formatRupiah(getTotal())}
        </span>
      </div>

      <span className="text-xs md:text-sm font-bold text-brand-accent flex items-center gap-1 group">
        Lihat Keranjang
        <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
      </span>
    </div>
  )
}
