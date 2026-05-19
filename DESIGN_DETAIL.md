B5c-DETAIL SELURUH HALAMAN — TECHNICAL SPEC ONLY
30 Halaman | AMD-001 Applied | Navbar Updated | Tab Pill Applied
Tanpa Stitch Prompt — Technical Spec lengkap siap coding

HALAMAN 1: HOMEPAGE
text

ROUTE: / | ROLE: public
DATA SOURCE: API-44 (keunggulan), API-10 (menu featured),
API-40 (galeri), API-45 (testimoni)
CART : useCart hook (AddToCartButton di menu featured)
ANATOMY:

Section Teknis Data
Navbar sticky top-0 z-50 backdrop-blur-sm bg white/95 static
Hero full-viewport h-screen bg-image + gradient overlay static/CMS
Keunggulan map(keunggulan[]) → KeunggulanCard, 3-col grid API-44
Menu Unggulan map(menu[]) limit 8, AddToCartButton per card API-10
Paket Unggulan map(paket[]) limit 3, card mini API-03
Cara Pesan static 3-step flex row static
Galeri map(galeri[]) masonry 3-col max 9 foto API-40
Testimoni map(testimoni[]) limit 6, grid 3-col API-45
Kontak anchor #kontak, static + env WA_NUMBER static
CTA Banner static static
Footer static static
CartBar fixed bottom conditional !cart.isEmpty useCart
CartDrawer conditional isDrawerOpen useCart
STATES:

text

Loading : skeleton grid Section Menu Unggulan (8 card animated pulse)
skeleton grid Section Paket Unggulan (3 card animated pulse)
skeleton grid Section Testimoni (3 card animated pulse)
semua section lain render langsung tanpa skeleton
Empty : Menu Unggulan kosong → 4 card dashed placeholder "Menu segera hadir"
Paket Unggulan kosong → collapse section (tidak render)
Galeri kosong → collapse section (tidak render)
Testimoni kosong → collapse section (tidak render)
Error : toast info bg #EFF6FF border-left 4px #3B82F6
"Beberapa konten gagal dimuat" 4000ms
section yang gagal collapse gracefully
halaman tetap tampil dengan section yang berhasil
Success : tidak ada (non-form page)
INTERAKSI:

text

Aksi: Klik [Pesan Sekarang] Hero
→ navigate /pesan

Aksi: Klik [Lihat Menu] Hero
→ navigate /menu

Aksi: Klik [+ Tambah] featured menu card
→ useCart.addItem({id, nama, foto, harga, porsi: min_porsi, min_porsi})
→ jika sudah ada: increment porsi min_porsi
→ toast success bg #F0FDF4 border-left 4px #4DAF48
"[Nama Menu] ditambahkan ke keranjang ✓" 3000ms
→ CartBar slide-up 250ms jika belum tampil
→ badge highlight muncul di card

Aksi: Klik [Lihat Semua Menu]
→ navigate /menu

Aksi: Klik [Lihat Detail] card paket unggulan
→ navigate /menu/paket/[id]

Aksi: Klik [Lihat Semua Paket →]
→ navigate /menu/paket

Aksi: Klik link Kontak navbar
→ smooth scroll ke section #kontak

Aksi: Klik CartBar
→ setIsDrawerOpen(true)

Aksi: Klik [Lanjut ke Pemesanan →] di CartDrawer
→ navigate /pesan
CART INTEGRATION:

TypeScript

// AddToCartButton di setiap featured menu card
// CartBar sticky bottom muncul jika cart tidak kosong
// CartDrawer full experience tersedia di homepage
// useCart.isInCart(id) → highlight badge pada card
RESPONSIVE:

text

Mobile : Hero h-screen teks center, grid menu 2-col,
keunggulan stack 1-col, paket 1-col,
galeri 2-col, testimoni swipe carousel 1-col,
kontak stack vertikal
Tablet : grid menu 3-col, keunggulan 3-col, paket 2-col
Desktop : grid menu 4-col, keunggulan 3-col, paket 3-col,
galeri masonry 3-col, testimoni 3-col
DATA MOCK:

JSON

{
"keunggulan": [
{"icon": "chef-hat", "judul": "Chef Berpengalaman",
"deskripsi": "Tim chef profesional 10+ tahun di industri katering"},
{"icon": "truck", "judul": "Antar ke Lokasi",
"deskripsi": "Pengiriman tepat waktu ke seluruh Jabodetabek"},
{"icon": "leaf", "judul": "Bahan Segar Setiap Hari",
"deskripsi": "Bahan baku dipilih segar dari pasar lokal setiap pagi"}
],
"menu_featured": [
{"id": "m001", "nama": "Nasi Box Ayam Bakar Madu",
"harga": 35000, "min_porsi": 50,
"foto": "/img/nasi-ayam.jpg", "kategori": "Nasi Box"}
],
"paket_featured": [
{"id": "p001", "nama": "Paket Pernikahan Eksklusif",
"subtitle": "Untuk 200–500 tamu",
"harga_per_porsi": 85000, "min_order": 200,
"items": ["Nasi Putih", "Ayam Bakar", "Gado-gado"]}
],
"galeri": [
{"id": "g001", "foto": "/img/galeri-1.jpg",
"alt": "Acara pernikahan Budi & Sari Jakarta"}
],
"testimoni": [
{"nama": "Ibu Sari Dewi", "kota": "Jakarta Selatan",
"rating": 5,
"teks": "Katering terbaik! Makanan enak dan tepat waktu."}
]
}
HALAMAN 2: KATALOG MENU
text

ROUTE: /menu | ROLE: public
DATA SOURCE: API-01 (list menu)
CART : useCart hook (localStorage)
COMPONENTS: CatalogTabs (shared), AddToCartButton,
CartBar, CartDrawer, CartItemRow
ANATOMY:

Section Teknis Data
Navbar sticky top-0 z-50 static
Page Header H1 + breadcrumb static static
CatalogTabs shared component, usePathname() active state static
Filter Bar sticky top-[64px] z-40, state: activeCategory, searchQuery client
Menu Grid map(filteredItems) → MenuCard API-01
CartBar fixed bottom-6 conditional !cart.isEmpty useCart
CartDrawer conditional isDrawerOpen useCart
Footer static static
COMPONENT: CatalogTabs

TypeScript

// src/components/catalog/CatalogTabs.tsx
// Shared di /menu dan /menu/paket

interface Tab {
label: string // 'Menu Pilihan' | 'Paket Bundling'
icon: string // '🍽️' | '📦'
href: string // '/menu' | '/menu/paket'
}

// Logic:
const pathname = usePathname()
const isActive = (href: string) => pathname === href

// Style active : bg #4DAF48 text white radius-9999px
// shadow(0 2px 8px rgba(77,175,72,0.3))
// pointer-events-none
// Style inactive: bg white border 1.5px #E5E7EB text #6B7280
// radius-9999px hover border #4DAF48
// text #4DAF48 bg #F0FDF4 transition 150ms
// Posisi: antara Page Header dan Filter Bar
// Height tab: 44px | px-6 py-2.5 | gap ikon-label: 8px
STATES:

text

Loading : skeleton 8 card animated pulse
foto placeholder h-48 bg-gray-200 rounded-t-12px
3 line text placeholder gap 8px margin 16px
Empty : ikon 🍽️ 64px #9CA3AF center
heading "Menu belum tersedia" Bold 20px #1E1E1E
subtext "Coba ubah filter atau cari kata lain"
[Reset Filter] Secondary px-6 py-2.5 radius 8px
Error : toast error bg #FEF2F2 border-left 4px #EF4444 ✗
"Gagal memuat menu. Coba lagi." 4000ms kanan-bawah
Success : toast bg #F0FDF4 border-left 4px #4DAF48 ✓
"[Nama Menu] ditambahkan ke keranjang" 3000ms
INTERAKSI:

text

Aksi: Klik tab [Paket Bundling]
→ router.push('/menu/paket')
→ navigate ke halaman paket

Aksi: Klik chip kategori
→ update activeCategory state
→ filter grid client-side tanpa re-fetch

Aksi: Ketik di search input
→ debounce 300ms
→ filter nama menu client-side

Aksi: Klik [+ Tambah] pada card
→ useCart.addItem({
id, nama, foto_url, harga,
porsi: min_porsi, min_porsi,
item_type: 'menu'
})
→ jika sudah ada: increment porsi min_porsi
→ toast "[Nama] ditambahkan ke keranjang" 3000ms
→ CartBar slide-up 250ms jika belum tampil
→ tombol berubah [✓ Ditambahkan]
→ badge "[N] porsi" muncul di foto card

Aksi: Klik [✓ Ditambahkan]
→ useCart.addItem → increment porsi min_porsi
→ update badge porsi di card
→ toast "Porsi [Nama] ditambah menjadi [N] porsi" 2000ms

Aksi: Klik CartBar
→ setIsDrawerOpen(true)

Aksi: Klik [Tambah Menu Lagi] di CartDrawer
→ setIsDrawerOpen(false)

Aksi: Klik [Lanjut ke Pemesanan →] di CartDrawer
→ navigate /pesan

Aksi: Klik foto atau nama card
→ navigate /menu/[id]

Aksi: Klik overlay CartDrawer
→ setIsDrawerOpen(false)
CART DRAWER — ITEM INTERAKSI:

text

Aksi: Klik [−] di CartItemRow
→ jika porsi > min_porsi: useCart.updatePorsi(id, porsi - min_porsi)
→ jika porsi = min_porsi: tombol disabled opacity-0.4, tidak bisa kurang
→ update subtotal + total realtime

Aksi: Klik [+] di CartItemRow
→ useCart.updatePorsi(id, porsi + min_porsi)
→ update subtotal + total realtime

Aksi: Klik 🗑️ hapus di CartItemRow
→ show konfirmasi inline: "Hapus item ini?"
[Ya, Hapus] text-sm #EF4444 | [Batal] text-sm #6B7280
→ konfirmasi [Ya, Hapus]: useCart.removeItem(id)
→ update CartBar total realtime
→ jika cart kosong: CartBar slide-down hilang
FILTER LOGIC:

TypeScript

// client-side filter (tidak re-fetch)
const filtered = menu
.filter(item =>
activeCategory === 'Semua' || item.kategori === activeCategory
)
.filter(item =>
item.nama.toLowerCase().includes(searchQuery.toLowerCase())
)
RESPONSIVE:

text

Mobile : CatalogTabs fit-content kiri, filter chip scroll horizontal
no-scrollbar, search full-width di atas chip, grid 2-col
CartBar di atas safe-area-bottom
Tablet : grid 3-col
Desktop : grid 4-col, filter 1 baris, CartDrawer side panel w-420px
DATA MOCK:

JSON

{
"menu": [
{"id": "m001", "nama": "Nasi Bakar Ikan Asin",
"kategori": "Nasi Box", "harga": 28000,
"min_porsi": 50, "foto": "/img/nasi-bakar.jpg",
"status": "aktif"},
{"id": "m002", "nama": "Gado-Gado Jakarta",
"kategori": "Prasmanan", "harga": 22000,
"min_porsi": 100, "foto": "/img/gado-gado.jpg",
"status": "aktif"},
{"id": "m003", "nama": "Es Teh Manis",
"kategori": "Minuman", "harga": 5000,
"min_porsi": 50, "foto": "/img/es-teh.jpg",
"status": "aktif"}
]
}
HALAMAN 3: DETAIL MENU
text

