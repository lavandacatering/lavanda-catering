'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { formatRupiah, cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
const CalendarPicker = dynamic(
  () => import('@/components/order/CalendarPicker').then((mod) => mod.CalendarPicker),
  { ssr: false }
)
import {
  AlertTriangle,
  ChevronRight,
  ShoppingBag,
  Trash2,
  ChevronLeft,
  CheckCircle,
  Calendar,
  Lock,
  User,
  Phone,
  MapPin,
  Clock,
  FileText,
  CreditCard,
  Loader2,
} from 'lucide-react'

interface ItemStatus {
  nama: string
  active: boolean
  exists: boolean
}

export default function OrderPage() {
  const router = useRouter()
  const { items, updatePorsi, removeItem, getTotal, isMounted, isExpired, clearCart } = useCart()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Wizard state: 1 = Review, 2 = Pengiriman & Tanggal, 3 = Pembayaran & Consent
  const [step, setStep] = useState<number>(1)

  // Step 2 Form States
  const [nama, setNama] = useState('')
  const [noHp, setNoHp] = useState('')
  const [alamatEvent, setAlamatEvent] = useState('')
  const [tanggalAcara, setTanggalAcara] = useState<Date | undefined>(undefined)
  const [waktuAcara, setWaktuAcara] = useState('12:00')
  const [catatan, setCatatan] = useState('')

  // Step 3 Form States
  const [tipeBayar, setTipeBayar] = useState<'dp' | 'lunas'>('dp')
  const [consentGiven, setConsentGiven] = useState(false)

  // Validation & Processing States
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({})

  // Expiration check on mount
  useEffect(() => {
    isExpired()
  }, [isExpired])

  // Scroll to top on step transition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

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

    const interval = setInterval(checkActiveStatuses, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [isMounted, items])

  // Determine if there are inactive or non-existent items in cart
  const inactiveItems = items.filter((item) => {
    const status = itemStatuses[item.id]
    if (!status) return false
    return !status.active || !status.exists
  })

  const hasInactiveItems = inactiveItems.length > 0

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-neutral-mid animate-pulse">
            Menghubungkan sesi keranjang...
          </p>
        </div>
      </div>
    )
  }

  // Handle Step 1 → Step 2 Transition
  const handleGoToStep2 = () => {
    if (hasInactiveItems) return
    setStep(2)
    setGlobalError(null)
  }

  // Handle Step 2 → Step 3 Transition & Validations
  const handleGoToStep3 = () => {
    const newErrors: Record<string, string> = {}
    setGlobalError(null)

    // Nama validation (only letters, spaces, and standard name punctuation)
    const nameRegex = /^[A-Za-z\s'.`-]+$/
    if (!nama.trim()) {
      newErrors.nama = 'Nama lengkap pemesan wajib diisi.'
    } else if (!nameRegex.test(nama.trim())) {
      newErrors.nama = 'Nama lengkap penerima hanya boleh berisi huruf (tidak boleh ada angka).'
    } else if (nama.trim().length < 3) {
      newErrors.nama = 'Nama lengkap penerima terlalu pendek, minimal 3 karakter.'
    }

    // Nomor HP validation (starts with 08 or +62, 10-14 digits)
    const hpRegex = /^(?:\+62|08)[0-9]{8,12}$/
    if (!noHp) {
      newErrors.noHp = 'Nomor handphone wajib diisi.'
    } else if (!hpRegex.test(noHp)) {
      newErrors.noHp = 'Format nomor HP salah. Gunakan 08xx atau +62xx (10-14 digit).'
    }

    // Alamat validation (min 10 characters)
    if (!alamatEvent.trim()) {
      newErrors.alamatEvent = 'Alamat lengkap acara wajib diisi.'
    } else if (alamatEvent.trim().length < 10) {
      newErrors.alamatEvent = 'Detail alamat katering minimal 10 karakter.'
    }

    // Tanggal validation
    if (!tanggalAcara) {
      newErrors.tanggalAcara = 'Wajib memilih tanggal acara pelaksanaan.'
    }

    // Waktu validation
    const timeMatch = waktuAcara.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    if (!waktuAcara) {
      newErrors.waktuAcara = 'Waktu acara wajib diisi.'
    } else if (!timeMatch) {
      newErrors.waktuAcara = 'Format waktu harus valid (HH:MM).'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorKey)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setErrors({})
    setStep(3)
  }

  // Submit complete order + DOKU payment initiation
  const handleFinalOrderSubmit = async () => {
    if (!consentGiven) return
    setSubmitting(true)
    setGlobalError(null)

    try {
      // 1. POST /api/v1/pesanan to create order
      const orderRes = await fetch('/api/v1/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama,
          no_hp: noHp,
          alamat_event: alamatEvent,
          tanggal_acara: tanggalAcara?.toISOString().split('T')[0],
          waktu_acara: waktuAcara,
          catatan,
          items: items.map((it) => ({
            item_type: it.item_type,
            id: it.id,
            porsi: it.porsi,
          })),
          tipe_bayar: tipeBayar,
          consent_given: consentGiven,
        }),
      })

      const orderJson = await orderRes.json()

      if (!orderRes.ok || orderJson.status === 'error') {
        throw new Error(orderJson.message || 'Gagal meregistrasi pesanan makanan Anda.')
      }

      const { pesanan_id } = orderJson.data

      // 2. POST /api/v1/pembayaran/initiate to get DOKU sandbox checkout portal
      const payRes = await fetch('/api/v1/pembayaran/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pesanan_id,
          tipe: tipeBayar,
        }),
      })

      const payJson = await payRes.json()

      if (!payRes.ok || payJson.status === 'error') {
        throw new Error(payJson.message || 'Gagal memulai inisiasi gerbang DOKU.')
      }

      const { doku_payment_url } = payJson.data

      // 3. Clear customer shopping cart
      clearCart()

      // 4. Redirect to DOKU sandbox gatepage
      router.push(doku_payment_url)
    } catch (err: unknown) {
      console.error('[CheckoutSubmitError]:', err)
      const errMsg =
        err instanceof Error ? err.message : 'Gagal memproses pesanan. Silakan coba kembali.'
      setGlobalError(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Formatting variables
  const totalBahanPangan = getTotal()
  const totalPorsi = items.reduce((acc, curr) => acc + curr.porsi, 0)
  const nominalDP = totalBahanPangan * 0.5
  const nominalSisa = totalBahanPangan - nominalDP

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 font-sans text-neutral-dark">
      {/* Dynamic Progress Header bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-35 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4.5 flex items-center justify-between">
          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1)
              } else {
                router.push('/menu')
              }
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-mid hover:text-brand-primary transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Kembali' : 'Kembali'}
          </button>
          <span className="text-sm font-black tracking-widest text-[#4DAF48]">
            LAVANDA CATERING
          </span>
          <div className="hidden sm:block text-xs font-bold text-neutral-mid bg-neutral-100 px-3 py-1 rounded-full">
            Langkah {step} dari 3
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        {/* Stepper Wizard Progress Indicator */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 z-0" />

            {/* Step 1: Keranjang */}
            <div
              onClick={() => step > 1 && setStep(1)}
              className={cn(
                'z-10 bg-[#FDFDFD] pr-4 flex items-center gap-2 cursor-pointer transition-all',
                step === 1 ? 'scale-105' : 'opacity-80'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all',
                  step >= 1
                    ? 'bg-[#4DAF48] text-white ring-4 ring-[#4DAF48]/10'
                    : 'bg-gray-100 text-neutral-mid'
                )}
              >
                1
              </div>
              <span
                className={cn(
                  'text-xs font-black hidden sm:block',
                  step === 1 ? 'text-[#4DAF48]' : 'text-neutral-mid'
                )}
              >
                Review Keranjang
              </span>
            </div>

            {/* Step 2: Informasi */}
            <div
              onClick={() => step > 2 && setStep(2)}
              className={cn(
                'z-10 bg-[#FDFDFD] px-4 flex items-center gap-2 transition-all',
                step > 2 ? 'cursor-pointer' : '',
                step === 2 ? 'scale-105' : 'opacity-80'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all',
                  step >= 2
                    ? 'bg-[#4DAF48] text-white ring-4 ring-[#4DAF48]/10'
                    : 'bg-gray-100 text-neutral-mid'
                )}
              >
                2
              </div>
              <span
                className={cn(
                  'text-xs font-black hidden sm:block',
                  step === 2 ? 'text-[#4DAF48]' : 'text-neutral-mid'
                )}
              >
                Informasi & Tanggal
              </span>
            </div>

            {/* Step 3: Bayar */}
            <div
              className={cn(
                'z-10 bg-[#FDFDFD] pl-4 flex items-center gap-2 transition-all',
                step === 3 ? 'scale-105' : 'opacity-80'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all',
                  step === 3
                    ? 'bg-[#4DAF48] text-white ring-4 ring-[#4DAF48]/10'
                    : 'bg-gray-100 text-neutral-mid'
                )}
              >
                3
              </div>
              <span
                className={cn(
                  'text-xs font-black hidden sm:block',
                  step === 3 ? 'text-[#4DAF48]' : 'text-neutral-mid'
                )}
              >
                Metode & Bayar
              </span>
            </div>
          </div>
        </div>

        {globalError && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800 shadow-md">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="text-xs font-bold leading-normal">
              <span className="uppercase tracking-wider text-red-600 block mb-0.5">
                TERJADI KESALAHAN
              </span>
              {globalError}
            </div>
          </div>
        )}

        {/* STEP 1: REVIEW KERANJANG */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Content List Items */}
            <div className="lg:col-span-2 space-y-6">
              {hasInactiveItems && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800 shadow-xs animate-shake">
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

              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <h3 className="text-sm font-extrabold text-neutral-dark uppercase tracking-wide flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#4DAF48]" /> Daftar Menu dalam Keranjang (
                    {items.length} jenis)
                  </h3>
                  {checkingStatus && (
                    <span className="text-[10px] bg-[#4DAF48]/5 text-[#4DAF48] font-bold px-2.5 py-1 rounded-full animate-pulse">
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
                          <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                            {item.foto_url ? (
                              <Image
                                src={item.foto_url.split(',')[0]}
                                alt={item.nama}
                                fill
                                sizes="72px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#4DAF48]/5 text-[#4DAF48] font-extrabold text-sm uppercase">
                                {item.nama.substring(0, 2)}
                              </div>
                            )}
                          </div>

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
                            <p className="text-xs text-[#4DAF48] font-black mt-1">
                              {formatRupiah(item.harga)}{' '}
                              <span className="text-[10px] text-neutral-mid font-semibold">
                                / porsi
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-6 justify-between w-full sm:w-auto mt-4 sm:mt-0 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 h-10 shadow-xs">
                              <button
                                onClick={() => updatePorsi(item.id, item.porsi - 1)}
                                disabled={item.porsi <= item.min_porsi}
                                className="px-3 text-neutral-mid hover:bg-gray-100 hover:text-[#4DAF48] active:bg-gray-200 text-sm font-extrabold transition-all h-full disabled:opacity-30 disabled:hover:bg-transparent"
                              >
                                −
                              </button>
                              <span className="px-4 text-xs font-bold text-[#4DAF48] min-w-[50px] text-center">
                                {item.porsi} Porsi
                              </span>
                              <button
                                onClick={() => updatePorsi(item.id, item.porsi + 1)}
                                className="px-3 text-neutral-mid hover:bg-gray-100 hover:text-[#4DAF48] active:bg-gray-200 text-sm font-extrabold transition-all h-full"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1 min-w-[110px]">
                              <span className="text-[10px] font-bold text-neutral-mid uppercase tracking-wide">
                                Subtotal
                              </span>
                              <span className="text-sm font-black text-[#4DAF48]">
                                {formatRupiah(item.subtotal)}
                              </span>
                            </div>

                            {deleteConfirmId !== item.id && (
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-2.5 border border-gray-100 hover:border-red-200 hover:bg-red-50 rounded-xl text-neutral-mid hover:text-danger transition-all shrink-0 cursor-pointer shadow-xs"
                                aria-label="Hapus menu dari keranjang"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {deleteConfirmId === item.id && (
                          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-center justify-between text-xs animate-slide-down">
                            <span className="font-semibold text-neutral-dark">
                              Apakah Anda yakin ingin menghapus menu ini?
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  removeItem(item.id)
                                  setDeleteConfirmId(null)
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-danger text-white font-extrabold cursor-pointer hover:bg-red-600 shadow-xs transition-colors"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-neutral-mid font-extrabold cursor-pointer hover:bg-gray-50 shadow-xs transition-colors"
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

            {/* Sidebar Estimasi */}
            <div className="space-y-6 sticky top-24 self-start">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
                <h3 className="text-xs font-black text-neutral-dark uppercase tracking-wider border-b border-gray-100 pb-4 mb-4">
                  Rincian Pemesanan
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-mid font-medium">Banyak Menu</span>
                    <span className="font-black text-neutral-dark">{items.length} jenis</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-mid font-medium">Total Porsi</span>
                    <span className="font-black text-neutral-dark">{totalPorsi} porsi</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-gray-100 pt-3">
                    <span className="text-neutral-mid font-medium">Subtotal Pangan</span>
                    <span className="font-black text-neutral-dark">
                      {formatRupiah(totalBahanPangan)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-mid font-medium">Biaya Servis / Pengantaran</span>
                    <span className="text-[10px] bg-neutral-100 text-neutral-mid font-bold px-2 py-0.5 rounded-full">
                      Dihitung di langkah 2
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-150 pt-4 mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-black text-neutral-dark uppercase tracking-wider">
                      Estimasi Total
                    </span>
                    <span className="text-lg font-black text-[#4DAF48]">
                      {formatRupiah(totalBahanPangan)}
                    </span>
                  </div>
                  <p className="text-[9px] text-neutral-mid leading-relaxed mt-1">
                    *Harga di atas belum termasuk biaya pengiriman / biaya tambahan sesuai metode
                    layanan yang dipilih.
                  </p>
                </div>

                <button
                  onClick={handleGoToStep2}
                  disabled={hasInactiveItems}
                  className={cn(
                    'w-full py-4.5 rounded-2xl text-white font-extrabold text-sm text-center shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer',
                    hasInactiveItems
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-[#4DAF48] to-[#96B83D] hover:brightness-105 active:scale-[0.99] hover:shadow-lg hover:shadow-[#4DAF48]/10'
                  )}
                >
                  {hasInactiveItems
                    ? 'Lengkapi Keranjang Terlebih Dahulu'
                    : 'Lanjut ke Informasi Pengiriman'}
                  {!hasInactiveItems && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-900 shadow-inner">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[10px] leading-relaxed font-semibold">
                  Lavanda Catering menjamin bahan berkualitas tinggi & higienis. Hubungi CS untuk
                  pesanan custom khusus lainnya.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INFORMASI & TANGGAL */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-sm font-extrabold text-neutral-dark uppercase tracking-wide flex items-center gap-2">
                    <User className="w-5 h-5 text-[#4DAF48]" /> Data Penerima & Pengiriman
                  </h3>
                  <p className="text-neutral-mid text-xs mt-1">
                    Harap isi data dengan lengkap agar tidak menghambat pengantaran.
                  </p>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-2" id="nama">
                  <label className="text-xs font-black text-neutral-dark uppercase tracking-wide flex items-center gap-1.5">
                    Nama Penerima <span className="text-[#4DAF48] font-black">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-mid" />
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda..."
                      className={cn(
                        'w-full pl-11 pr-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 placeholder-neutral-mid/60 text-neutral-dark font-medium',
                        errors.nama
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-[#4DAF48]/10 focus:border-[#4DAF48]'
                      )}
                    />
                  </div>
                  {errors.nama && (
                    <p className="text-[10px] text-red-500 font-bold">{errors.nama}</p>
                  )}
                </div>

                {/* Nomor HP */}
                <div className="space-y-2" id="noHp">
                  <label className="text-xs font-black text-neutral-dark uppercase tracking-wide flex items-center gap-1.5">
                    Nomor WhatsApp / HP <span className="text-[#4DAF48] font-black">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-mid" />
                    <input
                      type="tel"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="Contoh: 081234567890 atau +6281234567890..."
                      className={cn(
                        'w-full pl-11 pr-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 placeholder-neutral-mid/60 text-neutral-dark font-medium',
                        errors.noHp
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-[#4DAF48]/10 focus:border-[#4DAF48]'
                      )}
                    />
                  </div>
                  {errors.noHp && (
                    <p className="text-[10px] text-red-500 font-bold">{errors.noHp}</p>
                  )}
                </div>

                {/* Jam Acara */}
                <div className="space-y-2" id="waktuAcara">
                  <label className="text-xs font-black text-neutral-dark uppercase tracking-wide flex items-center gap-1.5">
                    Waktu Pengiriman / Jam Acara{' '}
                    <span className="text-[#4DAF48] font-black">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-mid" />
                    <input
                      type="time"
                      value={waktuAcara}
                      onChange={(e) => setWaktuAcara(e.target.value)}
                      className={cn(
                        'w-full pl-11 pr-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 text-neutral-dark font-semibold',
                        errors.waktuAcara
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-[#4DAF48]/10 focus:border-[#4DAF48]'
                      )}
                    />
                  </div>
                  {errors.waktuAcara && (
                    <p className="text-[10px] text-red-500 font-bold">{errors.waktuAcara}</p>
                  )}
                </div>

                {/* Alamat Event */}
                <div className="space-y-2" id="alamatEvent">
                  <label className="text-xs font-black text-neutral-dark uppercase tracking-wide flex items-center gap-1.5">
                    Alamat Detail Lokasi / Event{' '}
                    <span className="text-[#4DAF48] font-black">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-neutral-mid" />
                    <textarea
                      value={alamatEvent}
                      onChange={(e) => setAlamatEvent(e.target.value)}
                      placeholder="Tuliskan nama jalan, RT/RW, nomor rumah, gedung/ruangan, patokan..."
                      rows={3}
                      className={cn(
                        'w-full pl-11 pr-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 placeholder-neutral-mid/60 text-neutral-dark font-medium resize-none',
                        errors.alamatEvent
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-[#4DAF48]/10 focus:border-[#4DAF48]'
                      )}
                    />
                  </div>
                  {errors.alamatEvent && (
                    <p className="text-[10px] text-red-500 font-bold">{errors.alamatEvent}</p>
                  )}
                  <p className="text-[10px] text-neutral-mid font-medium italic">
                    * Area cakupan gratis ongkir mencakup seluruh area Kota Semarang utama.
                  </p>
                </div>

                {/* Catatan Tambahan */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-dark uppercase tracking-wide flex items-center gap-1.5">
                    Catatan Tambahan untuk Katering (Opsional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-neutral-mid" />
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Contoh: Kurangi micin, rasa kuah agak gurih pedas, lauk dibungkus plastik terpisah..."
                      rows={2}
                      className="w-full pl-11 pr-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-gray-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4DAF48]/10 focus:border-[#4DAF48] placeholder-neutral-mid/60 text-neutral-dark font-medium resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Calendar Picker component */}
              <div id="tanggalAcara">
                <CalendarPicker
                  selectedDate={tanggalAcara}
                  onDateSelect={setTanggalAcara}
                  totalPorsiRequired={totalPorsi}
                />
                {errors.tanggalAcara && (
                  <p className="text-[11px] text-red-500 font-black mt-2 bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {errors.tanggalAcara}
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar step 2 info */}
            <div className="space-y-6 sticky top-24 self-start">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
                <h3 className="text-xs font-black text-neutral-dark uppercase tracking-wider border-b border-gray-100 pb-4 mb-4">
                  Detail Pengiriman
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-2.5 text-xs">
                    <User className="w-4.5 h-4.5 text-[#4DAF48] shrink-0" />
                    <div>
                      <p className="text-neutral-mid font-medium">Pemesan</p>
                      <p className="font-extrabold text-neutral-dark mt-0.5">
                        {nama || '(Belum diisi)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 text-xs">
                    <Phone className="w-4.5 h-4.5 text-[#4DAF48] shrink-0" />
                    <div>
                      <p className="text-neutral-mid font-medium">No. Telepon / WA</p>
                      <p className="font-extrabold text-neutral-dark mt-0.5">
                        {noHp || '(Belum diisi)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 text-xs">
                    <Calendar className="w-4.5 h-4.5 text-[#4DAF48] shrink-0" />
                    <div>
                      <p className="text-neutral-mid font-medium">Tanggal Acara</p>
                      <p className="font-extrabold text-neutral-dark mt-0.5">
                        {tanggalAcara
                          ? tanggalAcara.toLocaleDateString('id-ID', { dateStyle: 'long' })
                          : '(Belum dipilih)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 text-xs">
                    <MapPin className="w-4.5 h-4.5 text-[#4DAF48] shrink-0" />
                    <div>
                      <p className="text-neutral-mid font-medium">Alamat Event</p>
                      <p className="font-extrabold text-neutral-dark mt-0.5 line-clamp-2">
                        {alamatEvent || '(Belum diisi)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6 text-xs">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-black text-neutral-dark uppercase">Subtotal Pangan</span>
                    <span className="font-black text-brand-primary text-sm">
                      {formatRupiah(totalBahanPangan)}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-mid leading-relaxed">
                    *Semua pemesanan minimal lead-time di bawah kapasitas ketersediaan harian
                    Semarang.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border border-gray-200 rounded-xl text-neutral-dark font-extrabold text-xs text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Ubah Keranjang
                  </button>
                  <button
                    onClick={handleGoToStep3}
                    className="flex-2 py-4 rounded-xl bg-gradient-to-r from-[#4DAF48] to-[#96B83D] hover:brightness-105 active:scale-[0.99] hover:shadow-lg hover:shadow-[#4DAF48]/10 text-white font-extrabold text-xs text-center shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    Detail Pembayaran <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: METODE & BAYAR / CONSENT */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Payment Method Options & PDP Consent */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-sm font-extrabold text-neutral-dark uppercase tracking-wide flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#4DAF48]" /> Pilih Opsi Skema Pembayaran
                  </h3>
                  <p className="text-neutral-mid text-xs mt-1">
                    Anda dapat membayar lunas langsung atau uang muka (DP) minimal 50% terlebih
                    dahulu.
                  </p>
                </div>

                {/* Premium Select Cards for Pembayaran */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option DP */}
                  <div
                    onClick={() => setTipeBayar('dp')}
                    className={cn(
                      'border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-36 relative select-none',
                      tipeBayar === 'dp'
                        ? 'border-[#4DAF48] bg-[#4DAF48]/5 shadow-md shadow-[#4DAF48]/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    {tipeBayar === 'dp' && (
                      <span className="absolute top-4 right-4 bg-[#4DAF48] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Terpilih
                      </span>
                    )}
                    <div>
                      <h4 className="text-xs font-black text-neutral-dark uppercase tracking-wider">
                        Bayar DP 50%
                      </h4>
                      <p className="text-[10px] text-neutral-mid mt-1 leading-normal">
                        Membayar uang muka sebesar 50% saat ini. Sisa pembayaran dilunasi paling
                        lambat H-1 acara.
                      </p>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] text-neutral-mid font-medium uppercase">
                        Nominal DP
                      </p>
                      <p className="text-base font-black text-[#4DAF48]">
                        {formatRupiah(nominalDP)}
                      </p>
                    </div>
                  </div>

                  {/* Option Lunas */}
                  <div
                    onClick={() => setTipeBayar('lunas')}
                    className={cn(
                      'border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-36 relative select-none',
                      tipeBayar === 'lunas'
                        ? 'border-[#4DAF48] bg-[#4DAF48]/5 shadow-md shadow-[#4DAF48]/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    {tipeBayar === 'lunas' && (
                      <span className="absolute top-4 right-4 bg-[#4DAF48] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Terpilih
                      </span>
                    )}
                    <div>
                      <h4 className="text-xs font-black text-neutral-dark uppercase tracking-wider">
                        Bayar Lunas (100%)
                      </h4>
                      <p className="text-[10px] text-neutral-mid mt-1 leading-normal">
                        Membayar lunas seluruh pemesanan saat ini untuk kepraktisan bertransaksi
                        tanpa beban tagihan akhir.
                      </p>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] text-neutral-mid font-medium uppercase">
                        Nominal Lunas
                      </p>
                      <p className="text-base font-black text-[#4DAF48]">
                        {formatRupiah(totalBahanPangan)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UU PDP Consent Checkbox */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
                <div className="flex items-start gap-4 select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="pdp-consent"
                      name="pdp-consent"
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="h-4.5 w-4.5 rounded-md border-gray-300 text-[#4DAF48] focus:ring-[#4DAF48] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pdp-consent"
                      className="text-xs font-bold text-neutral-dark mr-1 leading-normal cursor-pointer"
                    >
                      Pernyataan Persetujuan Pemrosesan Data Pribadi (UU PDP)
                    </label>
                    <p className="text-[10px] text-neutral-mid mt-1.5 leading-relaxed">
                      Dengan mencentang kotak ini, saya menyetujui secara sadar bahwa data pribadi
                      pemesan berupa nama lengkap, nomor WhatsApp, serta detail alamat lokasi
                      katering dapat diregistrasikan dan diproses oleh{' '}
                      <strong>Lavanda Catering</strong> untuk kepentingan logistik pengantaran
                      makanan dan notifikasi order sesuai dengan{' '}
                      <Link
                        href="/kebijakan-privasi"
                        target="_blank"
                        className="text-[#4DAF48] hover:underline font-bold"
                      >
                        Kebijakan Privasi
                      </Link>{' '}
                      dan{' '}
                      <Link
                        href="/syarat-ketentuan"
                        target="_blank"
                        className="text-[#4DAF48] hover:underline font-bold"
                      >
                        Syarat & Ketentuan Layanan
                      </Link>
                      . Kami menjamin kerahasiaan data dan tidak akan menjual informasi Anda kepada
                      pihak ketiga mana pun.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing breakdown sidebar */}
            <div className="space-y-6 sticky top-24 self-start">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
                <h3 className="text-xs font-black text-neutral-dark uppercase tracking-wider border-b border-gray-100 pb-4 mb-4">
                  Rincian Biaya Final
                </h3>

                <div className="space-y-3 mb-6 text-xs font-medium text-neutral-dark">
                  <div className="flex justify-between">
                    <span className="text-neutral-mid">Subtotal Bahan Pangan</span>
                    <span>{formatRupiah(totalBahanPangan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-mid">Biaya Pengiriman</span>
                    <span className="text-[#4DAF48] font-black uppercase text-[10px] bg-[#4DAF48]/5 px-2 py-0.5 rounded-full">
                      Gratis Semarang
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-mid">MDR QRIS (0.7%)</span>
                    <span>
                      {formatRupiah(
                        Math.round((tipeBayar === 'dp' ? nominalDP : totalBahanPangan) * 0.007)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="text-neutral-mid font-semibold">
                      Uang yang Wajib Dibayar Sekarang
                    </span>
                    <span className="font-black text-[#4DAF48] text-sm">
                      {formatRupiah(
                        (tipeBayar === 'dp' ? nominalDP : totalBahanPangan) +
                          Math.round((tipeBayar === 'dp' ? nominalDP : totalBahanPangan) * 0.007)
                      )}
                    </span>
                  </div>
                  {tipeBayar === 'dp' && (
                    <div className="flex justify-between opacity-80 italic text-[11px] text-neutral-mid">
                      <span>Sisa Tagihan Nanti (H-1)</span>
                      <span>{formatRupiah(nominalSisa)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex items-center gap-2 text-neutral-mid text-[10px] mb-2 font-medium">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pembayaran Terenkripsi 256-bit Secure</span>
                  </div>
                  <p className="text-[9px] text-neutral-mid leading-relaxed font-semibold">
                    Setelah mengklik tombol di bawah, Anda akan langsung dialihkan ke gerbang
                    pembayaran aman DOKU Sandbox untuk menyelesaikan tagihan Anda.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleFinalOrderSubmit}
                    disabled={!consentGiven || submitting}
                    className={cn(
                      'w-full py-4.5 rounded-2xl text-white font-extrabold text-sm text-center shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer select-none',
                      !consentGiven || submitting
                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-[#4DAF48] to-[#96B83D] hover:brightness-105 hover:shadow-lg hover:shadow-[#4DAF48]/15 active:scale-[0.99]'
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Memproses Transaksi...
                      </>
                    ) : (
                      <>
                        Bayar Sekarang <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!submitting) setStep(2)
                    }}
                    disabled={submitting}
                    className="w-full py-3.5 border border-gray-200 rounded-xl text-neutral-dark font-extrabold text-xs text-center cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Kembali Ke Form Pengiriman
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
