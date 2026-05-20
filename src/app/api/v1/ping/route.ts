/**
 * src/app/api/v1/ping/route.ts
 *
 * GET /api/v1/ping
 * Anti-idle Supabase Endpoint (TASK-018)
 *
 * Mengakses DB untuk menjaga database tetap aktif di Supabase free tier.
 * Dilindungi menggunakan ANTI_IDLE_SECRET dari serverEnv.
 *
 * Menggunakan @supabase/supabase-js (bukan Prisma) agar kompatibel 100% dengan
 * lingkungan Cloudflare Pages Edge Runtime tanpa native Rust binary crash.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { serverEnv } from '@/lib/env'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // Ambil data untuk diagnosa lingkungan (tanpa membocorkan nilai rahasia)
  const envDiagnostics = {
    DATABASE_URL: !!process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0,
    DIRECT_URL: !!process.env.DIRECT_URL && process.env.DIRECT_URL.length > 0,
    NEXT_PUBLIC_SUPABASE_URL:
      !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0,
    SUPABASE_SERVICE_ROLE_KEY:
      !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0,
    ANTI_IDLE_SECRET: !!process.env.ANTI_IDLE_SECRET && process.env.ANTI_IDLE_SECRET.length > 0,
  }

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
    const expectedSecret = process.env.ANTI_IDLE_SECRET

    if (!expectedSecret) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'SERVER_CONFIG_ERROR',
          message:
            'Server belum dikonfigurasi dengan benar: ANTI_IDLE_SECRET tidak ditemukan di lingkungan runtime.',
          diagnostics: envDiagnostics,
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
          diagnostics: {
            ANTI_IDLE_SECRET: envDiagnostics.ANTI_IDLE_SECRET,
          },
        },
        { status: 401 }
      )
    }

    // 3. Query database via Supabase JS Client (Edge Runtime-safe)
    // Melakukan select kategori pertama untuk memastikan database koneksi aktif
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'SUPABASE_CONFIG_ERROR',
          message: 'Konfigurasi Supabase tidak lengkap di lingkungan runtime.',
          diagnostics: envDiagnostics,
        },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()
    const { data: dbCheck, error: dbError } = await supabase.from('kategori').select('id').limit(1)

    if (dbError) {
      throw dbError
    }

    return NextResponse.json(
      {
        status: 'success',
        data: {
          ping: 'pong',
          database: dbCheck && dbCheck.length > 0 ? 'connected' : 'empty_but_connected',
          timestamp: new Date().toISOString(),
        },
        diagnostics: envDiagnostics,
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
        diagnostics: envDiagnostics,
        details: {
          message: errorMessage,
          stack: errorStack,
        },
      },
      { status: 500 }
    )
  }
}