ROUTE: /menu/[id] | ROLE: public
DATA SOURCE: API-02 (detail menu by ID),
API-01 (menu lainnya same kategori)
CART : useCart hook (localStorage)
COMPONENTS: AddToCartButton (extended),
CartBar, CartDrawer
ANATOMY:

Section Teknis Data
Navbar sticky top-0 z-50 static
Breadcrumb nama dari API-02 response API-02
Foto next/image priority=true sizes responsive API-02
Badge highlight conditional useCart.isInCart(id) useCart
Info Utama destructure API-02 response API-02
Counter porsi useState(menu.min_porsi) client
Estimasi harga computed: counter × harga realtime client
Add to Cart useCart.addItem / updatePorsi useCart
Alergen tags map(alergen[]) → chip API-02
Mobile sticky CTA fixed bottom-0 conditional scroll position client
Menu Lainnya fetch API-01 kategori sama exclude current ID API-01
CartBar fixed bottom-6 conditional useCart
CartDrawer conditional isDrawerOpen useCart
Footer static static
STATES:

text

Loading : skeleton 2-col layout animated pulse
kiri: foto placeholder h-80 bg-gray-200 radius 12px
kanan: badge placeholder w-20 h-6 + H1 placeholder w-3/4 h-8
harga w-1/2 h-6 + 3 line deskripsi + counter placeholder
Section Menu Lainnya: skeleton 4 card
Empty : notFound() → Next.js /not-found (route tidak ada)
Error : toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal memuat detail menu. Coba refresh halaman." 4000ms
Success : toast bg #F0FDF4 border-left 4px #4DAF48
"[Nama Menu] ditambahkan ke keranjang ✓" 3000ms
CartBar slide-up 250ms
FORM FIELDS:

Field Tipe Required Validasi Default
jumlah_porsi number counter ya >= min_porsi, integer, kelipatan min_porsi min_porsi
INTERAKSI:

text

Aksi: Klik [+] counter porsi
→ setState(porsi + min_porsi)
→ update estimasi harga realtime

Aksi: Klik [−] counter porsi
→ jika porsi > min_porsi: setState(porsi - min_porsi)
→ jika porsi = min_porsi: tombol [−] disabled opacity-0.4

Aksi: Klik [+ Tambah ke Keranjang]
→ useCart.addItem({
id, item_type: 'menu',
nama, foto_url, harga,
porsi: jumlah_porsi,
min_porsi
})
→ toast "[Nama] ditambahkan ke keranjang ✓" 3000ms
→ CartBar slide-up 250ms
→ tombol berubah → [✓ Perbarui Keranjang]
→ badge "Di Keranjang ✓" muncul di pojok foto

Aksi: Klik [✓ Perbarui Keranjang]
→ useCart.updatePorsi(id, jumlah_porsi)
→ toast "Porsi [Nama] diperbarui menjadi [N] porsi" 2000ms

Aksi: Klik CartBar
→ setIsDrawerOpen(true)

Aksi: Klik card di Menu Lainnya
→ navigate /menu/[id-lain]
→ re-fetch API-02 dengan ID baru
MOBILE STICKY CTA:

TypeScript

// Fixed bottom-0 muncul setelah scroll melewati kolom info
// Menggunakan IntersectionObserver pada elemen CTA kolom kanan
// Saat CTA kolom kanan tidak visible → show sticky bottom bar
// Layout sticky bar: counter [−][porsi][+] + [+ Tambah ke Keranjang]
// bg white border-top 1px #E5E7EB padding 16px safe-area-inset-bottom
// z-30 (di bawah CartBar z-40)
RESPONSIVE:

text

Mobile : stack vertikal, foto 100% width aspect-video,
sticky CTA bottom bar, menu lainnya horizontal scroll
Tablet : 2-col 50/50
Desktop : 2-col 55/45, CTA dalam kolom kanan,
CartDrawer side panel w-420px
DATA MOCK:

JSON

{
"id": "m003",
"nama": "Ayam Penyet Sambal Bawang",
"kategori": "Prasmanan",
"harga": 32000,
"min_porsi": 50,
"status": "aktif",
"foto": "/img/ayam-penyet.jpg",
"deskripsi": "Ayam goreng empuk dipenyet dengan sambal bawang khas Jawa, disajikan dengan lalapan segar dan nasi putih pulen.",
"alergen": ["kacang tanah"]
}
HALAMAN 4: KATALOG PAKET
text

ROUTE: /menu/paket | ROLE: public
DATA SOURCE: API-03 (list paket)
CART : useCart hook, item_type: 'paket'
COMPONENTS: CatalogTabs (shared), CartBar,
CartDrawer, CartItemRow
ANATOMY:

Section Teknis Data
Navbar sticky top-0 z-50 static
Page Header H1 "Katalog Menu" + breadcrumb static
CatalogTabs shared, usePathname() → /menu/paket active static
Info Banner static static
Paket Grid map(paket[]) → PaketCard API-03
Counter per card useState(min_order) per paket ID sebagai key client
Estimasi per card computed: counter × harga realtime client
CartBar fixed bottom-6 conditional useCart
CartDrawer conditional isDrawerOpen useCart
Footer static static
STATES:

text

Loading : skeleton 3 card animated pulse
header card gray-300 h-28 + 4 line items h-4 + footer h-12
Empty : ikon 📦 64px #9CA3AF center
"Paket belum tersedia" Bold 20px #1E1E1E
"Silakan lihat menu satuan kami" Regular 16px #6B7280
[Lihat Menu Pilihan] gradient px-6 py-2.5 radius 8px → /menu
Error : toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal memuat paket. Coba lagi." 4000ms
Success : toast bg #F0FDF4 border-left 4px #4DAF48
"[Nama Paket] ditambahkan ke keranjang" 3000ms
INTERAKSI:

text

Aksi: Klik tab [Menu Pilihan]
→ router.push('/menu')

Aksi: Counter [+][−] per card
→ update counterState[paketId]
→ update estimasi total per card realtime
→ [−] disabled jika counter = min_order

Aksi: Klik [+ Tambah ke Keranjang]
→ useCart.addItem({
id, item_type: 'paket',
nama, foto_url: null,
harga, porsi: counterState[id],
min_porsi: min_order
})
→ toast "[Nama] ditambahkan ke keranjang" 3000ms
→ CartBar slide-up
→ badge "Di Keranjang ✓" di header card

Aksi: Klik [✓ Di Keranjang]
→ useCart.addItem → increment min_order
→ update badge + estimasi

Aksi: Klik [Lihat Detail →]
→ navigate /menu/paket/[id]

Aksi: Klik CartBar → open CartDrawer
COUNTER STATE MANAGEMENT:

TypeScript

// Setiap card punya counter state sendiri
// Menggunakan object dengan paket ID sebagai key
const [counters, setCounters] = useState<Record<string, number>>({})

const getCounter = (id: string, min: number) =>
counters[id] ?? min

const updateCounter = (id: string, val: number, min: number) =>
setCounters(prev => ({...prev, [id]: Math.max(val, min)}))
RESPONSIVE:

text

Mobile : CatalogTabs fit-content, grid 1-col full-width,
CartBar pill bottom
Tablet : grid 2-col
Desktop : grid 3-col, CartDrawer side panel w-420px
DATA MOCK:

JSON

{
"paket": [
{
"id": "p001",
"nama": "Paket Pernikahan Eksklusif",
"subtitle": "Untuk 200–500 tamu undangan",
"harga_per_porsi": 85000,
"min_order": 200,
"items": [
{"menu": "Nasi Putih", "keterangan": "sesuai order"},
{"menu": "Ayam Bakar Kecap", "keterangan": "1 pcs/orang"},
{"menu": "Gado-gado Jakarta", "keterangan": "1 porsi/orang"},
{"menu": "Es Teh Manis", "keterangan": "1 gelas/orang"}
]
},
{
"id": "p002",
"nama": "Paket Seminar Profesional",
"subtitle": "Untuk 100–300 peserta",
"harga_per_porsi": 45000,
"min_order": 100,
"items": [
{"menu": "Nasi Box Ayam Bakar", "keterangan": "1 box/orang"},
{"menu": "Snack Prasmanan", "keterangan": "2 item/orang"},
{"menu": "Minuman Kotak", "keterangan": "1 pcs/orang"}
]
}
]
}
HALAMAN 5: DETAIL PAKET
text

ROUTE: /menu/paket/[id] | ROLE: public
DATA SOURCE: API-04 (detail paket by ID),
API-03 (paket lainnya exclude current)
CART : useCart hook, item_type: 'paket'
COMPONENTS: CartBar, CartDrawer
ANATOMY:

Section Teknis Data
Navbar sticky top-0 z-50 static
Breadcrumb nama dari API-04 response API-04
Foto next/image, badge "Di Keranjang ✓" conditional API-04
Info Utama destructure response API-04
Highlights map(highlights[]) → chip API-04
Counter order useState(min_order) client
Estimasi total computed: counter × harga realtime client
Add to Cart useCart.addItem type='paket' useCart
Isi Paket map(items[]) 2-col grid API-04
Mobile sticky CTA fixed bottom-0 conditional scroll client
Paket Lainnya fetch API-03 exclude current ID max 3 API-03
CartBar fixed bottom-6 conditional useCart
CartDrawer conditional isDrawerOpen useCart
Footer static static
STATES:

text

Loading : skeleton 2-col animated pulse
kiri: foto gray-200 aspect-video radius 12px
kanan: 6 line text placeholder
Section Isi Paket: skeleton 6 item placeholder
Section Paket Lainnya: skeleton 3 card
Empty : notFound() → /not-found
Error : toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal memuat detail paket. Refresh halaman." 4000ms
Success : toast bg #F0FDF4 border-left 4px #4DAF48
"[Nama Paket] ditambahkan ke keranjang ✓" 3000ms
CartBar slide-up 250ms
FORM FIELDS:

Field Tipe Required Validasi Default
jumlah_order number counter ya >= min_order, integer min_order
INTERAKSI:

text

Aksi: Klik [+] counter
→ setState(order + min_order)
→ update estimasi total realtime

Aksi: Klik [−] counter
→ jika order > min_order: setState(order - min_order)
→ jika order = min_order: tombol [−] disabled opacity-0.4

Aksi: Klik [+ Tambah ke Keranjang]
→ useCart.addItem({
id, item_type: 'paket',
nama, foto_url: null,
harga: harga_per_porsi,
porsi: jumlah_order,
min_porsi: min_order
})
→ toast "[Nama] ditambahkan ke keranjang ✓" 3000ms
→ CartBar slide-up
→ badge "Di Keranjang ✓" di foto
→ tombol → [✓ Perbarui Keranjang]

Aksi: Klik [✓ Perbarui Keranjang]
→ useCart.updatePorsi(id, jumlah_order)
→ toast "Jumlah [Nama] diperbarui menjadi [N] order" 2000ms

Aksi: Klik card Paket Lainnya
→ navigate /menu/paket/[id-lain]
RESPONSIVE:

text

Mobile : stack vertikal, foto 100% aspect-4/3,
isi paket 1-col, sticky CTA bottom bar,
paket lainnya horizontal scroll
Tablet : 2-col 50/50
Desktop : 2-col 55/45, isi paket 2-col,
CartDrawer side panel w-420px
DATA MOCK:

JSON

