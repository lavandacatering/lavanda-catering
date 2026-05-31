'use client'

/**
 * src/app/(admin)/admin/menu/page.tsx — /admin/menu
 * Admin: List semua menu + toggle status + hapus + navigasi ke form baru/edit
 *
 * Auth: ditangani oleh layout.tsx (requireAdminAuth)
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn, formatRupiah } from '@/lib/utils'

interface MenuItem {
  id: string
  nama: string
  deskripsi: string | null
  harga: number
  foto_url: string | null
  status: 'aktif' | 'nonaktif'
  min_porsi: number
  kategori: { id: string; nama: string }
  deleted_at: string | null
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

export default function AdminMenuPage() {
  const [menuList, setMenuList] = useState<MenuItem[]>([])
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

  const fetchMenu = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/v1/admin/menu?per_page=100${search ? `&search=${encodeURIComponent(search)}` : ''}`
      )
      if (res.ok) {
        const json = await res.json()
        setMenuList(json.data ?? [])
      } else {
        showToast('Gagal memuat daftar menu.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchMenu, refreshKey])

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif'
    try {
      const res = await fetch(`/api/v1/admin/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        showToast(`Status menu berhasil diubah menjadi ${newStatus}.`, 'success')
        setRefreshKey((k) => k + 1)
      } else {
        showToast(json.message ?? 'Gagal mengubah status menu.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/admin/menu/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        showToast('Menu berhasil dihapus.', 'success')
        setConfirmDeleteId(null)
        setRefreshKey((k) => k + 1)
      } else {
        showToast(json.message ?? 'Gagal menghapus menu.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredMenu = menuList.filter((m) => m.deleted_at === null)

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
            <h1 className="text-base font-extrabold text-neutral-dark">Kelola Menu</h1>
          </div>
          <Link
            href="/admin/menu/baru"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white font-bold text-sm hover:brightness-105 transition-all shadow-sm"
          >
            <span>+</span>
            <span>Tambah Menu</span>
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
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197M15.803 15.803A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu..."
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
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🍽️</span>
            <h2 className="text-lg font-bold text-neutral-dark mb-2">Belum ada menu</h2>
            <p className="text-neutral-mid text-sm mb-6">
              {search
                ? 'Tidak ada menu yang cocok dengan pencarian.'
                : 'Tambahkan menu pertama untuk katalog Lavanda.'}
            </p>
            <Link
              href="/admin/menu/baru"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-primary text-white font-bold text-sm hover:brightness-105 transition-all"
            >
              + Tambah Menu Pertama
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-mid mb-4 font-semibold">
              {filteredMenu.length} menu ditemukan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                >
                  {/* Foto */}
                  <div className="relative h-40 bg-gray-100">
                    {item.foto_url ? (
                      <Image
                        src={item.foto_url.split(',')[0]}
                        alt={item.nama}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    {/* Status badge */}
                    <span
                      className={cn(
                        'absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full',
                        item.status === 'aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {item.status === 'aktif' ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-neutral-mid uppercase tracking-wider mb-1">
                      {item.kategori.nama}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-dark mb-1 line-clamp-2">
                      {item.nama}
                    </h3>
                    <p className="text-brand-primary font-bold text-sm">
                      {formatRupiah(item.harga)}
                    </p>
                    <p className="text-xs text-neutral-mid mt-0.5 mb-4">
                      Min. {item.min_porsi} porsi
                    </p>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                          item.status === 'aktif'
                            ? 'bg-gray-100 text-neutral-mid hover:bg-gray-200'
                            : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        )}
                      >
                        {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>

                      {/* Edit */}
                      {(() => {
                        const safeId = /^[a-zA-Z0-9-]+$/.test(item.id) ? item.id : ''
                        return (
                          <Link
                            href={`/admin/menu/${safeId}/edit`}
                            className="px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary/20 transition-all"
                          >
                            Edit
                          </Link>
                        )
                      })()}

                      {/* Delete confirm */}
                      {confirmDeleteId === item.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="px-2 py-1.5 rounded-lg bg-danger text-white text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-60"
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
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
