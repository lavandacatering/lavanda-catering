'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  sumber: string
  nama: string
  peran: string | null
  teks: string
  rating: number
  foto_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'hidden'
  created_at: string
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

export default function TestimonialAdmin() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [activeTab, setActiveTab] = useState<
    'semua' | 'pending' | 'approved' | 'hidden' | 'rejected'
  >('semua')
  const [refreshKey, setRefreshKey] = useState(0)

  // Form State
  const [nama, setNama] = useState('')
  const [peran, setPeran] = useState('')
  const [teks, setTeks] = useState('')
  const [rating, setRating] = useState(5)
  const [fotoUrl, setFotoUrl] = useState('')

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  })

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000)
  }

  // Fetch all testimonials when refreshKey changes
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/v1/admin/testimoni')
        if (res.ok) {
          const json = await res.json()
          if (json.status === 'success' && json.data) {
            setTestimonials(json.data)
          }
        } else {
          triggerToast('Gagal memuat ulasan pelanggan.', 'error')
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err)
        triggerToast('Gagal terhubung ke database.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [refreshKey])

  // File Upload handler for avatar using API-24b general upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('context', 'testimoni')

    try {
      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (res.ok && json.status === 'success') {
        setFotoUrl(json.data.url)
        triggerToast('Foto profil ulasan berhasil diunggah!', 'success')
      } else {
        triggerToast(json.message || 'Gagal mengunggah foto.', 'error')
      }
    } catch (err) {
      console.error('Upload error:', err)
      triggerToast('Koneksi bermasalah saat mengunggah foto.', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Handle status update (Approve, Hide, Reject) via PATCH API-34
  const handleUpdateStatus = async (id: string, status: 'approved' | 'hidden' | 'rejected') => {
    try {
      const res = await fetch(`/api/v1/admin/testimoni/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const json = await res.json()
      if (res.ok && json.status === 'success') {
        triggerToast(`Status ulasan berhasil diubah menjadi ${status}!`, 'success')
        setRefreshKey((prev) => prev + 1)
      } else {
        triggerToast(json.message || 'Gagal memperbarui status.', 'error')
      }
    } catch (err) {
      console.error('Status update error:', err)
      triggerToast('Gagal terhubung ke server.', 'error')
    }
  }

  // Handle Form Submit (Add Manual Testimonial) via POST API-35
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (nama.trim().length < 3) {
      triggerToast('Nama minimal 3 karakter.', 'error')
      return
    }

    if (teks.trim().length === 0 || teks.length > 500) {
      triggerToast('Ulasan wajib diisi maks 500 karakter.', 'error')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/v1/admin/testimoni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama,
          peran: peran ? peran.trim() : null,
          teks,
          rating,
          foto_url: fotoUrl || null,
        }),
      })

      const json = await res.json()
      if (res.ok && json.status === 'success') {
        triggerToast('Testimoni manual berhasil ditambahkan dan disetujui!', 'success')
        // Reset form
        setNama('')
        setPeran('')
        setTeks('')
        setRating(5)
        setFotoUrl('')
        setRefreshKey((prev) => prev + 1)
      } else {
        triggerToast(json.message || 'Gagal menambahkan testimoni.', 'error')
      }
    } catch (err) {
      console.error('Save error:', err)
      triggerToast('Terjadi kesalahan jaringan.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Filter items in memory
  const filteredTestimonials = testimonials.filter((item) => {
    if (activeTab === 'semua') return true
    return item.status === activeTab
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-neutral-dark animate-pulse">
            Memuat Ulasan Pelanggan...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      {/* 1. TOP HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-neutral-mid hover:text-brand-primary font-bold text-sm flex items-center gap-1"
            >
              ← Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-extrabold text-neutral-dark">Kelola Ulasan Pelanggan</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TOAST NOTIFIER */}
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

        {/* LEFT COLUMN: MANUAL ENTRY FORM (sumber: 'admin') */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-card border border-gray-100 h-fit flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-extrabold text-neutral-dark">Tambah Ulasan Manual</h3>
            <p className="text-xs text-neutral-mid mt-1">
              Menginput langsung testimoni dari WA / media sosial client.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-dark">Nama Pelanggan / Acara</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Rian & Dita"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-dark">Keterangan / Peran</label>
              <input
                type="text"
                value={peran}
                onChange={(e) => setPeran(e.target.value)}
                placeholder="Pengantin Baru / HRD Astra"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-dark">Skor Rating Bintang</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={cn(
                      'text-2xl transition-all',
                      rating >= star ? 'text-[#F59E0B] scale-105' : 'text-gray-200'
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-dark">
                Foto Profil Ulasan (Opsional)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-gray-150 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {fotoUrl ? (
                    <Image src={fotoUrl} alt="Avatar preview" fill className="object-cover" />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                </div>

                <label className="cursor-pointer px-4 py-2 rounded-lg border border-gray-200 text-neutral-mid text-xs font-bold hover:bg-gray-50 transition-all">
                  {uploading ? 'Mengunggah...' : 'Unggah Foto'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-dark">
                Teks Ulasan (Maks 500 karakter)
              </label>
              <textarea
                required
                rows={4}
                maxLength={500}
                value={teks}
                onChange={(e) => setTeks(e.target.value)}
                placeholder="Rasa makanan sangat enak dan pelayanannya..."
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50 resize-none"
              />
              <span className="text-[10px] text-right text-neutral-mid font-semibold">
                {teks.length}/500 karakter
              </span>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full py-3 rounded-lg bg-brand-primary text-white font-extrabold text-xs tracking-wide shadow-sm hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              {saving ? 'Menyimpan...' : '✓ Simpan & Auto-Approve'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: LIST & WORKFLOW CONTROLS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tabs Filter */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
            {(['semua', 'pending', 'approved', 'hidden', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-wide shrink-0',
                  activeTab === tab
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-neutral-mid hover:bg-gray-50'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Testimonial List Grid */}
          {filteredTestimonials.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-card border border-gray-100 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-2">💬</span>
              <h4 className="text-sm font-extrabold text-neutral-dark">
                Belum Ada Ulasan Ditemukan
              </h4>
              <p className="text-xs text-neutral-mid mt-1">
                Ulasan dengan status filter &quot;{activeTab}&quot; belum tersedia.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredTestimonials.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 shadow-card border border-gray-100 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center"
                >
                  <div className="grow flex gap-4 items-start">
                    {/* User profile picture */}
                    <div className="relative w-11 h-11 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                      {item.foto_url ? (
                        <Image src={item.foto_url} alt={item.nama} fill className="object-cover" />
                      ) : (
                        item.nama.substring(0, 1).toUpperCase()
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-neutral-dark">{item.nama}</h4>
                        <span
                          className={cn(
                            'text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide border',
                            item.status === 'approved'
                              ? 'bg-[#F0FDF4] border-brand-primary/30 text-[#166534]'
                              : item.status === 'pending'
                                ? 'bg-[#FFFBEB] border-warning/30 text-[#92400E]'
                                : item.status === 'hidden'
                                  ? 'bg-gray-50 border-gray-200 text-neutral-mid'
                                  : 'bg-red-50 border-danger/30 text-[#991B1B]'
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-mid mt-0.5 font-bold uppercase tracking-wider">
                        {item.peran || 'Pelanggan'} · Sumber: {item.sumber}
                      </p>

                      {/* Star Display */}
                      <div className="flex text-[#F59E0B] gap-0.5 my-1 text-sm">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>

                      <p className="text-xs text-neutral-dark dark:text-zinc-300 font-semibold leading-relaxed mt-1">
                        &quot;{item.teks}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Operational workflow actions */}
                  <div className="flex gap-2 self-end md:self-center shrink-0">
                    {item.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'approved')}
                        className="px-3 py-1.5 bg-brand-primary text-white font-bold text-[10px] rounded-md shadow-xs hover:brightness-105 active:scale-95 transition-all"
                      >
                        Approve
                      </button>
                    )}
                    {item.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'hidden')}
                        className="px-3 py-1.5 bg-neutral-dark text-white font-bold text-[10px] rounded-md shadow-xs hover:brightness-110 active:scale-95 transition-all"
                      >
                        Hide
                      </button>
                    )}
                    {item.status !== 'rejected' && item.status !== 'hidden' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'rejected')}
                        className="px-3 py-1.5 bg-danger text-white font-bold text-[10px] rounded-md shadow-xs hover:brightness-105 active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
