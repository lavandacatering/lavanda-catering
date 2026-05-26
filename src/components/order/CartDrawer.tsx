'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { cn, formatRupiah } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const { items, updatePorsi, removeItem, getTotal, isMounted } = useCart()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCheckout = () => {
    onClose()
    router.push('/pesan')
  }

  const handleBrowseMenu = () => {
    onClose()
    router.push('/menu')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={cn(
            'w-screen max-w-md bg-white shadow-xl flex flex-col',
            'rounded-l-2xl overflow-hidden',
            'animate-slide-left duration-300'
          )}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-neutral-dark">Keranjang Pesanan</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-50 text-neutral-mid hover:text-neutral-dark transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Content */}
          <div className="grow overflow-y-auto p-6 flex flex-col gap-6">
            {!isMounted || items.length === 0 ? (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4 animate-pulse">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-neutral-dark mb-1">
                  Keranjang masih kosong
                </h3>
                <p className="text-xs text-neutral-mid max-w-xs mb-6">
                  Tambahkan menu lezat pilihanmu dari katalog untuk memulai pemesanan.
                </p>
                <button
                  onClick={handleBrowseMenu}
                  className="px-6 py-2.5 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm shadow-sm hover:brightness-105 transition-all"
                >
                  Lihat Menu
                </button>
              </div>
            ) : (
              // Items List
              <div className="flex flex-col gap-4 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative w-14 h-14 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                        {item.foto_url ? (
                          <Image
                            src={item.foto_url.split(',')[0]}
                            alt={item.nama}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-primary/5 text-brand-primary font-bold text-xs">
                            {item.nama.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info & Price */}
                      <div className="grow">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-neutral-dark leading-tight">
                            {item.nama}
                          </h4>
                          <span className="text-sm font-bold text-brand-primary shrink-0">
                            {formatRupiah(item.subtotal)}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-mid mt-0.5 uppercase tracking-wider font-semibold">
                          {item.item_type === 'menu' ? 'Satuan' : 'Paket'} · Min porsi:{' '}
                          {item.min_porsi}
                        </p>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-8">
                            <button
                              onClick={() => updatePorsi(item.id, item.porsi - item.min_porsi)}
                              disabled={item.porsi <= item.min_porsi}
                              className="px-2.5 hover:bg-gray-100 text-neutral-dark disabled:opacity-40 disabled:hover:bg-transparent transition-all h-full"
                            >
                              −
                            </button>
                            <span className="px-3 text-xs font-bold text-neutral-dark min-w-[32px] text-center">
                              {item.porsi}
                            </span>
                            <button
                              onClick={() => updatePorsi(item.id, item.porsi + item.min_porsi)}
                              className="px-2.5 hover:bg-gray-100 text-neutral-dark transition-all h-full"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Button Trigger */}
                          {deleteConfirmId !== item.id ? (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1 text-neutral-mid hover:text-danger rounded-md hover:bg-gray-50 transition-colors"
                              aria-label="Remove item"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Inline Delete Confirmation */}
                    {deleteConfirmId === item.id && (
                      <div className="bg-red-50/55 border border-red-100 rounded-lg p-2.5 flex items-center justify-between text-xs animate-fade-in-up">
                        <span className="font-medium text-neutral-dark">Hapus menu ini?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              removeItem(item.id)
                              setDeleteConfirmId(null)
                            }}
                            className="px-2.5 py-1 rounded bg-danger text-white font-bold"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 rounded bg-white border border-gray-200 text-neutral-mid font-semibold"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {isMounted && items.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-neutral-mid">Estimasi Total</span>
                <span className="text-xl font-extrabold text-brand-primary">
                  {formatRupiah(getTotal())}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg border border-brand-primary text-brand-primary font-bold text-xs text-center hover:bg-brand-primary/5 active:scale-[0.99] transition-all"
                >
                  + Tambah Menu Lainnya
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-lg bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent text-white font-bold text-sm text-center shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
                >
                  Lanjut ke Pemesanan →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
