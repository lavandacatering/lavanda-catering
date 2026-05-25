import Link from 'next/link'

export default function Footer() {
  const waNumber = process.env.NEXT_PUBLIC_WA_BISNIS || '6281234567890'
  const waDisplay = '0812-3456-7890' // Default formatted fallback

  return (
    <footer className="bg-[#1E1E1E] text-[#9CA3AF] border-t border-[#374151] pt-16 pb-8 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-brand-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Lavanda Catering
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Layanan catering profesional di Semarang. Menyajikan hidangan lezat dan berkualitas
              tinggi untuk pernikahan, korporat, dan berbagai acara spesial Anda.
            </p>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Kontak Kami
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-brand-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href={`https://wa.me/${waNumber}`}
                  className="hover:text-brand-primary transition-colors"
                >
                  {waDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-brand-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:halo@lavandacatering.id"
                  className="hover:text-brand-primary transition-colors"
                >
                  halo@lavandacatering.id
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-brand-primary shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-400">
                  Jl. Pandanaran No. 123, Mugassari, Kec. Semarang Selatan, Kota Semarang, Jawa
                  Tengah 50249
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Area */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Area Layanan
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-gray-400">
              <li>• Seluruh Kota Semarang</li>
              <li>• Semarang Barat &amp; Timur</li>
              <li>• Semarang Utara &amp; Selatan</li>
              <li>• Banyumanik &amp; Tembalang</li>
              <li>• Ungaran &amp; Sekitarnya</li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Informasi Hukum
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="hover:text-brand-primary transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="hover:text-brand-primary transition-colors"
                >
                  Syarat &amp; Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-[#374151] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Lavanda Catering. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/lavandacatering"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://facebook.com/lavandacatering"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
