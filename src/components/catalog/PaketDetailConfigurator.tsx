'use client'

/**
 * src/components/catalog/PaketDetailConfigurator.tsx
 * Client Component untuk kalkulator porsi & tombol beli di Halaman Detail Paket
 * Aligns with AMD-001 (Cart UX)
 */

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react'

interface PaketDetailConfiguratorProps {
  id: string
  nama: string
  harga: number
  minOrder: number
  fotoUrl: string | null
}

export default function PaketDetailConfigurator({
  id,
  nama,
  harga,
  minOrder,
  fotoUrl,
}: PaketDetailConfiguratorProps) {
  const { addItem, isInCart, getCartItem, isMounted } = useCart()
  const [porsi, setPorsi] = useState<number>(minOrder)

  const inCart = isMounted && isInCart(id)
  const cartItem = inCart ? getCartItem(id) : null

  const handleIncrement = () => {
    setPorsi((prev) => prev + 10)
  }

  const handleDecrement = () => {
    setPorsi((prev) => Math.max(minOrder, prev - 10))
  }

  const handleAddToCart = () => {
    addItem({
      id,
      item_type: 'paket',
      nama,
      foto_url: fotoUrl,
      harga,
      porsi: porsi,
      min_porsi: minOrder,
    })
  }

  const totalEstimation = porsi * harga

  return (
    <div className="space-y-4">
      {/* Portions Selector */}
      <div className="bg-brand-bg p-4 rounded-xl border border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xs text-neutral-dark uppercase tracking-wider">
            Jumlah Porsi
          </span>
          <span className="text-[11px] text-neutral-mid font-semibold">Min. {minOrder} porsi</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white h-11 w-48 shadow-inner">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={porsi <= minOrder}
              className="w-12 h-full flex items-center justify-center text-neutral-mid hover:text-neutral-dark hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={minOrder}
              value={porsi}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setPorsi(isNaN(val) ? minOrder : Math.max(minOrder, val))
              }}
              className="w-full text-center border-none p-0 focus:ring-0 font-sans text-sm font-bold text-neutral-dark bg-transparent"
            />
            <button
              type="button"
              onClick={handleIncrement}
              className="w-12 h-full flex items-center justify-center text-neutral-mid hover:text-brand-primary hover:bg-gray-50 transition-all font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200/60 pt-3 flex justify-between items-end">
          <span className="text-xs text-neutral-mid font-bold">Estimasi Total Harga:</span>
          <span className="text-xl font-black text-brand-primary tracking-tight">
            {formatRupiah(totalEstimation)}
          </span>
        </div>
      </div>

      {/* Cart Status Badge */}
      {inCart && cartItem && (
        <div className="bg-[#eff4ff] border border-[#d9e3f6] rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-brand-primary animate-fade-in">
          <Check className="w-4 h-4 text-brand-primary shrink-0" />
          <span>✓ {cartItem.porsi} Porsi sudah ada di keranjang belanja.</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAddToCart}
        className="w-full h-12 bg-linear-to-r from-brand-primary to-brand-secondary text-white font-extrabold text-sm tracking-wide shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 rounded-lg"
      >
        <ShoppingCart className="w-4.5 h-4.5" />
        Tambah {porsi} Porsi ke Keranjang
      </button>
    </div>
  )
}
