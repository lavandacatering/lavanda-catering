import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Menentukan tingkat sampel untuk penelusuran transaksi performa
  tracesSampleRate: 1.0,

  // Nonaktifkan mode debug pada production
  debug: false,
})
