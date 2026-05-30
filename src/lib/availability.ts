import { prisma } from './prisma'
import { Prisma } from '@/generated/prisma'

export interface DateAvailability {
  tanggal: string // YYYY-MM-DD
  is_blocked: boolean
  alasan_block: string | null
  kapasitas_customer_total: number
  kapasitas_customer_dipesan: number
  kapasitas_customer_sisa: number
  kapasitas_porsi_total: number
  kapasitas_porsi_dipesan: number
  kapasitas_porsi_sisa: number
  is_past_lead_time: boolean
}

/**
 * Normalizes a Date representation to local YYYY-MM-DD string
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Checks system-wide availability constraints for a date range
 */
export async function getAvailabilityInRange(
  startStr: string,
  endStr: string
): Promise<DateAvailability[]> {
  const start = new Date(startStr)
  const end = new Date(endStr)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Format tanggal start atau end tidak valid.')
  }

  // 1. Fetch default settings
  const settingsRows = await prisma.settings.findMany({
    where: {
      key: {
        in: ['kapasitas_customer_default', 'kapasitas_porsi_default', 'lead_time_hari'],
      },
    },
  })

  const settings = {
    kapasitas_customer_default: 10,
    kapasitas_porsi_default: 500,
    lead_time_hari: 7,
  }

  settingsRows.forEach((row) => {
    if (row.key === 'kapasitas_customer_default')
      settings.kapasitas_customer_default = parseInt(row.value) || 10
    if (row.key === 'kapasitas_porsi_default')
      settings.kapasitas_porsi_default = parseInt(row.value) || 500
    if (row.key === 'lead_time_hari') settings.lead_time_hari = parseInt(row.value) || 7
  })

  // Calculate lead-time boundary (H + lead_time_hari)
  // Today's date normalized (00:00:00 local time)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const leadTimeLimit = new Date(today)
  leadTimeLimit.setDate(leadTimeLimit.getDate() + settings.lead_time_hari)

  // 2. Fetch custom config overrides for the date range
  const customConfigs = await prisma.kalender_config.findMany({
    where: {
      tanggal: {
        gte: start,
        lte: end,
      },
    },
  })

  // 3. Fetch active orders bookings in range
  const orders = await prisma.pesanan.findMany({
    where: {
      tanggal_acara: {
        gte: start,
        lte: end,
      },
      status_pesanan: {
        not: 'dibatalkan',
      },
    },
    select: {
      tanggal_acara: true,
      total_porsi: true,
    },
  })

  // Map orders by normalized date string
  const bookingsMap: Record<string, { customers: number; portions: number }> = {}
  orders.forEach((order) => {
    const dStr = toLocalDateString(new Date(order.tanggal_acara))
    if (!bookingsMap[dStr]) {
      bookingsMap[dStr] = { customers: 0, portions: 0 }
    }
    bookingsMap[dStr].customers += 1
    bookingsMap[dStr].portions += order.total_porsi
  })

  // Map custom configs by normalized date string
  const configsMap: Record<string, (typeof customConfigs)[0]> = {}
  customConfigs.forEach((conf) => {
    const dStr = toLocalDateString(new Date(conf.tanggal))
    configsMap[dStr] = conf
  })

  // Generate availability day-by-day
  const result: DateAvailability[] = []
  const current = new Date(start)

  while (current <= end) {
    const dStr = toLocalDateString(current)
    const custom = configsMap[dStr]
    const booking = bookingsMap[dStr] || { customers: 0, portions: 0 }

    // Capacities definitions
    const customerCap = custom ? custom.kapasitas_customer : settings.kapasitas_customer_default
    const portionCap = custom ? custom.kapasitas_porsi : settings.kapasitas_porsi_default
    const manuallyBlocked = custom ? custom.is_blocked : false
    const reason = custom ? custom.alasan_block : null

    const isPastLeadTime = new Date(current) < leadTimeLimit

    const customerSisa = Math.max(0, customerCap - booking.customers)
    const portionSisa = Math.max(0, portionCap - booking.portions)

    // A date is blocked if manually blocked, past lead time, or no capacity left
    const isBlocked = manuallyBlocked || isPastLeadTime || customerSisa <= 0 || portionSisa <= 0

    result.push({
      tanggal: dStr,
      is_blocked: isBlocked,
      alasan_block: manuallyBlocked
        ? reason
        : isPastLeadTime
          ? 'Di bawah batas lead time pemesanan (min H-7)'
          : customerSisa <= 0 || portionSisa <= 0
            ? 'Kapasitas penuh'
            : null,
      kapasitas_customer_total: customerCap,
      kapasitas_customer_dipesan: booking.customers,
      kapasitas_customer_sisa: customerSisa,
      kapasitas_porsi_total: portionCap,
      kapasitas_porsi_dipesan: booking.portions,
      kapasitas_porsi_sisa: portionSisa,
      is_past_lead_time: isPastLeadTime,
    })

    current.setDate(current.getDate() + 1)
  }

  return result
}

