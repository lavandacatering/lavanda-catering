/**
 * API-25: GET /api/v1/admin/paket — list semua paket (admin view)
 * API-26: POST /api/v1/admin/paket — buat paket baru
 *
 * Auth: checkAdminAuth()
 * Revalidate tag 'paket-list' setelah write
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// API-25: GET list paket untuk admin
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
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') ?? '50', 10)))

  try {
    const where = {
      ...(includeDeleted ? {} : { deleted_at: null }),
      ...(search ? { nama: { contains: search, mode: 'insensitive' as const } } : {}),
    }

    const [total, paket] = await Promise.all([
      prisma.paket.count({ where }),
      prisma.paket.findMany({
        where,
        include: {
          paket_items: {
            include: {
              menu: {
                select: { id: true, nama: true, harga: true },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    return NextResponse.json({
      status: 'success',
      data: paket.map((item) => ({
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
    console.error('[API-25] GET /api/v1/admin/paket error:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memuat daftar paket.',
        errors: [],
      },
      { status: 500 }
    )
  }
}

// API-26: POST buat paket baru
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
    const { nama, subtitle, deskripsi, harga, min_order, status, foto_url, items } = body

    const errors: { field: string; message: string }[] = []
    if (!nama || typeof nama !== 'string' || nama.trim().length < 3) {
      errors.push({ field: 'nama', message: 'Nama paket minimal 3 karakter.' })
    }
    const hargaNum = parseFloat(harga)
    if (isNaN(hargaNum) || hargaNum <= 0) {
      errors.push({ field: 'harga', message: 'Harga paket harus lebih dari 0.' })
    }
    const minOrderNum = parseInt(min_order, 10)
    if (isNaN(minOrderNum) || minOrderNum <= 0) {
      errors.push({ field: 'min_order', message: 'Minimum order harus lebih dari 0.' })
    }
    if (status && !['aktif', 'nonaktif'].includes(status)) {
      errors.push({ field: 'status', message: 'Status tidak valid.' })
    }
    if (!Array.isArray(items) || items.length < 1 || items.length > 10) {
      errors.push({ field: 'items', message: 'Paket harus memiliki 1 - 10 item menu.' })
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { status: 'error', code: 'VALIDATION_ERROR', message: 'Data tidak valid.', errors },
        { status: 422 }
      )
    }

    // Buat paket beserta items-nya menggunakan Prisma transaction
    const newPaket = await prisma.$transaction(async (tx) => {
      const created = await tx.paket.create({
        data: {
          nama: nama.trim(),
          subtitle: subtitle?.trim() ?? null,
          deskripsi: deskripsi?.trim() ?? null,
          harga: hargaNum,
          min_order: minOrderNum,
          status: status ?? 'aktif',
          foto_url: foto_url || null,
        },
      })

      // Insert paket_items
      for (const item of items) {
        await tx.paket_items.create({
          data: {
            paket_id: created.id,
            menu_id: item.menu_id,
            keterangan: item.keterangan?.trim() ?? null,
            porsi_per_paket: parseInt(item.porsi_per_paket, 10) || 1,
          },
        })
      }

      return tx.paket.findUnique({
        where: { id: created.id },
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
      `[API-26] Admin ${adminSession.email} created package: ${newPaket?.id} — ${newPaket?.nama}`
    )

    // Revalidate tag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('paket-list', 'max')

    return NextResponse.json(
      {
        status: 'success',
        data: {
          id: newPaket?.id,
          nama: newPaket?.nama,
          harga: newPaket ? parseFloat(newPaket.harga.toString()) : 0,
          status: newPaket?.status,
          min_order: newPaket?.min_order,
          paket_items: newPaket?.paket_items.map((pi) => ({
            id: pi.id,
            menu: pi.menu,
          })),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API-26] POST /api/v1/admin/paket error:', error)
    return NextResponse.json(
      { status: 'error', code: 'DATABASE_ERROR', message: 'Gagal membuat paket.', errors: [] },
      { status: 500 }
    )
  }
}
