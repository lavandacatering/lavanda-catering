/**
 * src/middleware.ts — Edge Middleware (required for Cloudflare Pages / OpenNext)
 *
 * Middleware ini berjalan di Cloudflare Edge runtime.
 * Auth protection dilakukan di Server Component via proxy.ts (requireAdminAuth)
 * dan Server Actions via checkAdminAuth() — bukan di middleware ini.
 *
 * Middleware ini hanya meneruskan semua request (NextResponse.next())
 * agar OpenNext dapat mendeteksi middleware sebagai Edge runtime.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.*\\.xml|robots\\.txt).*)',
  ],
}
