import Link from 'next/link'

export const metadata = {
  title: 'Syarat & Ketentuan | Lavanda Catering',
  description:
    'Syarat dan ketentuan pemesanan, pembayaran, pembatalan acara, dan refund katering di Semarang oleh Lavanda Catering.',
}

export default function SyaratKetentuanPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_BISNIS || '6281234567890'
  const waLink = `https://wa.me/${waNumber}?text=Halo%20Lavanda%20Catering%2C%20saya%20ingin%20bertanya%20mengenai%20Syarat%20%26%20Ketentuan%20pemesanan.`

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
              Syarat &amp; Ketentuan
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-dark mb-2">
            Syarat &amp; Ketentuan
          </h1>
          <p className="text-sm text-neutral-mid">Terakhir diperbarui: 1 Agustus 2025</p>
        </div>

        {/* Article Body */}
        <article className="bg-white rounded-xl border border-border shadow-card p-6 md:p-10 space-y-8">
          <section className="text-neutral-dark text-base leading-relaxed space-y-4">
            <p>
              Dengan mengakses, memesan hidangan, atau menggunakan seluruh ekosistem layanan dari
              Lavanda Catering, Anda secara sadar menyetujui untuk terikat oleh Syarat dan Ketentuan
              yang tertulis di bawah ini. Mohon baca lembar ketentuan ini dengan saksama sebelum
              memulai pemesanan catering.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">1. Kontrak Pemesanan</h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>
                Semua pemesanan prasmanan, gubukan, maupun nasi box di Semarang harus diajukan
                melalui situs web resmi kami atau saluran administrasi WhatsApp resmi. Detail menu,
                porsi, dan waktu acara yang tertera di nota kesepahaman (invoice) akan menjadi acuan
                utama pelaksanaan layanan kuliner kami di lapangan.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">
              2. Ketentuan DP &amp; Pembayaran
            </h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>Pembayaran diatur dengan kesepakatan tertib sebagai berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Pemesanan dianggap <strong>SAH &amp; DIKONFIRMASI</strong> setelah Anda melakukan
                  pembayaran Uang Muka (DP) minimal sebesar 50% dari total nilai transaksi.
                </li>
                <li>
                  Pelunasan sisa tagihan 50% wajib dilakukan selambat-lambatnya{' '}
                  <strong>3 (tiga) hari sebelum tanggal acara berlangsung (H-3)</strong>.
                </li>
                <li>
                  Pembayaran resmi hanya dilayani melalui gateway pembayaran digital DOKU (QRIS,
                  Virtual Account) atau transfer bank langsung ke rekening terverifikasi di sistem
                  kami.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">
              3. Kebijakan Pembatalan &amp; Refund
            </h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>
                Karena persiapan bahan baku makanan segar, penyusunan jadwal kru, dan pemesanan
                logistik dilakukan jauh-jauh hari, kami menetapkan kebijakan pembatalan dan refund
                uang muka (DP) berikut:
              </p>
              <div className="border border-border rounded-lg overflow-hidden my-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-border">
                      <th className="p-3 font-semibold text-neutral-dark">Waktu Pembatalan</th>
                      <th className="p-3 font-semibold text-neutral-dark">
                        Ketentuan Pengembalian (Refund)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-medium text-neutral-dark">
                        &gt; 14 Hari Sebelum Acara
                      </td>
                      <td className="p-3 text-brand-primary font-semibold">DP Dikembalikan 100%</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-medium text-neutral-dark">
                        7 s/d 14 Hari Sebelum Acara
                      </td>
                      <td className="p-3 text-warning font-semibold">DP Dikembalikan 50%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-dark">
                        &lt; 7 Hari Sebelum Acara
                      </td>
                      <td className="p-3 text-danger font-semibold">
                        DP Hangus (Tidak Ada Pengembalian)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-neutral-mid italic">
                * Catatan: Proses verifikasi dan transfer balik dana refund yang disetujui
                memerlukan waktu 3-5 hari kerja.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">
              4. Batas Waktu Pemesanan &amp; Perubahan
            </h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>
                Batas minimal pemesanan baru untuk event adalah 7 hari sebelum acara (H-7) sesuai
                parameter ketersediaan kalender katering kami. Pengurangan porsi tidak diperkenankan
                setelah DP dibayarkan. Penambahan porsi dapat diajukan selambat-lambatnya H-3
                sebelum acara, bergantung pada kapasitas produksi dapur Lavanda Catering pada hari
                tersebut.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-dark">
              5. Kebersihan, Alergi &amp; Tanggung Jawab
            </h2>
            <div className="text-neutral-mid text-sm leading-relaxed space-y-2">
              <p>
                Kami menjamin kebersihan makanan dengan standar higienis tinggi selama proses
                memasak dan penyajian di event Anda. Pemesan wajib menginformasikan secara tertulis
                jika ada tamu/undangan yang memiliki alergi makanan tertentu saat melakukan
                pemesanan. Kami tidak bertanggung jawab atas efek medis/reaksi alergi dari bahan
                makanan jika pemberitahuan tertulis tidak dilampirkan.
              </p>
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <div>
                <h3 className="font-bold text-sm text-neutral-dark mb-1">
                  Ada pertanyaan mengenai syarat katering?
                </h3>
                <p className="text-xs text-neutral-mid">
                  Hubungi CS kami untuk memandu Anda memahami detail kerja sama event Anda.
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto shrink-0 justify-center">
              <a
                href="mailto:halo@lavandacatering.id"
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
