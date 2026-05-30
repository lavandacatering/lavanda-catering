'use client'

/**
 * src/components/catalog/PaketCard.tsx
 * Card untuk item paket bundling di katalog publik
 * - Header gradient premium
 * - List constituent menu items
 * - Porsi counter starting at min_order
 * - Tombol "Tambah ke Keranjang"
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import { CheckCircle2, ShoppingCart, Plus, Minus, Package, Check } from 'lucide-react'

export interface PaketCardData {
  id: string
  nama: string
  subtitle: string | null
  deskripsi: string | null
  harga: number
  foto_url: string | null
  min_order: number
  status: string
  paket_items: {
    id: string
    keterangan: string | null
    porsi_per_paket: number
    menu: {
      id: string
      nama: string
      harga: number
      foto_url: string | null
    } | null
  }[]
}

interface PaketCardProps {
  paket: PaketCardData
}

export default function PaketCard({ paket }: PaketCardProps) {
  const router = useRouter()
  const { addItem, isInCart, getCartItem, isMounted } = useCart()
  const [porsi, setPorsi] = useState<number>(paket.min_order)

  const inCart = isMounted && isInCart(paket.id)
  const cartItem = inCart ? getCartItem(paket.id) : null

  const handleIncrement = () => {
    // Increment by 10 as step size for professional catering feel, or by 1
    setPorsi((prev) => prev + 10)
  }

  const handleDecrement = () => {
    setPorsi((prev) => Math.max(paket.min_order, prev - 10))
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      id: paket.id,
      item_type: 'paket',
      nama: paket.nama,
      foto_url: paket.foto_url,
      harga: paket.harga,
      porsi: porsi,
      min_porsi: paket.min_order,
    })
  }

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return
    }
    router.push(`/menu/paket/${paket.id}`)
  }

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-hover hover:-translate-y-0.5 transition-all duration-250 cursor-pointer"
    >
      {/* Header Card dengan Gradient Premium */}
      <div className="bg-linear-to-r from-brand-primary via-brand-secondary to-[#79dd6f] p-5 text-white relative">
        {/* Link to detail */}
        <Link href={`/menu/paket/${paket.id}`} className="block hover:underline">
          <h3 className="font-bold text-lg md:text-xl tracking-tight leading-snug">{paket.nama}</h3>
        </Link>
        {paket.subtitle && (
          <p className="text-xs text-white/90 mt-1 font-medium">{paket.subtitle}</p>
        )}

        {/* Image icon background for luxury look */}
        <Package className="absolute right-4 bottom-4 w-12 h-12 stroke-[0.8] opacity-15" />
      </div>

      <div className="p-5 flex flex-col grow gap-4">
        {/* Deskripsi Singkat */}
        {paket.deskripsi && (
          <p className="text-xs text-neutral-mid line-clamp-2 leading-relaxed font-medium">
            {paket.deskripsi}
          </p>
        )}

        {/* List Constituent Items */}
        <div className="grow">
          <h4 className="text-[11px] font-bold text-neutral-dark uppercase tracking-wider mb-2">
            Isi Paket:
          </h4>
          <ul className="flex flex-col gap-2.5">
            {paket.paket_items.slice(0, 5).map((pi) => (
              <li
                key={pi.id}
                className="flex items-start gap-2 text-xs text-neutral-dark font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span className="leading-tight">
                  {pi.menu?.nama || 'Menu Pilihan'}{' '}
                  {pi.keterangan && (
                    <span className="text-[10px] text-neutral-mid font-normal">
                      ({pi.keterangan})
                    </span>
                  )}
                </span>
              </li>
            ))}
            {paket.paket_items.length > 5 && (
              <li className="text-[11px] text-neutral-mid pl-6 font-medium">
                +{paket.paket_items.length - 5} menu lainnya.{' '}
                <Link
                  href={`/menu/paket/${paket.id}`}
                  className="text-brand-primary hover:underline font-bold"
                >
                  Lihat Detail →
                </Link>
              </li>
            )}
          </ul>
        </div>

        <hr className="border-gray-100 my-1" />

        {/* Harga & Min Order */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-lg md:text-xl font-extrabold text-brand-primary">
              {formatRupiah(paket.harga)}
              <span className="text-xs text-neutral-mid font-normal">/porsi</span>
            </div>
            <div className="text-[10px] text-neutral-mid font-bold mt-0.5">
              Min. order {paket.min_order} porsi
            </div>
          </div>

          {/* Cart Highlight Badge */}
          {inCart && cartItem && (
            <span className="bg-brand-primary text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {cartItem.porsi} Porsi di Cart
            </span>
          )}
        </div>

        {/* Portions Calculator & Add to Cart button */}
        {paket.status === 'aktif' ? (
          <div className="flex flex-col gap-2.5 mt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9 bg-gray-50/50 grow">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={porsi <= paket.min_order}
                  className="px-3 text-neutral-mid hover:text-neutral-dark hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all h-full font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={paket.min_order}
                  value={porsi}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    setPorsi(isNaN(val) ? paket.min_order : Math.max(paket.min_order, val))
                  }}
                  className="w-full text-center border-none p-0 focus:ring-0 font-sans text-xs font-bold text-neutral-dark bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-3 text-neutral-mid hover:text-brand-primary hover:bg-gray-100 transition-all h-full font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full h-10 bg-linear-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs tracking-wide shadow-xs hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 rounded-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Tambah {porsi} Porsi ke Keranjang
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed mt-2"
          >
            Tidak Tersedia
          </button>
        )}
      </div>
    </article>
  )
}
