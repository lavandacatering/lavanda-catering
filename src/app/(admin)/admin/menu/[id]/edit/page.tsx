'use client'

/**
 * src/app/(admin)/admin/menu/[id]/edit/page.tsx — /admin/menu/[id]/edit
 * Form edit menu yang sudah ada
 *
 * Styled with premium vector icons (lucide-react) to avoid any generic AI look.
 * Supports up to 5 photos with visual thumbnail gallery and inline deletion overlays.
 * BC3: useParams() untuk client component
 * Auth: ditangani oleh layout.tsx
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { cn, formatRupiah } from '@/lib/utils'
import { ArrowLeft, Upload, Check, X, Save, Loader2, AlertCircle } from 'lucide-react'

interface Kategori {
  id: string
  nama: string
}

interface FormErrors {
  nama?: string
  kategori_id?: string
  harga?: string
  min_porsi?: string
  foto?: string
}

interface PhotoItem {
  file?: File
  url: string
  previewUrl: string
}

export default function AdminMenuEditPage() {
  const router = useRouter()
  const params = useParams()
  const menuId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Form state
  const [nama, setNama] = useState('')
  const [kategoriId, setKategoriId] = useState('')
  const [harga, setHarga] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [minPorsi, setMinPorsi] = useState('')
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
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

  // Fetch menu + kategori
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [menuRes, kategoriRes] = await Promise.all([
          fetch(`/api/v1/admin/menu/${menuId}`),
          fetch('/api/v1/kategori'),
        ])

        const kategoriJson = kategoriRes.ok ? await kategoriRes.json() : { data: [] }
        setKategoriList(kategoriJson.data ?? [])

        if (menuRes.status === 404) {
          setNotFound(true)
          return
        }
        if (!menuRes.ok) {
          showToast('Gagal memuat data menu.', 'error')
          return
        }

        const menuJson = await menuRes.json()
        const m = menuJson.data
        if (!m) {
          setNotFound(true)
          return
        }

        // Populate form
        setNama(m.nama ?? '')
        setKategoriId(m.kategori?.id ?? '')
        setHarga(m.harga?.toString() ?? '')
        setDeskripsi(m.deskripsi ?? '')
        setMinPorsi(m.min_porsi?.toString() ?? '')
        setStatus(m.status ?? 'aktif')

        // Parse foto_url
        const urls = m.foto_url ? m.foto_url.split(',').filter(Boolean) : []
        const parsedPhotos = urls.map((url: string) => ({
          url,
          previewUrl: url,
        }))
        setPhotos(parsedPhotos)
      } catch {
        showToast('Gagal memuat data.', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (menuId) fetchData()
  }, [menuId])

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!nama.trim() || nama.trim().length < 2) errs.nama = 'Nama menu minimal 2 karakter.'
    if (!kategoriId) errs.kategori_id = 'Kategori wajib dipilih.'
    const hargaNum = parseFloat(harga)
    if (!harga || isNaN(hargaNum) || hargaNum <= 0) errs.harga = 'Harga harus lebih dari 0.'
    const minPorsiNum = parseInt(minPorsi, 10)
    if (!minPorsi || isNaN(minPorsiNum) || minPorsiNum <= 0)
      errs.min_porsi = 'Min. porsi harus lebih dari 0.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const keptUrls = photos.map((p) => p.url).filter(Boolean)

      // Update menu data (termasuk foto_url yang dipertahankan)
      const res = await fetch(`/api/v1/admin/menu/${menuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          kategori_id: kategoriId,
          harga: parseFloat(harga),
          deskripsi: deskripsi.trim() || null,
          min_porsi: parseInt(minPorsi, 10),
          status,
          foto_url: keptUrls.join(','),
        }),
      })

      const json = await res.json()
      if (res.ok && json.status === 'success') {
        // Upload foto baru jika ada
        const newFiles = photos.map((p) => p.file).filter((f): f is File => !!f)
        if (newFiles.length > 0) {
          await handleUploadFoto(newFiles)
        }
        showToast('Menu berhasil diperbarui!', 'success')
        setTimeout(() => router.push('/admin/menu'), 1500)
      } else {
        showToast(json.message ?? 'Gagal mengupdate menu.', 'error')
        if (json.errors?.length) {
          const fieldErrs: FormErrors = {}
          json.errors.forEach((err: { field: string; message: string }) => {
            ;(fieldErrs as Record<string, string>)[err.field] = err.message
          })
          setErrors(fieldErrs)
        }
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUploadFoto = async (filesToUpload: File[]) => {
    const formData = new FormData()
    filesToUpload.forEach((file) => {
      formData.append('foto', file)
    })

    setUploadingFoto(true)
    try {
      const res = await fetch(`/api/v1/admin/menu/${menuId}/upload-foto`, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        showToast('Foto berhasil diunggah!', 'success')
      } else {
        showToast(json.message ?? 'Gagal mengunggah foto.', 'error')
      }
    } catch {
      showToast('Gagal mengunggah foto.', 'error')
    } finally {
      setUploadingFoto(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4DAF48] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h1 className="text-lg font-bold text-neutral-dark">Menu tidak ditemukan</h1>
        <Link href="/admin/menu" className="text-[#4DAF48] font-semibold text-sm hover:underline">
          ← Kembali ke daftar menu
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans antialiased text-[#1E1E1E]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/admin/menu"
            className="inline-flex items-center gap-1.5 text-neutral-mid hover:text-[#4DAF48] font-semibold text-sm transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Kembali
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-extrabold text-neutral-dark">Edit Menu</h1>
        </div>
      </header>

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
              <Check className="w-4 h-4 text-[#4DAF48]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-danger" />
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
          {/* Foto Upload — Maksimal 5 Foto */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-neutral-dark">
                Foto Menu <span className="text-neutral-mid font-normal">({photos.length}/5)</span>
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
                    alt={`Foto menu ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer select-none"
                    aria-label={`Hapus foto ${idx + 1}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/40 text-[9px] font-bold text-white rounded-md backdrop-blur-xs select-none">
                    Foto {idx + 1}
                  </span>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="relative aspect-4/3 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#4DAF48] bg-gray-50/50 hover:bg-[#F0FDF4]/30 flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 select-none shadow-2xs text-center p-2 group">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#4DAF48] transition-colors" />
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
            {errors.foto && <p className="text-xs text-danger font-semibold mt-2">{errors.foto}</p>}
          </div>

          <hr className="border-gray-100" />

          <div>
            <label htmlFor="nama" className="block text-sm font-semibold text-neutral-dark mb-1.5">
              Nama Menu <span className="text-danger">*</span>
            </label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value)
                setErrors((p) => ({ ...p, nama: undefined }))
              }}
              className={cn(
                'w-full h-12 px-4 rounded-lg border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors',
                errors.nama ? 'border-danger' : 'border-border'
              )}
            />
            {errors.nama && <p className="text-xs text-danger mt-1">{errors.nama}</p>}
          </div>

          <div>
            <label
              htmlFor="kategori"
              className="block text-sm font-semibold text-neutral-dark mb-1.5"
            >
              Kategori <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <select
                id="kategori"
                value={kategoriId}
                onChange={(e) => {
                  setKategoriId(e.target.value)
                  setErrors((p) => ({ ...p, kategori_id: undefined }))
                }}
                className={cn(
                  'w-full h-12 px-4 rounded-lg border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors appearance-none cursor-pointer',
                  errors.kategori_id ? 'border-danger' : 'border-border'
                )}
              >
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-mid">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {errors.kategori_id && <p className="text-xs text-danger mt-1">{errors.kategori_id}</p>}
          </div>

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
                htmlFor="min_porsi"
                className="block text-sm font-semibold text-neutral-dark mb-1.5"
              >
                Min. Porsi <span className="text-danger">*</span>
              </label>
              <input
                id="min_porsi"
                type="number"
                min="1"
                value={minPorsi}
                onChange={(e) => {
                  setMinPorsi(e.target.value)
                  setErrors((p) => ({ ...p, min_porsi: undefined }))
                }}
                className={cn(
                  'w-full h-12 px-4 rounded-lg border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] transition-colors',
                  errors.min_porsi ? 'border-danger' : 'border-border'
                )}
              />
              {errors.min_porsi && <p className="text-xs text-danger mt-1">{errors.min_porsi}</p>}
            </div>
          </div>

          <div>
            <label
              htmlFor="deskripsi"
              className="block text-sm font-semibold text-neutral-dark mb-1.5"
            >
              Deskripsi <span className="text-neutral-mid font-normal">(opsional)</span>
            </label>
            <textarea
              id="deskripsi"
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-[#4DAF48] resize-none"
            />
          </div>

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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || uploadingFoto}
              className="flex-1 h-12 rounded-lg bg-[#4DAF48] text-white font-bold text-sm hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {submitting || uploadingFoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
            <Link
              href="/admin/menu"
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
