/**
 * GET /api/v1/kategori
 * List semua kategori aktif untuk filter chip di halaman /menu
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      where: { is_active: true },
      orderBy: { urutan: 'asc' },
      select: {
        id: true,
        nama: true,
        urutan: true,
      },
    })

    return NextResponse.json({
      status: 'success',
      data: kategori,
    })
  } catch (error) {
    console.error('[API-KATEGORI] GET /api/v1/kategori error:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Gagal memuat daftar kategori.',
        errors: [],
      },
      { status: 500 }
    )
  }
}
