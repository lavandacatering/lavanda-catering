import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { cn, formatRupiah } from '@/lib/utils'
import AddToCartButton from '@/components/menu/AddToCartButton'

// Force dynamic so that the statistics and content updates are fresh
export const revalidate = 0
export const dynamic = 'force-dynamic'

interface KategoriInfo {
  nama: string
}

interface MenuItem {
  id: string
  nama: string
  deskripsi: string | null
  harga: number | string // Prisma Decimal compatibility
  min_porsi: number
  foto_url: string | null
  kategori?: KategoriInfo | null
}

interface PaketMenuInfo {
  nama: string
}

interface PaketItemRelation {
  menu: PaketMenuInfo | null
  menu_nama?: string
}

interface PaketItem {
  id: string
  nama: string
  subtitle: string | null
  deskripsi: string | null
  harga: number | string // Prisma Decimal compatibility
  min_order: number
  foto_url: string | null
  paket_items: PaketItemRelation[]
}

interface TestimonialItem {
  id: string
  nama: string
  peran: string | null
  teks: string
  rating: number
  foto_url: string | null
}

interface HeroContent {
  judul: string
  sub: string
  teks_cta: string
  foto_url: string
}

interface TentangContent {
  teks: string
  foto: string
  berdiri_sejak: string
  sertifikasi: string[]
}

interface KeunggulanContent {
  icon: string
  judul: string
  deskripsi: string
}

interface KontakContent {
  alamat: string
  telepon: string
  email: string
  maps_url: string
  jam_operasional: string
  area_layanan: string
}

interface GaleriContent {
  foto_url: string
  caption: string
  urutan: number
}

