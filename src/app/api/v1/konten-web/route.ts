import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/konten-web — Ambil data konten web landing page (Public)
export async function GET() {
  console.log('[API-KONTEN-WEB-PUBLIC] Fetching public web content...')

  try {
    const webContent = await prisma.konten_web.findUnique({
      where: { key: 'main' },
    })

    if (!webContent) {
      console.warn('[API-KONTEN-WEB-PUBLIC] Web content key "main" not found in database.')
      return NextResponse.json(
        {
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Konten web belum dikonfigurasi.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: webContent,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-KONTEN-WEB-PUBLIC] GET error:', err)

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal mengambil konten web.',
        diagnostics: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
