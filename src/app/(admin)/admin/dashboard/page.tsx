/**
 * src/app/(admin)/admin/dashboard/page.tsx
 *
 * Halaman dashboard admin — dilindungi oleh layout (admin)/layout.tsx.
 * Konten lengkap diimplementasi di TASK-051 (Sprint 6).
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — Admin Lavanda Catering',
  robots: { index: false, follow: false },
}

export default function AdminDashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm">
        🔧 Konten dashboard diimplementasi pada Sprint 6 (TASK-051).
      </p>
    </main>
  )
}