/**
 * Validates and locks a date capacity within an interactive transaction
 * ⚠️ SENIOR FLAG: Row-level locking to prevent race conditions on dual-limit bookings
 */
export async function checkAndLockDateCapacity(
  tx: Prisma.TransactionClient, // Prisma Transaction Client
  dateStr: string,
  extraPorsi: number
): Promise<{ allowed: boolean; reason?: string }> {
  const targetDate = new Date(dateStr)
  if (isNaN(targetDate.getTime())) {
    return { allowed: false, reason: 'Format tanggal tidak valid.' }
  }

  // 1. Acquire an exclusive row-level lock on the kalender_config for this date
  // This blocks other concurrent orders trying to check/book the same date
  await tx.$executeRaw`
    SELECT id FROM kalender_config 
    WHERE tanggal = ${targetDate}::date 
    FOR UPDATE
  `

  // 2. Fetch default limits
  const settingsRows = await tx.settings.findMany({
    where: {
      key: {
        in: ['kapasitas_customer_default', 'kapasitas_porsi_default', 'lead_time_hari'],
      },
    },
  })

  const settings = {
    kapasitas_customer_default: 10,
    kapasitas_porsi_default: 500,
    lead_time_hari: 7,
  }

  settingsRows.forEach((row) => {
    if (row.key === 'kapasitas_customer_default')
      settings.kapasitas_customer_default = parseInt(row.value) || 10
    if (row.key === 'kapasitas_porsi_default')
      settings.kapasitas_porsi_default = parseInt(row.value) || 500
    if (row.key === 'lead_time_hari') settings.lead_time_hari = parseInt(row.value) || 7
  })

  // 3. Check lead time (H + lead_time_hari minimum)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const leadTimeLimit = new Date(today)
  leadTimeLimit.setDate(leadTimeLimit.getDate() + settings.lead_time_hari)

  if (targetDate < leadTimeLimit) {
    return {
      allowed: false,
      reason: `Tanggal acara kurang dari H-${settings.lead_time_hari} lead time.`,
    }
  }

  // 4. Fetch custom config overrides
  const custom = await tx.kalender_config.findUnique({
    where: { tanggal: targetDate },
  })

  if (custom?.is_blocked) {
    return {
      allowed: false,
      reason: custom.alasan_block || 'Tanggal ini telah diblokir secara manual oleh admin.',
    }
  }

  const customerCap = custom ? custom.kapasitas_customer : settings.kapasitas_customer_default
  const portionCap = custom ? custom.kapasitas_porsi : settings.kapasitas_porsi_default

  // 5. Calculate currently booked capacities
  const activeOrders = await tx.pesanan.aggregate({
    where: {
      tanggal_acara: targetDate,
      status_pesanan: {
        not: 'dibatalkan',
      },
    },
    _sum: {
      total_porsi: true,
    },
    _count: {
      id: true,
    },
  })

  const bookedCustomers = activeOrders._count.id || 0
  const bookedPortions = activeOrders._sum.total_porsi || 0

  // 6. Validate limits
  if (bookedCustomers + 1 > customerCap) {
    return {
      allowed: false,
      reason: 'Kapasitas maksimal customer untuk hari tersebut telah penuh.',
    }
  }

  if (bookedPortions + extraPorsi > portionCap) {
    return {
      allowed: false,
      reason: `Kapasitas sisa porsi tidak mencukupi. Sisa porsi: ${portionCap - bookedPortions} porsi.`,
    }
  }

  return { allowed: true }
}
