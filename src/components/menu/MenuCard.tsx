'use client'

/**
 * src/components/menu/MenuCard.tsx
 * Card untuk item menu di katalog
 * - Foto 16:9 aspect ratio
 * - Badge kategori
 * - Badge cart highlight jika item sudah di keranjang (AMD-001)
 * - Hover: translate-y(-2px) shadow-hover
 * - AddToCartButton integrated
 */

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import AddToCartButton from '@/components/menu/AddToCartButton'
import { UtensilsCrossed, Check } from 'lucide-react'

export interface MenuCardData {
  id: string
  nama: string
  deskripsi: string | null
  harga: number
  foto_url: string | null
  status: string
  min_porsi: number
  kategori: {
    id: string
    nama: string
  }
}

interface MenuCardProps {
  menu: MenuCardData
}

export default function MenuCard({ menu }: MenuCardProps) {
  const { isInCart, getCartItem, isMounted } = useCart()
  const inCart = isMounted && isInCart(menu.id)
  const cartItem = inCart ? getCartItem(menu.id) : null

  return (
    <div className="group bg-white rounded-[12px] shadow-card overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200">
      {/* Foto */}
      <Link
        href={`/menu/${menu.id}`}
        className="block relative aspect-video overflow-hidden bg-gray-100"
      >
        {menu.foto_url ? (
          <Image
            src={menu.foto_url.split(',')[0]}
            alt={`Foto ${menu.nama} — Lavanda Catering`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-neutral-mid/30">
            <UtensilsCrossed className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Badge kategori */}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-neutral-dark text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
          {menu.kategori.nama}
        </span>

        {/* Cart badge highlight — AMD-001 */}
        {inCart && cartItem && (
          <span className="absolute top-2 right-2 bg-brand-primary text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            {cartItem.porsi} {menu.kategori.nama.toLowerCase() === 'prasmanan' ? 'pax' : 'porsi'}
          </span>
        )}

        {/* Status nonaktif overlay */}
        {menu.status === 'nonaktif' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-neutral-dark text-xs font-semibold px-3 py-1 rounded-full">
              Tidak Tersedia
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/menu/${menu.id}`}>
          <h3 className="font-bold text-sm text-neutral-dark leading-snug mb-1 line-clamp-2 hover:text-brand-primary transition-colors">
            {menu.nama}
          </h3>
        </Link>

        {/* Price and Min Portion in a single row - justified between */}
        {(() => {
          const unit = menu.kategori.nama.toLowerCase() === 'prasmanan' ? 'pax' : 'porsi'
          return (
            <div className="flex justify-between items-end mb-4 mt-auto pt-2">
              <div className="text-base text-brand-primary font-bold">
                {formatRupiah(menu.harga)}
                <span className="text-xs text-neutral-mid font-normal">/{unit}</span>
              </div>
              <div className="text-xs text-neutral-mid">
                min. {menu.min_porsi.toLocaleString('id-ID')} {unit}
              </div>
            </div>
          )
        })()}

        {menu.status === 'aktif' ? (
          <AddToCartButton
            id={menu.id}
            nama={menu.nama}
            harga={menu.harga}
            minPorsi={menu.min_porsi}
            itemType="menu"
            fotoUrl={menu.foto_url}
          />
        ) : (
          <button
            disabled
            className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed"
          >
            Tidak Tersedia
          </button>
        )}
      </div>
    </div>
  )
}
