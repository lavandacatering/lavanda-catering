import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('[SEED] Starting database seeding...')

  // 1. Seed settings
  const settingsSeed = [
    {
      key: 'kapasitas_customer_default',
      value: '10',
      keterangan: 'Maks customer per hari, 0=tak terbatas',
    },
    {
      key: 'kapasitas_porsi_default',
      value: '500',
      keterangan: 'Maks porsi per hari, 0=tak terbatas',
    },
    { key: 'dp_default_pct', value: '50', keterangan: 'Persentase DP default' },
    { key: 'lead_time_hari', value: '7', keterangan: 'Min hari sebelum acara untuk pesan' },
    { key: 'jam_buka', value: '07:00', keterangan: 'Jam mulai terima order' },
    { key: 'jam_tutup', value: '20:00', keterangan: 'Jam tutup terima order' },
    { key: 'area_layanan', value: 'Seluruh Semarang', keterangan: 'Area delivery' },
    { key: 'maintenance_mode', value: 'false', keterangan: 'true = aktifkan maintenance page' },
    { key: 'wa_bisnis_number', value: '6281234567890', keterangan: 'Nomor WA bisnis (62xxx)' },
    { key: 'nama_bisnis', value: 'Lavanda Catering', keterangan: 'Nama bisnis' },
    { key: 'tagline', value: 'Dipercaya Ratusan Event di Semarang', keterangan: 'Tagline bisnis' },
  ]

  for (const item of settingsSeed) {
    await prisma.settings.upsert({
      where: { key: item.key },
      update: {},
      create: item,
    })
  }
  console.log(`[SEED] Seeded ${settingsSeed.length} settings.`)

  // 2. Seed kategori
  const kategoriSeed = [
    { nama: 'Nasi Box', urutan: 1, is_active: true },
    { nama: 'Prasmanan', urutan: 2, is_active: true },
    { nama: 'Snack', urutan: 3, is_active: true },
    { nama: 'Minuman', urutan: 4, is_active: true },
    { nama: 'Dessert', urutan: 5, is_active: true },
  ]

  for (const item of kategoriSeed) {
    await prisma.kategori.upsert({
      where: { nama: item.nama },
      update: {},
      create: item,
    })
  }
  console.log(`[SEED] Seeded ${kategoriSeed.length} kategori.`)

  // 3. Seed konten_web key='main'
  const defaultKontenHero = {
    judul: 'Sajian Istimewa untuk Momen Berharga',
    sub: 'Layanan catering pernikahan, acara keluarga, dan event korporat premium di Semarang.',
    teks_cta: 'Pesan Sekarang',
    foto_url: '/brand/og-default.jpg',
  }

  const defaultTentangKami = {
    teks: 'Lavanda Catering adalah penyedia jasa katering profesional di Semarang yang berdiri sejak tahun 2018. Kami berkomitmen menghadirkan cita rasa masakan otentik dengan pelayanan prima dan higienis.',
    foto: '/brand/og-default.jpg',
    berdiri_sejak: '2018',
    sertifikasi: ['Halal MUI', 'P-IRT'],
  }

  const defaultKeunggulan = [
    {
      icon: 'restaurant',
      judul: 'Cita Rasa Terjamin',
      deskripsi: 'Dimasak oleh koki berpengalaman menggunakan bahan baku segar dan berkualitas.',
    },
    {
      icon: 'local_shipping',
      judul: 'Gratis Ongkir',
      deskripsi: 'Layanan pengiriman gratis untuk seluruh wilayah Kota Semarang.',
    },
    {
      icon: 'workspace_premium',
      judul: 'Sertifikasi Halal',
      deskripsi: 'Seluruh dapur dan proses pengolahan makanan kami telah bersertifikat halal.',
    },
    {
      icon: 'group',
      judul: 'Pelayanan Profesional',
      deskripsi: 'Staf berpengalaman dan profesional siap melayani pesanan Anda.',
    },
    {
      icon: 'payments',
      judul: 'Harga Kompetitif',
      deskripsi: 'Katering berkualitas premium dengan harga yang bersahabat dan transparan.',
    },
  ]

  const defaultKontak = {
    alamat: 'Jl. Pandanaran No. 123, Semarang',
    telepon: '0812-3456-7890',
    email: 'halo@lavandacatering.id',
    maps_url: 'https://maps.google.com',
    jam_operasional: '07:00 - 20:00',
    area_layanan: 'Seluruh Semarang',
  }

  await prisma.konten_web.upsert({
    where: { key: 'main' },
    update: {
      konten_hero: defaultKontenHero,
      tentang_kami: defaultTentangKami,
      keunggulan: defaultKeunggulan,
      kontak: defaultKontak,
    },
    create: {
      key: 'main',
      konten_hero: defaultKontenHero,
      tentang_kami: defaultTentangKami,
      keunggulan: defaultKeunggulan,
      galeri: [],
      kontak: defaultKontak,
    },
  })
  console.log("[SEED] Seeded konten_web key='main'.")

  console.log('[SEED] Database seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error('[SEED-ERROR] Database seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
