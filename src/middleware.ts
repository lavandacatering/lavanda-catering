/**
 * src/middleware.ts — Minimal Edge Middleware
 *
 * Diperlukan oleh @opennextjs/cloudflare untuk melacak request dengan benar.
 * Middleware ini berjalan di Edge runtime bawaan Cloudflare Pages.
 */

import { NextResponse } from 'next/server'

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali berkas statis (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.*\\.xml|robots\\.txt).*)',
  ],
}
