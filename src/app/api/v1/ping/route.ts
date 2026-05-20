/**
 * src/app/api/v1/ping/route.ts
 *
 * GET /api/v1/ping
 * Anti-idle Supabase Endpoint (TASK-018)
 *
 * Mengakses DB untuk menjaga database tetap aktif di Supabase free tier.
 * Dilindungi menggunakan ANTI_IDLE_SECRET dari serverEnv.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serverEnv } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil secret dari header atau query parameter
    const authHeader = request.headers.get('Authorization')
    const querySecret = request.nextUrl.searchParams.get('secret')

    let providedSecret = ''

    if (authHeader && authHeader.startsWith('Bearer ')) {
      providedSecret = authHeader.substring(7)
    } else if (querySecret) {
      providedSecret = querySecret
    }

    // 2. Validasi secret
    const expectedSecret = serverEnv.antiIdleSecret

    if (!expectedSecret) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'SERVER_CONFIG_ERROR',
          message: 'Server belum dikonfigurasi dengan benar.',
        },
        { status: 500 }
      )
    }

    if (providedSecret !== expectedSecret) {
      // SECURITY_DEFAULTS: Log gagal login/akses tanpa mengekspos detail token
      const clientIp =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      console.warn(`[API-PING] Unauthorized ping attempt from IP: ${clientIp}`)

      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Akses ditolak. Token tidak valid.',
        },
        { status: 401 }
      )
    }

    // 3. Query database (anti-idle activity)
    // Melakukan select kategori pertama untuk memastikan database koneksi aktif
    const dbCheck = await prisma.kategori.findFirst({
      select: {
        id: true,
      },
    })

    return NextResponse.json(
      {
        status: 'success',
        data: {
          ping: 'pong',
          database: dbCheck ? 'connected' : 'empty_but_connected',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('[API-PING] Error during ping endpoint execution:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Koneksi database gagal atau tidak stabil.',
        details: {
          message: errorMessage,
          stack: errorStack,
        },
      },
      { status: 500 }
    )
  }
}
