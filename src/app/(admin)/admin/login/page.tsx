/**
 * src/app/(admin)/admin/login/page.tsx
 *
 * Halaman login admin — TIDAK memerlukan auth (public route).
 * Form login diimplementasi lengkap di TASK-053 (Sprint 5).
 * Saat ini berupa placeholder functional agar admin-auth.ts bisa ditest.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login Admin — Lavanda Catering',
  description: 'Halaman login admin Lavanda Catering',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#4A7C59] mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-xl">🌿</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Lavanda</h1>
          <p className="text-sm text-gray-500 mt-1">Masuk ke panel admin</p>
        </div>

        {/* Form implementasi lengkap di TASK-053 */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled
              placeholder="admin@lavandacatering.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div className="pt-2">
            <button
              type="button"
              disabled
              className="w-full bg-[#4A7C59] text-white py-2.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
            >
              Masuk
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            🔧 Form login diaktifkan pada Sprint 5 (TASK-053)
          </p>
        </div>
      </div>
    </div>
  )
}
