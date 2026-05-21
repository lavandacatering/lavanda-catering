import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Menentukan tingkat sampel untuk penelusuran transaksi performa
  tracesSampleRate: 1.0,

  // Menentukan tingkat sampel rekaman sesi jika terjadi kesalahan (replays)
  replaysOnErrorSampleRate: 1.0,

  // Menentukan tingkat sampel rekaman sesi normal (10%)
  replaysSessionSampleRate: 0.1,

  // Nonaktifkan mode debug pada production
  debug: true,
})
