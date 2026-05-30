'use client'

/**
 * src/components/menu/MenuDetailClient.tsx
 * Client-side interaction untuk halaman detail menu:
 * - Counter porsi state
 * - Estimasi harga realtime
 * - AddToCartButton (update mode jika sudah di cart)
 * - Mobile sticky CTA (IntersectionObserver)
 * - Toast notifications
 * - Styled with premium vector icons (lucide-react) matching reference template
 */

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'
import { formatRupiah, cn } from '@/lib/utils'
import { Info, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'

interface MenuDetailClientProps {
  menu: {
    id: string
    nama: string
    deskripsi: string | null
    harga: number
    foto_url: string | null
    status: string
    min_porsi: number
    kategori: { id: string; nama: string }
  }
}

export default function MenuDetailClient({ menu }: MenuDetailClientProps) {
  const { addItem, updatePorsi, isInCart, getCartItem, isMounted } = useCart()
  const [porsi, setPorsi] = useState(menu.min_porsi)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)

  const inCart = isMounted && isInCart(menu.id)
  const cartItem = inCart ? getCartItem(menu.id) : null

  // IntersectionObserver untuk mobile sticky CTA
  useEffect(() => {
    if (!ctaRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting)
      },
      { threshold: 0 }
    )
    observer.observe(ctaRef.current)
    return () => observer.disconnect()
  }, [])

  const handleDecrease = () => {
    if (porsi > menu.min_porsi) {
      setPorsi((prev) => prev - 1)
    }
  }

  const handleIncrease = () => {
    setPorsi((prev) => prev + 1)
  }

  const handleAddToCart = () => {
    if (inCart) {
      updatePorsi(menu.id, porsi)
      toast.success(`Porsi ${menu.nama} diperbarui menjadi ${porsi} porsi`, { duration: 2000 })
    } else {
      addItem({
        id: menu.id,
        item_type: 'menu',
        nama: menu.nama,
        foto_url: menu.foto_url,
        harga: menu.harga,
        porsi,
        min_porsi: menu.min_porsi,
      })
      toast.success(`${menu.nama} ditambahkan ke keranjang ✓`, { duration: 3000 })
    }
  }

  const estimasiHarga = porsi * menu.harga

  return (
    <>
      <div ref={ctaRef} className="flex flex-col space-y-6">
        {/* Status & Nama */}
        <div className="space-y-2">
          <div>
            <span
              className={cn(
                'inline-block font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs',
                menu.status === 'aktif'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
              )}
            >
              {menu.status === 'aktif' ? 'Tersedia' : 'Tidak Tersedia'}
            </span>
          </div>

          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] leading-tight tracking-tight">
            {menu.nama}
          </h1>

          <div className="text-2xl sm:text-3xl font-extrabold text-[#4DAF48] tracking-tight">
            {formatRupiah(menu.harga)}
            <span className="text-sm font-normal text-neutral-mid">/porsi</span>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="text-sm sm:text-base leading-relaxed text-neutral-mid border-t border-b border-gray-100 py-4 space-y-3">
          {menu.deskripsi ? (
            <p className="whitespace-pre-line text-[#3f4a3c]">{menu.deskripsi}</p>
          ) : (
            <p className="text-neutral-mid italic">Belum ada deskripsi untuk menu ini.</p>
          )}
        </div>

        {/* Minimal Order Info Block */}
        <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100/60 text-neutral-dark text-xs sm:text-sm">
          <Info className="w-4 h-4 text-[#4DAF48] shrink-0 mt-0.5" />
          <span className="text-neutral-700 leading-normal">
            Minimal pemesanan:{' '}
            <strong className="text-neutral-dark">
              {menu.min_porsi.toLocaleString('id-ID')} porsi
            </strong>{' '}
            untuk layanan {menu.kategori.nama.toLowerCase()}.
          </span>
        </div>

        {/* Order Configurator */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm sm:text-base text-[#1E1E1E]">Kuantitas</span>
            <span className="text-xs text-neutral-mid">Kelipatan {menu.min_porsi} porsi</span>
          </div>

          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-1 w-44 shadow-2xs">
            <button
              onClick={handleDecrease}
              disabled={porsi <= menu.min_porsi}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-md transition-all outline-hidden',
                porsi <= menu.min_porsi
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-neutral-mid hover:text-[#4DAF48] hover:bg-gray-50'
              )}
              aria-label="Kurangi porsi"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-sm sm:text-base text-[#1E1E1E] w-12 text-center select-none">
              {porsi}
            </span>
            <button
              onClick={handleIncrease}
              className="w-9 h-9 flex items-center justify-center text-neutral-mid hover:text-[#4DAF48] hover:bg-gray-50 rounded-md transition-all outline-hidden"
              aria-label="Tambah porsi"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-between items-end pt-3 border-t border-gray-200/80">
            <span className="text-sm text-neutral-mid font-medium">Estimasi Total:</span>
            <span className="font-extrabold text-lg sm:text-xl text-[#1E1E1E]">
              {formatRupiah(estimasiHarga)}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        {menu.status === 'aktif' ? (
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-full py-3.5 px-6 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm select-none cursor-pointer',
                inCart
                  ? 'bg-emerald-50 border border-[#4DAF48] text-[#4DAF48] hover:bg-emerald-100/60'
                  : 'bg-linear-to-r from-[#4DAF48] to-[#96B83D] text-white hover:brightness-105 hover:shadow-md hover:shadow-emerald-500/10'
              )}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {inCart
                ? `✓ Perbarui Keranjang (${cartItem?.porsi ?? 0} porsi)`
                : `Tambah ke Keranjang`}
            </button>

            {inCart && (
              <a
                href="/pesan"
                className="w-full py-3.5 px-6 rounded-lg bg-neutral-dark text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:bg-neutral-800 hover:shadow-md select-none"
              >
                <span>Lanjut ke Pemesanan</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        ) : (
          <button
            disabled
            className="w-full py-3.5 rounded-lg bg-gray-100 text-gray-400 font-bold text-sm sm:text-base cursor-not-allowed select-none border border-gray-200/50"
          >
            Menu Tidak Tersedia
          </button>
        )}
      </div>

      {/* Mobile Sticky CTA */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center gap-3 safe-area-inset-bottom md:hidden shadow-lg animate-slide-up">
          {/* Mini counter */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 bg-white">
            <button
              onClick={handleDecrease}
              disabled={porsi <= menu.min_porsi}
              className={cn(
                'w-9 h-9 flex items-center justify-center transition-all',
                porsi <= menu.min_porsi ? 'text-gray-300 cursor-not-allowed' : 'text-neutral-dark'
              )}
              aria-label="Kurangi porsi"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 h-9 flex items-center justify-center text-xs font-bold text-neutral-dark border-x border-gray-200">
              {porsi}
            </span>
            <button
              onClick={handleIncrease}
              className="w-9 h-9 flex items-center justify-center text-neutral-dark hover:bg-gray-50 transition-all"
              aria-label="Tambah porsi"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CTA button */}
          {menu.status === 'aktif' ? (
            <button
              onClick={handleAddToCart}
              className={cn(
                'flex-1 h-9.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                inCart
                  ? 'bg-emerald-50 border border-[#4DAF48] text-[#4DAF48]'
                  : 'bg-linear-to-r from-[#4DAF48] to-[#96B83D] text-white'
              )}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {inCart ? `✓ Perbarui` : `Tambah — ${formatRupiah(estimasiHarga)}`}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 h-9.5 rounded-lg bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed"
            >
              Tidak Tersedia
            </button>
          )}
        </div>
      )}
    </>
  )
}
