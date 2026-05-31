'use client'

/**
 * src/app/(admin)/admin/menu/paket/page.tsx — /admin/menu/paket
 * Admin: List semua paket + toggle status + hapus + navigasi ke form baru/edit
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn, formatRupiah } from '@/lib/utils'

interface PaketItem {
  id: string
  nama: string
  subtitle: string | null
  deskripsi: string | null
  harga: number
  foto_url: string | null
  status: 'aktif' | 'nonaktif'
  min_order: number
  deleted_at: string | null
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

export default function AdminPaketPage() {
  const [paketList, setPaketList] = useState<PaketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000)
  }

  const fetchPaket = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/v1/admin/paket?per_page=100${search ? `&search=${encodeURIComponent(search)}` : ''}`
      )
      if (res.ok) {
        const json = await res.json()
        setPaketList(json.data ?? [])
      } else {
        showToast('Gagal memuat daftar paket.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaket()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchPaket, refreshKey])

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif'
    try {
      const res = await fetch(`/api/v1/admin/paket/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        showToast(`Status paket berhasil diubah menjadi ${newStatus}.`, 'success')
        setRefreshKey((k) => k + 1)
      } else {
        showToast(json.message ?? 'Gagal mengubah status paket.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/admin/paket/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        showToast('Paket berhasil dihapus.', 'success')
        setConfirmDeleteId(null)
        setRefreshKey((k) => k + 1)
      } else {
        showToast(json.message ?? 'Gagal menghapus paket.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredPaket = paketList.filter((pkt) => pkt.deleted_at === null)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-neutral-mid hover:text-brand-primary font-bold text-sm flex items-center gap-1"
            >
              ← Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-extrabold text-neutral-dark">Kelola Paket</h1>
          </div>
          <Link
            href="/admin/menu/paket/baru"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white font-bold text-sm hover:brightness-105 transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus text-[11px]" />
            <span>Tambah Paket</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {/* Toast */}
        {toast.show && (
          <div
            className={cn(
              'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg border-l-4 shadow-lg flex items-center gap-3 animate-slide-up',
              toast.type === 'success'
                ? 'bg-[#F0FDF4] border-brand-primary text-[#166534]'
                : 'bg-[#FEF2F2] border-danger text-[#991B1B]'
            )}
          >
            <span className="text-lg">{toast.type === 'success' ? '✓' : '✗'}</span>
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-[13px] text-neutral-mid text-xs" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama paket..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse border border-gray-100"
              >
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPaket.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-xs">
            <i className="fa-solid fa-box-open text-4xl mx-auto mb-4 text-neutral-mid/40 block" />
            <h2 className="text-lg font-bold text-neutral-dark mb-2">Belum ada paket</h2>
            <p className="text-neutral-mid text-sm mb-6">
              {search
                ? 'Tidak ada paket yang cocok dengan pencarian.'
                : 'Tambahkan paket pertama untuk katalog bundling Lavanda.'}
            </p>
            <Link
              href="/admin/menu/paket/baru"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-primary text-white font-bold text-sm hover:brightness-105 transition-all shadow-sm"
            >
              + Tambah Paket Pertama
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-mid mb-4 font-semibold">
              {filteredPaket.length} paket ditemukan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPaket.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                  <div>
                    {/* Header bg-gradient */}
                    <div className="bg-linear-to-r from-brand-primary to-brand-secondary p-4 text-white relative">
                      <h3 className="font-bold text-base leading-snug tracking-tight truncate">
                        {item.nama}
                      </h3>
                      {item.subtitle && (
                        <p className="text-[10px] text-white/90 truncate mt-0.5">{item.subtitle}</p>
                      )}
                      <span
                        className={cn(
                          'absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm',
                          item.status === 'aktif'
                            ? 'bg-green-500/20 text-white border border-green-400'
                            : 'bg-gray-500/20 text-gray-200 border border-gray-400'
                        )}
                      >
                        {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-1">
                      <p className="text-brand-primary font-black text-base">
                        {formatRupiah(item.harga)}
                        <span className="text-xs text-neutral-mid font-normal">/porsi</span>
                      </p>
                      <p className="text-xs text-neutral-dark font-bold">
                        Min. order {item.min_order} porsi
                      </p>
                      {item.deskripsi && (
                        <p className="text-xs text-neutral-mid line-clamp-2 leading-relaxed mt-2">
                          {item.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t border-gray-50 flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                        item.status === 'aktif'
                          ? 'bg-gray-150 text-neutral-mid hover:bg-gray-200'
                          : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                      )}
                    >
                      {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>

                    {(() => {
                      const safeId = /^[a-zA-Z0-9-]+$/.test(item.id) ? item.id : ''
                      return (
                        <Link
                          href={`/admin/menu/paket/${safeId}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary/20 transition-all flex items-center"
                        >
                          Edit
                        </Link>
                      )
                    })()}

                    {confirmDeleteId === item.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="px-2.5 py-1.5 rounded-lg bg-danger text-white text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-60"
                        >
                          {deletingId === item.id ? '...' : 'Ya'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 rounded-lg bg-gray-100 text-neutral-mid text-xs font-bold hover:bg-gray-200 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-danger text-xs font-bold hover:bg-red-100 transition-all"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
