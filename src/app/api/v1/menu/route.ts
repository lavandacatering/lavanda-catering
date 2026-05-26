/**
 * API-01: GET /api/v1/menu
 * List menu publik — filter kategori, search, pagination
 * Hanya tampilkan status='aktif' dan deleted_at IS NULL
 *
 * Query params:
 *   page        integer default 1
 *   per_page    integer default 20 max 50
 *   kategori    string  filter by kategori.nama
 *   search      string  full-text search pada nama menu
 *   status      string  default 'aktif' (admin bisa kirim 'semua')
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') ?? '20', 10)))
  const kategori = searchParams.get('kategori') ?? ''
  const search = searchParams.get('search') ?? ''
  const statusFilter = searchParams.get('status') ?? 'aktif'

  try {
    const where = {
      deleted_at: null,
      // Status filter: kalau 'semua' tidak filter status (untuk admin), default 'aktif'
      ...(statusFilter !== 'semua' ? { status: statusFilter } : {}),
      // Filter by kategori name
      ...(kategori && kategori !== 'Semua'
        ? {
            kategori: {
              nama: kategori,
            },
          }
        : {}),
      // Full text search pada nama (case-insensitive)
      ...(search
        ? {
            nama: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    }

    const [total, menu] = await Promise.all([
      prisma.menu.count({ where }),
      prisma.menu.findMany({
        where,
        include: {
          kategori: {
            select: { id: true, nama: true, urutan: true },
          },
        },
        orderBy: [{ urutan_dalam_kategori: 'asc' }, { created_at: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    const totalPages = Math.ceil(total / perPage)

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
      })),
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
      },
    })
  } catch (error) {
    console.error('[API-01] GET /api/v1/menu error:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memuat daftar menu. Coba lagi.',
        errors: [],
      },
      { status: 500 }
    )
  }
}
