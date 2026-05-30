import { NextResponse } from 'next/server'
import { getAvailabilityInRange } from '@/lib/availability'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'MISSING_PARAMETERS',
        message: 'Parameter start dan end tanggal wajib diisi.',
        errors: [],
      },
      { status: 400 }
    )
  }

  try {
    const data = await getAvailabilityInRange(start, end)
    return NextResponse.json({
      status: 'success',
      data,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-AVAILABILITY] Error fetching availability:', err)
    return NextResponse.json(
      {
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Gagal mengambil data ketersediaan tanggal acara.',
        errors: [],
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
