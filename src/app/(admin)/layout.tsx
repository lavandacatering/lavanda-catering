/**
 * src/app/(admin)/layout.tsx
 *
 * Layout untuk semua route admin.
 * Memanggil requireAdminAuth() dari proxy.ts — redirect ke /admin/login jika !auth.
 *
 * CATATAN: /admin/login TIDAK menggunakan layout ini (route group terpisah).
 * Layout ini hanya terpasang pada route /admin/* yang BUTUH auth.
 */

import { requireAdminAuth } from '@/lib/admin-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth guard — redirect ke /admin/login jika tidak ada session (BC1)
  await requireAdminAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AdminSidebar + AdminBottomNav akan diimplementasi di TASK-022 */}
      {children}
    </div>
  )
}