export default async function Home() {
  // 1. Fetch all data in parallel inside Server Component
  let webContent: Record<string, unknown> | null = null
  let completedCount = 12
  let featuredMenus: MenuItem[] = []
  let featuredPackages: PaketItem[] = []
  let approvedTestimonials: TestimonialItem[] = []
  let waNumber = '6281234567890'

  try {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const [contentRes, countRes, menusRes, packagesRes, testimonialsRes, waSetting] =
      await Promise.all([
        prisma.konten_web.findUnique({ where: { key: 'main' } }),
        prisma.pesanan.count({
          where: {
            status_pesanan: 'selesai',
            tanggal_acara: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
        }),
        prisma.menu.findMany({
          where: { status: 'aktif', deleted_at: null },
          take: 8,
          include: { kategori: true },
          orderBy: { urutan_dalam_kategori: 'asc' },
        }),
        prisma.paket.findMany({
          where: { status: 'aktif', deleted_at: null },
          take: 3,
          include: {
            paket_items: {
              include: { menu: true },
            },
          },
        }),
        prisma.testimoni.findMany({
          where: { status: 'approved' },
          take: 6,
          orderBy: { created_at: 'desc' },
        }),
        prisma.settings.findUnique({ where: { key: 'wa_bisnis_number' } }),
      ])

    webContent = contentRes as unknown as Record<string, unknown> | null
    completedCount = countRes > 0 ? countRes : 12
    featuredMenus = menusRes as unknown as MenuItem[]
    featuredPackages = packagesRes as unknown as PaketItem[]
    approvedTestimonials = testimonialsRes as unknown as TestimonialItem[]
    if (waSetting?.value) {
      waNumber = waSetting.value
    }
  } catch (err) {
    console.error('[HOMEPAGE-DATA-ERROR] Failed to query database for landing page:', err)
  }

  // Fallbacks if data is empty or DB call failed
  const hero = (webContent?.konten_hero as unknown as HeroContent) || {
    judul: 'Sajian Istimewa untuk Momen Berharga',
    sub: 'Layanan catering pernikahan, acara keluarga, dan event korporat premium di Semarang.',
    teks_cta: 'Pesan Sekarang',
    foto_url: '/brand/hero_catering_background.png',
  }

  const tentang = (webContent?.tentang_kami as unknown as TentangContent) || {
    teks: 'Lavanda Catering adalah penyedia jasa katering profesional di Semarang yang berdiri sejak tahun 2018. Kami berkomitmen menghadirkan cita rasa masakan otentik dengan pelayanan prima dan higienis.',
    foto: '/brand/hero_catering_background.png',
    berdiri_sejak: '2018',
    sertifikasi: ['Halal MUI', 'P-IRT'],
  }

  const keunggulan = (webContent?.keunggulan as unknown as KeunggulanContent[]) || [
    {
      icon: 'restaurant',
      judul: 'Cita Rasa Terjamin',
      deskripsi: 'Resep otentik dengan bahan pilihan kualitas terbaik.',
    },
    {
      icon: 'local_shipping',
      judul: 'Gratis Ongkir',
      deskripsi: 'Nikmati layanan pengiriman gratis untuk seluruh area Semarang.',
    },
    {
      icon: 'workspace_premium',
      judul: 'Sertifikasi Halal',
      deskripsi: 'Dapur & proses pengolahan kami terjamin 100% halal.',
    },
    {
      icon: 'group',
      judul: 'Pelayanan Profesional',
      deskripsi: 'Staf berpengalaman dan profesional siap melayani pesanan Anda.',
    },
    {
      icon: 'eco',
      judul: 'Bahan Higienis',
      deskripsi: 'Standar kebersihan tinggi dalam setiap proses produksi.',
    },
    {
      icon: 'payments',
      judul: 'Harga Kompetitif',
      deskripsi: 'Kualitas katering premium dengan harga yang tetap adil.',
    },
  ]

  const kontak = (webContent?.kontak as unknown as KontakContent) || {
    alamat: 'Jl. Pandanaran No. 123, Mugassari, Semarang',
    telepon: '0812-3456-7890',
    email: 'halo@lavandacatering.id',
    maps_url: 'https://maps.google.com',
    jam_operasional: '07:00 - 20:00',
    area_layanan: 'Seluruh Semarang',
  }

  const galeri = (webContent?.galeri as unknown as GaleriContent[]) || [
    {
      foto_url: '/brand/hero_catering_background.png',
      caption: 'Acara Pernikahan Royal',
      urutan: 1,
    },
    { foto_url: '/brand/hero_catering_background.png', caption: 'Prasmanan Korporat', urutan: 2 },
    { foto_url: '/brand/hero_catering_background.png', caption: 'Nasi Box Spesial', urutan: 3 },
  ]

  // Mock Menu Unggulan if DB returned empty
  const displayMenus =
    featuredMenus.length > 0
      ? featuredMenus
      : [
          {
            id: 'm1',
            nama: 'Nasi Box Ayam Bakar Madu',
            deskripsi:
              'Nasi box lengkap dengan ayam bakar madu empuk, tahu, tempe, lalapan dan sambal.',
            harga: 28000,
            min_porsi: 20,
            foto_url: '/brand/menu_nasi_box.png',
            kategori: { nama: 'Nasi Box' },
          },
          {
            id: 'm2',
            nama: 'Prasmanan Rendang Minang',
            deskripsi:
              'Daging sapi rendang otentik bumbu padang kaya rempah yang meresap sempurna.',
            harga: 42000,
            min_porsi: 50,
            foto_url: '/brand/menu_prasmanan.png',
            kategori: { nama: 'Prasmanan' },
          },
          {
            id: 'm3',
            nama: 'Snack Box Premium (3 Kue)',
            deskripsi:
              'Pilihan 3 snack manis dan asin premium untuk menemani acara rapat korporat.',
            harga: 15000,
            min_porsi: 30,
            foto_url: '/brand/menu_snack_box.png',
            kategori: { nama: 'Snack' },
          },
          {
            id: 'm4',
            nama: 'Es Dawet Ayu Selasih',
            deskripsi:
              'Minuman segar dengan santan murni, gula jawa pilihan, dawet kenyal dan selasih.',
            harga: 8000,
            min_porsi: 50,
            foto_url: null,
            kategori: { nama: 'Minuman' },
          },
        ]

  // Mock Paket Unggulan if DB returned empty
  const displayPackages =
    featuredPackages.length > 0
      ? featuredPackages
      : [
          {
            id: 'p1',
            nama: 'Paket Pernikahan Silver',
            subtitle: 'Untuk 200–500 tamu',
            deskripsi: 'Paket lengkap prasmanan pernikahan ekonomis dengan rasa bintang lima.',
            harga: 65000,
            min_order: 200,
            foto_url: null,
            paket_items: [
              { menu: { nama: 'Nasi Putih' } },
              { menu: { nama: 'Sup Kimlo' } },
              { menu: { nama: 'Ayam Goreng Mentega' } },
              { menu: { nama: 'Kakap Asam Manis' } },
              { menu: { nama: 'Es Cream Cup' } },
            ],
          },
          {
            id: 'p2',
            nama: 'Paket Seminar Eksklusif',
            subtitle: 'Untuk 50–150 peserta',
            deskripsi: 'Kombinasi nasi box makan siang premium dan snack box rapat semi-formal.',
            harga: 45000,
            min_order: 50,
            foto_url: null,
            paket_items: [
              { menu: { nama: 'Nasi Box Premium' } },
              { menu: { nama: 'Snack Box (2 kue)' } },
              { menu: { nama: 'Air Mineral Gelas' } },
            ],
          },
        ]

  // Mock Testimonial if DB returned empty
  const displayTestimonials =
    approvedTestimonials.length > 0
      ? approvedTestimonials
      : [
          {
            id: 't1',
            nama: 'Rian & Dita',
            peran: 'Pengantin Baru',
            teks: 'Sangat puas dengan katering Lavanda saat pernikahan kami kemarin. Seluruh tamu memuji rasa gulai dan sate sapinya. Pelayanan staff prasmanannya juga super bersih dan rapi!',
            rating: 5,
            foto_url: null,
          },
          {
            id: 't2',
            nama: 'Ibu Hani Wijaya',
            peran: 'HRD Astra Semarang',
            teks: 'Sudah langganan nasi box dari Lavanda untuk meeting bulanan direksi. Makanannya selalu hangat, box rapi, pengiriman selalu on-time H-30 menit sebelum acara mulai.',
            rating: 5,
            foto_url: null,
          },
        ]

  // LocalBusiness schema for SEO (TASK-028)
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://lavandacatering.id',
    name: 'Lavanda Catering',
    image: 'https://lavandacatering.id/brand/og-image.png',
    telephone: kontak.telepon,
    email: kontak.email,
    url: 'https://lavandacatering.id',
    address: {
      '@type': 'PostalAddress',
      streetAddress: kontak.alamat,
      addressLocality: 'Semaraing',
      addressRegion: 'Jawa Tengah',
      postalCode: '50249',
      addressCountry: 'ID',
    },
    priceRange: '$$',
    servesCuisine: 'Indonesian',
    areaServed: 'Semarang',
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-[#F9FAFB] font-sans dark:bg-black w-full overflow-x-hidden">
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* 1. HERO SECTION */}
      <section
        className="relative w-full min-h-[614px] flex items-center justify-center overflow-hidden"
        style={{ position: 'relative' }}
      >
        {/* Next.js Optimized Image */}
        <Image
          src={hero.foto_url || '/brand/hero_catering_background.png'}
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-[#1E1E1E]/60" style={{ zIndex: 1 }}></div>

        <div
          className="relative max-w-7xl mx-auto px-6 text-center text-white flex flex-col items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md leading-tight">
            {hero.judul}
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8 drop-shadow-sm font-semibold max-w-3xl leading-snug">
            {hero.sub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/pesan"
              className="w-full sm:w-auto bg-linear-to-r from-[#4DAF48] to-[#006e12] text-white font-bold px-8 py-3.5 rounded-lg hover:scale-[0.98] transition-all shadow-sm text-center"
            >
              {hero.teks_cta}
            </Link>
            <Link
              href="/menu"
              className="w-full sm:w-auto border border-white text-white font-bold px-8 py-3.5 rounded-lg hover:bg-white hover:text-[#1E1E1E] transition-colors shadow-sm text-center"
            >
              Lihat Menu
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6 w-full">
        <div className="bg-linear-to-br from-[#4DAF48]/10 to-[#96B83D]/10 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white dark:border-zinc-800 bg-white/90 p-6 md:p-10 overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xs font-bold text-[#006e12] uppercase tracking-widest mb-1">
                Kualitas &amp; Kepercayaan
              </h2>
              <p className="text-[#1E1E1E] dark:text-white text-2xl md:text-3xl font-extrabold">
                Standar Keunggulan Lavanda Catering
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-5 py-2.5 rounded-full border-2 border-[#006e12]/20 shadow-md group">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4daf48] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4daf48]"></span>
              </span>
              <span className="font-bold text-[#006e12] text-sm">
                {completedCount} Pesanan aktif di Semarang saat ini
              </span>
            </div>
          </div>

          {/* Quality Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {keunggulan.map((item, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-default"
              >
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors',
                    index % 2 === 0
                      ? 'bg-[#006e12]/20 text-[#006e12] group-hover:bg-[#006e12] group-hover:text-white'
                      : 'bg-[#52651f]/20 text-[#52651f] group-hover:bg-[#52651f] group-hover:text-white'
                  )}
                >
                  <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                </div>
                <h4 className="font-bold text-[#1E1E1E] dark:text-white mb-2 text-lg">
                  {item.judul}
                </h4>
                <p className="text-xs text-neutral-mid dark:text-zinc-400 leading-relaxed font-semibold">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MENU UNGGULAN */}
      <section className="py-20 max-w-7xl w-full px-6" id="menu">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-center text-[#1E1E1E] dark:text-white mb-4">
            Menu Pilihan Terbaik
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayMenus.slice(0, 3).map((menuItem) => (
            <div
              key={menuItem.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative pb-[75%] bg-gray-100 dark:bg-zinc-800">
                {menuItem.foto_url ? (
                  <Image
                    src={menuItem.foto_url.split(',')[0]}
                    alt={menuItem.nama}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-[#4DAF48]/5 to-[#52651f]/10 text-[#006e12]">
                    <span className="material-symbols-outlined text-4xl opacity-40 mb-1">
                      restaurant
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      Lavanda Signature
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-[#cbf06e] text-[#536d00] text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                  {menuItem.kategori?.nama || 'Catering'}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-[#1E1E1E] dark:text-white mb-2">
                  {menuItem.nama}
                </h3>
                <p className="font-bold text-[#006e12] text-base mb-1">
                  {formatRupiah(Number(menuItem.harga))}
                  <span className="text-[#6B7280] font-normal text-sm">/porsi</span>
                </p>
                <p className="text-xs text-[#6B7280] mb-4">min. {menuItem.min_porsi} porsi</p>
                <AddToCartButton
                  id={menuItem.id}
                  nama={menuItem.nama}
                  harga={Number(menuItem.harga)}
                  minPorsi={menuItem.min_porsi}
                  itemType="menu"
                  fotoUrl={menuItem.foto_url}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 border-2 border-[#4daf48] text-[#006e12] dark:text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#4daf48] hover:text-white transition-all duration-300 shadow-sm"
          >
            Eksplorasi Seluruh Kreasi Menu Kami
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
              chevron_right
            </span>
          </Link>
        </div>
      </section>

      {/* 4. PAKET UNGGULAN */}
      <section
        className="py-20 bg-linear-to-br from-[#4DAF48]/5 via-[#96B83D]/5 to-white dark:from-zinc-950 dark:to-black border-t border-b border-gray-100 dark:border-zinc-900 w-full flex justify-center"
        id="paket-unggulan"
      >
        <div className="max-w-7xl w-full px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#006e12] uppercase tracking-widest block mb-2">
              Paket Bundling Terlengkap
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E1E1E] dark:text-white">
              Solusi Praktis Acara Lebih Hemat
            </h2>
            <div className="w-16 h-1 bg-[#006e12] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPackages.map((paketItem) => {
              const visibleItems = paketItem.paket_items.slice(0, 3)
              const extraCount = paketItem.paket_items.length - 3
              return (
                <div
                  key={paketItem.id}
                  className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  <div className="bg-linear-to-r from-[#4DAF48] to-[#96B83D] p-5">
                    <h4 className="text-xl font-bold text-white">{paketItem.nama}</h4>
                    <p className="text-[13px] text-white/90 mt-0.5">{paketItem.subtitle}</p>
                  </div>

                  <div className="p-5 grow flex flex-col justify-between">
                    <div>
                      <ul className="space-y-3">
                        {visibleItems.map((pi, index: number) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-[#1E1E1E] dark:text-zinc-300"
                          >
                            <span className="material-symbols-outlined text-[#006e12] text-lg shrink-0">
                              check
                            </span>
                            <span>{pi.menu?.nama || pi.menu_nama || 'Menu Pilihan'}</span>
                          </li>
                        ))}
                      </ul>
                      {extraCount > 0 && (
                        <p className="text-xs text-[#6B7280] mt-3 pl-7">+{extraCount} item lagi</p>
                      )}
                    </div>

                    <div>
                      <div className="h-px bg-gray-100 dark:border-zinc-800 my-4" />
                      <p className="text-2xl font-bold text-[#006e12]">
                        {formatRupiah(Number(paketItem.harga))}
                        <span className="text-sm text-[#6B7280] font-normal">/porsi</span>
                      </p>
                      <p className="text-xs text-[#6B7280] mb-4">
                        min. {paketItem.min_order} order
                      </p>
                      <Link
                        href={`/menu/paket`}
                        className="flex items-center justify-center w-full h-11 border-[1.5px] border-[#006e12] text-[#006e12] font-semibold text-sm rounded-lg hover:bg-[#eff4ff] transition-colors"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/menu/paket"
              className="inline-flex items-center gap-2 px-8 py-3 border-[1.5px] border-[#006e12] text-[#006e12] dark:text-white font-semibold text-sm rounded-lg hover:bg-[#f0fdf4] transition-colors"
            >
              Lihat Semua Paket
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TENTANG KAMI & KEUNGGULAN */}
      <section className="py-20 px-6 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-video lg:aspect-square bg-gray-150 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-800">
          <Image
            src={tentang.foto || '/brand/hero_catering_background.png'}
            alt="About us kitchen"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md dark:bg-zinc-900/95 p-5 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-neutral-mid uppercase tracking-wide">
              Berdiri Sejak
            </h4>
            <p className="text-2xl font-extrabold text-[#006e12]">
              {tentang.berdiri_sejak || '2018'}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {tentang.sertifikasi?.map((cert, idx) => (
                <span
                  key={idx}
                  className="bg-[#cbf06e]/20 text-[#536d00] font-extrabold text-[9px] uppercase px-2 py-0.5 rounded"
                >
                  ✓ {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-bold text-[#006e12] uppercase tracking-widest block mb-2">
              Pilar Mutu Kami
            </span>
            <h2 className="text-3xl font-extrabold text-[#1E1E1E] dark:text-white leading-tight">
              Cita Rasa Otentik, Pelayanan Prima
            </h2>
          </div>
          <p className="text-sm md:text-base text-neutral-mid dark:text-zinc-400 leading-relaxed font-semibold">
            {tentang.teks}
          </p>

          <div className="flex flex-col gap-4 mt-4">
            {keunggulan.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 items-start p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#006e12]/10 flex items-center justify-center text-[#006e12] shrink-0">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1E1E1E] dark:text-white">{item.judul}</h4>
                  <p className="text-xs text-neutral-mid dark:text-zinc-400 mt-1 leading-relaxed font-semibold">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CARA PESAN */}
      <section
        className="bg-[#eff4ff] dark:bg-zinc-950/40 border-y border-gray-100 dark:border-zinc-900 py-24 w-full flex justify-center"
        id="cara-pesan"
      >
        <div className="max-w-7xl w-full px-6">
          <h2 className="text-3xl font-extrabold text-center text-[#1E1E1E] dark:text-white mb-16">
            Cara Mudah Pesan Catering
          </h2>
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 relative">
            <div className="hidden lg:block absolute top-16 left-[15%] right-[15%] h-0 border-t-2 border-dashed border-[#006e12]/20 z-0"></div>

            {[
              {
                step: 1,
                icon: 'restaurant',
                title: 'Pilih Menu',
                desc: 'Jelajahi berbagai pilihan Nasi Box, Prasmanan, dan Snack Box terbaik kami yang bisa disesuaikan dengan kebutuhan acara Anda.',
                bullets: ['100+ Pilihan Menu', 'Kustomisasi Porsi'],
              },
              {
                step: 2,
                icon: 'edit_note',
                title: 'Isi Data',
                desc: 'Lengkapi detail pesanan mulai dari tanggal, waktu, hingga lokasi pengiriman di Semarang. Tim kami akan segera melakukan verifikasi.',
                bullets: ['Konfirmasi Cepat', 'Admin Responsif'],
              },
              {
                step: 3,
                icon: 'verified_user',
                title: 'Bayar',
                desc: 'Selesaikan pembayaran dengan aman melalui QRIS atau Transfer Bank. Pesanan Anda masuk jadwal produksi secara otomatis.',
                bullets: ['Keamanan Terjamin', 'Berbagai Metode'],
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex-1 flex flex-col items-center text-center relative z-10 group"
              >
                <div className="w-32 h-32 bg-linear-to-br from-[#4daf48] to-[#006e12] rounded-full flex items-center justify-center shadow-xl mb-8 relative transform transition-transform group-hover:scale-105">
                  <span className="material-symbols-outlined text-white text-5xl">{item.icon}</span>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#cbf06e] text-[#151f00] rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#1E1E1E] dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-[#6B7280] dark:text-zinc-400 px-6 mb-6 leading-relaxed">
                  {item.desc}
                </p>
                <div className="flex flex-col gap-2 text-sm font-semibold text-[#006e12]">
                  {item.bullets.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. GALERI KEGIATAN MASONRY STYLE */}
      <section className="py-20 max-w-7xl w-full px-6">
        <h2 className="text-3xl font-extrabold text-center text-[#1E1E1E] dark:text-white mb-12">
          Galeri Lavanda Catering
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galeri.slice(0, 5).map((photo, index) => {
            const isLarge = index === 2
            return (
              <div
                key={index}
                className={cn(
                  'relative bg-gray-100 rounded-xl overflow-hidden shadow-sm group border border-gray-100 dark:border-zinc-800 transition-all duration-300',
                  isLarge ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                )}
              >
                <Image
                  src={photo.foto_url || '/brand/hero_catering_background.png'}
                  alt={photo.caption || 'Galeri event'}
                  fill
                  sizes={
                    isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'
                  }
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-xs font-bold text-white leading-tight">
                    {photo.caption}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. TESTIMONI PELANGGAN */}
      <section className="bg-white dark:bg-zinc-900 border-t border-b border-gray-100 dark:border-zinc-900 py-20 w-full flex justify-center">
        <div className="max-w-7xl w-full px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1E1E1E] dark:text-white">Kata Mereka</h2>
            <p className="text-xs text-neutral-mid dark:text-zinc-400 mt-2 font-semibold">
              Lebih dari 200 keluarga sudah mempercayakan acara mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#006e12]/10 text-[#006e12] font-extrabold text-sm flex items-center justify-center shrink-0 overflow-hidden relative">
                      {testimonial.foto_url ? (
                        <Image
                          src={testimonial.foto_url}
                          alt={testimonial.nama}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        testimonial.nama.substring(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E1E1E] dark:text-white leading-snug">
                        {testimonial.nama}
                      </h4>
                      <p className="text-[10px] text-neutral-mid mt-0.5 font-bold uppercase tracking-wider">
                        {testimonial.peran || 'Pelanggan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex text-[#F59E0B] gap-0.5 mb-4 text-sm">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>

                  <p className="italic text-neutral-mid dark:text-zinc-300 text-xs md:text-sm border-l-4 border-[#006e12] pl-4 font-semibold leading-relaxed">
                    &quot;{testimonial.teks}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. KONTAK & LOKASI MAPS */}
      <section id="kontak" className="py-20 max-w-7xl w-full px-6 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1E1E1E] dark:text-white leading-tight mb-4">
              Konsultasikan Acara Anda
            </h2>
            <p className="text-sm text-neutral-mid dark:text-zinc-400 mb-8 leading-relaxed font-semibold">
              Tim kami siap membantu menyusun menu terbaik yang sesuai dengan anggaran dan konsep
              acara Anda.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#006e12]/10 text-[#006e12] rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-mid font-bold uppercase tracking-wider">
                    WhatsApp Admin
                  </p>
                  <p className="font-bold text-[#1E1E1E] dark:text-white">{kontak.telepon}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#006e12]/10 text-[#006e12] rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-mid font-bold uppercase tracking-wider">
                    Email Bisnis
                  </p>
                  <p className="font-bold text-[#1E1E1E] dark:text-white">{kontak.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#1E1E1E] dark:text-white mb-3">
                  Lokasi Kami
                </h3>
                <div className="flex items-start gap-2.5 mb-4">
                  <span className="material-symbols-outlined text-[#006e12] shrink-0">
                    location_on
                  </span>
                  <p className="text-xs md:text-sm text-[#1E1E1E] dark:text-zinc-300 font-semibold">
                    {kontak.alamat}
                  </p>
                </div>
                <div className="w-full h-[260px] rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.2260742137976!2d110.4109724108873!3d-6.982631592997972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b49520ade43%3A0x673e2003c20db207!2sJl.%20Pandanaran%2C%20Kota%20Semarang%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1716630000000!5m2!1sid!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Kantor Lavanda Catering"
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-xs text-neutral-mid mb-4 font-semibold">
                  Ingin berkonsultasi langsung? Hubungi kami melalui WhatsApp:
                </p>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all shadow-md cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 fill-current shrink-0"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Chat via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA BANNER */}
      <section className="py-20 bg-[#006e12] w-full flex justify-center text-center text-white">
        <div className="max-w-4xl px-6 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            Siap Membuat Momen Anda Tak Terlupakan?
          </h2>
          <p className="mb-8 opacity-90 max-w-2xl text-xs md:text-sm font-semibold leading-relaxed">
            Pesan sekarang dan dapatkan gratis ongkir ke seluruh wilayah Semarang! Pemesanan mudah,
            aman, dan higienis.
          </p>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#006e12] hover:bg-opacity-95 font-bold px-8 py-3.5 rounded-lg hover:scale-105 active:scale-[0.98] transition-all cursor-pointer shadow-sm text-sm"
          >
            Pesan Sekarang Melalui WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
