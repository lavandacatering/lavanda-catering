import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

// PATCH /api/v1/admin/testimoni/[id] — Update status testimoni (Admin Only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // BC3: Semua dynamic route params wajib async/await
  const { id } = await params

  console.log(`[API-ADMIN-TESTIMONI-DETAIL] Admin updating status of testimonial: ${id}`)

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

    const { status } = body

    // Validate status values
    const VALID_STATUSES = ['pending', 'approved', 'rejected', 'hidden']
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: `Status tidak valid. Hanya menerima: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 422 }
      )
    }

    // Check if the testimonial exists in the DB
    const existingTestimonial = await prisma.testimoni.findUnique({
      where: { id },
    })

    if (!existingTestimonial) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Testimoni tidak ditemukan.',
        },
        { status: 404 }
      )
    }

    // 2. Perform database update
    const updatedTestimonial = await prisma.testimoni.update({
      where: { id },
      data: {
        status,
        approved_by: status === 'approved' ? admin.email : undefined,
      },
    })

    // Log administrative action (SECURITY_DEFAULTS requirement)
    console.info(
      `[API-ADMIN-TESTIMONI-DETAIL] Admin ${admin.email} successfully updated testimonial ${id} status to ${status}.`
    )

    return NextResponse.json({
      status: 'success',
      data: updatedTestimonial,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-TESTIMONI-DETAIL] PATCH error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk mengubah status testimoni.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memperbarui status testimoni di database.',
        diagnostics: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
