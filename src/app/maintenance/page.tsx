import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sedang Dalam Pemeliharaan — Lavanda Catering',
  description: 'Website Lavanda Catering sedang dalam pemeliharaan. Mohon coba beberapa saat lagi.',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#FAFAF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          {/* Logo placeholder — diganti setelah TASK-020 */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#4A7C59',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: '1.5rem' }}>🌿</span>
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#1C1C1A',
              marginBottom: '0.75rem',
            }}
          >
            Sedang Dalam Pemeliharaan
          </h1>

          <p style={{ color: '#6B7280', lineHeight: 1.6, marginBottom: '2rem' }}>
            Website Lavanda Catering sedang kami perbarui untuk memberikan pengalaman terbaik. Mohon
            kembali beberapa saat lagi.
          </p>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_BISNIS ?? '6281234567890'}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#4A7C59',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <span>💬</span> Hubungi Kami via WhatsApp
          </a>
        </div>
      </body>
    </html>
  )
}
