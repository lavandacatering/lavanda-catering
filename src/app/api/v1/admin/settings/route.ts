import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

// GET /api/v1/admin/settings — Ambil semua settings (Khusus Admin)
export async function GET() {
  console.log('[API-ADMIN-SETTINGS] Admin fetching all settings...')

  try {
    // 1. Double auth check (BC1 + SECURITY_DEFAULTS)
    await checkAdminAuth()

    const allSettings = await prisma.settings.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({
      status: 'success',
      data: allSettings,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-SETTINGS] GET error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk melihat konfigurasi ini.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal mengambil konfigurasi admin.',
        diagnostics: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  }
}

// PUT /api/v1/admin/settings — Bulk update settings (Khusus Admin)
export async function PUT(request: NextRequest) {
  console.log('[API-ADMIN-SETTINGS] Admin updating settings...')

  try {
    // 1. Double auth check (BC1 + SECURITY_DEFAULTS)
    const admin = await checkAdminAuth()

    const body = await request.json()

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Format request body tidak valid. Wajib berupa JSON objek.',
        },
        { status: 422 }
      )
    }

    // 2. Perform updates in a single database transaction
    const entries = Object.entries(body)

    if (entries.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Request body kosong. Tidak ada konfigurasi yang diubah.',
        },
        { status: 422 }
      )
    }

    console.info(
      `[API-ADMIN-SETTINGS] Admin ${admin.email} is updating ${entries.length} setting keys.`
    )

    const updatedSettings = await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    )

    // Log administrative action (SECURITY_DEFAULTS requirement)
    console.info(`[API-ADMIN-SETTINGS] Admin ${admin.email} successfully updated settings.`)

    return NextResponse.json({
      status: 'success',
      data: updatedSettings,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-SETTINGS] PUT error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk mengubah konfigurasi ini.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memperbarui konfigurasi sistem di database.',
        diagnostics: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
