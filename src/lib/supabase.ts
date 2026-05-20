/**
 * src/lib/supabase.ts
 *
 * Supabase client factory untuk server-side dan client-side.
 * Menggunakan @supabase/ssr untuk Next.js App Router.
 *
 * SECURITY_DEFAULTS:
 * - service_role key hanya digunakan di server (admin operations)
 * - anon key aman untuk client (Row Level Security diterapkan di DB)
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { publicEnv, serverEnv } from '@/lib/env'

/**
 * Client-side Supabase client.
 * Gunakan di Client Components ('use client').
 */
export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey)
}

/**
 * Server-side Supabase client dengan cookie support.
 * Gunakan di Server Components, Route Handlers, Server Actions.
 * Menggunakan anon key + RLS untuk operasi normal.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // setAll dipanggil dari Server Component — diabaikan
          // Cookie akan di-set via middleware jika diperlukan
        }
      },
    },
  })
}

/**
 * Server-side Supabase admin client dengan service_role key.
 * HANYA untuk operasi admin yang butuh bypass RLS.
 * JANGAN gunakan di client-side atau expose ke browser.
 */
export function createAdminClient() {
  return createSupabaseJsClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