{
"id": "p002",
"nama": "Paket Seminar Profesional",
"subtitle": "Untuk 100–300 peserta",
"harga_per_porsi": 45000,
"min_order": 100,
"deskripsi": "Paket lengkap untuk acara seminar, workshop, dan training korporat dengan menu bergizi dan penyajian profesional.",
"highlights": [
"Termasuk peralatan makan",
"Gratis setup meja",
"Tersedia pilihan vegetarian"
],
"items": [
{"menu": "Nasi Box Ayam Bakar", "keterangan": "1 box/orang"},
{"menu": "Snack Prasmanan", "keterangan": "2 item/orang"},
{"menu": "Minuman Kotak", "keterangan": "1 pcs/orang"},
{"menu": "Buah Potong", "keterangan": "1 cup/orang"}
]
}
HALAMAN 6: FORM ORDER
text

ROUTE: /pesan | ROLE: public
DATA SOURCE: API-06 (kalender tersedia),
API-08 (settings: dp_pct, rekening, metode bayar),
API-05 (validasi status menu masih aktif — bg check)
CART : useCart hook (read + modify Step 1)
GUARD : cart kosong → tampil empty state Step 1 (tidak redirect)
ANATOMY:

Section Teknis Data
Navbar minimal — logo + [✕ Batalkan] saja static
Step Indicator sticky top-[64px] z-40, useState(currentStep 1-3) client
Step 1 List map(cart.items) → CartItemRow review mode useCart
Step 1 Validasi bg check status menu aktif API-05
Step 1 Subtotal computed dari cart.items useCart
Step 2 Form react-hook-form, semua field client
Step 2 Kalender date input, min H+7, disable tanggal dari API-06 API-06
Step 3 Summary read-only dari form state + cart state client
Step 3 Payment radio full/dp, data dari API-08 API-08
Step 3 Rekening conditional render jika bukan cash API-08
Submit POST API-08 /orders API-08
Footer NONE (focused checkout) —
STATES:

text

Loading : skeleton form Step 2 saat fetch API-06 (8 line animated pulse)
tombol submit Step 3: disabled + spinner 20px white saat proses
Empty : Step 1 cart kosong:
ikon 🛒 80px #9CA3AF center
"Keranjang kamu masih kosong" Bold 20px #1E1E1E
"Tambahkan menu terlebih dahulu." Regular 16px #6B7280
[Lihat Menu] gradient px-8 py-3 radius 8px → /menu
Error : inline per field 12px #EF4444 di bawah field (Step 2)
toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal memproses pesanan. Coba lagi." 4000ms (Step 3 submit)
Success : useCart.clearCart()
redirect /pesan/sukses
state: {nomor_pesanan, nama, total, dp_amount, tipe_bayar, rekening}
STEP INDICATOR:

TypeScript

// sticky top-[64px] z-40 bg white border-bottom 1px #F3F4F6
// 3 step dengan garis penghubung

interface Step {
number: 1 | 2 | 3
label: string // 'Review Pesanan' | 'Data Pemesan' | 'Konfirmasi'
}

// Style:
// active : lingkaran 36px bg #4DAF48 text white Bold 14px
// completed: lingkaran 36px bg #4DAF48 ikon ✓ white
// inactive : lingkaran 36px bg #E5E7EB text #9CA3AF Bold 14px
// garis penghubung h-0.5 flex-1 mx-4:
// completed → #4DAF48 | inactive → #E5E7EB
// label SemiBold 12px di bawah lingkaran
// Mobile: label hanya pada step active
STEP 1 — REVIEW PESANAN:

TypeScript

// Saat mount: validasi semua item di cart masih aktif
// via API-05 background check
// Jika ada yang nonaktif:
// - hapus otomatis dari cart
// - show warning banner per item yang dihapus
// - bg #FEF2F2 border #EF4444 radius 8px padding 12px 16px
// - "⚠ [Nama Menu] tidak lagi tersedia dan telah dihapus dari keranjang."

// CartItemRow review mode:
// foto 64px radius 8px | nama + tipe badge | min-porsi caption
// counter [−][porsi][+] | subtotal #4DAF48 | 🗑️ hapus

// Konfirmasi hapus inline (bukan modal):
// "Hapus item ini?" [Ya, Hapus] text #EF4444 | [Batal] text #6B7280

// Ringkasan subtotal:
// bg #F9FAFB radius 8px padding 16px
// setiap item: nama kiri + "N porsi × Rp X" kanan Regular 14px
// divider + Total Bold 20px #4DAF48
FORM FIELDS STEP 2:

Field Tipe Required Validasi Placeholder
nama text ya min 3 char, max 100 char "Budi Santoso"
no_hp tel ya format +62/08, 10-14 digit "0812-3456-7890"
alamat_event textarea ya min 10 char, max 500 char "Jl. Kemang Raya No. 12..."
tanggal_acara date ya min hari ini +7, tidak pada tanggal diblokir API-06 —
waktu_acara time ya format HH:MM "08:00"
catatan textarea tidak max 300 char "Alergi, permintaan khusus..."
STEP 3 — PAYMENT FIELDS:

Field Tipe Required Validasi Default
tipe_bayar radio ya 'full' atau 'dp' 'dp'
consent checkbox ya harus true untuk enable submit false
INTERAKSI STEP 1:

text

Aksi: Counter [+][−] item
→ useCart.updatePorsi(id, newPorsi)
→ update subtotal + total realtime
→ [−] disabled jika porsi = min_porsi

Aksi: Hapus item → [Ya, Hapus]
→ useCart.removeItem(id)
→ update total realtime
→ jika cart kosong → show empty state

Aksi: [+ Tambah Menu Lagi]
→ navigate /menu (keranjang tetap tersimpan di localStorage)

Aksi: [Lanjut ke Data Pemesan →]
→ validate cart.items.length > 0
→ currentStep = 2
→ fetch API-06 untuk disable tanggal
INTERAKSI STEP 2:

text

Aksi: [← Kembali]
→ currentStep = 1

Aksi: [Lanjut ke Konfirmasi →]
→ react-hook-form trigger() validate semua field
→ valid: currentStep = 3, fetch API-08 untuk payment options
→ tidak valid: show inline error per field
INTERAKSI STEP 3:

text

Aksi: Klik [Edit] di summary
→ currentStep = step terkait (1 untuk item, 2 untuk data)

Aksi: Toggle radio tipe_bayar
→ update tampilan nominal (full / dp_amount)
→ show/hide instruksi transfer

Aksi: [Salin Nomor Rekening]
→ navigator.clipboard.writeText(nomor_rekening)
→ toast "Nomor rekening disalin!" 2000ms

Aksi: Submit [Konfirmasi & Pesan]
→ validate consent === true (tombol disabled jika false)
→ tombol disabled + spinner 20px white
→ POST API-08 /orders {
nama, no_hp, alamat_event,
tanggal_acara, waktu_acara, catatan,
tipe_bayar, consent: true,
items: cart.items.map(i => ({
id: i.id,
item_type: i.item_type,
porsi: i.porsi
})),
source: 'customer'
}
→ sukses:
useCart.clearCart()
router.push('/pesan/sukses')
sessionStorage.setItem('order_result', JSON.stringify(result))
→ gagal:
toast error "Gagal memproses pesanan. Coba lagi." 4000ms
tombol kembali enabled
CART EXPIRY CHECK:

TypeScript

// Saat mount /pesan, cek cart expiry
const cart = useCart()
if (cart.isExpired()) {
cart.clearCart()
// show toast warning
// "Sesi keranjang kamu sudah kedaluwarsa"
// kemudian tampil empty state Step 1
}
RESPONSIVE:

text

Mobile : step indicator angka saja tanpa label (kecuali active)
form full-width, radio card full-width
tombol back+next stack vertikal (next di atas back)
Desktop : max-w-720px center mx-auto
tombol back+next flex row (back kiri, next kanan flex-1)
DATA MOCK:

JSON

{
"cart_items": [
{
"id": "m001", "item_type": "menu",
"nama": "Nasi Box Ayam Bakar Madu",
"harga": 35000, "porsi": 100, "min_porsi": 50,
"subtotal": 3500000
},
{
"id": "p001", "item_type": "paket",
"nama": "Paket Seminar Profesional",
"harga": 45000, "porsi": 150, "min_porsi": 100,
"subtotal": 6750000
}
],
"cart_total": 10250000,
"form_step2": {
"nama": "Budi Santoso",
"no_hp": "081234567890",
"alamat_event": "Jl. BSD Raya No. 5, Tangerang Selatan 15310",
"tanggal_acara": "2025-09-20",
"waktu_acara": "10:00",
"catatan": "Mohon sediakan area untuk 200 tamu"
},
"payment_settings": {
"dp_pct": 50,
"rekening": {
"bank": "BCA",
"nomor": "1234567890",
"atas_nama": "Lavanda Catering"
}
}
}
HALAMAN 7: SUKSES BAYAR
text

ROUTE: /pesan/sukses | ROLE: public
DATA SOURCE: sessionStorage 'order_result' (tidak ada API call)
GUARD : jika tidak ada sessionStorage → redirect /
ANATOMY:

Section Teknis Data
Navbar logo center saja, tidak ada nav link static
Success Icon CSS animation keyframes draw ✓ static
Pesan Sukses nama dari orderState sessionStorage
Nomor Pesanan nomor_pesanan dari orderState sessionStorage
Ringkasan destructure orderState sessionStorage
Instruksi Bayar conditional tipe_bayar !== 'lunas' sessionStorage
CTA buttons navigate links static
Footer static minimal static
STATES:

text

Loading : tidak ada (data dari sessionStorage, instant render)
Empty : !sessionStorage.order_result → router.replace('/')
Error : tidak ada (no API call)
Success : ini IS halaman success
INTERAKSI:

text

Aksi: Klik [Salin Nomor Pesanan]
→ navigator.clipboard.writeText(nomor_pesanan)
→ toast success "Nomor pesanan disalin!" 2000ms

Aksi: Klik [Bagikan via WhatsApp]
→ const text = `Pesanan saya di Lavanda Catering:
  Nomor: ${nomor_pesanan}
  Tanggal: ${tanggal_acara}
  Total: Rp ${total}`
→ window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)

Aksi: Klik [Cek Status Pesanan]
→ navigate /cek-pesanan/[nomor_pesanan]

Aksi: Klik [Kembali ke Beranda]
→ sessionStorage.removeItem('order_result')
→ navigate /
RESPONSIVE:

text

Mobile : semua center, width 100%, CTA stack vertikal full-width
Desktop : max-w-560px center mx-auto, card shadow prominent
DATA MOCK:

JSON

{
"nomor_pesanan": "LVC-20250820-001",
"nama": "Budi Santoso",
"tanggal_acara": "2025-09-20",
"waktu_acara": "10:00",
"alamat_event": "Jl. BSD Raya No. 5, Tangerang Selatan 15310",
"total": 10250000,
"dp_amount": 5125000,
"tipe_bayar": "dp",
"status_bayar": "belum_bayar",
"rekening": {
"bank": "BCA",
"nomor": "1234567890",
"atas_nama": "Lavanda Catering"
}
}
HALAMAN 8: CEK PESANAN INPUT
text

ROUTE: /cek-pesanan | ROLE: public
DATA SOURCE: tidak ada API (form input saja)
ANATOMY:

Section Teknis Data
Navbar standard public navbar static
Hero Card center max-w-480px mx-auto static
Form Input react-hook-form 1 field client
Catatan static teks static
Footer static static
STATES:

text

Loading : tombol disabled + inline spinner 18px saat navigate
(fetch terjadi di halaman /cek-pesanan/[nomor])
Empty : tidak ada
Error : inline "Format nomor pesanan tidak valid" 12px #EF4444
(validasi client-side format saja)
Success : navigate /cek-pesanan/[nomor_pesanan]
FORM FIELDS:

