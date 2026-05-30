'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Calendar as CalendarIcon, Save, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DayConfig {
  tanggal: string
  is_override: boolean
  is_blocked: boolean
  alasan_block: string | null
  kapasitas_customer: number | null
  kapasitas_porsi: number | null
  total_orders: number
  total_portions_booked: number
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

export default function AdminKalenderPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [days, setDays] = useState<DayConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  // Editor states
  const [selectedDay, setSelectedDay] = useState<DayConfig | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [alasanBlock, setAlasanBlock] = useState('')
  const [kapasitasCustomer, setKapasitasCustomer] = useState(10)
  const [kapasitasPorsi, setKapasitasPorsi] = useState(500)
  const [saving, setSaving] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000)
  }

  useEffect(() => {
    let active = true

    // Delay setLoading to next microtask to avoid synchronous render warning
    Promise.resolve().then(() => {
      if (active) setLoading(true)
    })

    const startStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const endStr = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

    const load = async () => {
      try {
        const res = await fetch(`/api/v1/admin/kalender/config?start=${startStr}&end=${endStr}`)
        if (res.ok && active) {
          const json = await res.json()
          setDays(json.data || [])
        } else if (active) {
          showToast('Gagal memuat kalender.', 'error')
        }
      } catch {
        if (active) {
          showToast('Gagal terhubung ke server.', 'error')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [currentMonth, refreshCount])

  const handleSelectDay = (day: DayConfig) => {
    setSelectedDay(day)
    setIsBlocked(day.is_blocked)
    setAlasanBlock(day.alasan_block || '')
    setKapasitasCustomer(day.kapasitas_customer || 10)
    setKapasitasPorsi(day.kapasitas_porsi || 500)
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDay) return

    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/kalender/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: selectedDay.tanggal,
          is_blocked: isBlocked,
          alasan_block: isBlocked ? alasanBlock : '',
          kapasitas_customer: kapasitasCustomer,
          kapasitas_porsi: kapasitasPorsi,
        }),
      })

      if (res.ok) {
        showToast(`Konfigurasi tanggal ${selectedDay.tanggal} diperbarui.`, 'success')
        setSelectedDay(null)
        setRefreshCount((prev) => prev + 1)
      } else {
        const json = await res.json()
        showToast(json.message || 'Gagal menyimpan konfigurasi.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke database.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const nextMonth = subMonths(prev, 1)
      setSelectedDay(null)
      return nextMonth
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
    setSelectedDay(null)
  }

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
            <h1 className="text-base font-extrabold text-neutral-dark flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-primary" />
              Kelola Kalender & Kapasitas Pemesanan
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        {/* Left 2 Cols: Calendar Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-neutral-dark uppercase tracking-wide">
                {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-mid" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-mid" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <span className="text-sm text-neutral-mid animate-pulse">
                  Menghubungkan kalender...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {days.map((day) => {
                  const isDayBlocked = day.is_blocked
                  const hasOrders = day.total_orders > 0

                  return (
                    <div
                      key={day.tanggal}
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px]',
                        selectedDay?.tanggal === day.tanggal
                          ? 'border-brand-primary ring-2 ring-brand-primary/10 bg-brand-primary/5'
                          : isDayBlocked
                            ? 'border-red-200 bg-red-50/50 hover:bg-red-50'
                            : day.is_override
                              ? 'border-orange-200 bg-orange-50/20 hover:bg-orange-50/40'
                              : 'border-gray-100 bg-white hover:border-gray-200'
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-neutral-dark">
                          {format(new Date(day.tanggal), 'dd eee', { locale: localeId })}
                        </span>
                        <div className="flex gap-1.5">
                          {isDayBlocked && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              BLOCKED
                            </span>
                          )}
                          {day.is_override && !isDayBlocked && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                              CUSTOM
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="text-[11px] text-gray-500 flex justify-between">
                          <span>Porsi Booked:</span>
                          <span
                            className={cn(
                              'font-bold',
                              hasOrders ? 'text-brand-primary' : 'text-neutral-mid'
                            )}
                          >
                            {day.total_portions_booked} porsi
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex justify-between">
                          <span>Kapasitas:</span>
                          <span className="font-semibold text-neutral-dark">
                            {day.kapasitas_porsi ?? 500}p / {day.kapasitas_customer ?? 10}c
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Day Config Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-sm text-neutral-dark mb-4 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-primary" />
              Detail & Override Hari
            </h3>

            {selectedDay ? (
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-mid uppercase tracking-wide block mb-1">
                    Tanggal terpilih
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-neutral-dark uppercase">
                    {format(new Date(selectedDay.tanggal), 'iiii, dd MMMM yyyy', {
                      locale: localeId,
                    })}
                  </div>
                </div>

                {/* Status Booking Counts info */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-light/10 rounded-lg border border-neutral-light/50 text-xs">
                  <div>
                    <span className="text-gray-500 block">Total Pesanan</span>
                    <span className="text-sm font-extrabold text-neutral-dark">
                      {selectedDay.total_orders} order
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Total Kebutuhan Porsi</span>
                    <span className="text-sm font-extrabold text-brand-primary">
                      {selectedDay.total_portions_booked} porsi
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4 pt-4 space-y-4">
                  {/* Block / Blocked Checkbox */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-dark">
                      Blokir Pemesanan Hari Ini?
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBlocked(!isBlocked)}
                      className={cn(
                        'w-12 h-6 flex items-center rounded-full p-1 transition-all duration-200 outline-none',
                        isBlocked ? 'bg-red-500 justify-end' : 'bg-gray-200 justify-start'
                      )}
                    >
                      <span className="bg-white w-4 h-4 rounded-full shadow-xs" />
                    </button>
                  </div>

                  {isBlocked && (
                    <div>
                      <label className="text-[11px] font-bold text-neutral-mid uppercase tracking-wide block mb-1">
                        Alasan Blokir
                      </label>
                      <textarea
                        value={alasanBlock}
                        onChange={(e) => setAlasanBlock(e.target.value)}
                        placeholder="Contoh: Libur Nasional / Kuota dapur penuh..."
                        rows={2}
                        className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        required
                      />
                    </div>
                  )}

                  {!isBlocked && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-mid uppercase tracking-wide block mb-1">
                          Max Customer
                        </label>
                        <input
                          type="number"
                          value={kapasitasCustomer}
                          onChange={(e) => setKapasitasCustomer(parseInt(e.target.value) || 0)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-neutral-mid uppercase tracking-wide block mb-1">
                          Max Porsi
                        </label>
                        <input
                          type="number"
                          value={kapasitasPorsi}
                          onChange={(e) => setKapasitasPorsi(parseInt(e.target.value) || 0)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg bg-brand-primary text-white font-bold text-xs hover:brightness-105 transition-all shadow-sm disabled:opacity-60"
                  >
                    {saving ? (
                      'Menyimpan...'
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Override</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="px-4 h-10 rounded-lg border border-gray-200 text-neutral-mid text-xs font-bold hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12">
                <span className="text-3xl mb-3 block">👈</span>
                <p className="text-xs text-neutral-mid font-semibold leading-relaxed">
                  Pilih salah satu tanggal di kalender sebelah kiri untuk mengubah kapasitas atau
                  memblokir booking.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
