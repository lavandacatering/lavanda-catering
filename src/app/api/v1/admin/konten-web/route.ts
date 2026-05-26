import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'
import { Prisma } from '@/generated/prisma'

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

// ---------------------------------------------------------------------------
// Helpers: deep-merge utilities to prevent overwriting existing data with empties
// ---------------------------------------------------------------------------

/** Merge two plain objects; incoming non-empty values win, but empty strings / null / undefined are ignored.
 *  Returns undefined if both inputs are empty (Prisma treats undefined as "skip field"). */
function mergeObject<T extends Record<string, unknown>>(
  existing: T | null | undefined,
  incoming: T | null | undefined
): T | undefined {
  if (!incoming) return (existing ?? undefined) as T | undefined
  if (!existing) return incoming
  const merged = { ...existing } as Record<string, unknown>
  for (const [key, val] of Object.entries(incoming)) {
    // Only overwrite if the incoming value is non-empty
    if (val !== null && val !== undefined && val !== '') {
      merged[key] = val
    }
  }
  return merged as T
}

/** For arrays (keunggulan, galeri): replace only if incoming is a non-empty array.
 *  Returns undefined if both inputs are empty (Prisma treats undefined as "skip field"). */
function mergeArray<T>(
  existing: T[] | null | undefined,
  incoming: T[] | null | undefined
): T[] | undefined {
  if (Array.isArray(incoming) && incoming.length > 0) return incoming
  return (existing ?? undefined) as T[] | undefined
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

    // 2. Read existing content from DB for server-side merge
    const existing = await prisma.konten_web.findUnique({
      where: { key: 'main' },
    })

    // 3. Deep-merge each section: incoming non-empty values win,
    //    empty/null incoming values are ignored so existing data is preserved
    const mergedHero = mergeObject(
      existing?.konten_hero as Record<string, unknown> | null,
      konten_hero as Record<string, unknown> | null
    )
    const mergedTentang = mergeObject(
      existing?.tentang_kami as Record<string, unknown> | null,
      tentang_kami as Record<string, unknown> | null
    )
    const mergedKeunggulan = mergeArray(
      existing?.keunggulan as Record<string, unknown>[] | null,
      keunggulan as Record<string, unknown>[] | null
    )
    const mergedGaleri =
      galeri !== undefined
        ? galeri // Galeri supports intentional empty (user deleted all photos)
        : (existing?.galeri ?? [])
    const mergedKontak = mergeObject(
      existing?.kontak as Record<string, unknown> | null,
      kontak as Record<string, unknown> | null
    )

    // 4. Upsert the web content with merged data
    const updatedContent = await prisma.konten_web.upsert({
      where: { key: 'main' },
      update: {
        konten_hero: mergedHero as Prisma.InputJsonValue,
        tentang_kami: mergedTentang as Prisma.InputJsonValue,
        keunggulan: mergedKeunggulan as Prisma.InputJsonValue,
        galeri: mergedGaleri as Prisma.InputJsonValue,
        kontak: mergedKontak as Prisma.InputJsonValue,
        updated_by: admin.email,
      },
      create: {
        key: 'main',
        konten_hero: (mergedHero ?? undefined) as Prisma.InputJsonValue | undefined,
        tentang_kami: (mergedTentang ?? undefined) as Prisma.InputJsonValue | undefined,
        keunggulan: (mergedKeunggulan ?? undefined) as Prisma.InputJsonValue | undefined,
        galeri: (mergedGaleri ?? []) as Prisma.InputJsonValue,
        kontak: (mergedKontak ?? undefined) as Prisma.InputJsonValue | undefined,
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
