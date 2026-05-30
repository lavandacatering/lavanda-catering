/**
 * API-03: GET /api/v1/paket
 * List paket publik — filter status='aktif' dan deleted_at IS NULL
 *
 * Query params:
 *   page        integer default 1
 *   per_page    integer default 20 max 50
 *   search      string  full-text search pada nama paket
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') ?? '20', 10)))
  const search = searchParams.get('search') ?? ''

  try {
    const where = {
      deleted_at: null,
      status: 'aktif',
      ...(search
        ? {
            nama: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    }

    const [total, paket] = await Promise.all([
      prisma.paket.count({ where }),
      prisma.paket.findMany({
        where,
        include: {
          paket_items: {
            include: {
              menu: {
                select: {
                  id: true,
                  nama: true,
                  harga: true,
                  foto_url: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    const totalPages = Math.ceil(total / perPage)

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
                foto_url: pi.menu.foto_url,
              }
            : null,
        })),
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
    console.error('[API-03] GET /api/v1/paket error:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memuat daftar paket. Coba lagi.',
        errors: [],
      },
      { status: 500 }
    )
  }
}
