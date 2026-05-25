'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console with unique prefix for observability
    console.error('[CLIENT-CRASH] Unhandled error captured by error boundary:', error)
  }, [error])

  // Resolve WhatsApp fallback link
  const waNumber = process.env.NEXT_PUBLIC_WA_BISNIS || '6281234567890'
  const waLink = `https://wa.me/${waNumber}?text=Halo%20Lavanda%20Catering%2C%20saya%20mengalami%20kendala%20sistem%20di%20website.`

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-warning/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="text-center max-w-md mx-auto flex flex-col items-center z-10 animate-fade-in-up">
        {/* Spatula Illustration */}
        <div className="relative mb-6 flex items-center justify-center">
          <svg
            className="w-[120px] h-[120px] text-warning stroke-[2]"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
          >
            {/* Background ring decorative */}
            <circle cx="50" cy="50" r="44" className="stroke-warning/20" strokeWidth="4" />

            {/* Spatula head */}
            <path
              d="M38 18h24v28c0 4-3 7-7 7H45c-4 0-7-3-7-7V18z"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Spatula slots */}
            <line x1="44" y1="24" x2="44" y2="44" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="24" x2="50" y2="44" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="56" y1="24" x2="56" y2="44" strokeWidth="2.5" strokeLinecap="round" />

            {/* Neck */}
            <path d="M50 53v10" strokeWidth="3.5" strokeLinecap="round" />

            {/* Wooden Handle */}
            <path
              d="M47 63h6v22a3 3 0 0 1-6 0V63z"
              fill="currentColor"
              className="text-warning/80"
              strokeWidth="1"
            />
            {/* Handle hanging hole */}
            <circle cx="50" cy="80" r="1.5" fill="white" stroke="none" />
          </svg>
        </div>

        {/* Big Code */}
        <span className="text-7xl font-extrabold text-warning leading-none tracking-tighter mb-4">
          500
        </span>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-dark mb-4">
          Terjadi Kesalahan Sistem
        </h1>

        {/* Subtext */}
        <p className="text-neutral-mid text-base mb-8 max-w-sm">
          Dapur kami sedang ada masalah teknis. Mohon coba lagi dalam beberapa saat.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-warning to-amber-500 text-white font-bold text-sm text-center shadow-card hover:shadow-hover hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-border bg-white text-neutral-dark font-bold text-sm text-center hover:bg-black/5 active:scale-[0.98] transition-all"
          >
            Hubungi WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
