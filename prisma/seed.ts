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

  // 4. Seed menu items for packages
  const nasiBoxKategori = await prisma.kategori.findFirst({ where: { nama: 'Nasi Box' } })
  const prasmananKategori = await prisma.kategori.findFirst({ where: { nama: 'Prasmanan' } })
  const snackKategori = await prisma.kategori.findFirst({ where: { nama: 'Snack' } })
  const minumanKategori = await prisma.kategori.findFirst({ where: { nama: 'Minuman' } })

  const menuSeed = [
    {
      nama: 'Nasi Putih',
      kategori_id: nasiBoxKategori?.id || '',
      harga: 5000,
      min_porsi: 10,
      status: 'aktif',
    },
    {
      nama: 'Ayam Bakar Madu',
      kategori_id: prasmananKategori?.id || '',
      harga: 25000,
      min_porsi: 10,
      status: 'aktif',
    },
    {
      nama: 'Sapi Lada Hitam',
      kategori_id: prasmananKategori?.id || '',
      harga: 35000,
      min_porsi: 10,
      status: 'aktif',
    },
    {
      nama: 'Capcay Seafood',
      kategori_id: prasmananKategori?.id || '',
      harga: 15000,
      min_porsi: 10,
      status: 'aktif',
    },
    {
      nama: 'Es Puter',
      kategori_id: minumanKategori?.id || '',
      harga: 8000,
      min_porsi: 20,
      status: 'aktif',
    },
    {
      nama: 'Air Mineral',
      kategori_id: minumanKategori?.id || '',
      harga: 3000,
      min_porsi: 10,
      status: 'aktif',
    },
    {
      nama: 'Coffee Break Snack',
      kategori_id: snackKategori?.id || '',
      harga: 12000,
      min_porsi: 20,
      status: 'aktif',
    },
    {
      nama: 'Lunch Box Premium',
      kategori_id: nasiBoxKategori?.id || '',
      harga: 30000,
      min_porsi: 10,
      status: 'aktif',
    },
  ]

  const seededMenus: Record<string, string> = {}
  for (const item of menuSeed) {
    if (!item.kategori_id) continue
    let existingMenu = await prisma.menu.findFirst({
      where: { nama: item.nama, deleted_at: null },
    })
    if (!existingMenu) {
      existingMenu = await prisma.menu.create({
        data: {
          nama: item.nama,
          kategori_id: item.kategori_id,
          harga: item.harga,
          min_porsi: item.min_porsi,
          status: item.status,
          deskripsi: `Sajian ${item.nama} spesial rasa premium dari dapur Lavanda.`,
        },
      })
    }
    seededMenus[item.nama] = existingMenu.id
  }
  console.log('[SEED] Seeded menus.')

  // 5. Seed paket
  const paketSeed = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      nama: 'Paket Pernikahan Eksklusif',
      subtitle: 'Untuk 200–500 tamu',
      deskripsi:
        'Solusi lengkap katering pernikahan mewah dengan hidangan prasmanan kelas atas. Layanan lengkap termasuk dekorasi meja saji dan waitress profesional.',
      harga: 85000,
      min_order: 200,
      status: 'aktif',
      items: [
        { menuName: 'Nasi Putih', keterangan: '1 porsi/orang' },
        { menuName: 'Ayam Bakar Madu', keterangan: '1 porsi/orang' },
        { menuName: 'Sapi Lada Hitam', keterangan: '1 porsi/orang' },
        { menuName: 'Capcay Seafood', keterangan: '1 porsi/orang' },
        { menuName: 'Es Puter', keterangan: '1 porsi/orang' },
        { menuName: 'Air Mineral', keterangan: '1 porsi/orang' },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      nama: 'Paket Seminar Profesional',
      subtitle: 'Untuk 100-300 peserta',
      deskripsi:
        'Solusi katering praktis dan elegan untuk acara seminar, meeting, atau corporate event Anda. Disajikan dengan standar higienis tinggi menggunakan bahan-bahan segar pilihan.',
      harga: 45000,
      min_order: 100,
      status: 'aktif',
      items: [
        { menuName: 'Coffee Break Snack', keterangan: '1 porsi/orang' },
        { menuName: 'Lunch Box Premium', keterangan: '1 porsi/orang' },
        { menuName: 'Air Mineral', keterangan: '1 porsi/orang' },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      nama: 'Paket Prasmanan Corporate',
      subtitle: 'Untuk 150-400 porsi',
      deskripsi:
        'Hidangan prasmanan lezat khusus untuk acara gathering, rapat besar, maupun syukuran perusahaan dengan cita rasa Nusantara otentik.',
      harga: 55000,
      min_order: 150,
      status: 'aktif',
      items: [
        { menuName: 'Nasi Putih', keterangan: '1 porsi/orang' },
        { menuName: 'Sapi Lada Hitam', keterangan: '1 porsi/orang' },
        { menuName: 'Capcay Seafood', keterangan: '1 porsi/orang' },
        { menuName: 'Air Mineral', keterangan: '1 porsi/orang' },
      ],
    },
  ]

  for (const pkt of paketSeed) {
    const createdPaket = await prisma.paket.upsert({
      where: { id: pkt.id },
      update: {
        nama: pkt.nama,
        subtitle: pkt.subtitle,
        deskripsi: pkt.deskripsi,
        harga: pkt.harga,
        min_order: pkt.min_order,
        status: pkt.status,
      },
      create: {
        id: pkt.id,
        nama: pkt.nama,
        subtitle: pkt.subtitle,
        deskripsi: pkt.deskripsi,
        harga: pkt.harga,
        min_order: pkt.min_order,
        status: pkt.status,
      },
    })

    // Seed paket_items
    for (const item of pkt.items) {
      const menuId = seededMenus[item.menuName]
      if (!menuId) continue
      await prisma.paket_items.upsert({
        where: {
          paket_id_menu_id: {
            paket_id: createdPaket.id,
            menu_id: menuId,
          },
        },
        update: {
          keterangan: item.keterangan,
          porsi_per_paket: 1,
        },
        create: {
          paket_id: createdPaket.id,
          menu_id: menuId,
          keterangan: item.keterangan,
          porsi_per_paket: 1,
        },
      })
    }
  }
  console.log('[SEED] Seeded pakets and their items.')

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
