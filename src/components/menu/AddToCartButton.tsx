'use client'

import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  id: string
  nama: string
  harga: number
  minPorsi: number
  itemType?: 'menu' | 'paket'
  fotoUrl?: string | null
  className?: string
}

export default function AddToCartButton({
  id,
  nama,
  harga,
  minPorsi,
  itemType = 'menu',
  fotoUrl = null,
  className,
}: AddToCartButtonProps) {
  const { addItem, isInCart, getCartItem, isMounted } = useCart()

  if (!isMounted) {
    return (
      <button
        disabled
        className={cn(
          'w-full py-2.5 rounded-lg bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed',
          className
        )}
      >
        Loading...
      </button>
    )
  }

  const inCart = isInCart(id)
  const cartItem = getCartItem(id)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click navigation
    addItem({
      id,
      item_type: itemType,
      nama,
      foto_url: fotoUrl,
      harga,
      porsi: minPorsi,
      min_porsi: minPorsi,
    })
  }

  if (inCart && cartItem) {
    return (
      <button
        onClick={handleAdd}
        className={cn(
          'w-full py-2.5 rounded-lg border-2 border-brand-primary bg-brand-primary/5 text-brand-primary font-extrabold text-xs tracking-wide',
          'hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5',
          className
        )}
      >
        <svg
          className="w-4 h-4 text-brand-primary animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>{cartItem.porsi} Porsi (✓ Ditambah)</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={cn(
        'w-full py-2.5 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary text-white font-extrabold text-xs tracking-wide shadow-xs',
        'hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1',
        className
      )}
    >
      <span>+ Tambah</span>
    </button>
  )
}