Field Tipe Required Validasi Placeholder
nomor_pesanan text ya format LVC-YYYYMMDD-XXX, auto uppercase "LVC-20250820-001"
INTERAKSI:

text

Aksi: Input teks nomor pesanan
→ auto transform toUpperCase()
→ format hint di bawah input "Format: LVC-YYYYMMDD-XXX"

Aksi: Submit [Cek Sekarang]
→ validate format client-side (regex: /^LVC-\d{8}-\d{3}$/)
→ valid: navigate /cek-pesanan/[nomor]
→ tidak valid: inline error "Format nomor pesanan tidak valid"
RESPONSIVE:

text

Mobile : card full-width margin 16px padding 24px, semua center
Desktop : card max-w-480px center padding 48px shadow-modal
HALAMAN 9: DETAIL CEK PESANAN
text

ROUTE: /cek-pesanan/[nomor] | ROLE: public
DATA SOURCE: API-07 (detail pesanan by nomor, public endpoint)
ANATOMY:

Section Teknis Data
Navbar standard public navbar static
Breadcrumb nomor dari URL param static
Status Badge Card status dari API response API-07
Timeline map(status_history[]) → TimelineItem API-07
Detail Card destructure pesanan API-07
Item List map(items[]) API-07
Pembayaran Info status_bayar, dp_amount, total API-07
Kontak Admin static + env WA_NUMBER static
Footer static static
STATUS BADGE CONFIG:

TypeScript

const statusConfig = {
menunggu: {
label: 'Menunggu Konfirmasi',
bg: '#FFFBEB', text: '#F59E0B', border: '#F59E0B'
},
dikonfirmasi: {
label: 'Dikonfirmasi',
bg: '#F0FDF4', text: '#4DAF48', border: '#4DAF48'
},
persiapan: {
label: 'Dalam Persiapan',
bg: '#EFF6FF', text: '#3B82F6', border: '#3B82F6'
},
selesai: {
label: 'Selesai',
bg: '#F0FDF4', text: '#4DAF48', border: '#4DAF48'
},
dibatalkan: {
label: 'Dibatalkan',
bg: '#FEF2F2', text: '#EF4444', border: '#EF4444'
}
}
TIMELINE CONFIG:

TypeScript

const timelineSteps = [
'Pesanan Masuk',
'Konfirmasi Admin',
'Pembayaran',
'Persiapan',
'Selesai'
]
// active: ikon ✓ bg #4DAF48 garis solid #4DAF48
// completed: sama
// pending: ikon ○ bg gray-200 garis dashed gray-300
// setiap step ada timestamp jika completed
STATES:

text

Loading : skeleton timeline 5 baris animated pulse
skeleton 2 card detail (3 row placeholder each)
Empty : ikon 🔍 64px #9CA3AF center
"Pesanan tidak ditemukan" Bold 20px #1E1E1E
"Pastikan nomor pesanan sudah benar" Regular 16px #6B7280
[Cek Nomor Lain] Secondary → /cek-pesanan
Error : toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal memuat status pesanan. Coba lagi." 4000ms + tombol [Coba Lagi] text-link #4DAF48
Success : tidak ada (read-only page)
INTERAKSI:

text

Aksi: Klik [Cek Nomor Lain]
→ navigate /cek-pesanan

