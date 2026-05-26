/**
 * API-02: GET /api/v1/menu/[id]
 * Detail menu by ID publik
 * Include: kategori + menu_lainnya (same kategori, max 4, exclude current)
 *
 * BC3: Async dynamic params (wajib Next.js 16)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { status: 'error', code: 'INVALID_ID', message: 'ID menu tidak valid.', errors: [] },
      { status: 400 }
    )
  }

  try {
    const menu = await prisma.menu.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        kategori: {
          select: { id: true, nama: true, urutan: true },
        },
      },
    })

    if (!menu) {
      return NextResponse.json(
        { status: 'error', code: 'NOT_FOUND', message: 'Menu tidak ditemukan.', errors: [] },
        { status: 404 }
      )
    }

    // Fetch menu lainnya — same kategori, exclude current, max 4, status aktif
    let menuLainnya = await prisma.menu.findMany({
      where: {
        kategori_id: menu.kategori_id,
        id: { not: id },
        status: 'aktif',
        deleted_at: null,
      },
      include: {
        kategori: {
          select: { id: true, nama: true },
        },
      },
      orderBy: { urutan_dalam_kategori: 'asc' },
      take: 4,
    })

    // Fallback: Jika tidak ada menu di kategori yang sama, ambil menu dari kategori lain agar rekomendasi tidak kosong
    if (menuLainnya.length === 0) {
      menuLainnya = await prisma.menu.findMany({
        where: {
          id: { not: id },
          status: 'aktif',
          deleted_at: null,
        },
        include: {
          kategori: {
            select: { id: true, nama: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 4,
      })
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
        urutan_dalam_kategori: menu.urutan_dalam_kategori,
        kategori: menu.kategori,
        created_at: menu.created_at,
        updated_at: menu.updated_at,
        menu_lainnya: menuLainnya.map((m) => ({
          id: m.id,
          nama: m.nama,
          harga: parseFloat(m.harga.toString()),
          foto_url: m.foto_url,
          min_porsi: m.min_porsi,
          kategori: m.kategori,
        })),
      },
    })
  } catch (error) {
    console.error(`[API-02] GET /api/v1/menu/${id} error:`, error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memuat detail menu. Coba refresh halaman.',
        errors: [],
      },
      { status: 500 }
    )
  }
}
