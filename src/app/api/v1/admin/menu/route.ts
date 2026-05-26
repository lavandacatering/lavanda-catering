/**
 * API-20: GET /api/v1/admin/menu — list semua menu (termasuk nonaktif, admin view)
 * API-21: POST /api/v1/admin/menu — buat menu baru
 *
 * Auth: checkAdminAuth() (double auth check — BC1)
 * TASK-036: revalidateTag setelah write
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// API-20: GET list menu untuk admin (include deleted optional, status filter)
export async function GET(request: NextRequest) {
  try {
    await checkAdminAuth()
  } catch {
    return NextResponse.json(
      { status: 'error', code: 'UNAUTHORIZED', message: 'Akses ditolak.', errors: [] },
      { status: 401 }
    )
  }

  const { searchParams } = request.nextUrl
  const includeDeleted = searchParams.get('include_deleted') === 'true'
  const search = searchParams.get('search') ?? ''
  const kategori = searchParams.get('kategori') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') ?? '50', 10)))

  try {
    const where = {
      ...(includeDeleted ? {} : { deleted_at: null }),
      ...(search ? { nama: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(kategori && kategori !== 'Semua' ? { kategori: { nama: kategori } } : {}),
    }

    const [total, menu] = await Promise.all([
      prisma.menu.count({ where }),
      prisma.menu.findMany({
        where,
        include: {
          kategori: { select: { id: true, nama: true } },
        },
        orderBy: [{ kategori_id: 'asc' }, { urutan_dalam_kategori: 'asc' }, { created_at: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    return NextResponse.json({
      status: 'success',
      data: menu.map((item) => ({
        id: item.id,
        nama: item.nama,
        deskripsi: item.deskripsi,
        harga: parseFloat(item.harga.toString()),
        foto_url: item.foto_url,
        status: item.status,
        min_porsi: item.min_porsi,
        urutan_dalam_kategori: item.urutan_dalam_kategori,
        kategori: item.kategori,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at,
      })),
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error('[API-20] GET /api/v1/admin/menu error:', error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal memuat daftar menu.', errors: [] },
      { status: 500 }
    )
  }
}

// API-21: POST buat menu baru
export async function POST(request: NextRequest) {
  let adminSession
  try {
    adminSession = await checkAdminAuth()
  } catch {
    return NextResponse.json(
      { status: 'error', code: 'UNAUTHORIZED', message: 'Akses ditolak.', errors: [] },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { nama, kategori_id, harga, deskripsi, min_porsi, status, urutan_dalam_kategori } = body

    // Validasi field wajib
    const errors: { field: string; message: string }[] = []
    if (!nama || typeof nama !== 'string' || nama.trim().length < 2) {
      errors.push({ field: 'nama', message: 'Nama menu minimal 2 karakter.' })
    }
    if (!kategori_id || typeof kategori_id !== 'string') {
      errors.push({ field: 'kategori_id', message: 'Kategori wajib dipilih.' })
    }
    const hargaNum = parseFloat(harga)
    if (!harga || isNaN(hargaNum) || hargaNum <= 0) {
      errors.push({ field: 'harga', message: 'Harga harus lebih dari 0.' })
    }
    const minPorsiNum = parseInt(min_porsi, 10)
    if (!min_porsi || isNaN(minPorsiNum) || minPorsiNum <= 0) {
      errors.push({ field: 'min_porsi', message: 'Minimum porsi harus lebih dari 0.' })
    }
    if (status && !['aktif', 'nonaktif'].includes(status)) {
      errors.push({ field: 'status', message: 'Status tidak valid.' })
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { status: 'error', code: 'VALIDATION_ERROR', message: 'Data tidak valid.', errors },
        { status: 422 }
      )
    }

    // Verifikasi kategori_id ada
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

    const menu = await prisma.menu.create({
      data: {
        nama: nama.trim(),
        kategori_id,
        harga: hargaNum,
        deskripsi: deskripsi?.trim() ?? null,
        min_porsi: minPorsiNum,
        status: status ?? 'aktif',
        urutan_dalam_kategori: parseInt(urutan_dalam_kategori, 10) || 0,
      },
      include: {
        kategori: { select: { id: true, nama: true } },
      },
    })

    // Log aksi admin (SECURITY_DEFAULTS)
    console.info(`[API-21] Admin ${adminSession.email} created menu: ${menu.id} — ${menu.nama}`)

    // TASK-036: Revalidate cache setelah create
    // BC6: 2 argumen wajib — ARCHITECTURE.md
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('menu-list', 'max')

    return NextResponse.json(
      {
        status: 'success',
        data: {
          id: menu.id,
          nama: menu.nama,
          harga: parseFloat(menu.harga.toString()),
          foto_url: menu.foto_url,
          status: menu.status,
          min_porsi: menu.min_porsi,
          kategori: menu.kategori,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API-21] POST /api/v1/admin/menu error:', error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal membuat menu.', errors: [] },
      { status: 500 }
    )
  }
}
