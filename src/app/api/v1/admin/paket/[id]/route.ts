/**
 * API-27: PUT /api/v1/admin/paket/[id] — update paket
 * API-28: DELETE /api/v1/admin/paket/[id] — soft delete paket
 *
 * Auth: checkAdminAuth()
 * BC3: async params
 * Revalidate tag 'paket-list' setelah write
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// GET detail paket (admin view)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAdminAuth()
  } catch {
    return NextResponse.json(
      { status: 'error', code: 'UNAUTHORIZED', message: 'Akses ditolak.', errors: [] },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const item = await prisma.paket.findFirst({
      where: { id, deleted_at: null },
      include: {
        paket_items: {
          include: {
            menu: { select: { id: true, nama: true, harga: true } },
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { status: 'error', code: 'NOT_FOUND', message: 'Paket tidak ditemukan.', errors: [] },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: {
        id: item.id,
        nama: item.nama,
        subtitle: item.subtitle,
        deskripsi: item.deskripsi,
        harga: parseFloat(item.harga.toString()),
        foto_url: item.foto_url,
        min_order: item.min_order,
        status: item.status,
        paket_items: item.paket_items.map((pi) => ({
          id: pi.id,
          keterangan: pi.keterangan,
          porsi_per_paket: pi.porsi_per_paket,
          menu: pi.menu
            ? {
                id: pi.menu.id,
                nama: pi.menu.nama,
                harga: parseFloat(pi.menu.harga.toString()),
              }
            : null,
        })),
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
    })
  } catch (error) {
    console.error(`[API-27-GET] GET /api/v1/admin/paket/${id} error:`, error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memuat detail paket.',
        errors: [],
      },
      { status: 500 }
    )
  }
}

// API-27: PUT update paket
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let adminSession
  try {
    adminSession = await checkAdminAuth()
  } catch {
    return NextResponse.json(
      { status: 'error', code: 'UNAUTHORIZED', message: 'Akses ditolak.', errors: [] },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const existing = await prisma.paket.findFirst({
      where: { id, deleted_at: null },
    })

    if (!existing) {
      return NextResponse.json(
        { status: 'error', code: 'NOT_FOUND', message: 'Paket tidak ditemukan.', errors: [] },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { nama, subtitle, deskripsi, harga, min_order, status, foto_url, items } = body

    const errors: { field: string; message: string }[] = []
    if (nama !== undefined && (typeof nama !== 'string' || nama.trim().length < 3)) {
      errors.push({ field: 'nama', message: 'Nama paket minimal 3 karakter.' })
    }
    if (harga !== undefined) {
      const hargaNum = parseFloat(harga)
      if (isNaN(hargaNum) || hargaNum <= 0) {
        errors.push({ field: 'harga', message: 'Harga paket harus lebih dari 0.' })
      }
    }
    if (min_order !== undefined) {
      const minOrderNum = parseInt(min_order, 10)
      if (isNaN(minOrderNum) || minOrderNum <= 0) {
        errors.push({ field: 'min_order', message: 'Minimum order harus lebih dari 0.' })
      }
    }
    if (status !== undefined && !['aktif', 'nonaktif'].includes(status)) {
      errors.push({ field: 'status', message: 'Status tidak valid.' })
    }
    if (items !== undefined && (!Array.isArray(items) || items.length < 1 || items.length > 10)) {
      errors.push({ field: 'items', message: 'Paket harus memiliki 1 - 10 item menu.' })
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { status: 'error', code: 'VALIDATION_ERROR', message: 'Data tidak valid.', errors },
        { status: 422 }
      )
    }

    const updatedPaket = await prisma.$transaction(async (tx) => {
      // Update basic fields
      const updateData: Record<string, unknown> = {}
      if (nama !== undefined) updateData.nama = nama.trim()
      if (subtitle !== undefined) updateData.subtitle = subtitle?.trim() ?? null
      if (deskripsi !== undefined) updateData.deskripsi = deskripsi?.trim() ?? null
      if (harga !== undefined) updateData.harga = parseFloat(harga)
      if (min_order !== undefined) updateData.min_order = parseInt(min_order, 10)
      if (status !== undefined) updateData.status = status
      if (foto_url !== undefined) updateData.foto_url = foto_url

      await tx.paket.update({
        where: { id },
        data: updateData,
      })

      // If items are provided, replace existing items
      if (items !== undefined) {
        // Delete all old items
        await tx.paket_items.deleteMany({
          where: { paket_id: id },
        })

        // Insert new ones
        for (const item of items) {
          await tx.paket_items.create({
            data: {
              paket_id: id,
              menu_id: item.menu_id,
              keterangan: item.keterangan?.trim() ?? null,
              porsi_per_paket: parseInt(item.porsi_per_paket, 10) || 1,
            },
          })
        }
      }

      return tx.paket.findUnique({
        where: { id },
        include: {
          paket_items: {
            include: {
              menu: { select: { id: true, nama: true } },
            },
          },
        },
      })
    })

    console.info(
      `[API-27] Admin ${adminSession.email} updated package: ${id} — ${updatedPaket?.nama}`
    )

    // Revalidate tags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('paket-list', 'max')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)(`paket-${id}`, 'max')

    return NextResponse.json({
      status: 'success',
      data: {
        id: updatedPaket?.id,
        nama: updatedPaket?.nama,
        harga: updatedPaket ? parseFloat(updatedPaket.harga.toString()) : 0,
        status: updatedPaket?.status,
        min_order: updatedPaket?.min_order,
        updated_at: updatedPaket?.updated_at,
      },
    })
  } catch (error) {
    console.error(`[API-27] PUT /api/v1/admin/paket/${id} error:`, error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal mengupdate paket.', errors: [] },
      { status: 500 }
    )
  }
}

// API-28: DELETE soft delete paket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminSession
  try {
    adminSession = await checkAdminAuth()
  } catch {
    return NextResponse.json(
      { status: 'error', code: 'UNAUTHORIZED', message: 'Akses ditolak.', errors: [] },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const existing = await prisma.paket.findFirst({
      where: { id, deleted_at: null },
    })

    if (!existing) {
      return NextResponse.json(
        { status: 'error', code: 'NOT_FOUND', message: 'Paket tidak ditemukan.', errors: [] },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.paket.update({
      where: { id },
      data: { deleted_at: new Date() },
    })

    console.info(
      `[API-28] Admin ${adminSession.email} soft-deleted package: ${id} — ${existing.nama}`
    )

    // Revalidate tags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('paket-list', 'max')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)(`paket-${id}`, 'max')

    return NextResponse.json({
      status: 'success',
      data: { id, deleted: true },
    })
  } catch (error) {
    console.error(`[API-28] DELETE /api/v1/admin/paket/${id} error:`, error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal menghapus paket.', errors: [] },
      { status: 500 }
    )
  }
}
