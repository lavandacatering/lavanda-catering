import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

// GET /api/v1/admin/konten-web — Ambil konten web (Admin Only)
export async function GET() {
  console.log('[API-ADMIN-KONTEN-WEB] Admin fetching web content...')

  try {
    // 1. Double auth check (BC1 + SECURITY_DEFAULTS)
    await checkAdminAuth()

    const webContent = await prisma.konten_web.findUnique({
      where: { key: 'main' },
    })

    if (!webContent) {
      console.warn('[API-ADMIN-KONTEN-WEB] Web content not found in database.')
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
    console.error('[API-ADMIN-KONTEN-WEB] GET error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk melihat konten web ini.',
        },
        { status: 401 }
      )
    }

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

// PUT /api/v1/admin/konten-web — Update konten web (Admin Only)
export async function PUT(request: NextRequest) {
  console.log('[API-ADMIN-KONTEN-WEB] Admin updating web content...')

  try {
    // 1. Double auth check (BC1 + SECURITY_DEFAULTS)
    const admin = await checkAdminAuth()

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Request body tidak valid.',
        },
        { status: 422 }
      )
    }

    const { konten_hero, tentang_kami, keunggulan, galeri, kontak } = body

    // 2. Upsert the web content
    const updatedContent = await prisma.konten_web.upsert({
      where: { key: 'main' },
      update: {
        konten_hero: konten_hero !== undefined ? konten_hero : undefined,
        tentang_kami: tentang_kami !== undefined ? tentang_kami : undefined,
        keunggulan: keunggulan !== undefined ? keunggulan : undefined,
        galeri: galeri !== undefined ? galeri : undefined,
        kontak: kontak !== undefined ? kontak : undefined,
        updated_by: admin.email,
      },
      create: {
        key: 'main',
        konten_hero: konten_hero || null,
        tentang_kami: tentang_kami || null,
        keunggulan: keunggulan || null,
        galeri: galeri || [],
        kontak: kontak || null,
        updated_by: admin.email,
      },
    })

    // Log admin action as per SECURITY_DEFAULTS
    console.info(`[API-ADMIN-KONTEN-WEB] Admin ${admin.email} successfully updated web content.`)

    return NextResponse.json({
      status: 'success',
      data: updatedContent,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-KONTEN-WEB] PUT error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk mengubah konten web ini.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memperbarui konten web di database.',
        diagnostics: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
