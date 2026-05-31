// Polyfill untuk process.versions di runtime non-Node (seperti Cloudflare Edge/isolate)
// guna mencegah fatal crash 'Cannot read properties of undefined (reading 'match')'
// saat modul @sentry/node-core diinisialisasi oleh bundler.
if (typeof process !== 'undefined') {
  const proc = process as unknown as { versions?: Record<string, string> }
  if (!proc.versions) {
    proc.versions = {}
  }
  if (!proc.versions.node) {
    proc.versions.node = '22.0.0'
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}
