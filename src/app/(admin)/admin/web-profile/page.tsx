'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Toast type definition
interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning'
}

interface KeunggulanItem {
  icon: string
  judul: string
  deskripsi: string
}

interface GaleriItem {
  foto_url: string
  caption: string
  urutan: number
}

export default function WebProfileAdmin() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null) // Tracks which section is uploading

  // Web Content form states
  const [hero, setHero] = useState({
    judul: '',
    sub: '',
    teks_cta: '',
    foto_url: '',
  })

  const [tentang, setTentang] = useState({
    teks: '',
    foto: '',
    berdiri_sejak: '',
    sertifikasi: [] as string[],
  })

  const [keunggulan, setKeunggulan] = useState<KeunggulanItem[]>([])
  const [manualPilarIndices, setManualPilarIndices] = useState<number[]>([])
  const [galeri, setGaleri] = useState<GaleriItem[]>([])
  const [kontak, setKontak] = useState({
    alamat: '',
    telepon: '',
    email: '',
    maps_url: '',
    jam_operasional: '',
    area_layanan: '',
  })

  // Toast notifier
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  })

  const triggerToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000)
  }

  // Fetch web content on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/v1/admin/konten-web')
        if (res.ok) {
          const json = await res.json()
          if (json.status === 'success' && json.data) {
            const data = json.data
            // 1. Hero robust check & fallback
            setHero({
              judul: data.konten_hero?.judul || '',
              sub: data.konten_hero?.sub || '',
              teks_cta: data.konten_hero?.teks_cta || '',
              foto_url: data.konten_hero?.foto_url || '',
            })

            // 2. Tentang Kami robust check & fallback
            setTentang({
              teks: data.tentang_kami?.teks || '',
              foto: data.tentang_kami?.foto || '',
              berdiri_sejak: data.tentang_kami?.berdiri_sejak || '',
              sertifikasi: Array.isArray(data.tentang_kami?.sertifikasi)
                ? data.tentang_kami.sertifikasi
                : [],
            })

            // 3. Keunggulan robust check & fallback (wajib minimal 5 pilar)
            const defaultKeunggulanPlaceholder = [
              {
                icon: 'restaurant',
                judul: 'Cita Rasa Terjamin',
                deskripsi:
                  'Dimasak oleh koki berpengalaman menggunakan bahan baku segar dan berkualitas.',
              },
              {
                icon: 'local_shipping',
                judul: 'Gratis Ongkir',
                deskripsi: 'Layanan pengiriman gratis untuk seluruh wilayah Kota Semarang.',
              },
              {
                icon: 'workspace_premium',
                judul: 'Sertifikasi Halal',
                deskripsi:
                  'Seluruh dapur dan proses pengolahan makanan kami telah bersertifikat halal.',
              },
              {
                icon: 'group',
                judul: 'Pelayanan Profesional',
                deskripsi: 'Staf berpengalaman dan profesional siap melayani pesanan Anda.',
              },
              {
                icon: 'payments',
                judul: 'Harga Kompetitif',
                deskripsi:
                  'Katering berkualitas premium dengan harga yang bersahabat dan transparan.',
              },
            ]

            let keunggulanList = Array.isArray(data.keunggulan) ? data.keunggulan : []
            if (keunggulanList.length === 0) {
              keunggulanList = defaultKeunggulanPlaceholder
            } else if (keunggulanList.length < 5) {
              keunggulanList = [
                ...keunggulanList,
                ...defaultKeunggulanPlaceholder.slice(keunggulanList.length),
              ]
            }
            setKeunggulan(keunggulanList)

            // 4. Galeri fallback
            setGaleri(Array.isArray(data.galeri) ? data.galeri : [])

            // 5. Kontak robust check & fallback
            setKontak({
              alamat: data.kontak?.alamat || '',
              telepon: data.kontak?.telepon || '',
              email: data.kontak?.email || '',
              maps_url: data.kontak?.maps_url || '',
              jam_operasional: data.kontak?.jam_operasional || '',
              area_layanan: data.kontak?.area_layanan || '',
            })
          }
        } else {
          triggerToast('Gagal memuat konten dari database.', 'error')
        }
      } catch (err) {
        console.error('Error fetching web content:', err)
        triggerToast('Terjadi kesalahan jaringan saat memuat data.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // File Upload handler using API-24b signed upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: 'hero' | 'tentang' | 'galeri'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(section)
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'context',
      section === 'galeri' ? 'galeri' : section === 'hero' ? 'hero' : 'testimoni'
    )

    try {
      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (res.ok && json.status === 'success') {
        const uploadedUrl = json.data.url
        if (section === 'hero') {
          setHero((prev) => ({ ...prev, foto_url: uploadedUrl }))
        } else if (section === 'tentang') {
          setTentang((prev) => ({ ...prev, foto: uploadedUrl }))
        } else if (section === 'galeri') {
          // Add new gallery photo
          setGaleri((prev) => [
            ...prev,
            { foto_url: uploadedUrl, caption: 'Foto Galeri Baru', urutan: prev.length + 1 },
          ])
        }
        triggerToast('Berkas berhasil diunggah dan diverifikasi!', 'success')
      } else {
        triggerToast(json.message || 'MIME/size file tidak diizinkan.', 'error')
      }
    } catch (err) {
      console.error('Upload error:', err)
      triggerToast('Koneksi bermasalah saat mengunggah file.', 'error')
    } finally {
      setUploading(null)
      // reset file input
      e.target.value = ''
    }
  }

  // Update specific values in arrays
  const handleKeunggulanChange = (index: number, key: string, value: string) => {
    const updated = [...keunggulan]
    updated[index] = { ...updated[index], [key]: value }
    setKeunggulan(updated)
  }

  const templates = [
    {
      icon: 'restaurant',
      judul: 'Cita Rasa Terjamin',
      deskripsi: 'Dimasak oleh koki berpengalaman menggunakan bahan baku segar dan berkualitas.',
    },
    {
      icon: 'local_shipping',
      judul: 'Gratis Ongkir',
      deskripsi: 'Layanan pengiriman gratis untuk seluruh wilayah Kota Semarang.',
    },
    {
      icon: 'workspace_premium',
      judul: 'Sertifikasi Halal',
      deskripsi: 'Seluruh dapur dan proses pengolahan makanan kami telah bersertifikat halal.',
    },
    {
      icon: 'group',
      judul: 'Pelayanan Profesional',
      deskripsi: 'Staf berpengalaman dan profesional siap melayani pesanan Anda.',
    },
    {
      icon: 'payments',
      judul: 'Harga Kompetitif',
      deskripsi: 'Katering berkualitas premium dengan harga yang bersahabat dan transparan.',
    },
  ]

  const applyTemplateToKeunggulan = (index: number, templateIdx: number) => {
    if (templateIdx < 0 || templateIdx >= templates.length) return
    const updated = [...keunggulan]
    updated[index] = { ...templates[templateIdx] }
    setKeunggulan(updated)
    // Remove from manual state since we selected a template
    setManualPilarIndices((prev) => prev.filter((idx) => idx !== index))
  }

  const addKeunggulanItem = () => {
    const newIndex = keunggulan.length
    setKeunggulan((prev) => [
      ...prev,
      { icon: 'restaurant', judul: 'Keunggulan Baru', deskripsi: 'Deskripsi keunggulan baru.' },
    ])
    // New cards default to manual so they can be immediately edited
    setManualPilarIndices((prev) => [...prev, newIndex])
  }

  const removeKeunggulanItem = (index: number) => {
    if (keunggulan.length <= 5) {
      triggerToast('Minimal 5 keunggulan diperlukan!', 'warning')
      return
    }
    setKeunggulan((prev) => prev.filter((_, idx) => idx !== index))
    // Align indices in manual list after deletion
    setManualPilarIndices((prev) =>
      prev.filter((idx) => idx !== index).map((idx) => (idx > index ? idx - 1 : idx))
    )
  }

  const handleGaleriCaptionChange = (index: number, value: string) => {
    const updated = [...galeri]
    updated[index] = { ...updated[index], caption: value }
    setGaleri(updated)
  }

  const removeGaleriItem = (index: number) => {
    const updated = galeri.filter((_, idx) => idx !== index)
    setGaleri(updated)
  }

  // Save changes to API-41
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/v1/admin/konten-web', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          konten_hero: hero,
          tentang_kami: tentang,
          keunggulan,
          galeri,
          kontak,
        }),
      })

      const json = await res.json()
      if (res.ok && json.status === 'success') {
        triggerToast('Profil web berhasil diperbarui!', 'success')
      } else {
        triggerToast(json.message || 'Gagal menyimpan perubahan.', 'error')
      }
    } catch (err) {
      console.error('Save error:', err)
      triggerToast('Gagal terhubung ke database.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-neutral-dark animate-pulse">
            Memuat CMS Web Profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      {/* 1. TOP HEADER NAVIGATION */}
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
            <h1 className="text-base font-extrabold text-neutral-dark">Kelola Web Profile (CMS)</h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'px-6 py-2.5 rounded-lg bg-brand-primary text-white font-extrabold text-xs tracking-wide shadow-sm',
              'hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-2',
              saving ? 'opacity-65 cursor-not-allowed' : ''
            )}
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN FORMS */}
      <main className="max-w-5xl mx-auto px-6 mt-8 flex flex-col gap-8">
        {/* TOAST NOTIFICATION CONTAINER */}
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

        <form onSubmit={handleSave} className="flex flex-col gap-8">
          {/* SECTION 1: HERO CONTAINER */}
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 flex flex-col gap-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base font-extrabold text-neutral-dark">1. Hero Section</h3>
              <p className="text-xs text-neutral-mid mt-1">
                Konfigurasi header landing page utama (First fold view).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-dark">Judul Utama Hero</label>
                  <input
                    type="text"
                    required
                    value={hero.judul}
                    onChange={(e) => setHero((prev) => ({ ...prev, judul: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-gray-50/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-dark">Sub-judul Hero</label>
                  <textarea
                    required
                    rows={3}
                    value={hero.sub}
                    onChange={(e) => setHero((prev) => ({ ...prev, sub: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-gray-50/50 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-dark">Teks Tombol CTA</label>
                  <input
                    type="text"
                    required
                    value={hero.teks_cta}
                    onChange={(e) => setHero((prev) => ({ ...prev, teks_cta: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Photo Upload Area */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold text-neutral-dark">Foto Background Hero</label>
                <div className="relative aspect-video rounded-xl bg-gray-50 border border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center group">
                  {hero.foto_url ? (
                    <>
                      <Image src={hero.foto_url} alt="Hero preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <label className="cursor-pointer bg-white text-neutral-dark px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleFileUpload(e, 'hero')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-4">
                      <span className="text-3xl mb-2">📸</span>
                      <label className="cursor-pointer px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary/20 transition-all">
                        Unggah Foto
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileUpload(e, 'hero')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-neutral-mid mt-2">JPEG/PNG/WEBP, Max 5MB</p>
                    </div>
                  )}

                  {uploading === 'hero' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      <span>Mengunggah & Memindai...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: KEUNGGULAN (Min 5 Items, Add/Delete Support) */}
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 flex flex-col gap-6 animate-fade-in">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-neutral-dark">
                  2. Keunggulan Layanan
                </h3>
                <p className="text-xs text-neutral-mid mt-1">
                  Mengedit minimal 5 pilar keunggulan bisnis yang tampil di Homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={addKeunggulanItem}
                className="px-4 py-2 text-xs font-bold bg-[#006e12]/10 text-[#006e12] rounded-lg hover:bg-[#006e12]/20 transition-all flex items-center gap-1.5"
              >
                <span>+ Tambah Pilar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keunggulan.map((item, index) => {
                const templateIndex = templates.findIndex(
                  (t) =>
                    t.icon === item.icon && t.judul === item.judul && t.deskripsi === item.deskripsi
                )
                const isManual = manualPilarIndices.includes(index) || templateIndex === -1
                const activeMode = isManual ? 'manual' : 'template'

                return (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-extrabold text-xs text-brand-primary">
                        Pilar {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeKeunggulanItem(index)}
                        disabled={keunggulan.length <= 5}
                        className={cn(
                          'p-1.5 rounded-md border text-xs font-bold transition-all shrink-0',
                          keunggulan.length <= 5
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                            : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 active:scale-95'
                        )}
                        title={
                          keunggulan.length <= 5 ? 'Minimal 5 keunggulan diperlukan' : 'Hapus pilar'
                        }
                      >
                        🗑️ Hapus
                      </button>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-neutral-dark">
                        Mode Pengisian
                      </label>
                      <select
                        value={activeMode}
                        onChange={(e) => {
                          const nextMode = e.target.value
                          if (nextMode === 'template') {
                            // Switch to template: pre-fill with the first template
                            applyTemplateToKeunggulan(index, 0)
                          } else {
                            // Switch to manual: add index to manual list
                            setManualPilarIndices((prev) => [...prev, index])
                          }
                        }}
                        className="border border-gray-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:border-brand-primary focus:outline-hidden font-bold text-neutral-dark"
                      >
                        <option value="template">📋 Pilih Dari Template</option>
                        <option value="manual">✍️ Manual (Isi Sendiri)</option>
                      </select>
                    </div>

                    {/* Template Selection Dropdown (only visible in template mode) */}
                    {activeMode === 'template' && (
                      <div className="flex flex-col gap-1.5 animate-fade-in">
                        <label className="text-[10px] font-extrabold text-neutral-dark">
                          Pilihan Template
                        </label>
                        <select
                          value={templateIndex !== -1 ? templateIndex.toString() : '0'}
                          onChange={(e) => {
                            applyTemplateToKeunggulan(index, parseInt(e.target.value))
                          }}
                          className="border border-gray-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:border-brand-primary focus:outline-hidden font-semibold"
                        >
                          <option value="0">🍳 Cita Rasa Terjamin</option>
                          <option value="1">🚚 Gratis Ongkir</option>
                          <option value="2">🛡️ Sertifikasi Halal</option>
                          <option value="3">👥 Pelayanan Profesional</option>
                          <option value="4">💰 Harga Kompetitif</option>
                        </select>
                      </div>
                    )}

                    {/* Custom Input Fields */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-neutral-dark">
                        Nama Icon (Material Symbol){' '}
                        {activeMode === 'template' && (
                          <span className="text-gray-400 font-normal">(Template)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={activeMode === 'template'}
                        placeholder="restaurant, local_shipping, group, payments, dll."
                        value={item.icon}
                        onChange={(e) => handleKeunggulanChange(index, 'icon', e.target.value)}
                        className={cn(
                          'border rounded-lg px-3 py-2 text-xs focus:border-brand-primary bg-white focus:outline-hidden',
                          activeMode === 'template'
                            ? 'bg-gray-100/80 text-gray-500 border-gray-200/80 cursor-not-allowed font-medium'
                            : 'border-gray-200'
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-neutral-dark">
                        Judul Pilar{' '}
                        {activeMode === 'template' && (
                          <span className="text-gray-400 font-normal">(Template)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={activeMode === 'template'}
                        placeholder="Judul keunggulan..."
                        value={item.judul}
                        onChange={(e) => handleKeunggulanChange(index, 'judul', e.target.value)}
                        className={cn(
                          'border rounded-lg px-3 py-2 text-xs focus:border-brand-primary bg-white focus:outline-hidden',
                          activeMode === 'template'
                            ? 'bg-gray-100/80 text-gray-500 border-gray-200/80 cursor-not-allowed font-medium'
                            : 'border-gray-200'
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-neutral-dark">
                        Deskripsi Singkat{' '}
                        {activeMode === 'template' && (
                          <span className="text-gray-400 font-normal">(Template)</span>
                        )}
                      </label>
                      <textarea
                        required
                        rows={3}
                        disabled={activeMode === 'template'}
                        placeholder="Deskripsi keunggulan..."
                        value={item.deskripsi}
                        onChange={(e) => handleKeunggulanChange(index, 'deskripsi', e.target.value)}
                        className={cn(
                          'border rounded-lg px-3 py-2 text-xs focus:border-brand-primary bg-white resize-none focus:outline-hidden',
                          activeMode === 'template'
                            ? 'bg-gray-100/80 text-gray-500 border-gray-200/80 cursor-not-allowed font-medium'
                            : 'border-gray-200'
                        )}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION 3: TENTANG KAMI */}
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 flex flex-col gap-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base font-extrabold text-neutral-dark">3. Tentang Kami</h3>
              <p className="text-xs text-neutral-mid mt-1">
                Cerita ringkas mengenai sejarah katering & sertifikasi resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-dark">Deskripsi Cerita</label>
                  <textarea
                    required
                    rows={4}
                    value={tentang.teks}
                    onChange={(e) => setTentang((prev) => ({ ...prev, teks: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-gray-50/50 resize-none animate-fade-in"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-dark">Tahun Berdiri</label>
                    <input
                      type="text"
                      required
                      value={tentang.berdiri_sejak}
                      onChange={(e) =>
                        setTentang((prev) => ({ ...prev, berdiri_sejak: e.target.value }))
                      }
                      className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-dark">
                      Sertifikasi (Koma Pemisah)
                    </label>
                    <input
                      type="text"
                      value={tentang.sertifikasi?.join(', ')}
                      onChange={(e) =>
                        setTentang((prev) => ({
                          ...prev,
                          sertifikasi: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder="Halal MUI, P-IRT"
                      className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Area */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold text-neutral-dark">Foto Dapur / Chef</label>
                <div className="relative aspect-video rounded-xl bg-gray-50 border border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center group">
                  {tentang.foto ? (
                    <>
                      <Image
                        src={tentang.foto}
                        alt="Tentang preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <label className="cursor-pointer bg-white text-neutral-dark px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleFileUpload(e, 'tentang')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-4">
                      <span className="text-3xl mb-2">📸</span>
                      <label className="cursor-pointer px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary/20 transition-all">
                        Unggah Foto
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileUpload(e, 'tentang')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-neutral-mid mt-2">JPEG/PNG/WEBP, Max 5MB</p>
                    </div>
                  )}

                  {uploading === 'tentang' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      <span>Mengunggah & Memindai...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: GALERI MANAGER */}
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 flex flex-col gap-6">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-neutral-dark">4. Galeri Portofolio</h3>
                <p className="text-xs text-neutral-mid mt-1">
                  Mengelola foto dokumentasi kegiatan / buffet event (Maks 12).
                </p>
              </div>

              <label className="cursor-pointer px-4 py-2 rounded-lg bg-brand-primary text-white font-extrabold text-xs tracking-wide shadow-sm hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-1">
                + Tambah Foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, 'galeri')}
                  className="hidden"
                />
              </label>
            </div>

            {uploading === 'galeri' && (
              <div className="p-6 bg-gray-50 border border-dashed border-brand-primary/40 rounded-xl flex items-center justify-center text-xs font-bold text-brand-primary gap-2.5 animate-pulse">
                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent animate-spin rounded-full" />
                <span>Sedang Mengunggah & Memindai Byte Berkas Baru...</span>
              </div>
            )}

            {galeri.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="text-2xl mb-1 block">🖼️</span>
                <span className="text-xs text-neutral-mid font-semibold">
                  Belum ada foto galeri terpasang.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galeri.map((photo, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col relative group"
                  >
                    <div className="relative aspect-video bg-gray-50 shrink-0">
                      <Image
                        src={photo.foto_url}
                        alt="Gallery item"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGaleriItem(index)}
                        className="absolute top-2 right-2 bg-danger/90 hover:bg-danger text-white p-1 rounded-md transition-colors shadow-xs"
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
                            strokeWidth="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-neutral-dark">
                          Caption Foto
                        </label>
                        <input
                          type="text"
                          required
                          value={photo.caption}
                          onChange={(e) => handleGaleriCaptionChange(index, e.target.value)}
                          className="border border-gray-200 rounded-md px-2.5 py-1.5 text-xs focus:border-brand-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: CONTACT & ADDRESS */}
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 flex flex-col gap-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base font-extrabold text-neutral-dark">5. Informasi Kontak</h3>
              <p className="text-xs text-neutral-mid mt-1">
                Alamat kantor, nomor operasional, email bisnis, dan area pengiriman.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-dark">
                    Alamat Kantor Lengkap
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={kontak.alamat}
                    onChange={(e) => setKontak((prev) => ({ ...prev, alamat: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-dark">Telepon Hubungi</label>
                    <input
                      type="text"
                      required
                      value={kontak.telepon}
                      onChange={(e) => setKontak((prev) => ({ ...prev, telepon: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-dark">Email Bisnis</label>
                    <input
                      type="email"
                      required
                      value={kontak.email}
                      onChange={(e) => setKontak((prev) => ({ ...prev, email: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-dark">Jam Operasional</label>
                    <input
                      type="text"
                      required
                      value={kontak.jam_operasional}
                      onChange={(e) =>
                        setKontak((prev) => ({ ...prev, jam_operasional: e.target.value }))
                      }
                      className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-dark">Area Delivery</label>
                    <input
                      type="text"
                      required
                      value={kontak.area_layanan}
                      onChange={(e) =>
                        setKontak((prev) => ({ ...prev, area_layanan: e.target.value }))
                      }
                      className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-dark">
                    Google Maps Embed URL
                  </label>
                  <input
                    type="text"
                    required
                    value={kontak.maps_url}
                    onChange={(e) => setKontak((prev) => ({ ...prev, maps_url: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary bg-gray-50/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
