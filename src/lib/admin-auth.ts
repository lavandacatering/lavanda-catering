/**
 * src/lib/admin-auth.ts — Auth Guard Admin Helper
 *
 * File ini berisi helper untuk memverifikasi autentikasi admin.
 * Proteksi dilakukan di Server Component via requireAdminAuth()
 * dan di Server Actions via checkAdminAuth().
 *
 * SECURITY_DEFAULTS:
 * - Log semua aksi admin (sukses + gagal)
 * - Tidak ada secret hardcoded
 * - Generic error messages
 * - Session timeout 7 hari (dikelola Supabase)
 */

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'

/** Route admin yang tidak perlu auth */
const PUBLIC_ADMIN_ROUTES = ['/admin/login']

/**
 * Tipe data session admin yang dikembalikan setelah auth berhasil.
 */
export type AdminSession = {
  userId: string
  email: string
}

/**
 * requireAdminAuth()
 *
 * Gunakan di Server Component halaman admin.
 * Redirect ke /admin/login jika tidak ada session valid.
 */
export async function requireAdminAuth(): Promise<AdminSession> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    // Log akses gagal (SECURITY_DEFAULTS: log login attempt)
    console.warn(`[admin-auth] Unauthorized admin access attempt at ${new Date().toISOString()}`, {
      error: error?.message ?? 'No session',
    })
    redirect('/admin/login')
  }

  // Log akses berhasil (SECURITY_DEFAULTS: log semua aksi admin)
  console.info(
    `[admin-auth] Admin session valid: ${session.user.email} at ${new Date().toISOString()}`
  )

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
  }
}

/**
 * checkAdminAuth()
 *
 * Gunakan sebagai double-check di Server Actions (BC1 requirement).
 * Throw Error jika tidak ada session — jangan redirect dari Server Action.
 *
 * @throws Error dengan pesan generic jika tidak ada session
 */
export async function checkAdminAuth(): Promise<AdminSession> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    // Log percobaan akses tidak sah
    console.warn(`[admin-auth] Unauthorized Server Action attempt at ${new Date().toISOString()}`, {
      error: error?.message ?? 'No session',
    })
    // SECURITY_DEFAULTS: generic error
    throw new Error('Akses ditolak. Silakan login kembali.')
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
  }
}

/**
 * isPublicAdminRoute()
 *
 * Cek apakah path adalah route admin yang tidak perlu auth.
 */
export function isPublicAdminRoute(pathname: string): boolean {
  return PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))
}
