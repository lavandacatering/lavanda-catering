/**
 * API-04: GET /api/v1/paket/[id]
 * Detail paket publik — filter status='aktif' dan deleted_at IS NULL
 *
 * BC3: async params
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const item = await prisma.paket.findFirst({
      where: {
        id,
        status: 'aktif',
        deleted_at: null,
      },
      include: {
        paket_items: {
          include: {
            menu: {
              select: {
                id: true,
                nama: true,
                harga: true,
                foto_url: true,
                deskripsi: true,
              },
            },
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Paket tidak ditemukan.',
          errors: [],
        },
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
                foto_url: pi.menu.foto_url,
                deskripsi: pi.menu.deskripsi,
              }
            : null,
        })),
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
    })
  } catch (error) {
    console.error(`[API-04] GET /api/v1/paket/${id} error:`, error)
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
