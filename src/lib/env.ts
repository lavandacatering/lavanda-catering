/**
 * src/lib/env.ts
 *
 * Validasi semua environment variables wajib saat startup.
 * Sesuai ARCHITECTURE.md — 24 variabel, throw Error jika WAJIB tidak ada.
 *
 * SECURITY_DEFAULTS: Jangan log nilai secret ke console.
 */

type EnvVar = {
  key: string
  required: boolean
  serverOnly: boolean // true = jangan expose ke client
  description: string
}

const ENV_SCHEMA: EnvVar[] = [
  // Database
  {
    key: 'DATABASE_URL',
    required: true,
    serverOnly: true,
    description: 'Supabase pooler URL (pgbouncer port 6543)',
  },
  {
    key: 'DIRECT_URL',
    required: true,
    serverOnly: true,
    description: 'Supabase direct URL (port 5432) untuk migrasi Prisma',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    serverOnly: false,
    description: 'Supabase project URL',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    serverOnly: false,
    description: 'Supabase anon public key',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    serverOnly: true,
    description: 'Supabase service role key — JANGAN expose ke client',
  },

  // Payment Gateway (DOKU)
  { key: 'DOKU_CLIENT_ID', required: true, serverOnly: true, description: 'DOKU Client ID' },
  {
    key: 'DOKU_SECRET_KEY',
    required: true,
    serverOnly: true,
    description: 'DOKU Secret Key — JANGAN di-log',
  },
  {
    key: 'DOKU_ENV',
    required: true,
    serverOnly: true,
    description: 'DOKU environment: sandbox | production',
  },
  {
    key: 'DOKU_WEBHOOK_SECRET',
    required: true,
    serverOnly: true,
    description: 'DOKU webhook secret untuk verifikasi HMAC',
  },

  // Email (Resend)
  { key: 'RESEND_API_KEY', required: true, serverOnly: true, description: 'Resend API key' },
  {
    key: 'RESEND_FROM_EMAIL',
    required: true,
    serverOnly: true,
    description: 'Email pengirim (from address)',
  },

  // Media (Cloudinary)
  {
    key: 'CLOUDINARY_CLOUD_NAME',
    required: true,
    serverOnly: true,
    description: 'Cloudinary cloud name (server)',
  },
  {
    key: 'CLOUDINARY_API_KEY',
    required: true,
    serverOnly: true,
    description: 'Cloudinary API key',
  },
  {
    key: 'CLOUDINARY_API_SECRET',
    required: true,
    serverOnly: true,
    description: 'Cloudinary API secret — JANGAN di-log',
  },
  {
    key: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    required: true,
    serverOnly: false,
    description: 'Cloudinary cloud name (client)',
  },

  // Application
  {
    key: 'MAINTENANCE_MODE',
    required: true,
    serverOnly: false,
    description: 'Maintenance mode: true | false',
  },
  {
    key: 'NEXT_PUBLIC_BASE_URL',
    required: true,
    serverOnly: false,
    description: 'Base URL aplikasi',
  },
  {
    key: 'ANTI_IDLE_SECRET',
    required: true,
    serverOnly: true,
    description: 'Secret untuk anti-idle cron endpoint',
  },
  {
    key: 'NEXT_PUBLIC_WA_BISNIS',
    required: true,
    serverOnly: false,
    description: 'Nomor WhatsApp bisnis (fallback dari settings DB)',
  },

  // Rate Limiting (Upstash Redis)
  {
    key: 'UPSTASH_REDIS_REST_URL',
    required: false,
    serverOnly: true,
    description: 'Upstash Redis REST URL',
  },
  {
    key: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    serverOnly: true,
    description: 'Upstash Redis REST token',
  },

  // Analytics & Monitoring (opsional)
  {
    key: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    required: false,
    serverOnly: false,
    description: 'Google Analytics 4 Measurement ID',
  },
  { key: 'SENTRY_DSN', required: false, serverOnly: true, description: 'Sentry DSN (server)' },
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    serverOnly: false,
    description: 'Sentry DSN (client)',
  },
]

/**
 * Validasi semua env var yang WAJIB.
 * Dipanggil saat server startup (dari layout.tsx atau instrumentation.ts).
 *
 * @throws Error jika ada env var wajib yang tidak ada nilainya
 */
export function validateEnv(): void {
  // Hanya jalankan di server side
  if (typeof window !== 'undefined') return

  // Skip validation during the Next.js production build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const missing: string[] = []

  for (const envVar of ENV_SCHEMA) {
    if (!envVar.required) continue

    const value = process.env[envVar.key]

    if (!value || value.trim() === '') {
      missing.push(envVar.key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[env.ts] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nSalin .env.example ke .env dan isi semua nilai yang diperlukan.`
    )
  }
}

/**
 * Typed accessor untuk server-side env vars.
 * Gunakan ini agar TypeScript tidak complain tentang process.env possibly undefined.
 */
export const serverEnv = {
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  directUrl: process.env.DIRECT_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // Payment
  dokuClientId: process.env.DOKU_CLIENT_ID!,
  dokuSecretKey: process.env.DOKU_SECRET_KEY!,
  dokuEnv: process.env.DOKU_ENV as 'sandbox' | 'production',
  dokuWebhookSecret: process.env.DOKU_WEBHOOK_SECRET!,

  // Email
  resendApiKey: process.env.RESEND_API_KEY!,
  resendFromEmail: process.env.RESEND_FROM_EMAIL!,

  // Media
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET!,

  // App
  antiIdleSecret: process.env.ANTI_IDLE_SECRET!,
  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL!,
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
  sentryDsn: process.env.SENTRY_DSN,
} as const

/**
 * Typed accessor untuk public env vars (aman di client & server).
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  waBisnis: process.env.NEXT_PUBLIC_WA_BISNIS!,
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  sentreyDsnPublic: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const
