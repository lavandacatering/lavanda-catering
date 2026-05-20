/**
 * src/lib/prisma.ts — Prisma Client Singleton
 *
 * Wajib singleton untuk mencegah multiple client saat hot-reload dev.
 * Sesuai ARCHITECTURE.md: "Prisma singleton (lihat config di atas)"
 *
 * SECURITY_DEFAULTS:
 * - Tidak ada logging query di production (bisa expose data sensitif)
 * - Hanya log error di semua environment
 */

import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn'] // JANGAN tambah 'query' — bisa log data sensitif
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
