'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { formatRupiah, cn } from '@/lib/utils'
import {
  AlertTriangle,
  ChevronRight,
  ShoppingBag,
  Trash2,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react'

interface ItemStatus {
  nama: string
  active: boolean
  exists: boolean
}

export default function OrderPage() {
  const router = useRouter()
  const { items, updatePorsi, removeItem, getTotal, isMounted, isExpired } = useCart()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Background check status
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({})

  // Expiration check on mount
  useEffect(() => {
    isExpired()
  }, [isExpired])

  // Periodic active status background checker
  useEffect(() => {
    if (!isMounted || items.length === 0) return

    let active = true
    const checkActiveStatuses = async () => {
      setCheckingStatus(true)
      try {
        const res = await fetch('/api/v1/cart/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((it) => ({ id: it.id, type: it.item_type })),
          }),
        })
        if (res.ok && active) {
          const json = await res.json()
          setItemStatuses(json.data || {})
        }
      } catch (err) {
        console.error('Failed to run background active status check:', err)
      } finally {
        if (active) setCheckingStatus(false)
      }
    }

    checkActiveStatuses()

    // Polling check every 15 seconds to keep synced
    const interval = setInterval(checkActiveStatuses, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [isMounted, items])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-neutral-mid animate-pulse">
            Menghubungkan sesi keranjang...
          </p>
        </div>
      </div>
    )
  }

  // Determine if there are inactive or non-existent items
  const inactiveItems = items.filter((item) => {
    const status = itemStatuses[item.id]
    if (!status) return false
    return !status.active || !status.exists
  })

  const hasInactiveItems = inactiveItems.length > 0

  const handleNextStep = () => {
    if (hasInactiveItems) return
    // Proceed to delivery form (to be completed in next phase / custom checkout flow)
    router.push('/pesan/checkout')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 font-sans text-neutral-dark">
      {/* Header Area */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/menu"
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-mid hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
          </Link>
          <span className="text-sm font-extrabold tracking-wide uppercase text-brand-primary">
            LAVANDA CATERING
          </span>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        {/* Stepper Wizard Indicator */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />

            {/* Step 1: Active */}
            <div className="z-10 bg-[#FAFAFA] pr-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs ring-4 ring-brand-primary/10">
                1
              </div>
              <span className="text-xs font-extrabold text-brand-primary hidden sm:block">
                Review Keranjang
              </span>
            </div>

            {/* Step 2: Pending */}
            <div className="z-10 bg-[#FAFAFA] px-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-neutral-mid flex items-center justify-center font-bold text-xs">
                2
              </div>
              <span className="text-xs font-bold text-neutral-mid hidden sm:block">
                Informasi & Tanggal
              </span>
            </div>

            {/* Step 3: Pending */}
            <div className="z-10 bg-[#FAFAFA] pl-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-neutral-mid flex items-center justify-center font-bold text-xs">
                3
              </div>
              <span className="text-xs font-bold text-neutral-mid hidden sm:block">
                Metode & Bayar
              </span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="max-w-md mx-auto text-center py-20 bg-white rounded-2xl shadow-xs border border-gray-100 p-8 mt-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-extrabold text-neutral-dark mb-2">Keranjang Anda Kosong</h2>
            <p className="text-xs text-neutral-mid mb-8 max-w-xs mx-auto">
              Anda belum menambahkan menu atau paket apa pun ke dalam keranjang belanja.
            </p>
            <Link
              href="/menu"
              className="inline-flex py-3 px-8 rounded-xl bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent text-white font-bold text-sm shadow-md hover:brightness-105 transition-all"
            >
              Cari Menu Sekarang
            </Link>
          </div>
        ) : (
          /* Layout Keranjang */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Content List Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall warning banner if some item is inactive */}
              {hasInactiveItems && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800 shadow-xs animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide">
                      Pemesanan Terhalang
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed font-semibold">
                      Beberapa item di keranjang Anda telah dinonaktifkan atau dihapus oleh admin.
                      Anda harus menghapusnya terlebih dahulu sebelum dapat melanjutkan proses
                      pemesanan.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <h3 className="text-sm font-extrabold text-neutral-dark uppercase tracking-wide flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-brand-primary" /> Daftar Menu dalam
                    Keranjang ({items.length} jenis)
                  </h3>
                  {checkingStatus && (
                    <span className="text-[10px] bg-brand-primary/5 text-brand-primary font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Menyelaraskan status...
                    </span>
                  )}
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const status = itemStatuses[item.id]
                    const isItemInactive = status && (!status.active || !status.exists)

                    return (
                      <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col gap-4">
                        {/* Warning specific block */}
                        {isItemInactive && (
                          <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 flex gap-2 text-danger text-xs font-bold leading-normal">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>
                              {status?.exists
                                ? `Menu "${item.nama}" saat ini sedang dinonaktifkan oleh administrator.`
                                : `Menu "${item.nama}" telah dihapus dari sistem oleh administrator.`}
                              <br />
                              Harap hapus item ini agar Anda dapat melanjutkan checkout.
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          {/* Image */}
                          <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                            {item.foto_url ? (
                              <Image
                                src={item.foto_url.split(',')[0]}
                                alt={item.nama}
                                fill
                                sizes="72px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand-primary/5 text-brand-primary font-bold text-xs uppercase">
                                {item.nama.substring(0, 2)}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="grow">
                            <h4 className="text-sm font-extrabold text-neutral-dark">
                              {item.nama}
                            </h4>
                            <p className="text-[10px] text-neutral-mid mt-0.5 uppercase tracking-wider font-bold">
                              {item.item_type === 'menu'
                                ? 'Satuan · Menu Kotakan'
                                : 'Paket Catering'}{' '}
                              · Min porsi: {item.min_porsi} porsi
                            </p>
                            <p className="text-xs text-brand-primary font-extrabold mt-1">
                              {formatRupiah(item.harga)}{' '}
                              <span className="text-[10px] text-neutral-mid font-semibold">
                                / porsi
                              </span>
                            </p>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-6 justify-between w-full sm:w-auto mt-4 sm:mt-0 shrink-0">
                            {/* Counter */}
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 h-10 shrink-0">
                              <button
                                onClick={() => updatePorsi(item.id, item.porsi - 1)}
                                disabled={item.porsi <= item.min_porsi}
                                className="px-3 text-neutral-mid hover:bg-gray-100 active:bg-gray-200 text-sm font-extrabold transition-all h-full disabled:opacity-30 disabled:hover:bg-transparent"
                              >
                                −
                              </button>
                              <span className="px-4 text-xs font-bold text-neutral-dark min-w-[40px] text-center">
                                {item.porsi} Porsi
                              </span>
                              <button
                                onClick={() => updatePorsi(item.id, item.porsi + 1)}
                                className="px-3 text-neutral-mid hover:bg-gray-100 active:bg-gray-200 text-sm font-extrabold transition-all h-full"
                              >
                                +
                              </button>
                            </div>

                            {/* Subtotal & Delete */}
                            <div className="text-right flex flex-col items-end gap-1 min-w-[100px]">
                              <span className="text-xs font-bold text-neutral-mid">Subtotal</span>
                              <span className="text-sm font-extrabold text-brand-primary">
                                {formatRupiah(item.subtotal)}
                              </span>
                            </div>

                            {/* Trash Trigger */}
                            {deleteConfirmId !== item.id && (
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-2 border border-gray-100 hover:border-red-200 hover:bg-red-50 rounded-xl text-neutral-mid hover:text-danger transition-all shrink-0 cursor-pointer"
                                aria-label="Hapus menu dari keranjang"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Delete Confirmation */}
                        {deleteConfirmId === item.id && (
                          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-center justify-between text-xs animate-fade-in">
                            <span className="font-semibold text-neutral-dark">
                              Apakah Anda yakin ingin menghapus menu ini dari keranjang?
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  removeItem(item.id)
                                  setDeleteConfirmId(null)
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-danger text-white font-bold cursor-pointer hover:bg-red-600 transition-colors"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-neutral-mid font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Content: Sidebar Total Estimasi */}
            <div className="space-y-6 sticky top-24 self-start">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
                <h3 className="text-xs font-extrabold text-neutral-dark uppercase tracking-wide border-b border-gray-100 pb-4 mb-4">
                  Rincian Pemesanan
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-mid font-medium">Banyak Menu</span>
                    <span className="font-bold text-neutral-dark">{items.length} item</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-mid font-medium">Total Porsi</span>
                    <span className="font-bold text-neutral-dark">
                      {items.reduce((acc, curr) => acc + curr.porsi, 0)} porsi
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-gray-100 pt-3">
                    <span className="text-neutral-mid font-medium">Subtotal Pangan</span>
                    <span className="font-semibold text-neutral-dark">
                      {formatRupiah(getTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-mid font-medium">Biaya Servis / Ongkir</span>
                    <span className="text-[10px] bg-gray-100 text-neutral-mid font-bold px-2 py-0.5 rounded-full">
                      Dihitung di langkah 2
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-extrabold text-neutral-dark uppercase">
                      Estimasi Total
                    </span>
                    <span className="text-lg font-extrabold text-brand-primary">
                      {formatRupiah(getTotal())}
                    </span>
                  </div>
                  <p className="text-[9px] text-neutral-mid leading-relaxed mt-1">
                    *Harga di atas belum termasuk biaya pengiriman / biaya tambahan sesuai metode
                    layanan yang dipilih pada langkah selanjutnya.
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={hasInactiveItems}
                  className={cn(
                    'w-full py-4.5 rounded-2xl text-white font-extrabold text-sm text-center shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer',
                    hasInactiveItems
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent hover:brightness-105 active:scale-[0.99]'
                  )}
                >
                  {hasInactiveItems
                    ? 'Lengkapi Keranjang Terlebih Dahulu'
                    : 'Lanjut ke Informasi Pengiriman'}
                  {!hasInactiveItems && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Security info card */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[10px] leading-relaxed font-semibold">
                  Semua transaksi diproses secara aman. Anda dapat merubah isi porsi pemesanan atau
                  membatalkan sebelum konfirmasi akhir dilakukan.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
