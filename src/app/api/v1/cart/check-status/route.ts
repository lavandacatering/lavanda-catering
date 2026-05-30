import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

interface RequestItem {
  id: string
  type: 'menu' | 'paket'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const requestItems: RequestItem[] = body.items || []

    if (!Array.isArray(requestItems)) {
      return NextResponse.json(
        { status: 'error', code: 'INVALID_INPUT', message: 'Item list must be an array.' },
        { status: 400 }
      )
    }

    const menuIds = requestItems.filter((it) => it.type === 'menu').map((it) => it.id)
    const paketIds = requestItems.filter((it) => it.type === 'paket').map((it) => it.id)

    const [menus, pakets] = await Promise.all([
      menuIds.length > 0
        ? prisma.menu.findMany({
            where: {
              id: { in: menuIds },
              deleted_at: null,
            },
            select: { id: true, nama: true, status: true },
          })
        : [],
      paketIds.length > 0
        ? prisma.paket.findMany({
            where: {
              id: { in: paketIds },
              deleted_at: null,
            },
            select: { id: true, nama: true, status: true },
          })
        : [],
    ])

    const results: Record<string, { nama: string; active: boolean; exists: boolean }> = {}

    // Process menus
    const menuMap = new Map(menus.map((m) => [m.id, m]))
    for (const id of menuIds) {
      const match = menuMap.get(id)
      if (match) {
        results[id] = {
          nama: match.nama,
          active: match.status === 'aktif',
          exists: true,
        }
      } else {
        results[id] = {
          nama: 'Item tidak dikenal',
          active: false,
          exists: false,
        }
      }
    }

    // Process pakets
    const paketMap = new Map(pakets.map((p) => [p.id, p]))
    for (const id of paketIds) {
      const match = paketMap.get(id)
      if (match) {
        results[id] = {
          nama: match.nama,
          active: match.status === 'aktif',
          exists: true,
        }
      } else {
        results[id] = {
          nama: 'Paket tidak dikenal',
          active: false,
          exists: false,
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      data: results,
    })
  } catch (error) {
    console.error('[API] POST /api/v1/cart/check-status error:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'SERVER_ERROR',
        message: 'Gagal melakukan verifikasi status menu.',
      },
      { status: 500 }
    )
  }
}
