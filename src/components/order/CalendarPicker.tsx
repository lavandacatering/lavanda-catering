'use client'

import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { id as localeId } from 'date-fns/locale'
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns'
import { Calendar as CalendarIcon, Info, Loader2, AlertTriangle } from 'lucide-react'

// CSS import for react-day-picker
import 'react-day-picker/dist/style.css'

interface DateAvailability {
  tanggal: string
  is_blocked: boolean
  alasan_block: string | null
  kapasitas_customer_sisa: number
  kapasitas_porsi_sisa: number
}

interface CalendarPickerProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  totalPorsiRequired: number
}

export function CalendarPicker({
  selectedDate,
  onDateSelect,
  totalPorsiRequired,
}: CalendarPickerProps) {
  const [month, setMonth] = useState<Date>(new Date())
  const [availability, setAvailability] = useState<Record<string, DateAvailability>>({})
  const [loading, setLoading] = useState(false)
  const [leadTime, setLeadTime] = useState(7)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const [showAlert, setShowAlert] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | undefined>(undefined)

  // 1. Fetch system lead time
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/v1/settings')
        const json = await res.json()
        if (json.status === 'success' && json.data.lead_time_hari) {
          setLeadTime(parseInt(json.data.lead_time_hari) || 7)
        }
      } catch (err) {
        console.error('[CalendarPicker] Failed to fetch settings:', err)
      } finally {
        setLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [])

  // 2. Fetch availability whenever month changes
  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true)
      const start = format(startOfMonth(month), 'yyyy-MM-dd')
      const end = format(endOfMonth(addMonths(month, 1)), 'yyyy-MM-dd') // Fetch 2 months for seamless transition

      try {
        const res = await fetch(`/api/v1/kalender/availability?start=${start}&end=${end}`)
        const json = await res.json()
        if (json.status === 'success') {
          const map: Record<string, DateAvailability> = {}
          json.data.forEach((day: DateAvailability) => {
            map[day.tanggal] = day
          })
          setAvailability(map)
        }
      } catch (err) {
        console.error('[CalendarPicker] Failed to fetch availability:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [month])

  // Normalizes date to YYYY-MM-DD local format
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const monthStr = String(date.getMonth() + 1).padStart(2, '0')
    const dayStr = String(date.getDate()).padStart(2, '0')
    return `${year}-${monthStr}-${dayStr}`
  }

  // Handle selected date with lead time popup warning
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onDateSelect(undefined)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const limit = new Date(today)
    limit.setDate(limit.getDate() + leadTime)

    if (date < limit) {
      setPendingDate(date)
      setShowAlert(true)
    } else {
      onDateSelect(date)
    }
  }

  // Determine if day is dynamic blocked/unavailable
  const isDayDisabled = (day: Date): boolean => {
    // Cannot select past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (day < today) return true

    // Extract local representation
    const dStr = getLocalDateString(day)
    const dayAvail = availability[dStr]

    if (dayAvail) {
      // If manually blocked, or exceed capacities
      if (dayAvail.is_blocked) return true
      if (dayAvail.kapasitas_customer_sisa <= 0) return true

      // If portions requested exceeds left portions
      if (totalPorsiRequired > 0 && dayAvail.kapasitas_porsi_sisa < totalPorsiRequired) {
        return true
      }
    }

    return false
  }

  return (
    <>
      <div className="w-full bg-white border border-gray-100 hover:border-[#4DAF48]/30 transition-all duration-200 rounded-2xl p-6 shadow-xl text-neutral-dark">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#4DAF48]/10 text-[#4DAF48] rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg tracking-wide text-neutral-dark">
              Pilih Tanggal Acara
            </h3>
            <p className="text-neutral-mid text-xs">Pilih hari pelaksanaan katering Anda</p>
          </div>
        </div>

        <div className="relative flex justify-center bg-gray-50/50 border border-gray-100 rounded-xl p-3 min-h-[350px]">
          {loadingSettings ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
              <Loader2 className="w-8 h-8 text-[#4DAF48] animate-spin" />
            </div>
          ) : null}

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            locale={localeId}
            disabled={isDayDisabled}
            className="react-day-picker-custom"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-between items-center px-2 py-1.5 border-b border-gray-100',
              caption_label: 'text-sm font-bold tracking-wider text-neutral-dark uppercase',
              nav: 'flex items-center space-x-1',
              nav_button:
                'h-8 w-8 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg flex items-center justify-center p-0 text-neutral-mid hover:text-[#4DAF48]',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell:
                'text-[#4DAF48] w-9 font-extrabold text-[11px] uppercase tracking-wider text-center py-2',
              row: 'flex w-full mt-2',
              cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:z-20',
              day: 'h-9 w-9 p-0 font-bold text-neutral-dark hover:bg-[#4DAF48]/10 hover:text-[#4DAF48] rounded-lg transition-all focus:outline-none flex items-center justify-center',
              day_selected:
                '!bg-[#22C55E] !text-white hover:!bg-[#16A34A] font-black scale-105 shadow-md shadow-[#22C55E]/30',
              day_disabled:
                'text-gray-300 hover:bg-transparent hover:text-gray-300 opacity-20 cursor-not-allowed',
              day_today: 'border border-dashed border-[#4DAF48]/60 text-[#4DAF48] font-bold',
              day_outside: 'text-gray-400 opacity-20',
            }}
          />

          {loading && (
            <div className="absolute bottom-4 right-4 bg-white/95 border border-gray-150 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-neutral-dark shadow-md">
              <Loader2 className="w-3.5 h-3.5 text-[#4DAF48] animate-spin" />
              <span>Memperbarui jadwal...</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2.5 bg-[#4DAF48]/5 border border-[#4DAF48]/10 rounded-xl p-3.5">
          <Info className="w-4 h-4 text-[#4DAF48] shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-dark leading-relaxed">
            <p className="font-extrabold text-[#4DAF48] mb-0.5">Informasi Pemesanan</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-mid font-medium">
              <li>
                Minimum pemesanan <span className="font-bold text-neutral-dark">H-{leadTime}</span>{' '}
                sebelum tanggal acara.
              </li>
              {totalPorsiRequired > 0 && (
                <li>
                  Porsi pesanan Anda (
                  <span className="font-bold text-neutral-dark">{totalPorsiRequired} porsi</span>)
                  membatasi tanggal yang memiliki sisa kapasitas cukup.
                </li>
              )}
              <li>Tanggal berwarna redup tidak dapat dicadangkan.</li>
            </ul>
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="fixed inset-0 bg-neutral-dark/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl p-6 max-w-sm w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 text-amber-500">
              <div className="p-2 bg-amber-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-extrabold text-base text-neutral-dark">Peringatan Batas H+7</h4>
            </div>

            <p className="text-xs text-neutral-mid leading-relaxed">
              Anda memilih tanggal yang berjarak{' '}
              <span className="font-bold text-neutral-dark">kurang dari 7 hari</span> dari hari ini.
              Pemesanan mendadak (kurang dari H+7) berpotensi mengalami keterbatasan kapasitas
              katering. Kami sangat menyarankan konfirmasi cepat dengan admin.
            </p>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowAlert(false)
                  setPendingDate(undefined)
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-neutral-mid font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Pilih Ulang
              </button>
              <button
                type="button"
                onClick={() => {
                  onDateSelect(pendingDate)
                  setShowAlert(false)
                  setPendingDate(undefined)
                }}
                className="flex-1 py-3 bg-[#4DAF48] hover:bg-[#4DAF48]/90 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Tetap Pilih
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
