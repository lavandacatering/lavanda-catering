'use client'

/**
 * src/app/(admin)/admin/menu/paket/[id]/edit/page.tsx — /admin/menu/paket/[id]/edit
 * Form edit paket katering
 *
 * BC3: async params
 */

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { cn, formatRupiah } from '@/lib/utils'

interface MenuItem {
  id: string
  nama: string
  harga: number
  kategori: { nama: string }
}

interface SelectedMenuItem {
  menu_id: string
  nama: string
  keterangan: string
  porsi_per_paket: number
  harga: number
}

interface PhotoItem {
  file?: File
  url: string
  previewUrl: string
}

interface FormErrors {
  nama?: string
  harga?: string
  min_order?: string
  items?: string
}

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default function AdminPaketEditPage({ params }: EditPageProps) {
  const router = useRouter()
  const { id } = use(params) // Next.js 16 recommendation for unpacking params in Client Components

  const [menuList, setMenuList] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [nama, setNama] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [harga, setHarga] = useState('')
  const [minOrder, setMinOrder] = useState('100')
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif')

  // Multiple photo fields
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Package constituent items selection
  const [selectedItems, setSelectedItems] = useState<SelectedMenuItem[]>([])
  const [searchMenu, setSearchMenu] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>(
    {
      show: false,
      message: '',
      type: 'success',
    }
  )

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000)
  }

  // Fetch package details + list menus on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paketRes, menuRes] = await Promise.all([
          fetch(`/api/v1/admin/paket/${id}`),
          fetch('/api/v1/admin/menu?per_page=100'),
        ])

        if (!paketRes.ok || !menuRes.ok) {
          showToast('Gagal memuat data paket.', 'error')
          return
        }

        const paketJson = await paketRes.json()
        const menuJson = await menuRes.json()

        setMenuList(menuJson.data ?? [])

        const p = paketJson.data
        if (p) {
          setNama(p.nama)
          setSubtitle(p.subtitle ?? '')
          setDeskripsi(p.deskripsi ?? '')
          setHarga(p.harga.toString())
          setMinOrder(p.min_order.toString())
          setStatus(p.status)

          if (p.foto_url) {
            const urls = p.foto_url.split(',').filter(Boolean)
            setPhotos(urls.map((url: string) => ({ url, previewUrl: url })))
          }

          setSelectedItems(
            p.paket_items
              .map(
                (pi: {
                  keterangan: string | null
                  porsi_per_paket: number
                  menu?: {
                    id: string
                    nama: string
                    harga: number
                  } | null
                }) => ({
                  menu_id: pi.menu?.id || '',
                  nama: pi.menu?.nama || 'Menu Pilihan',
                  keterangan: pi.keterangan ?? '',
                  porsi_per_paket: pi.porsi_per_paket || 1,
                  harga: pi.menu?.harga || 0,
                })
              )
              .filter((item: SelectedMenuItem) => item.menu_id !== '')
          )
        }
      } catch {
        showToast('Terjadi kesalahan koneksi.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSelectItem = (menu: MenuItem) => {
    if (selectedItems.some((item) => item.menu_id === menu.id)) {
      showToast('Menu ini sudah ditambahkan ke dalam paket.', 'error')
      return
    }
    if (selectedItems.length >= 10) {
      showToast('Maksimal 10 item menu dalam satu paket.', 'error')
      return
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        menu_id: menu.id,
        nama: menu.nama,
        keterangan: '1 porsi/orang',
        porsi_per_paket: 1,
        harga: menu.harga,
      },
    ])
    setSearchMenu('')
    setErrors((prev) => ({ ...prev, items: undefined }))
  }

  const handleRemoveItem = (idx: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleUpdateItemKeterangan = (idx: number, val: string) => {
    setSelectedItems((prev) => {
      const updated = [...prev]
      updated[idx].keterangan = val
      return updated
    })
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!nama.trim() || nama.trim().length < 3) errs.nama = 'Nama paket minimal 3 karakter.'
    const hargaNum = parseFloat(harga)
    if (!harga || isNaN(hargaNum) || hargaNum <= 0) errs.harga = 'Harga paket harus lebih dari 0.'
    const minOrderNum = parseInt(minOrder, 10)
    if (!minOrder || isNaN(minOrderNum) || minOrderNum <= 0)
      errs.min_order = 'Minimum order harus lebih dari 0.'
    if (selectedItems.length < 1) errs.items = 'Pilih minimal 1 menu konstituen.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? [])
    if (selectedFiles.length === 0) return

    if (photos.length + selectedFiles.length > 5) {
      showToast('Maksimal 5 foto diperbolehkan.', 'error')
      return
    }

    selectedFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`File "${file.name}" melebihi batas 5MB.`, 'error')
        return
      }

      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhotos((prev) =>
          [...prev, { file, url: '', previewUrl: ev.target?.result as string }].slice(0, 5)
        )
      }
      reader.readAsDataURL(file)
    })

    if (e.target) e.target.value = ''
  }

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = []
    setUploadingFoto(true)
    try {
      for (const photo of photos) {
        if (photo.file) {
          const formData = new FormData()
          formData.append('file', photo.file)
          formData.append('context', 'paket')
          const res = await fetch('/api/v1/admin/upload', {
            method: 'POST',
            body: formData,
          })
          const json = await res.json()
          if (res.ok && json.status === 'success') {
            urls.push(json.data.url)
          } else {
            throw new Error(json.message ?? 'Gagal mengunggah foto.')
          }
        } else {
          urls.push(photo.url)
        }
      }
      return urls
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Gagal mengunggah foto.'
      showToast(errorMsg, 'error')
      throw err
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      let uploadedUrls: string[] = []
      try {
        uploadedUrls = await uploadPhotos()
      } catch {
        setSubmitting(false)
        return
      }

      const res = await fetch(`/api/v1/admin/paket/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          subtitle: subtitle.trim() || null,
          deskripsi: deskripsi.trim() || null,
          harga: parseFloat(harga),
          min_order: parseInt(minOrder, 10),
          status,
          foto_url: uploadedUrls.join(',') || null,
          items: selectedItems.map((item) => ({
            menu_id: item.menu_id,
            keterangan: item.keterangan.trim(),
            porsi_per_paket: item.porsi_per_paket,
          })),
        }),
      })

      const json = await res.json()
      if (res.ok && json.status === 'success') {
        showToast('Paket berhasil diperbarui!', 'success')
        setTimeout(() => router.push('/admin/menu/paket'), 1500)
      } else {
        showToast(json.message ?? 'Gagal memperbarui paket.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredMenuList = menuList.filter((m) =>
    m.nama.toLowerCase().includes(searchMenu.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4DAF48] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans antialiased text-[#1E1E1E]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/admin/menu/paket"
            className="inline-flex items-center gap-1.5 text-neutral-mid hover:text-[#4DAF48] font-semibold text-sm transition-colors group"
          >
            <i className="fa-solid fa-arrow-left text-xs transition-transform group-hover:-translate-x-0.5 pointer-events-none"></i>
            Kembali
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-extrabold text-neutral-dark">Edit Paket</h1>
        </div>
      </header>

      {/* Toast */}
      {toast.show && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg border-l-4 shadow-md flex items-center gap-3 animate-slide-up',
            toast.type === 'success'
              ? 'bg-emerald-50 border-[#4DAF48] text-emerald-800'
              : 'bg-rose-50 border-danger text-rose-800'
          )}
        >
          <div className="shrink-0">
            {toast.type === 'success' ? (
              <i className="fa-solid fa-check text-sm text-[#4DAF48]"></i>
            ) : (
              <i className="fa-solid fa-circle-exclamation text-sm text-danger"></i>
            )}
          </div>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6"
          noValidate
        >
          {/* Nama */}
          <div>
            <label htmlFor="nama" className="block text-sm font-semibold text-neutral-dark mb-1.5">
              Nama Paket <span className="text-danger">*</span>
            </label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value)
                setErrors((p) => ({ ...p, nama: undefined }))
              }}
              placeholder="Paket Pernikahan Eksklusif"
              className={cn(
                'w-full h-12 px-4 rounded-lg border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors',
                errors.nama ? 'border-danger focus:ring-danger' : 'border-border'
              )}
            />
            {errors.nama && <p className="text-xs text-danger mt-1">{errors.nama}</p>}
          </div>

          {/* Subtitle */}
          <div>
            <label
              htmlFor="subtitle"
              className="block text-sm font-semibold text-neutral-dark mb-1.5"
            >
              Subtitle / Tagline <span className="text-neutral-mid font-normal">(opsional)</span>
            </label>
            <input
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Untuk 200–500 tamu"
              className="w-full h-12 px-4 rounded-lg border border-border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label
              htmlFor="deskripsi"
              className="block text-sm font-semibold text-neutral-dark mb-1.5"
            >
              Deskripsi Paket <span className="text-neutral-mid font-normal">(opsional)</span>
            </label>
            <textarea
              id="deskripsi"
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi detail tentang penawaran paket..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] resize-none transition-colors"
            />
          </div>

          {/* Harga + Min Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="harga"
                className="block text-sm font-semibold text-neutral-dark mb-1.5"
              >
                Harga (per porsi) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid text-sm font-semibold">
                  Rp
                </span>
                <input
                  id="harga"
                  type="number"
                  min="1"
                  value={harga}
                  onChange={(e) => {
                    setHarga(e.target.value)
                    setErrors((p) => ({ ...p, harga: undefined }))
                  }}
                  placeholder="85000"
                  className={cn(
                    'w-full h-12 pl-10 pr-4 rounded-lg border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors',
                    errors.harga ? 'border-danger' : 'border-border'
                  )}
                />
              </div>
              {harga && !isNaN(parseFloat(harga)) && (
                <p className="text-xs text-[#4DAF48] mt-1 font-semibold">
                  {formatRupiah(parseFloat(harga))}
                </p>
              )}
              {errors.harga && <p className="text-xs text-danger mt-1">{errors.harga}</p>}
            </div>

            <div>
              <label
                htmlFor="min_order"
                className="block text-sm font-semibold text-neutral-dark mb-1.5"
              >
                Minimum Order (porsi) <span className="text-danger">*</span>
              </label>
              <input
                id="min_order"
                type="number"
                min="1"
                value={minOrder}
                onChange={(e) => {
                  setMinOrder(e.target.value)
                  setErrors((p) => ({ ...p, min_order: undefined }))
                }}
                placeholder="200"
                className={cn(
                  'w-full h-12 px-4 rounded-lg border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors',
                  errors.min_order ? 'border-danger' : 'border-border'
                )}
              />
              {errors.min_order && <p className="text-xs text-danger mt-1">{errors.min_order}</p>}
            </div>
          </div>

          {/* Foto Upload — Maksimal 5 Foto */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-neutral-dark">
                Foto Paket <span className="text-neutral-mid font-normal">({photos.length}/5)</span>
              </label>
              <span className="text-xs text-neutral-mid">Format: JPG, PNG, WebP. Maks 5MB.</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {photos.map((p, idx) => (
                <div
                  key={idx}
                  className="relative aspect-4/3 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden group shadow-2xs"
                >
                  <Image
                    src={p.previewUrl}
                    alt={`Foto paket ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer select-none"
                    aria-label={`Hapus foto ${idx + 1}`}
                  >
                    <i className="fa-solid fa-xmark text-xs"></i>
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/40 text-[9px] font-bold text-white rounded-md backdrop-blur-xs select-none">
                    Foto {idx + 1}
                  </span>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="relative aspect-4/3 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#4DAF48] bg-gray-50/50 hover:bg-[#F0FDF4]/30 flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 select-none shadow-2xs text-center p-2 group">
                  <i className="fa-solid fa-cloud-arrow-up text-lg text-gray-400 group-hover:text-[#4DAF48] transition-colors"></i>
                  <span className="text-[10px] font-semibold text-neutral-mid group-hover:text-[#4DAF48] transition-colors">
                    Tambah Foto
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2">Status</label>
            <div className="flex gap-3">
              {(['aktif', 'nonaktif'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 cursor-pointer outline-hidden',
                    status === s
                      ? s === 'aktif'
                        ? 'bg-[#4DAF48] text-white border-[#4DAF48] shadow-xs'
                        : 'bg-neutral-mid text-white border-neutral-mid shadow-xs'
                      : 'bg-white border-border text-neutral-mid hover:border-[#4DAF48]'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      status === s ? 'bg-white' : s === 'aktif' ? 'bg-[#4DAF48]' : 'bg-neutral-mid'
                    )}
                  />
                  {s === 'aktif' ? 'Aktif' : 'Nonaktif'}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Constituent Menus Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="block text-sm font-semibold text-neutral-dark">
                Menu Konstituen Paket <span className="text-danger">*</span>
              </h3>
              <p className="text-xs text-neutral-mid mt-0.5">
                Pilih minimal 1 menu dan maksimal 10 menu yang termasuk dalam paket ini.
              </p>
            </div>

            {/* Menu Search and Selection Bar */}
            <div className="relative">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid text-xs"></i>
                <input
                  type="text"
                  value={searchMenu}
                  onChange={(e) => setSearchMenu(e.target.value)}
                  placeholder="Ketik untuk mencari dan menambahkan menu..."
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {searchMenu.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 z-40 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1 divide-y divide-gray-50">
                  {filteredMenuList.length === 0 ? (
                    <div className="p-3 text-xs text-neutral-mid text-center">
                      Menu tidak ditemukan.
                    </div>
                  ) : (
                    filteredMenuList.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectItem(m)}
                        className="w-full p-3 text-left hover:bg-[#F0FDF4]/30 flex items-center justify-between text-xs font-semibold text-neutral-dark transition-colors"
                      >
                        <div>
                          <span>{m.nama}</span>
                          <span className="text-[10px] text-neutral-mid font-medium block">
                            Kategori: {m.kategori.nama}
                          </span>
                        </div>
                        <span className="text-brand-primary font-bold">
                          {formatRupiah(m.harga)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Items List */}
            {selectedItems.length > 0 ? (
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-neutral-mid uppercase tracking-wider">
                  Item Ditambahkan ({selectedItems.length}):
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-100 rounded-lg p-3 bg-gray-50/30">
                  {selectedItems.map((item, idx) => (
                    <div
                      key={item.menu_id}
                      className="bg-white p-3 rounded-lg border border-gray-150 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="grow space-y-1">
                        <span className="text-xs font-extrabold text-neutral-dark">
                          {item.nama}
                        </span>
                        <input
                          type="text"
                          value={item.keterangan}
                          onChange={(e) => handleUpdateItemKeterangan(idx, e.target.value)}
                          placeholder="Keterangan (contoh: 1 porsi/orang)"
                          className="w-full h-8 px-2.5 rounded bg-gray-50 border border-gray-200 text-xs text-neutral-dark focus:outline-none focus:ring-1 focus:ring-[#4DAF48]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="w-8 h-8 rounded-full hover:bg-rose-50 text-neutral-mid hover:text-danger flex items-center justify-center transition-colors cursor-pointer select-none shrink-0"
                      >
                        <i className="fa-solid fa-xmark text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50/20">
                <span className="text-2xl mb-1 block">🥗</span>
                <span className="text-xs text-neutral-mid font-semibold">
                  Belum ada menu yang dipilih.
                </span>
              </div>
            )}
            {errors.items && (
              <p className="text-xs text-danger font-semibold mt-1">{errors.items}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || uploadingFoto}
              className="flex-1 h-12 rounded-lg bg-[#4DAF48] text-white font-bold text-sm hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {submitting || uploadingFoto ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-sm"></i>
                  {uploadingFoto ? 'Mengunggah Foto...' : 'Menyimpan...'}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk text-sm"></i>
                  Perbarui Paket
                </>
              )}
            </button>
            <Link
              href="/admin/menu/paket"
              className="px-6 h-12 rounded-lg border border-border text-neutral-mid font-semibold text-sm hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              Batal
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
