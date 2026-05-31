import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Prisma } from '@/generated/prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numericValue)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue)
}

export async function generateNomorOrder(tx: Prisma.TransactionClient): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const datePrefix = `${year}${month}${date}`

  // Ambil pesanan terakhir dengan tanggal hari ini
  const pattern = `LVC-${datePrefix}-%`
  const latestOrder = await tx.$queryRaw<{ nomor_order: string }[]>`
    SELECT nomor_order FROM pesanan 
    WHERE nomor_order LIKE ${pattern} 
    ORDER BY nomor_order DESC 
    LIMIT 1
  `
  let counter = 1
  if (latestOrder && latestOrder.length > 0) {
    const lastNum = latestOrder[0].nomor_order
    const numPart = lastNum.split('-')[2]
    counter = parseInt(numPart, 10) + 1
  }

  const seq = String(counter).padStart(3, '0')
  return `LVC-${datePrefix}-${seq}`
}
