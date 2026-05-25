import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  console.log('[API-SETTINGS] Fetching public settings...')

  // Gather diagnostics for required database environment
  const diagnostics = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
  }

  try {
    // 1. Fetch public keys from settings table
    const publicKeys = [
      'nama_bisnis',
      'tagline',
      'wa_bisnis_number',
      'jam_buka',
      'jam_tutup',
      'area_layanan',
      'lead_time_hari',
    ]

    const settingsRows = await prisma.settings.findMany({
      where: {
        key: {
          in: publicKeys,
        },
      },
    })

    // 2. Transform array of rows into key-value map
    const publicSettings: Record<string, string> = {}
    settingsRows.forEach((row) => {
      publicSettings[row.key] = row.value
    })

    // 3. Fallback for wa_bisnis_number if DB is not seeded yet
    if (!publicSettings.wa_bisnis_number) {
      publicSettings.wa_bisnis_number = process.env.NEXT_PUBLIC_WA_BISNIS || '6281234567890'
    }

    return NextResponse.json({
      status: 'success',
      data: publicSettings,
    })
  } catch (error: unknown) {
    const err = error as Error & { code?: string }
    console.error('[API-SETTINGS] Failed to fetch settings:', err)

    // Handle DB schema empty warning specifically (PGRST205 / Table not found or similar)
    const isTableMissing = err?.message?.includes('does not exist') || err?.code === 'P2021'

    if (isTableMissing) {
      console.warn(
        '[API-SETTINGS] Database settings table not found. Returning environment fallbacks.'
      )
      return NextResponse.json({
        status: 'success',
        data: {
          nama_bisnis: 'Lavanda Catering',
          tagline: 'Dipercaya Ratusan Event di Semarang',
          wa_bisnis_number: process.env.NEXT_PUBLIC_WA_BISNIS || '6281234567890',
          jam_buka: '07:00',
          jam_tutup: '20:00',
          area_layanan: 'Seluruh Semarang',
          lead_time_hari: '7',
        },
      })
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal mengambil konfigurasi sistem dari database.',
        diagnostics,
        details:
          process.env.NODE_ENV !== 'production'
            ? { message: err.message, stack: err.stack }
            : undefined,
      },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
