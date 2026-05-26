/**
 * API-22: PUT /api/v1/admin/menu/[id] — update menu
 * API-23: DELETE /api/v1/admin/menu/[id] — soft delete menu
 *
 * BC3: async params
 * Auth: checkAdminAuth()
 * TASK-036: revalidateTag setelah write
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// API-20B: GET menu detail by ID (admin view)
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
    const menu = await prisma.menu.findFirst({
      where: { id, deleted_at: null },
      include: {
        kategori: { select: { id: true, nama: true } },
      },
    })

    if (!menu) {
      return NextResponse.json(
        { status: 'error', code: 'NOT_FOUND', message: 'Menu tidak ditemukan.', errors: [] },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: {
        id: menu.id,
        nama: menu.nama,
        deskripsi: menu.deskripsi,
        harga: parseFloat(menu.harga.toString()),
        foto_url: menu.foto_url,
        status: menu.status,
        min_porsi: menu.min_porsi,
        kategori: menu.kategori,
        urutan_dalam_kategori: menu.urutan_dalam_kategori,
        created_at: menu.created_at,
        updated_at: menu.updated_at,
      },
    })
  } catch (error) {
    console.error(`[API-20B] GET /api/v1/admin/menu/${id} error:`, error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal memuat data menu.', errors: [] },
      { status: 500 }
    )
  }
}

// API-22: PUT update menu by ID
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
    // Cek menu ada dan belum deleted
    const existing = await prisma.menu.findFirst({
      where: { id, deleted_at: null },
    })
    if (!existing) {
      return NextResponse.json(
        { status: 'error', code: 'NOT_FOUND', message: 'Menu tidak ditemukan.', errors: [] },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      nama,
      kategori_id,
      harga,
      deskripsi,
      min_porsi,
      status,
      urutan_dalam_kategori,
      foto_url,
    } = body

    // Validasi field yang diberikan
    const errors: { field: string; message: string }[] = []
    if (nama !== undefined && (typeof nama !== 'string' || nama.trim().length < 2)) {
      errors.push({ field: 'nama', message: 'Nama menu minimal 2 karakter.' })
    }
    if (harga !== undefined) {
      const hargaNum = parseFloat(harga)
      if (isNaN(hargaNum) || hargaNum <= 0) {
        errors.push({ field: 'harga', message: 'Harga harus lebih dari 0.' })
      }
    }
    if (min_porsi !== undefined) {
      const minPorsiNum = parseInt(min_porsi, 10)
      if (isNaN(minPorsiNum) || minPorsiNum <= 0) {
        errors.push({ field: 'min_porsi', message: 'Minimum porsi harus lebih dari 0.' })
      }
    }
    if (status !== undefined && !['aktif', 'nonaktif'].includes(status)) {
      errors.push({ field: 'status', message: 'Status tidak valid.' })
    }
    if (errors.length > 0) {
      return NextResponse.json(
        { status: 'error', code: 'VALIDATION_ERROR', message: 'Data tidak valid.', errors },
        { status: 422 }
      )
    }

    // Verifikasi kategori jika diubah
    if (kategori_id && kategori_id !== existing.kategori_id) {
      const kategori = await prisma.kategori.findFirst({
        where: { id: kategori_id, is_active: true },
      })
      if (!kategori) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Kategori tidak ditemukan.',
            errors: [{ field: 'kategori_id', message: 'Kategori tidak ditemukan.' }],
          },
          { status: 422 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (nama !== undefined) updateData.nama = nama.trim()
    if (kategori_id !== undefined) updateData.kategori_id = kategori_id
    if (harga !== undefined) updateData.harga = parseFloat(harga)
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi?.trim() ?? null
    if (min_porsi !== undefined) updateData.min_porsi = parseInt(min_porsi, 10)
    if (status !== undefined) updateData.status = status
    if (foto_url !== undefined) updateData.foto_url = foto_url
    if (urutan_dalam_kategori !== undefined)
      updateData.urutan_dalam_kategori = parseInt(urutan_dalam_kategori, 10) || 0

    const updated = await prisma.menu.update({
      where: { id },
      data: updateData,
      include: {
        kategori: { select: { id: true, nama: true } },
      },
    })

    console.info(`[API-22] Admin ${adminSession.email} updated menu: ${id} — ${updated.nama}`)

    // TASK-036: Revalidate cache
    // BC6: 2 argumen wajib — ARCHITECTURE.md
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('menu-list', 'max')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)(`menu-${id}`, 'max')

    return NextResponse.json({
      status: 'success',
      data: {
        id: updated.id,
        nama: updated.nama,
        harga: parseFloat(updated.harga.toString()),
        foto_url: updated.foto_url,
        status: updated.status,
        min_porsi: updated.min_porsi,
        kategori: updated.kategori,
        updated_at: updated.updated_at,
      },
    })
  } catch (error) {
    console.error(`[API-22] PUT /api/v1/admin/menu/${id} error:`, error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal mengupdate menu.', errors: [] },
      { status: 500 }
    )
  }
}

// API-23: DELETE soft delete menu
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
    const existing = await prisma.menu.findFirst({
      where: { id, deleted_at: null },
    })
    if (!existing) {
      return NextResponse.json(
        { status: 'error', code: 'NOT_FOUND', message: 'Menu tidak ditemukan.', errors: [] },
        { status: 404 }
      )
    }

    // Soft delete: set deleted_at = now()
    await prisma.menu.update({
      where: { id },
      data: { deleted_at: new Date() },
    })

    console.info(`[API-23] Admin ${adminSession.email} soft-deleted menu: ${id} — ${existing.nama}`)

    // TASK-036: Revalidate cache
    // BC6: 2 argumen wajib — ARCHITECTURE.md
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('menu-list', 'max')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)(`menu-${id}`, 'max')

    return NextResponse.json({
      status: 'success',
      data: { id, deleted: true },
    })
  } catch (error) {
    console.error(`[API-23] DELETE /api/v1/admin/menu/${id} error:`, error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal menghapus menu.', errors: [] },
      { status: 500 }
    )
  }
}
