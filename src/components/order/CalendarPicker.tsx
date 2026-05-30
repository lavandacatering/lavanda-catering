'use client'

import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { id as localeId } from 'date-fns/locale'
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns'
import { Calendar as CalendarIcon, Info, Loader2 } from 'lucide-react'

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

  // Determine if day is dynamic blocked/unavailable
  const isDayDisabled = (day: Date): boolean => {
    // Cannot select past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (day < today) return true

    // Extract local representation
    const dStr = getLocalDateString(day)
    const dayAvail = availability[dStr]

    // Calculate lead time boundary (H + lead_time_hari)
    const limit = new Date(today)
    limit.setDate(limit.getDate() + leadTime)

    if (day < limit) return true

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
    <div className="w-full bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#3D3D3D] transition-colors duration-200 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#BF5737]/10 text-[#BF5737] rounded-xl">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg tracking-wide">Pilih Tanggal Acara</h3>
          <p className="text-gray-400 text-xs">Pilih hari pelaksanaan katering Anda</p>
        </div>
      </div>

      <div className="relative flex justify-center bg-[#151515] border border-[#2D2D2D] rounded-xl p-3 min-h-[350px]">
        {loadingSettings ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#151515]/80 rounded-xl z-10">
            <Loader2 className="w-8 h-8 text-[#BF5737] animate-spin" />
          </div>
        ) : null}

        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={month}
          onMonthChange={setMonth}
          locale={localeId}
          disabled={isDayDisabled}
          className="react-day-picker-custom"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4',
            caption: 'flex justify-between items-center px-2 py-1.5 border-b border-[#2D2D2D]/60',
            caption_label: 'text-sm font-semibold tracking-wider text-gray-200 uppercase',
            nav: 'flex items-center space-x-1',
            nav_button:
              'h-8 w-8 bg-[#222] border border-[#333] hover:bg-[#333] hover:border-[#444] transition-colors rounded-lg flex items-center justify-center p-0 text-gray-300 hover:text-white',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell:
              'text-[#BF5737] w-9 font-semibold text-[11px] uppercase tracking-wider text-center py-2',
            row: 'flex w-full mt-2',
            cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:z-20',
            day: 'h-9 w-9 p-0 font-normal text-gray-300 hover:bg-[#BF5737]/20 hover:text-white rounded-lg transition-all focus:outline-none flex items-center justify-center',
            day_selected:
              'bg-[#BF5737] text-white hover:bg-[#BF5737]/90 font-semibold shadow-md shadow-[#BF5737]/20',
            day_disabled:
              'text-gray-600 hover:bg-transparent hover:text-gray-600 opacity-30 cursor-not-allowed',
            day_today: 'border border-dashed border-[#BF5737]/60 text-white font-semibold',
            day_outside: 'text-gray-700 opacity-20Cell',
          }}
        />

        {loading && (
          <div className="absolute bottom-4 right-4 bg-[#222]/90 border border-[#333] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-gray-300 shadow-md">
            <Loader2 className="w-3.5 h-3.5 text-[#BF5737] animate-spin" />
            <span>Memperbarui jadwal...</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2.5 bg-[#BF5737]/5 border border-[#BF5737]/20 rounded-xl p-3.5">
        <Info className="w-4 h-4 text-[#BF5737] shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300 leading-relaxed">
          <p className="font-semibold text-[#BF5737] mb-0.5">Informasi Pemesanan</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>
              Minimum pemesanan <span className="font-medium text-white">H-{leadTime}</span> sebelum
              tanggal acara.
            </li>
            {totalPorsiRequired > 0 && (
              <li>
                Porsi pesanan Anda (
                <span className="font-medium text-white">{totalPorsiRequired} porsi</span>)
                membatasi tanggal yang memiliki sisa kapasitas cukup.
              </li>
            )}
            <li>Tanggal berwarna redup tidak dapat dicadangkan.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
