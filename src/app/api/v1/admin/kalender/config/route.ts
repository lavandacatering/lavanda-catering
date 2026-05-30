import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

// GET /api/v1/admin/kalender/config?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(request: NextRequest) {
  console.log('[API-ADMIN-KALENDER-CONFIG] Admin fetching calendar configurations...')

  try {
    // 1. Auth check
    await checkAdminAuth()

    const { searchParams } = new URL(request.url)
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')

    if (!startStr || !endStr) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Parameter start dan end tanggal wajib diisi.',
        },
        { status: 422 }
      )
    }

    const startDate = new Date(startStr)
    const endDate = new Date(endStr)

    // 2. Fetch overrides
    const overrides = await prisma.kalender_config.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // 3. Fetch active orders in range to aggregate count/portion
    // Active orders: status_pesanan is NOT 'batal'
    const orders = await prisma.pesanan.findMany({
      where: {
        tanggal_acara: {
          gte: startDate,
          lte: endDate,
        },
        status_pesanan: {
          notIn: ['batal', 'dibatalkan'],
        },
      },
      select: {
        tanggal_acara: true,
        total_porsi: true,
      },
    })

    // Aggregate orders by date string YYYY-MM-DD
    const orderAggregates: Record<string, { orderCount: number; portionCount: number }> = {}
    orders.forEach((o) => {
      // Format to local date string YYYY-MM-DD safely
      const dateStr = o.tanggal_acara.toISOString().split('T')[0]
      if (!orderAggregates[dateStr]) {
        orderAggregates[dateStr] = { orderCount: 0, portionCount: 0 }
      }
      orderAggregates[dateStr].orderCount += 1
      orderAggregates[dateStr].portionCount += o.total_porsi
    })

    // Map overrides list
    const overrideMap = new Map(overrides.map((c) => [c.tanggal.toISOString().split('T')[0], c]))

    // Build day-by-day response array
    const dateCursor = new Date(startDate)
    const daysData = []

    // Safety cap to avoid infinite loop
    let count = 0
    while (dateCursor <= endDate && count < 100) {
      const dateStr = dateCursor.toISOString().split('T')[0]
      const config = overrideMap.get(dateStr)
      const agg = orderAggregates[dateStr] || { orderCount: 0, portionCount: 0 }

      daysData.push({
        tanggal: dateStr,
        is_override: !!config,
        is_blocked: config?.is_blocked ?? false,
        alasan_block: config?.alasan_block ?? null,
        kapasitas_customer: config?.kapasitas_customer ?? null,
        kapasitas_porsi: config?.kapasitas_porsi ?? null,
        total_orders: agg.orderCount,
        total_portions_booked: agg.portionCount,
      })

      dateCursor.setDate(dateCursor.getDate() + 1)
      count++
    }

    return NextResponse.json({
      status: 'success',
      data: daysData,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-KALENDER-CONFIG] GET error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk mengelola kalender.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal mengambil data kalender admin.',
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/kalender/config
// Upsert singular or multiple calendar configuration overrides
export async function POST(request: NextRequest) {
  console.log('[API-ADMIN-KALENDER-CONFIG] Admin updating calendar configurations...')

  try {
    // 1. Auth check
    const admin = await checkAdminAuth()

    const body = await request.json()
    const items = Array.isArray(body) ? body : [body]

    // Validate inputs
    for (const item of items) {
      if (!item.tanggal) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Parameter tanggal wajib disertakan.',
          },
          { status: 422 }
        )
      }
    }

    // Process upserts in transaction
    const results = await prisma.$transaction(
      items.map((item) => {
        const dateVal = new Date(item.tanggal)

        // Define updates object dynamically based on optional keys
        const updateData: {
          is_blocked?: boolean
          alasan_block?: string | null
          kapasitas_customer?: number
          kapasitas_porsi?: number
          created_by?: string
        } = {}
        if (item.is_blocked !== undefined) updateData.is_blocked = !!item.is_blocked
        if (item.alasan_block !== undefined) updateData.alasan_block = item.alasan_block
        if (item.kapasitas_customer !== undefined)
          updateData.kapasitas_customer = parseInt(item.kapasitas_customer)
        if (item.kapasitas_porsi !== undefined)
          updateData.kapasitas_porsi = parseInt(item.kapasitas_porsi)
        updateData.created_by = admin.email

        // Default creations
        const createData = {
          tanggal: dateVal,
          is_blocked: item.is_blocked !== undefined ? !!item.is_blocked : false,
          alasan_block: item.alasan_block || null,
          kapasitas_customer:
            item.kapasitas_customer !== undefined ? parseInt(item.kapasitas_customer) : 10,
          kapasitas_porsi:
            item.kapasitas_porsi !== undefined ? parseInt(item.kapasitas_porsi) : 500,
          created_by: admin.email,
        }

        return prisma.kalender_config.upsert({
          where: { tanggal: dateVal },
          update: updateData,
          create: createData,
        })
      })
    )

    console.info(
      `[API-ADMIN-KALENDER-CONFIG] Admin ${admin.email} successfully updated ${results.length} dates.`
    )

    return NextResponse.json({
      status: 'success',
      data: results,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-KALENDER-CONFIG] POST error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk mengelola kalender.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memperbarui konfigurasi kalender.',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
