import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="text-center max-w-md mx-auto flex flex-col items-center z-10 animate-fade-in-up">
        {/* Empty Plate Illustration */}
        <div className="relative mb-6 flex items-center justify-center">
          <svg
            className="w-[120px] h-[120px] text-brand-primary stroke-[2]"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
          >
            {/* The Plate rim */}
            <circle cx="50" cy="50" r="40" className="stroke-brand-primary/20" strokeWidth="4" />
            <circle cx="50" cy="50" r="40" strokeWidth="2.5" />
            {/* Inner rim */}
            <circle cx="50" cy="50" r="30" strokeDasharray="5 4" />
            <circle cx="50" cy="50" r="20" strokeWidth="1" className="stroke-brand-primary/40" />

            {/* Fork on the left */}
            <path
              d="M20 35v15c0 3 2 5 4 5s4-2 4-5V35M24 55v18"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
            <path d="M24 35v10" strokeLinecap="round" />

            {/* Knife on the right */}
            <path
              d="M76 35v18c0 4-3 7-3 7v13"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Big Code */}
        <span className="text-7xl font-extrabold text-brand-primary leading-none tracking-tighter mb-4">
          404
        </span>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-dark mb-4">
          Halaman Tidak Ditemukan
        </h1>

        {/* Subtext */}
        <p className="text-neutral-mid text-base mb-8 max-w-sm">
          Sepertinya halaman yang kamu cari sudah pindah atau tidak ada. Yuk kembali ke beranda.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white font-bold text-sm text-center shadow-card hover:shadow-hover hover:brightness-105 active:scale-[0.98] transition-all"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-border bg-white text-brand-primary font-bold text-sm text-center hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
          >
            Lihat Menu
          </Link>
        </div>
      </div>
    </div>
  )
}
