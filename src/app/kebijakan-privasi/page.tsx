import Link from 'next/link'

export const metadata = {
  title: 'Kebijakan Privasi | Lavanda Catering',
  description:
    'Kebijakan privasi pelindungan data pribadi pengguna layanan catering di Semarang oleh Lavanda Catering.',
}

export default function KebijakanPrivasiPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_BISNIS || '6281234567890'
  const waLink = `https://wa.me/${waNumber}?text=Halo%20Lavanda%20Catering%2C%20saya%20ingin%20bertanya%20mengenai%20Kebijakan%20Privasi.`

  return (
    <div className="bg-brand-bg min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-semibold text-neutral-mid">
            <li>
              <Link href="/" className="hover:text-brand-primary transition-colors">
                Beranda
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li aria-current="page" className="text-neutral-dark">
              Kebijakan Privasi
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-dark mb-2">
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-neutral-mid">Terakhir diperbarui: 1 Agustus 2025</p>
        </div>

        {/* Article Body */}
        <article className="bg-white rounded-xl border border-border shadow-card p-6 md:p-10 space-y-8">
          <section className="text-neutral-dark text-base leading-relaxed space-y-4">
            <p>
              Selamat datang di Lavanda Catering. Kami menghargai privasi Anda dan berkomitmen untuk
              melindungi data pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami
              mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat menggunakan
              layanan kami sesuai dengan Undang-Undang Pelindungan Data Pribadi (UU PDP) yang
              berlaku di Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">1. Pengumpulan Data</h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>
                Kami mengumpulkan beberapa jenis informasi untuk memberikan layanan terbaik kepada
                Anda:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  <strong>Informasi Pribadi:</strong> Nama pemesan, alamat email, nomor telepon, dan
                  alamat lengkap pengiriman/lokasi event saat Anda melakukan pemesanan.
                </li>
                <li>
                  <strong>Data Transaksi:</strong> Rincian paket katering yang Anda pilih, jumlah
                  porsi, metode pembayaran, nominal uang muka (DP), pelunasan, serta riwayat
                  transaksi pembayaran.
                </li>
                <li>
                  <strong>Data Teknis:</strong> Alamat IP, jenis browser, dan informasi perangkat
                  saat Anda mengakses situs web kami demi keamanan operasional dan analitik sistem.
                </li>
              </ol>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">2. Penggunaan Data</h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>
                Informasi pribadi yang kami kumpulkan digunakan secara eksklusif untuk tujuan
                operasional berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Memproses administrasi pesanan dan mengirimkan pesanan catering Anda dengan
                  akurat.
                </li>
                <li>
                  Berkomunikasi mengenai status pesanan, verifikasi pembayaran, perubahan jadwal,
                  dan layanan pelanggan.
                </li>
                <li>
                  Meningkatkan kualitas hidangan, ketepatan waktu pengiriman, serta pengalaman
                  pengguna di platform kami.
                </li>
                <li>
                  Mengirimkan notifikasi invoice resmi, update status via WhatsApp Bisnis, atau
                  promosi (hanya jika disetujui).
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">
              3. Penyimpanan &amp; Keamanan Data
            </h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>
                Kami menyimpan data pribadi Anda selama diperlukan untuk memenuhi tujuan
                administrasi hukum, garansi transaksi, dan perpajakan operasional. Kami menerapkan
                langkah-langkah keamanan teknis yang ketat untuk mencegah akses tidak sah,
                kebocoran, atau penyalahgunaan data Anda. Semua transaksi pembayaran diproses
                melalui gateway pembayaran berlisensi DOKU yang aman dan terenkripsi.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">4. Hak Pengguna</h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>Sesuai regulasi UU PDP, Anda memiliki hak penuh terhadap data Anda sendiri:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Hak untuk mengakses data pribadi yang kami simpan tentang Anda.</li>
                <li>
                  Hak untuk meminta koreksi jika ada data pemesan atau tanggal yang tidak akurat.
                </li>
                <li>
                  Hak untuk meminta penghapusan permanen data Anda dari database kami (Right to be
                  Forgotten), selama tidak melanggar kewajiban hukum transaksi aktif.
                </li>
              </ul>
            </div>
          </section>

          {/* Help Banner inside Policy */}
          <div className="mt-8 bg-brand-primary/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-brand-primary/10">
            <div className="flex items-center gap-4">
              <svg
                className="w-8 h-8 text-brand-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <div>
                <h3 className="font-bold text-sm text-neutral-dark mb-1">
                  Ada pertanyaan terkait privasi data?
                </h3>
                <p className="text-xs text-neutral-mid">
                  Tim Customer Service kami siap membantu menjelaskan pelindungan data Anda.
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto shrink-0 justify-center">
              <a
                href="mailto:privacy@lavandacatering.id"
                className="inline-flex items-center justify-center px-4 py-2 border border-border bg-white text-xs font-semibold rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                Email Kami
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-primary/95 active:scale-95 transition-all"
              >
                Chat WhatsApp
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