Aksi: Klik [Hubungi Admin via WhatsApp]
→ const text = `Halo, saya ingin bertanya tentang pesanan ${nomor}`
→ window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`)
RESPONSIVE:

text

Mobile : semua stack, max-w-100%, timeline compact margin-left 16px
Desktop : max-w-720px center mx-auto
DATA MOCK:

JSON

{
"nomor_pesanan": "LVC-20250820-001",
"status": "dikonfirmasi",
"nama": "Budi Santoso",
"tanggal_acara": "2025-09-20",
"waktu_acara": "10:00",
"total": 10250000,
"dp_amount": 5125000,
"status_bayar": "dp_dibayar",
"timeline": [
{"step": "Pesanan Masuk", "waktu": "2025-08-20 09:15", "selesai": true},
{"step": "Konfirmasi Admin", "waktu": "2025-08-20 10:30", "selesai": true},
{"step": "Pembayaran", "waktu": "2025-08-20 14:00", "selesai": true},
{"step": "Persiapan", "waktu": null, "selesai": false},
{"step": "Selesai", "waktu": null, "selesai": false}
],
"items": [
{"nama": "Nasi Box Ayam Bakar Madu", "porsi": 100, "subtotal": 3500000}
]
}
HALAMAN 10: FORM TESTIMONI
text

ROUTE: /testimoni/[token] | ROLE: public
DATA SOURCE: API-11 (get info by token),
API-12 (POST submit testimoni)
ANATOMY:

Section Teknis Data
Navbar logo center saja, tidak ada link static
Info Pesanan fetch by token API-11
Rating Stars useState(rating 0-5) client
Nama pre-filled dari API-11, input disabled API-11
Textarea teks controlled, maxLength 500 client
Counter karakter computed 500 - teks.length client
Checkbox izin useState(true default) client
Submit POST API-12 API-12
Success state replace form (in-place) client
Footer NONE —
STATES:

text

Loading : skeleton 1 card h-48 animated pulse saat fetch API-11
Empty : token tidak valid atau sudah digunakan:
ikon ⚠️ 64px #F59E0B center
"Link tidak valid" Bold 20px #1E1E1E
"Link testimoni ini tidak valid atau sudah digunakan."
[Kembali ke Beranda] Secondary → /
Error : toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal mengirim testimoni. Coba lagi." 4000ms
Success : replace seluruh form dengan:
ikon ✓ animasi CSS draw 64px #4DAF48
"Terima Kasih! 🎉" Bold 28px #1E1E1E center
"Testimoni Anda telah berhasil dikirim." Regular 16px #6B7280
[Lihat Website Kami] Secondary → / margin-top 24px
(in-place replace, BUKAN redirect)
FORM FIELDS:

Field Tipe Required Validasi Placeholder
nama text disabled ya pre-filled, tidak bisa edit —
rating star (1-5) ya min 1, tidak boleh 0 —
teks textarea ya min 10 char, max 500 char "Layanan ramah, makanan enak..."
izin_tampil checkbox tidak default true —
INTERAKSI:

text

Aksi: Hover bintang rating
→ preview fill gold #F59E0B hingga bintang yang di-hover

Aksi: Klik bintang
→ setRating(n) 1-5
→ visual: bintang 1 s/d n filled gold, sisanya outline gray-300

Aksi: Ketik teks
→ update counter "N/500" realtime
→ jika > 500: trim + counter merah #EF4444

Aksi: Submit [Kirim Testimoni]
→ validate rating > 0 && teks.length >= 10
→ tombol disabled + spinner 20px white
→ POST API-12 /testimoni {
token,
rating,
teks,
izin_tampil
}
→ sukses: replace form dengan halaman terima kasih (in-place)
→ gagal: toast error "Gagal mengirim testimoni. Coba lagi." 4000ms
tombol kembali enabled
RESPONSIVE:

text

Mobile : max-w-100% padding 24px, bintang 56px each,
textarea rows 4, tombol full-width
Desktop : max-w-560px center mx-auto padding 48px
DATA MOCK:

JSON

{
"token_info": {
"nama": "Ibu Ratna Wulandari",
"nomor_pesanan": "LVC-20250715-003",
"tanggal_acara": "2025-07-15",
"status_token": "valid"
}
}
HALAMAN 11 & 12: PRIVACY POLICY & TERMS OF SERVICE
text

ROUTE: /kebijakan-privasi | /syarat-ketentuan | ROLE: public
DATA SOURCE: static (tidak ada API)
ANATOMY:

Section Teknis Data
Navbar standard public navbar static
Page Header H1 + tanggal update + breadcrumb static
Konten static HTML/MDX max-w-800px center static
Kontak bg #F0FDF4 card + kontak info static
Footer standard footer static
STATES:

text

Loading : tidak ada (static page)
Empty : tidak ada
Error : tidak ada
Success : tidak ada
KONTEN SECTIONS — Privacy Policy:

text

1. Pengumpulan Data Pribadi
2. Penggunaan Data
3. Penyimpanan & Keamanan Data
4. Hak Pengguna
5. Cookie & Tracking
6. Perubahan Kebijakan
7. Kontak
   KONTEN SECTIONS — Terms of Service:

text

1. Penerimaan Syarat
2. Layanan Lavanda Catering
3. Pemesanan & Pembayaran
4. Pembatalan & Refund
5. Tanggung Jawab
6. Perubahan Syarat
7. Kontak
   TYPOGRAPHY KONTEN:

text

H2: Bold 700 24px #1E1E1E margin-top 40px margin-bottom 16px
H3: SemiBold 600 20px #1E1E1E margin-top 24px margin-bottom 12px
p : Regular 400 16px #1E1E1E line-height 1.8 margin-bottom 16px
li: Regular 400 16px #1E1E1E line-height 1.8
a : #4DAF48 underline hover opacity-80
RESPONSIVE:

text

Mobile : padding 16px, H1 28px, font 15px
Desktop : max-w-800px center, line-height 1.9
HALAMAN 13: MAINTENANCE
text

ROUTE: /maintenance | ROLE: public
DATA SOURCE: env var (MAINTENANCE_END, WA_NUMBER)
ANATOMY:

Section Teknis Data
Logo SVG center static
Ilustrasi SVG wrench/tool animasi subtle static
Heading static static
Estimasi conditional process.env.MAINTENANCE_END env var
WhatsApp CTA wa.me/[process.env.WA_NUMBER] env var
STATES:

text

Loading : tidak ada
Empty : tidak ada
Error : tidak ada
Success : tidak ada
MIDDLEWARE:

TypeScript

// middleware.ts
// Redirect semua request ke /maintenance
// kecuali /maintenance itu sendiri dan /admin/login
if (process.env.MAINTENANCE_MODE === 'true') {
if (!pathname.startsWith('/maintenance') &&
!pathname.startsWith('/admin/login')) {
return NextResponse.redirect(new URL('/maintenance', req.url))
}
}
HALAMAN 14: ADMIN LOGIN
text

ROUTE: /admin/login | ROLE: public (pre-auth)
DATA SOURCE: API-13 (POST /auth/login)
GUARD : jika sudah auth → redirect /admin/dashboard
ANATOMY:

Section Teknis Data
Logo SVG center static
Login Card max-w-400px center, shadow-modal static
Form react-hook-form 2 field client
Error Banner conditional showError state client
Rate Limit Warning attemptCount >= 8 client
STATES:

text

Loading : tombol disabled + spinner 18px white dalam tombol
Empty : tidak ada
Error : error banner inline (bukan toast)
bg #FEF2F2 border #EF4444 radius 8px padding 12px 16px
"Email atau kata sandi salah." Regular 14px #EF4444
SELALU generic — tidak spesifik email vs password
Success : redirect /admin/dashboard
set auth token di httpOnly cookie via API response
FORM FIELDS:

Field Tipe Required Validasi Placeholder
email email ya format email valid "admin@lavandacatering.id"
password password ya tidak kosong "••••••••"
INTERAKSI:

text

Aksi: Toggle ikon 👁 password
→ toggle input type password ↔ text

Aksi: Submit [Masuk]
→ tombol disabled + spinner
→ increment attemptCount
→ POST API-13 /auth/login {email, password}
→ sukses (200): redirect /admin/dashboard
→ gagal 401/403: showError = true (banner generic)
→ gagal 429: show rate limit warning
"Terlalu banyak percobaan. Tunggu [N] menit."
bg #FFFBEB border #F59E0B text #F59E0B

Aksi: attemptCount >= 8 (client-side)
→ show warning F59E0B sebelum submit berikutnya
SECURITY NOTES:

text

- Error message SELALU generic
- Tidak bedakan email tidak ada vs password salah
- Rate limit track server-side (API-13) + client-side (attemptCount)
- httpOnly cookie untuk token storage
- Redirect jika sudah auth: middleware check token
  RESPONSIVE:

text

Mobile : card full-width margin 16px padding 32px
Desktop : card max-w-400px center padding 48px shadow-modal
bg #F9FAFB full-page
HALAMAN 15: ADMIN DASHBOARD
text

ROUTE: /admin/dashboard | ROLE: admin
DATA SOURCE: API-15 (stats + pesanan terbaru + kalender mini)
GUARD : middleware proxy.ts — redirect /admin/login jika tidak auth
ANATOMY:

Section Teknis Data
Navbar Admin logo kiri + notif badge + nama admin + logout static + auth state
Sidebar 240px fixed, Dashboard active static
Page Header H1 + tanggal hari ini static
Stats Cards 4 card: map(stats) API-15
Pesanan Perlu Tindakan filter status=menunggu max 5 API-15
Kalender Mini 7-day strip API-15
Quick Actions 4 button card static static
STATS CARDS CONFIG:

TypeScript

const statsConfig = [
{
key: 'pesanan_hari_ini',
label: 'Pesanan Hari Ini',
icon: 'clipboard-list',
color: '#4DAF48'
},
{
key: 'pesanan_bulan_ini',
label: 'Pesanan Bulan Ini',
icon: 'calendar',
color: '#3B82F6'
},
{
key: 'pendapatan_bulan_ini',
label: 'Pendapatan Bulan Ini',
icon: 'currency',
color: '#4DAF48',
format: 'currency'
},
{
key: 'menunggu_konfirmasi',
label: 'Menunggu Konfirmasi',
icon: 'clock',
color: '#F59E0B',
badge: true // tampil badge warning jika > 0
}
]
KALENDER MINI CONFIG:

TypeScript

// 7-day strip: hari ini + 6 hari ke depan
// Setiap cell: tanggal + nama hari + badge jumlah pesanan
const dayStatus = {
tersedia: { bg: '#F0FDF4', text: '#4DAF48' },
hampir_penuh: { bg: '#FFFBEB', text: '#F59E0B' },
penuh: { bg: '#FEF2F2', text: '#EF4444' },
diblokir: { bg: '#F3F4F6', text: '#6B7280' }
}
QUICK ACTIONS:

TypeScript

const quickActions = [
{ label: '+ Buat Pesanan Manual', href: '/admin/pesanan/buat', icon: 'plus' },
{ label: 'Kelola Menu', href: '/admin/menu', icon: 'menu' },
{ label: 'Lihat Laporan', href: '/admin/laporan', icon: 'chart' },
{ label: 'Generate QR Code', href: '/admin/qr-code', icon: 'qr' }
]
STATES:

text

Loading : skeleton 4 stats card + skeleton 5 row table + skeleton 7 day strip, animated pulse
Empty : stats card = 0 → tampilkan 0 (bukan skeleton/hide)
tabel pesanan kosong:
ikon 📋 center "Belum ada pesanan masuk"
subtext "Pesanan baru akan muncul di sini"
Error : toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal memuat data dashboard. Coba refresh." 4000ms
Success : tidak ada (read-only)
INTERAKSI:

text

Aksi: Klik [Lihat] di row pesanan
→ navigate /admin/pesanan/[id]

Aksi: Klik "Lihat Semua →"
→ navigate /admin/pesanan

Aksi: Klik hari di kalender mini
→ navigate /admin/kalender?tanggal=[YYYY-MM-DD]

Aksi: Klik quick action card
→ navigate ke href masing-masing

Aksi: Klik notifikasi badge navbar
→ navigate /admin/pesanan?status=menunggu

Aksi: Klik [Logout] navbar
→ DELETE API-13 /auth/logout
→ clear httpOnly cookie
→ navigate /admin/login
RESPONSIVE:

text

Mobile : sidebar → bottom navigation 5 ikon utama
(Dashboard, Pesanan, Menu, Kalender, More)
stats 2x2 grid, tabel horizontal scroll
kalender mini horizontal scroll
Desktop : sidebar 240px fixed, main content 1040px
DATA MOCK:

JSON

{
"stats": {
"pesanan_hari_ini": 3,
"pesanan_bulan_ini": 47,
"pendapatan_bulan_ini": 12500000,
"menunggu_konfirmasi": 2
},
"pesanan_terbaru": [
{
"id": "ord-003",
"nomor": "LVC-20250820-003",
"nama": "Ibu Haryanti",
"tanggal_acara": "2025-09-15",
"total": 3500000,
"status": "menunggu"
}
],
"kalender_mini": [
{"tanggal": "2025-08-20", "hari": "Rabu",
"jumlah_pesanan": 3, "status": "hampir_penuh"},
{"tanggal": "2025-08-21", "hari": "Kamis",
"jumlah_pesanan": 0, "status": "tersedia"}
]
}
HALAMAN 16: LIST PESANAN ADMIN
text

ROUTE: /admin/pesanan | ROLE: admin
DATA SOURCE: API-15 (list pesanan dengan filter & pagination)
ANATOMY:

Section Teknis Data
Navbar Admin standard admin navbar auth state
Sidebar Pesanan active static
Page Header H1 + [+ Buat Manual] button static
Filter Bar dropdown status + bulan + search client state
Jumlah Hasil "Menampilkan N pesanan" API-15
Tabel map(pesanan[]) → TableRow, sortable header API-15
Pagination page state, totalPage dari API API-15
FILTER STATE:

TypeScript

interface FilterState {
status: 'semua' | 'menunggu' | 'dikonfirmasi' | 'persiapan' | 'selesai' | 'dibatalkan'
bulan: string // format 'YYYY-MM' atau 'semua'
search: string // nomor pesanan atau nama customer
sort_by: 'tanggal_acara' | 'total' | 'created_at'
sort_dir: 'asc' | 'desc'
page: number
}
STATUS BADGE TABLE:

TypeScript

const statusBadge = {
menunggu: { label: 'Menunggu', bg: '#FFFBEB', text: '#F59E0B' },
dikonfirmasi: { label: 'Dikonfirmasi', bg: '#F0FDF4', text: '#4DAF48' },
persiapan: { label: 'Persiapan', bg: '#EFF6FF', text: '#3B82F6' },
selesai: { label: 'Selesai', bg: '#F0FDF4', text: '#4DAF48' },
dibatalkan: { label: 'Dibatalkan', bg: '#FEF2F2', text: '#EF4444' }
}
STATES:

text

Loading : skeleton 8 row tabel, 3 col placeholder per row animated pulse
Empty : ikon 📋 center
"Belum ada pesanan"
"Pesanan dari pelanggan akan muncul di sini"
[+ Buat Pesanan Manual] gradient
Error : toast error "Gagal memuat daftar pesanan. Coba lagi." 4000ms
Success : tidak ada (list page)
INTERAKSI:

text

Aksi: Change dropdown status
→ update filter.status
→ reset page = 1
→ refetch API-15 ?status=[val]&page=1

Aksi: Change dropdown bulan
→ update filter.bulan
→ reset page = 1
→ refetch API-15

Aksi: Ketik search
→ debounce 400ms
→ update filter.search
→ refetch API-15 ?search=[query]

Aksi: Klik header tabel sortable
→ jika field sama: toggle sort_dir asc ↔ desc
→ jika field beda: set sort_by = field, sort_dir = asc
→ refetch API-15 ?sort_by=&sort_dir=

Aksi: Klik nomor halaman pagination
→ update filter.page = n
→ refetch API-15 ?page=n

Aksi: Klik [Lihat] di row
→ navigate /admin/pesanan/[id]

Aksi: Klik [+ Buat Pesanan Manual]
→ navigate /admin/pesanan/buat
RESPONSIVE:

text

Mobile : tabel → card list vertikal per pesanan
filter collapse behind [Filter ▼] button
search full-width
Desktop : tabel full-width, filter 1 baris
DATA MOCK:

JSON

{
"pesanan": [
{
"id": "ord-003",
"nomor": "LVC-20250820-003",
"nama": "Ibu Haryanti",
"tanggal_acara": "2025-09-15",
"total": 3500000,
"status": "menunggu",
"created_at": "2025-08-20T09:15:00Z"
},
{
"id": "ord-002",
"nomor": "LVC-20250819-002",
"nama": "Pak Rudi Hartono",
"tanggal_acara": "2025-09-10",
"total": 8750000,
"status": "dikonfirmasi",
"created_at": "2025-08-19T14:30:00Z"
}
],
"total": 47,
"page": 1,
"per_page": 20,
"total_pages": 3
}
HALAMAN 17: DETAIL PESANAN ADMIN
text

ROUTE: /admin/pesanan/[id] | ROLE: admin
DATA SOURCE: API-16 (detail pesanan),
API-17 (status pembayaran),
API-19 (update status pesanan)
NOTE: 3 API untuk 1 entitas pesanan — valid (SENIOR FLAG clear)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Pesanan active static
Breadcrumb + Header nomor + status badge API-16
Info Pemesan Card destructure pesanan API-16
Detail Item Card map(items[]) API-16
Kalkulasi Card dp, sisa, total API-16
Status Pembayaran Card riwayat pembayaran API-17
Panel Ubah Status form dropdown + textarea client + API-19
Timeline Riwayat map(riwayat_status[]) API-16
STATES:

text

Loading : skeleton 4 card (2-3 row placeholder each) animated pulse
Empty : notFound() → API-16 return 404
Error : toast error bg #FEF2F2 border-left 4px #EF4444
"Gagal memuat detail pesanan. Refresh halaman." 4000ms
Success : toast success bg #F0FDF4 border-left 4px #4DAF48
"Status berhasil diubah" 3000ms
update badge status in-place + update timeline
TIDAK redirect
PANEL UBAH STATUS — FORM FIELDS:

Field Tipe Required Validasi Default
status_baru select ya enum valid, tidak boleh sama dengan status saat ini —
alasan textarea conditional wajib jika status_baru = 'dibatalkan', min 10 char —
STATUS FLOW:

text

menunggu → dikonfirmasi → persiapan → selesai
↘ dibatalkan (dari menunggu atau dikonfirmasi)
INTERAKSI:

text

Aksi: Klik [Konfirmasi Pembayaran]
→ modal konfirmasi:
"Tandai pembayaran sebagai lunas?"
[Ya, Konfirmasi] gradient | [Batal] Secondary
→ konfirmasi:
POST API-17 /payment/confirm {pesanan_id}
→ sukses: update badge status bayar in-place
toast "Pembayaran berhasil dikonfirmasi" 3000ms
→ gagal: toast error "Gagal konfirmasi pembayaran." 4000ms

Aksi: Submit [Simpan Perubahan Status]
→ validate (alasan wajib jika dibatalkan)
→ PATCH API-19 /pesanan/[id]/status {status: status_baru, alasan}
→ sukses: update status badge in-place
append item baru ke timeline
toast success "Status berhasil diubah" 3000ms
→ gagal: toast error "Gagal mengubah status." 4000ms
inline error pada field alasan jika tidak diisi

Aksi: Klik nomor HP di Info Pemesan
→ window.open('tel:[no_hp]')
atau wa.me/[no_hp] — preferensi WA
RESPONSIVE:

text

Mobile : semua card stack vertikal, tombol full-width
Desktop : 2-col layout: kiri (info+detail+kalkulasi),
kanan (status bayar + panel ubah + timeline)
DATA MOCK:

JSON

{
"pesanan": {
"id": "ord-003",
"nomor": "LVC-20250820-003",
"status": "menunggu",
"nama": "Ibu Haryanti",
"no_hp": "081234567890",
"tanggal_acara": "2025-09-15",
"waktu_acara": "10:00",
"alamat_event": "Jl. BSD Raya No. 5, Tangerang Selatan 15310",
"catatan": "Mohon sediakan 5 meja extra",
"items": [
{"nama": "Nasi Box Ayam Bakar", "porsi": 100,
"harga_satuan": 35000, "subtotal": 3500000}
],
"total": 3500000,
"dp_pct": 50,
"dp_amount": 1750000,
"status_bayar": "belum_bayar",
"source": "customer",
"riwayat_status": [
{"status": "menunggu", "waktu": "2025-08-20T09:15:00Z",
"oleh": "system"}
]
}
}
HALAMAN 18: BUAT ORDER MANUAL
text

ROUTE: /admin/pesanan/buat | ROLE: admin
DATA SOURCE: API-18 (POST create manual order),
API-05 (menu list untuk search + pilih),
API-06 (kalender untuk disable tanggal — opsional admin)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Pesanan active static
Page Header breadcrumb + H1 + badge "Admin" static
Form Data Pemesan react-hook-form client
Pilih Menu Section search + add to list API-05 + client
Item List map(selectedItems[]) editable client
Kalkulasi computed dari selectedItems client
Status Bayar radio (admin-only field) client
Submit POST API-18 API-18
PILIH MENU LOGIC:

TypeScript

// Search menu by nama, fetch API-05 ?search=[query]
// Hasil: dropdown list max 5 item
// Klik item → tambah ke selectedItems dengan porsi = min_porsi
// Jika sudah ada → increment porsi min_porsi (bukan duplicate)
// selectedItems: CartItem[] (sama dengan useCart interface)
FORM FIELDS:

Field Tipe Required Validasi Placeholder
nama text ya min 3 char "Ibu Sari Dewanti"
no_hp tel ya format Indonesia "0812-3456-7890"
alamat_event textarea ya min 10 char "Jl. Sudirman No. 1..."
tanggal_acara date ya min besok (admin lebih fleksibel dari H+7) —
waktu_acara time ya — "09:00"
catatan textarea tidak max 300 char —
items[] — ya min 1 item —
porsi per item number ya >= min_porsi —
status_bayar radio ya belum_bayar / dp_dibayar / lunas belum_bayar
nominal_bayar number conditional wajib jika dp_dibayar, > 0 —
source hidden ya hardcode 'admin_manual' —
STATES:

text

Loading : skeleton dropdown result saat search (3 item pulse)
Empty : search tidak menemukan hasil:
"Menu tidak ditemukan untuk '[query]'" caption #6B7280
Error : toast error "Gagal membuat pesanan. Coba lagi." 4000ms + inline per field jika validasi server
Success : redirect /admin/pesanan/[id-baru]
toast "Pesanan berhasil dibuat" 3000ms
(toast muncul di halaman detail setelah redirect)
INTERAKSI:

text

Aksi: Ketik di search menu
→ debounce 300ms
→ GET API-05 ?search=[query]
→ tampilkan dropdown hasil max 5

Aksi: Klik item di dropdown
→ tambah ke selectedItems list
→ default porsi = min_porsi
→ tutup dropdown

Aksi: Counter [+][−] di item list
→ update porsi item
→ update kalkulasi total

Aksi: Klik hapus item
→ removeItem dari selectedItems
→ update kalkulasi

Aksi: Submit [Simpan Pesanan]
→ validate semua field
→ tombol disabled + spinner
→ POST API-18 /pesanan/manual {
...form_data,
items: selectedItems,
status_bayar,
nominal_bayar,
source: 'admin_manual'
}
→ sukses: navigate /admin/pesanan/[id]
→ gagal: toast error + inline validation

Aksi: Klik [Batal]
→ modal konfirmasi "Batalkan buat pesanan?"
→ ya: navigate back /admin/pesanan
HALAMAN 19: LIST MENU ADMIN
text

ROUTE: /admin/menu | ROLE: admin
DATA SOURCE: API-20 (list menu admin, semua status)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Menu active static
Page Header H1 + [+ Tambah Menu] button static
Filter Bar dropdown kategori + status + search client state
Jumlah hasil "Menampilkan N menu" API-20
Grid Menu map(menu[]) → MenuAdminCard API-20
Bulk Action Bar conditional selectedIds.length > 0 client
MENU ADMIN CARD:

TypeScript

// foto 16:9 radius-t-12px
// badge status: Aktif (#4DAF48) / Nonaktif (#6B7280)
// nama Bold 16px + harga + min porsi caption
// footer card:
// checkbox kiri (bulk select)
// [Edit] Secondary kecil → /admin/menu/[id]/edit
// Switch toggle aktif/nonaktif kanan
// checkbox + toggle: min touch 44x44px
STATES:

text

Loading : skeleton 8 card animated pulse
foto gray-200 h-40 + 3 line text + footer placeholder
Empty : ikon 🍽️ center
"Belum ada menu"
[+ Tambah Menu Pertama] gradient → /admin/menu/baru
Error : toast error "Gagal memuat menu. Coba refresh." 4000ms
Success : toast "Status menu diperbarui." 3000ms (per toggle)
INTERAKSI:

text

Aksi: Toggle switch aktif/nonaktif
→ optimistic update (toggle langsung)
→ PATCH API-20 /menu/[id]/status {status: 'aktif'|'nonaktif'}
→ sukses: badge update in-place + toast "Status menu diperbarui."
→ gagal: revert toggle + toast error "Gagal mengubah status."

Aksi: Klik checkbox card
→ toggle selectedIds.includes(id)
→ jika selectedIds.length > 0: show bulk action bar

Aksi: Bulk [Nonaktifkan]
→ modal konfirmasi "Nonaktifkan N menu?"
→ PATCH API-20 /menu/bulk-status {ids: selectedIds, status: 'nonaktif'}
→ sukses: update semua card + clear selectedIds

Aksi: Klik [Edit]
→ navigate /admin/menu/[id]/edit

Aksi: Klik [+ Tambah Menu]
→ navigate /admin/menu/baru
RESPONSIVE:

text

Mobile : grid 2-col, bulk action sticky bottom
Desktop : grid 4-col, bulk action bar atas tabel
HALAMAN 20: BUAT/EDIT MENU
text

ROUTE: /admin/menu/baru (create)
/admin/menu/[id]/edit (edit) | ROLE: admin
DATA SOURCE: API-21 (POST create menu),
API-22 (GET detail + PUT edit menu),
API-24 (POST upload foto)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Menu active static
Page Header breadcrumb + H1 kontekstual static
Foto Upload drag-drop + preview API-24
Form Fields react-hook-form pre-fill pada edit API-22 (GET)
Alergen multi-select chip client
Status Toggle switch aktif/nonaktif client
Footer Action [Batal] + [Simpan] + [Hapus] (edit only) static
FOTO UPLOAD:

TypeScript

// drag-drop area: dashed border 2px #E5E7EB radius 12px
// center: ikon upload + "Klik atau drag foto di sini"
// accepted: jpg, png, webp | max size: 5MB
// preview: img 16:9 setelah upload berhasil
// progress: linear progress bar #4DAF48 saat upload
// error: "Ukuran file terlalu besar (max 5MB)" atau
// "Format tidak didukung (jpg, png, webp saja)"

// Upload flow:
// 1. File selected/dropped
// 2. Client validate size + format
// 3. POST API-24 /upload multipart/form-data
// 4. Response: { url: string }
// 5. Set form field foto_url = url
FORM FIELDS:

Field Tipe Required Validasi Placeholder
foto file upload ya jpg/png/webp max 5MB —
nama text ya min 3 char, max 100 char "Soto Betawi Spesial"
kategori select ya enum: Nasi Box/Prasmanan/Snack/Minuman/Dessert —
harga number ya > 0, integer, max 9999999 "28000"
min_porsi number ya > 0, integer "50"
deskripsi textarea tidak max 500 char —
alergen multi-select tidak enum valid —
status toggle ya aktif/nonaktif aktif
STATES:

text

Loading : skeleton form pada edit mode (fetch API-22)
8 placeholder field animated pulse
Empty : tidak ada (form selalu render)
Error : inline per field 12px #EF4444 di bawah field + toast error "Gagal menyimpan menu." 4000ms
Success : redirect /admin/menu
toast "Menu berhasil disimpan." 3000ms
INTERAKSI:

text

Aksi: Drop/select file foto
→ client validate
→ show progress bar
→ POST API-24 /upload
→ sukses: show preview + set foto_url di form state
→ gagal: inline error di upload area

Aksi: Submit [Simpan Menu]
→ validate semua field (react-hook-form)
→ tombol disabled + spinner
→ POST API-21 /menu (baru)
atau PUT API-22 /menu/[id] (edit)
→ sukses: navigate /admin/menu + toast
→ gagal 422: inline per field dari server error
→ gagal 5xx: toast error

Aksi: [Hapus Menu] (edit mode saja)
→ modal konfirmasi:
"Hapus menu [Nama]? Aksi tidak dapat dibatalkan."
[Ya, Hapus] Danger | [Batal] Secondary
→ konfirmasi:
DELETE API-22 /menu/[id]
navigate /admin/menu
toast "Menu berhasil dihapus."

Aksi: [Batal]
→ jika ada perubahan belum disimpan:
modal "Perubahan belum disimpan. Keluar?"
[Ya, Keluar] | [Tetap di sini]
→ tidak ada perubahan: navigate back langsung
HALAMAN 21: LIST PAKET ADMIN
text

ROUTE: /admin/menu/paket | ROLE: admin
DATA SOURCE: API-25 (list paket admin, semua status)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Menu active (sub: Paket) static
Page Header H1 + [+ Tambah Paket] button static
Paket List map(paket[]) → PaketAdminCard vertikal API-25
Status Toggle per card client + API-25
PAKET ADMIN CARD:

TypeScript

// Layout: card vertikal bg white radius 12px shadow padding 20px
// Header: nama Bold 20px + badge status + switch toggle kanan
// Body:
// subtitle Regular 14px #6B7280
// mini list: max 3 item + "+N lagi" text
// divider
// harga Bold 22px #4DAF48 + min order caption
// Footer:
// [Edit] Secondary → /admin/menu/paket/[id]/edit
// [Lihat Publik] text-link → /menu/paket/[id] new tab
STATES:

text

Loading : skeleton 4 card vertikal animated pulse
h-8 placeholder + 3 line + h-6 footer
Empty : ikon 📦 center
"Belum ada paket"
[+ Tambah Paket Pertama] gradient → /admin/menu/paket/baru
Error : toast error "Gagal memuat paket. Coba refresh." 4000ms
Success : toast "Status paket diperbarui." 3000ms
INTERAKSI:

text

Aksi: Toggle switch aktif/nonaktif
→ optimistic update
→ PATCH API-25 /paket/[id]/status {status}
→ sukses: badge update + toast
→ gagal: revert + toast error

Aksi: Klik [Edit]
→ navigate /admin/menu/paket/[id]/edit

Aksi: Klik [Lihat Publik]
→ window.open('/menu/paket/[id]', '\_blank')
HALAMAN 22: BUAT/EDIT PAKET
text

ROUTE: /admin/menu/paket/baru (create)
/admin/menu/paket/[id]/edit (edit) | ROLE: admin
DATA SOURCE: API-26 (POST create paket),
API-27 (GET detail + PUT edit paket),
API-20 (list menu untuk select items)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Menu active static
Page Header breadcrumb + H1 kontekstual static
Form Utama react-hook-form pre-fill pada edit API-27 (GET)
Item Builder search + add menu + list editable API-20 + client
Live Preview read-only preview card kanan (desktop) client computed
Foto Upload opsional, same flow dengan menu API-24 opsional
Status Toggle aktif/nonaktif client
Footer Action [Batal] + [Simpan] + [Hapus] (edit only) static
ITEM BUILDER:

TypeScript

// Tombol [+ Tambah Item]
// Setiap item row:
// dropdown search menu (GET API-20 ?search=[q])
// input teks keterangan (contoh: "1 box/orang")
// tombol hapus baris
//
// Validasi:
// min 1 item, max 10 item
// jika > 10: [+ Tambah Item] disabled
// counter "N/10 item" di atas list
//
// Duplicate check:
// menu yang sama tidak boleh dipilih 2x dalam 1 paket
// jika duplicate: dropdown error inline "Menu sudah dipilih"
FORM FIELDS:

Field Tipe Required Validasi Placeholder
nama text ya min 3 char, max 100 char "Paket Pernikahan Eksklusif"
subtitle text tidak max 100 char "Untuk 200–500 tamu"
deskripsi textarea tidak max 300 char —
harga number ya > 0, integer "85000"
min_order number ya > 0, integer "200"
items[].menu_id select search ya min 1, max 10, no duplicate —
items[].keterangan text tidak max 50 char "1 porsi/orang"
foto file tidak jpg/png/webp max 5MB —
status toggle ya aktif/nonaktif aktif
LIVE PREVIEW:

TypeScript

// Desktop: card preview sticky kanan, max-w-320px
// Update realtime saat form berubah
// Preview = PaketCard component dalam read-only mode
// Menampilkan: nama, subtitle, list items, harga, min_order
// Label "Preview" Bold 14px #6B7280 di atas card
STATES:

text

Loading : skeleton form pada edit animated pulse
Empty : tidak ada
Error : inline per field + toast "Gagal menyimpan paket." 4000ms
Success : redirect /admin/menu/paket
toast "Paket berhasil disimpan." 3000ms
INTERAKSI:

text

Aksi: Submit [Simpan Paket]
→ validate semua field
→ tombol disabled + spinner
→ POST API-26 (baru) atau PUT API-27/[id] (edit)
→ sukses: navigate /admin/menu/paket + toast
→ gagal: inline per field + toast error

Aksi: [Hapus Paket] (edit only)
→ modal konfirmasi
→ DELETE API-27/[id]
→ navigate /admin/menu/paket + toast "Paket berhasil dihapus."
HALAMAN 23: KALENDER ADMIN
text

ROUTE: /admin/kalender | ROLE: admin
DATA SOURCE: API-29 (kalender data per bulan),
API-30 (POST blokir / DELETE buka tanggal)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Kalender active static
Page Header H1 + navigasi bulan + [Hari Ini] + [+ Blokir] static
Legend static chip 4 status static
Kalender Grid 35 cell (5 minggu × 7 hari), merge API data API-29
Panel Detail slide-in kanan / bottom sheet mobile API-29 (loaded)
Modal Blokir date picker + alasan textarea client + API-30
KALENDER GRID:

TypeScript

// Generate 35 cell dari hari pertama bulan (padding dengan hari sebelumnya)
// Merge dengan API-29 response untuk status + jumlah pesanan

interface DayCell {
date: string // YYYY-MM-DD
isCurrentMonth: boolean
status: 'tersedia' | 'hampir_penuh' | 'penuh' | 'diblokir'
jumlah_pesanan: number
alasan_blokir?: string
pesanan?: PesananMini[]
}

const cellBg = {
tersedia: '#F0FDF4',
hampir_penuh: '#FFFBEB',
penuh: '#FEF2F2',
diblokir: '#F3F4F6'
}
PANEL DETAIL:

TypeScript

// Desktop: slide-in dari kanan, width 320px, overlay partial
// Mobile: bottom sheet, max-h-70vh
// Konten:
// tanggal Bold 18px + status badge
// list pesanan di tanggal itu:
// nama | waktu | status badge | [Lihat] text-link
// jika diblokir: alasan blokir
// tombol [Blokir Tanggal] atau [Buka Blokir] sesuai status
MODAL BLOKIR:

TypeScript

// Trigger: tombol [+ Blokir Tanggal] header atau dari panel detail
// Fields:
// tanggal: date input (pre-filled jika dari panel)
// alasan: textarea, opsional, max 200 char
// [Simpan Blokir] gradient | [Batal] Secondary
STATES:

text

Loading : skeleton 35 cell grid animated pulse
setiap cell: h-24 bg-gray-200 rounded-8px
Empty : semua cell render normal (hijau = tersedia)
tidak ada empty state khusus
Error : toast error "Gagal memuat kalender. Coba refresh." 4000ms
Success : "Tanggal berhasil diblokir." 3000ms
atau "Blokir berhasil dibuka." 3000ms
update cell warna in-place
INTERAKSI:

text

Aksi: Klik [< Prev] / [Next >] navigasi bulan
→ update bulan state
→ refetch API-29 ?bulan=[MM]&tahun=[YYYY]

Aksi: Klik [Hari Ini]
→ set bulan ke bulan saat ini
→ highlight sel hari ini dengan border #4DAF48

Aksi: Klik cell tanggal
→ setSelectedDate(date)
→ open panel detail (data sudah loaded dari API-29)

Aksi: Klik [Blokir Tanggal] di panel / header
→ buka modal, pre-fill tanggal jika dari panel
→ POST API-30 /kalender/blokir {tanggal, alasan}
→ sukses: update cell status in-place + close modal
toast "Tanggal berhasil diblokir." 3000ms

Aksi: Klik [Buka Blokir] di panel
→ modal konfirmasi singkat "Buka blokir tanggal ini?"
→ DELETE API-30 /kalender/blokir/[tanggal]
→ sukses: update cell status in-place
toast "Blokir berhasil dibuka." 3000ms

Aksi: Klik [Lihat] pesanan di panel
→ navigate /admin/pesanan/[id]
RESPONSIVE:

text

Mobile : kalender → list view per hari (compact)
tap hari → bottom sheet panel
Desktop : grid 7-col kalender full, panel slide-in kanan
HALAMAN 24: LAPORAN PENDAPATAN
text

ROUTE: /admin/laporan | ROLE: admin
DATA SOURCE: API-31 (laporan dengan filter periode)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Laporan active static
Page Header H1 + [Export Rekap] button static
Filter Periode tab Mingguan/Bulanan/Tahunan + dropdown client
Summary Cards 4 card stats API-31
Chart line/bar chart, recharts API-31
Breakdown Kategori tabel + donut chart API-31
Tabel Pesanan paginated list API-31
FILTER STATE:

TypeScript

interface LaporanFilter {
periode: 'mingguan' | 'bulanan' | 'tahunan'
bulan?: string // YYYY-MM (untuk bulanan)
tahun?: string // YYYY
minggu?: string // YYYY-WNN (untuk mingguan)
}
SUMMARY CARDS:

TypeScript

const summaryCards = [
{ key: 'total_pendapatan', label: 'Total Pendapatan', format: 'currency' },
{ key: 'jumlah_pesanan', label: 'Jumlah Pesanan', format: 'number' },
{ key: 'rata_rata', label: 'Rata-rata per Pesanan', format: 'currency' },
{
key: 'pertumbuhan',
label: 'Pertumbuhan',
format: 'percent',
positif: { color: '#4DAF48', icon: '↑' },
negatif: { color: '#EF4444', icon: '↓' }
}
]
STATES:

text

Loading : skeleton 4 card + chart area h-64 gray-200 animated + skeleton 8 row tabel
Empty : ikon 📊 64px #9CA3AF center
"Belum ada data periode ini"
"Coba pilih periode lain atau periksa filter."
TIDAK ada tombol aksi
Error : toast error "Gagal memuat laporan. Coba lagi." 4000ms
Success : tidak ada (read-only)
INTERAKSI:

text

Aksi: Klik tab periode / change dropdown
→ update filter state
→ refetch API-31 dengan params baru
→ update semua section dari response

Aksi: Klik [Export Rekap]
→ navigate /admin/laporan/export

Aksi: Hover chart data point
→ tooltip: tanggal + nominal Rp format

Aksi: Klik row tabel pesanan
→ navigate /admin/pesanan/[id]
RESPONSIVE:

text

Mobile : summary 2x2, chart scroll horizontal min-w-400px,
breakdown tabel scroll horizontal
Desktop : 4-col summary, chart full-width, breakdown 2-col
HALAMAN 25: EXPORT REKAP
text

ROUTE: /admin/laporan/export | ROLE: admin
DATA SOURCE: API-32 (POST generate + GET download + GET riwayat)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Laporan active static
Page Header breadcrumb + H1 static
Form Export date range + format + include client
Riwayat Export tabel max 10 API-32
FORM FIELDS:

Field Tipe Required Validasi Default
dari date ya tidak boleh > sampai awal bulan ini
sampai date ya tidak boleh < dari, tidak boleh > hari ini hari ini
format radio ya xlsx / pdf / csv xlsx
include[] checkbox ya min 1: Rekap Pesanan / Rekap Pendapatan / Detail Item semua checked
STATES:

text

Loading : tombol [Download Rekap] disabled + spinner saat generate
skeleton 5 row riwayat animated pulse (initial load)
Empty : riwayat kosong:
"Belum ada riwayat export." Regular 14px #6B7280 center
Error : toast error "Gagal membuat file export. Coba lagi." 4000ms
Success : toast "File berhasil diunduh." 3000ms + trigger browser download (Blob / signed URL) + append baris baru ke riwayat tabel
INTERAKSI:

text

Aksi: Submit [Download Rekap]
→ validate dari <= sampai && include.length > 0
→ tombol disabled + spinner
→ POST API-32 /export/generate {dari, sampai, format, include}
→ response: file blob atau signed URL
→ trigger download: <a href=[url] download> click
→ toast "File berhasil diunduh." 3000ms
→ refetch riwayat tabel

Aksi: Klik [Download Ulang] di riwayat
→ GET API-32 /export/[id]/download
→ trigger download
HALAMAN 26: KELOLA TESTIMONI
text

ROUTE: /admin/testimoni | ROLE: admin
DATA SOURCE: API-33 (list testimoni),
API-34 (PATCH approve/reject),
API-35 (POST generate link)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Testimoni active static
Page Header H1 + badge pending count API-33
Tab Filter Semua / Menunggu / Disetujui / Ditolak client
List Testimoni map(testimoni[]) → TestimoniCard API-33
Generate Link search pesanan + tombol generate API-33 + API-35
TESTIMONI CARD:

TypeScript

// foto avatar 48px radius-full + nama Bold + kota caption
// rating bintang ⭐ #F59E0B
// tanggal submit Regular 12px #6B7280
// teks testimoni italic Regular 16px #6B7280
// nomor pesanan: text-link → /admin/pesanan/[id]
// Footer card actions:
// jika pending: [Setujui] gradient kecil + [Tolak] danger kecil
// jika approved: badge "Ditampilkan" #4DAF48 + [Sembunyikan] text-link
// jika rejected: badge "Ditolak" #EF4444 + [Setujui] text-link
STATES:

text

Loading : skeleton 5 card vertikal animated pulse
Empty : ikon ⭐ 64px #9CA3AF center
"Belum ada testimoni"
"Link testimoni dikirim otomatis setelah pesanan selesai."
Error : toast error "Gagal memuat testimoni. Coba refresh." 4000ms
Success : toast "Testimoni berhasil disetujui." 3000ms
atau "Testimoni berhasil ditolak." 3000ms
atau "Link berhasil dikirim via WhatsApp." 3000ms
update card in-place
INTERAKSI:

text

Aksi: Klik tab filter
→ update activeTab state
→ filter list client-side (data sudah loaded)

Aksi: Klik [Setujui]
→ PATCH API-34 /testimoni/[id]/approve
→ sukses: update badge card in-place + toast

Aksi: Klik [Tolak]
→ modal: textarea alasan opsional
→ PATCH API-34 /testimoni/[id]/reject {alasan}
→ sukses: update badge card in-place + toast

Aksi: Klik [Sembunyikan]
→ PATCH API-34 /testimoni/[id]/hide
→ sukses: update badge "Disembunyikan" in-place

Aksi: Search pesanan + [Generate & Kirim via WA]
→ search: GET API-33 /pesanan?search=[query]&status=selesai
→ pilih pesanan dari dropdown
→ POST API-35 /testimoni/generate {pesanan_id}
→ sukses: toast "Link berhasil dikirim via WhatsApp." + show link preview untuk copy manual
HALAMAN 27: QR CODE MANAGER
text

ROUTE: /admin/qr-code | ROLE: admin
DATA SOURCE: API-36 (list QR),
API-37 (POST generate QR),
API-38 (GET download QR),
API-39 (DELETE hapus QR)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar QR Code active static
Page Header H1 static
Form Generate tipe + label + target client
Preview QR conditional setelah generate API-37
Riwayat QR grid 3-col API-36
FORM GENERATE FIELDS:

Field Tipe Required Validasi Placeholder
tipe select ya menu / wa / bayar —
label text ya min 3 char, max 50 char "Menu Prasmanan 2025"
target text ya URL valid atau nomor WA format Indonesia "https://lavanda.id/menu"
PREVIEW QR:

TypeScript

// Muncul setelah generate berhasil
// QR image 256x256px center dalam card bg white
// Label nama QR di bawah
// URL target caption
// Tombol aksi:
// [Download PNG] gradient
// [Download PDF] Secondary
// [Salin URL] text-link
STATES:

text

Loading : form generate: tombol disabled + spinner saat POST
riwayat: skeleton 6 card grid animated pulse
preview: skeleton 256px gray-200 animated pulse
Empty : riwayat kosong:
"Belum ada QR code dibuat."
Regular 14px #6B7280 center
Error : toast error "Gagal generate QR code. Coba lagi." 4000ms
Success : toast "QR code berhasil dibuat." 3000ms + show preview section
INTERAKSI:

text

Aksi: Submit [Generate QR]
→ validate semua field
→ tombol disabled + spinner
→ POST API-37 /qr-code/generate {tipe, label, target}
→ sukses: set previewData + show preview + toast
append ke riwayat list
→ gagal: toast error

Aksi: [Download PNG]
→ GET API-38 /qr-code/[id]/download?format=png
→ trigger browser download

Aksi: [Download PDF]
→ GET API-38 /qr-code/[id]/download?format=pdf
→ trigger browser download

Aksi: [Salin URL]
→ navigator.clipboard.writeText(target_url)
→ toast "URL berhasil disalin!" 2000ms

Aksi: [Hapus] di riwayat
→ modal konfirmasi "Hapus QR code ini?"
→ DELETE API-39 /qr-code/[id]
→ sukses: remove card dari riwayat
toast "QR berhasil dihapus." 3000ms
RESPONSIVE:

text

Mobile : preview QR center full-width, riwayat 2-col
Desktop : preview center max-w-320px, riwayat 3-col
HALAMAN 28: CMS WEB PROFILE
text

ROUTE: /admin/web-profile | ROLE: admin
DATA SOURCE: API-40 (GET content web profile),
API-41 (PUT save content)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Web Profile active static
Page Header H1 + badge info static
Tab Sections Hero / Keunggulan / Galeri / Kontak client
Form per Tab react-hook-form, pre-fill dari API-40 API-40
Foto Upload drag-drop (Hero + Galeri) API-24
Footer Sticky [Preview Website] + [Simpan Perubahan] static
TAB CONTENT:

TypeScript

// Tab: Hero | Keunggulan | Galeri | Kontak
// Active tab: underline #4DAF48 Bold 14px
// Inactive: Regular 14px #6B7280

// Tab Hero fields:
// foto_hero: upload opsional
// heading: text max 80 char
// subheading: textarea max 200 char
// teks_cta: text max 30 char
// Jika kosong: placeholder kuning "Akan menggunakan teks default"

// Tab Keunggulan:
// list editable max 6 item, min 1
// setiap item: icon dropdown + judul text + deskripsi textarea
// [+ Tambah Keunggulan] disabled jika >= 6
// [Hapus] per item disabled jika hanya 1

// Tab Galeri:
// grid upload max 12 foto
// drag-reorder (react-dnd atau @dnd-kit)
// progress per foto
// [Hapus] per foto
// auto-save order via debounce 1000ms PUT API-41

// Tab Kontak:
// alamat: textarea
// no_wa: tel format Indonesia
// email: email format
// link_maps: url format
// jam_operasional: text max 100 char
STATES:

text

Loading : skeleton form per tab saat initial load
atau saat pertama kali switch ke tab yang belum di-fetch
Empty : field kosong → show placeholder kuning
bg #FFFBEB border #F59E0B radius 8px padding 8px 12px
"Konten kosong — akan menggunakan default"
TIDAK error halaman
Error : toast error "Gagal menyimpan. Coba lagi." 4000ms
inline per field 12px #EF4444 jika validasi server
Success : toast "Web profile berhasil disimpan." 3000ms
in-place, TIDAK redirect
INTERAKSI:

text

Aksi: Submit [Simpan Perubahan] (footer sticky)
→ tombol disabled + spinner
→ PUT API-41 /web-profile dengan semua tab data
→ sukses: toast "Web profile berhasil disimpan." 3000ms
→ gagal: toast error + inline per field

Aksi: Drag reorder foto galeri
→ update order array state
→ debounce 1000ms → PUT API-41 /web-profile {galeri: reordered[]}
→ tidak ada toast (silent save)

Aksi: Upload foto (Hero atau Galeri)
→ POST API-24 /upload
→ sukses: set URL di form state + preview
→ gagal: inline error di upload area

Aksi: [Hapus] foto galeri
→ modal konfirmasi "Hapus foto ini?"
→ remove dari galeri array state
→ (disimpan saat klik [Simpan Perubahan])

Aksi: [Preview Website]
→ window.open('/', '\_blank')
HALAMAN 29: SETTINGS ADMIN
text

ROUTE: /admin/settings | ROLE: admin
DATA SOURCE: API-42 (GET settings),
API-43 (PUT save settings + POST change password)
ANATOMY:

Section Teknis Data
Navbar Admin standard auth state
Sidebar Settings active static
Page Header H1 + badge warning static
Kapasitas Card 4 field API-42
Pembayaran Card dp_pct + rekening + metode API-42
Notifikasi Card toggle WA + email + nomor target API-42
Akun Admin Card nama + email readonly + ganti password API-42
Footer Action [Simpan Pengaturan] gradient static
FORM FIELDS:

Field Tipe Required Validasi Helper
kapasitas_customer number ya integer >= 0 "0 = tidak ada batas"
kapasitas_porsi number ya integer >= 0 "0 = tidak ada batas"
lead_time number ya integer >= 1 "Minimal hari sebelum acara"
jam_buka time tidak format HH:MM "08:00"
jam_tutup time tidak format HH:MM "17:00"
dp_pct number ya 0–100 integer "0% = hanya full payment"
nama_bank text tidak max 50 char "BCA"
no_rekening text tidak max 30 char "1234567890"
atas_nama text tidak max 100 char "Lavanda Catering"
metode_bayar[] checkbox ya min 1: transfer/qris/cash —
notif_wa toggle tidak boolean true
notif_email toggle tidak boolean false
wa_notif_target tel conditional wajib jika notif_wa = true "08129876543"
nama_admin text ya min 3 char —
STATES:

text

Loading : skeleton 4 card form animated pulse saat initial load
Empty : tidak ada (selalu ada nilai default dari API)
Error : toast error "Gagal menyimpan pengaturan. Coba lagi." 4000ms
inline per field 12px #EF4444 jika validasi 422
Success : toast "Pengaturan berhasil disimpan." 3000ms
in-place, TIDAK redirect
INTERAKSI:

text

Aksi: Submit [Simpan Pengaturan]
→ validate semua field
→ tombol disabled + spinner
→ PUT API-43 /settings {semua field}
→ sukses: toast "Pengaturan berhasil disimpan." 3000ms
→ gagal 422: inline per field dari server error
→ gagal 5xx: toast error

Aksi: Klik [Ganti Password]
→ buka modal:
Input: Password Lama (required)
Input: Password Baru (required, min 8 char)
Input: Konfirmasi Password Baru (harus sama)
[Simpan Password] gradient | [Batal] Secondary
→ POST API-43 /settings/change-password {lama, baru}
→ sukses: modal tutup + toast "Password berhasil diubah."
→ gagal 401 (salah password lama):
inline "Password lama tidak sesuai" #EF4444
→ gagal validasi:
inline per field di modal

Aksi: Toggle notif_wa = off
→ hide field wa_notif_target
→ (disimpan saat [Simpan Pengaturan])
RESPONSIVE:

text

Mobile : card stack vertikal, form full-width
Desktop : 2-col layout opsional (kapasitas+notif kiri, bayar+akun kanan)
atau stack single-col max-w-720px center
HALAMAN 30: 404 / 500 ERROR
text

ROUTE: not-found.tsx (404) | error.tsx (500) | ROLE: public
DATA SOURCE: tidak ada (static)
ANATOMY:

Variant File Next.js Trigger
404 app/not-found.tsx notFound() atau route tidak match
500 app/error.tsx uncaught error, error boundary
STATES:

text

Loading : tidak ada
Empty : tidak ada
Error : ini IS halaman error — tidak ada nested error state
Success : tidak ada
INTERAKSI 404:

text

Aksi: Klik [Kembali ke Beranda]
→ navigate /

Aksi: Klik [Lihat Menu]
→ navigate /menu
INTERAKSI 500:

text

Aksi: Klik [Coba Lagi]
→ error.tsx: panggil reset() dari Next.js error boundary
→ re-render section yang error

Aksi: Klik [Hubungi Kami]
→ window.open('https://wa.me/[WA_NUMBER]')
RESPONSIVE:

text

Mobile : center, padding 32px, tombol full-width stack,
ilustrasi 120px
Desktop : ilustrasi 200px, max-w-480px center mx-auto,
tombol inline flex gap
