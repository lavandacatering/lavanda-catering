/**
 * src/proxy.ts — Auth Guard Admin
 *
 * PENTING: File ini adalah PENGGANTI middleware.ts untuk Next.js 16 (BC1).
 * Jangan buat middleware.ts — gunakan proxy.ts ini.
 *
 * Cara pakai:
 * - Import dan panggil requireAdminAuth() di awal setiap Server Component /admin/*
 * - Import dan panggil checkAdminAuth() di setiap Server Action yang butuh auth
 *
 * Proteksi:
 * - Semua route /admin/* wajib auth kecuali /admin/login
 * - Redirect ke /admin/login jika tidak ada session atau session expired
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
 *
 * Contoh pemakaian:
 * ```tsx
 * // src/app/(admin)/admin/dashboard/page.tsx
 * import { requireAdminAuth } from '@/proxy'
 *
 * export default async function DashboardPage() {
 *   const session = await requireAdminAuth()
 *   // session.userId dan session.email tersedia
 *   return <Dashboard />
 * }
 * ```
 */
export async function requireAdminAuth(): Promise<AdminSession> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    // Log akses gagal (SECURITY_DEFAULTS: log login attempt)
    console.warn(`[proxy] Unauthorized admin access attempt at ${new Date().toISOString()}`, {
      error: error?.message ?? 'No session',
    })
    redirect('/admin/login')
  }

  // Log akses berhasil (SECURITY_DEFAULTS: log semua aksi admin)
  // JANGAN log token/JWT — hanya userId dan email
  console.info(`[proxy] Admin session valid: ${session.user.email} at ${new Date().toISOString()}`)

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
 * Contoh pemakaian:
 * ```ts
 * // src/actions/menu.ts
 * 'use server'
 * import { checkAdminAuth } from '@/proxy'
 *
 * export async function createMenuAction(data: FormData) {
 *   const session = await checkAdminAuth() // throw jika tidak auth
 *   // lanjut proses...
 * }
 * ```
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
    console.warn(`[proxy] Unauthorized Server Action attempt at ${new Date().toISOString()}`, {
      error: error?.message ?? 'No session',
    })
    // SECURITY_DEFAULTS: generic error — tidak spesifik
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
 * Berguna jika ada logic kondisional di layout admin.
 */
export function isPublicAdminRoute(pathname: string): boolean {
  return PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))
}
