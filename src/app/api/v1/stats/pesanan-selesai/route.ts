import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/stats/pesanan-selesai — Ambil jumlah pesanan selesai bulan ini (Public)
export async function GET() {
  console.log('[API-STATS-PESANAN-SELESAI] Fetching trust count stats...')

  try {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Hitung jumlah pesanan dengan status 'selesai' di bulan ini
    const completedCount = await prisma.pesanan.count({
      where: {
        status_pesanan: 'selesai',
        tanggal_acara: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    })

    // fallback ke seed value 12 jika data real-time masih 0 agar tampilan landing page tidak kosong
    const count = completedCount > 0 ? completedCount : 12

    return NextResponse.json({
      status: 'success',
      data: {
        count,
        is_mocked: completedCount === 0,
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-STATS-PESANAN-SELESAI] GET error:', err)

    // Jika terjadi error (misalnya database belum di-setup di CF Pages),
    // kembalikan fallback value agar UI tidak crash
    return NextResponse.json({
      status: 'success',
      data: {
        count: 12,
        is_mocked: true,
      },
    })
  }
}

export const dynamic = 'force-dynamic'
