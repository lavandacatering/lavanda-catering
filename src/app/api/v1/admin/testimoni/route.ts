import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

// GET /api/v1/admin/testimoni — Ambil semua testimoni (Admin Only)
export async function GET(request: NextRequest) {
  console.log('[API-ADMIN-TESTIMONI] Admin fetching testimonials...')

  try {
    // 1. Double auth check (BC1 + SECURITY_DEFAULTS)
    await checkAdminAuth()

    const searchParams = request.nextUrl.searchParams
    const statusFilter = searchParams.get('status') // pending | approved | rejected | hidden

    const whereClause: { status?: string } = {}
    if (statusFilter) {
      whereClause.status = statusFilter
    }

    const testimonials = await prisma.testimoni.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({
      status: 'success',
      data: testimonials,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-TESTIMONI] GET error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk melihat daftar testimoni.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal mengambil daftar testimoni.',
        diagnostics: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/testimoni — Tambah testimoni manual (Admin Only)
export async function POST(request: NextRequest) {
  console.log('[API-ADMIN-TESTIMONI] Admin creating manual testimonial...')

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

    const { nama, peran, teks, rating, foto_url } = body

    // Server-side validation as per ARCHITECTURE.md B5c page specs
    if (!nama || typeof nama !== 'string' || nama.trim().length < 3) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Nama wajib diisi minimal 3 karakter.',
        },
        { status: 422 }
      )
    }

    if (!teks || typeof teks !== 'string' || teks.trim().length === 0 || teks.length > 500) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Teks ulasan wajib diisi maksimal 500 karakter.',
        },
        { status: 422 }
      )
    }

    const ratingVal = Number(rating)
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Rating wajib berupa angka bernilai antara 1 sampai 5.',
        },
        { status: 422 }
      )
    }

    // 2. Create database row
    const testimonial = await prisma.testimoni.create({
      data: {
        sumber: 'admin',
        nama: nama.trim(),
        peran: peran ? peran.trim() : null,
        teks: teks.trim(),
        rating: ratingVal,
        foto_url: fotoUrlOrNull(foto_url),
        status: 'approved', // Manual input from admin is auto-approved
        created_by: admin.email,
      },
    })

    // Log administrative action (SECURITY_DEFAULTS requirement)
    console.info(
      `[API-ADMIN-TESTIMONI] Admin ${admin.email} successfully created testimonial ID: ${testimonial.id}`
    )

    return NextResponse.json({
      status: 'success',
      data: testimonial,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-TESTIMONI] POST error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk menambah testimoni.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal menambahkan testimoni ke database.',
        diagnostics: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  }
}

function fotoUrlOrNull(url: unknown): string | null {
  if (typeof url === 'string' && url.trim().length > 0) {
    return url.trim()
  }
  return null
}

export const dynamic = 'force-dynamic'
export const runtime = 'edge'
