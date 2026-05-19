# DESIGN.md
# Lavanda Catering — Design System + Sitemap + Page Specs
# Blueprint Phase 2 v4.2 FINAL + AMD-001

---

## DESIGN SYSTEM

### Identitas
Style          : Clean Minimalist (Food Visual Focus)
Vibe Statement : "Fresh, Professional, and Appetizing"
Referensi      : Tokopedia/Shopee (banyak CTA, foto produk besar)
                 + Apple/Stripe (premium, minimal, polished)
Target Audience: Usia 20–40 tahun
                 HR Perusahaan | Hotel | Pabrik | Event Nikahan | Mahasiswa
Area Layanan   : Seluruh Semarang

---

### COLORS

Primary       #4DAF48   Hijau Brand      CTA button, icon aktif, status confirmed
Secondary     #96B83D   Hijau Olive      Badge, tag kategori, progress bar
Accent        #C6DE89   Hijau Muda       Background card, hover state, subtle bg
Neutral Dark  #1E1E1E   Charcoal         Heading, teks utama
Neutral Mid   #6B7280   Abu Netral       Teks sekunder, caption, placeholder
Background    #F9FAFB   Off-White        Halaman utama
Surface       #FFFFFF   Pure White       Card, modal, form
Warning       #F59E0B   Amber            WA belum terkirim, warning state
Danger        #EF4444   Merah Lembut     Error, tombol batalkan
Success       #4DAF48   (=Primary)       Status selesai, konfirmasi
Info          #3B82F6   Biru             Info banner

Gradient CTA  : linear-gradient(135deg, #4DAF48 0%, #96B83D 60%, #C6DE89 100%)
Gradient Hero : linear-gradient(135deg, #4DAF48 0%, #96B83D 60%, #C6DE89 100%)
               dipakai: Hero overlay, header paket card, CTA banner

---

### TYPOGRAPHY

Font Utama    : Plus Jakarta Sans (Google Fonts — gratis)
Fallback      : Inter → system-ui
Base Size     : 16px
Line Height   : 1.7

Heading H1    : font-weight 800, size 32px mobile / 48px desktop
Heading H2    : font-weight 700, size 24px mobile / 32px desktop
Heading H3    : font-weight 600, size 20px mobile / 24px desktop
Body          : font-weight 400, size 16px
Label         : font-weight 600, size 14px
Caption       : font-weight 400, size 12px

---

### SPACING & SHAPE

Spacing Base  : 4px (semua kelipatan 4: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
Border Radius :
  Card/Modal  : 12px
  Input/Button: 8px
  Badge/Pill  : 9999px
  Image       : 12px

Shadow Card   : 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
Shadow Modal  : 0 20px 60px rgba(0,0,0,0.12)
Shadow Hover  : 0 8px 24px rgba(0,0,0,0.12)
Shadow Cart   : 0 8px 32px rgba(0,0,0,0.24)
Border Default: 1px solid #E5E7EB

---

### GLOBAL UI ELEMENTS

#### NAVBAR
Height        : 64px
Background    : #FFFFFF / rgba(255,255,255,0.95) + backdrop-blur saat scroll
Border Bottom : 1px solid #F3F4F6
Left          : Logo Lavanda Catering (SVG) + nama bisnis
               font SemiBold 18px #1E1E1E

Right Public  : Link "Beranda" → /
                Link "Menu" → /menu
                Link "Cek Pesanan" → /cek-pesanan
                Link "Kontak" → /#kontak
                Tombol [Pesan Sekarang] gradient
                spacing antar link 32px | SemiBold 14px #6B7280
                active link: #4DAF48 | hover: #4DAF48 transition 150ms

Right Admin   : Badge notif + nama admin + tombol [Logout] text-only #6B7280

Behavior      : sticky top-0, z-50
Mobile Public : hamburger icon kanan → overlay full-screen white
                list: Beranda, Menu, Cek Pesanan, Kontak
                + [Pesan Sekarang] gradient full-width di bawah list
Mobile Admin  : Logo + hamburger → bottom navigation bar

Stitch        : "White sticky 64px navbar, logo and brand name left,
                 navigation links Beranda Menu Cek-Pesanan Kontak
                 center-right SemiBold 14px charcoal with green active
                 state, gradient CTA button Pesan-Sekarang far right,
                 hamburger on mobile"

#### SIDEBAR (ADMIN ONLY — Desktop)
Width         : 240px | Collapsed: 60px (tablet)
Background    : #FFFFFF
Border Right  : 1px solid #E5E7EB
Menu Items    : Dashboard, Pesanan, Menu, Kalender, Laporan,
                Testimoni, QR Code, Settings
Active State  : bg #F0FDF4, border-left 3px #4DAF48, text #4DAF48
Hover State   : bg #F9FAFB
Mobile        : Bottom Navigation Bar (5 ikon utama: Dashboard, Pesanan,
                Menu, Laporan, Settings)
Stitch        : "White sidebar with Lavanda green active indicator,
                 icon + label per item, smooth hover transition"

#### FOOTER (PUBLIC)
Background    : #1E1E1E (Charcoal)
Text Color    : #9CA3AF
Link Hover    : #4DAF48
Border Top    : 1px solid #374151
Konten        : Kolom 1: Logo putih + tagline
                Kolom 2: Kontak — nomor WA, email, alamat
                Kolom 3: Area Layanan — Seluruh Semarang
                Kolom 4: Link /kebijakan-privasi + /syarat-ketentuan
Height        : auto ~280px
WAJIB         : Link /kebijakan-privasi dan /syarat-ketentuan selalu ada
Floating WA   : Fixed bottom-right mobile, z-50, bg #25D366,
                ikon WA putih 24px, radius-full 56px shadow-lg
Stitch        : "Dark charcoal footer, white Lavanda logo, light gray
                 text, green hover on links, full width"

#### TOAST NOTIFICATIONS
Position      : kanan bawah desktop / bawah tengah mobile
Duration      : 4000ms
Z-index       : 9999
Library       : sonner

success : bg #F0FDF4  border-left 4px #4DAF48  icon ✓  text #166534
error   : bg #FEF2F2  border-left 4px #EF4444  icon ✗  text #991B1B
warning : bg #FFFBEB  border-left 4px #F59E0B  icon ⚠  text #92400E
info    : bg #EFF6FF  border-left 4px #3B82F6  icon ℹ  text #1E40AF

#### CART BAR (AMD-001 — sticky bottom)
Kondisi       : tampil HANYA jika keranjang tidak kosong
Position      : fixed bottom-6 left-1/2 -translate-x-1/2 z-40
Background    : #1E1E1E
Radius        : 9999px (pill)
Padding       : px-6 py-3.5
Shadow        : 0 8px 32px rgba(0,0,0,0.24)
Min Width     : 280px
Layout        : [🛒 ikon white 20px]
                [badge merah bulat: jumlah item Bold 11px]
                gap 12px
                "[N] item · Rp [total]" SemiBold 14px white
                gap 12px
                "Lihat Keranjang →" SemiBold 14px #C6DE89
Animasi       : slide-up + fade-in 250ms ease-out saat muncul
                slide-down + fade-out 200ms saat cart kosong
Halaman aktif : /, /menu, /menu/[id], /menu/paket, /menu/paket/[id]
Stitch        : "Fixed pill-shaped dark charcoal cart bar bottom center,
                 white cart icon red badge, item count and total white
                 SemiBold, accent green Lihat-Keranjang CTA text,
                 slide-up animation when cart has items"

#### CART DRAWER (AMD-001 — bottom sheet / side panel)
Trigger       : klik CartBar
Mobile        : fixed bottom-0 left-0 right-0 max-h-85vh z-50
                bg #FFFFFF radius-t-xl 20px
                shadow: 0 -8px 40px rgba(0,0,0,0.16)
Desktop       : fixed right-0 top-0 bottom-0 w-420px z-50
                bg #FFFFFF radius-l-xl 20px
                shadow: -8px 0 40px rgba(0,0,0,0.12)
Overlay       : bg rgba(0,0,0,0.4) fixed inset-0 z-40
                klik overlay → tutup drawer
Struktur      :
  Handle Bar  : w-10 h-1 bg-gray-300 radius-full mt-3 mx-auto (mobile)
  Header      : "Keranjang Pesanan" SemiBold 18px #1E1E1E
                + ikon ✕ kanan, border-bottom 1px #E5E7EB, padding 20px 24px
  List        : scrollable, padding 16px 24px per item
                CartItemRow: foto 56px radius 8px | nama Bold 14px |
                caption min-porsi 12px #6B7280 |
                counter [−][porsi][+] 32x32px border #E5E7EB |
                subtotal Bold 14px #4DAF48 | ikon 🗑️ hapus
                konfirmasi hapus inline: "Hapus item ini?"
                [Ya, Hapus] text #EF4444 | [Batal] text #6B7280
                divider 1px #F3F4F6 antar item
  Footer      : sticky border-top 1px #E5E7EB padding 20px 24px
                "Total" Regular 14px #6B7280 + "Rp [total]" Bold 20px #4DAF48
                [Tambah Menu Lagi] Secondary full-width 44px margin-top 12px
                [Lanjut ke Pemesanan →] gradient full-width 48px margin-top 8px
Empty state   : ikon 🛒 64px gray-300 center
                "Keranjang masih kosong"
                "Tambah menu favoritmu dari katalog"
                [Lihat Menu] gradient → /menu
Counter rule  : tombol [−] disabled (opacity 0.4) jika porsi = min_porsi
Stitch        : "Bottom sheet cart drawer mobile right-side panel desktop,
                 white background handle bar top mobile, header close button,
                 scrollable item list thumbnail foto 56px name counter
                 green subtotal, sticky footer total and two buttons"

#### CART BADGE / HIGHLIGHT (AMD-001 — pada menu card)
Kondisi       : tampil jika item sudah ada di keranjang
Position      : absolute top-2 right-2 pada foto card
Background    : #4DAF48
Text          : white Bold 11px "[N] porsi"
Radius        : 9999px | padding px-2 py-0.5

Tombol [+ Tambah] saat sudah di cart:
  Background  : #F0FDF4
  Border      : 1.5px solid #4DAF48
  Text        : #4DAF48 "✓ Ditambahkan"
  Klik lagi   : increment porsi sebesar min_porsi

#### CATALOG TABS (shared — /menu dan /menu/paket)
Komponen      : src/components/catalog/CatalogTabs.tsx
Posisi        : antara Page Header dan Filter Bar
Tab items     : 🍽️ Menu Pilihan → /menu
                📦 Paket Bundling → /menu/paket
Style aktif   : bg #4DAF48, text white Bold 14px,
                px-6 py-2.5 radius 9999px height 44px
                shadow(0 2px 8px rgba(77,175,72,0.3))
                pointer-events-none (tidak bisa diklik ulang)
Style inactive: bg white, border 1.5px #E5E7EB, text #6B7280 SemiBold 14px
                px-6 py-2.5 radius 9999px height 44px
                hover: border #4DAF48 text #4DAF48 bg #F0FDF4 transition 150ms
Teknis        : usePathname() untuk determine active state
                klik tab inactive → router.push(href)
                navigate antar route (BUKAN switch konten dalam 1 page)
Mobile        : fit-content horizontal scroll jika tidak muat

#### BUTTONS
Primary   : bg gradient(135deg, #4DAF48→#96B83D→#C6DE89),
            text white Bold 14px, px-6 py-3, radius 8px,
            height 48px, hover brightness-110
Secondary : bg white, border 1.5px #4DAF48, text #4DAF48,
            hover bg #F0FDF4, radius 8px
Danger    : bg #EF4444, text white, radius 8px, hover #DC2626
Ghost     : bg transparent, text #6B7280, hover bg #F9FAFB
Disabled  : bg #E5E7EB, text #9CA3AF, cursor not-allowed
Touch Min : 44×44px (WCAG 2.1)

#### INPUT FIELDS
Border        : 1px solid #E5E7EB
Radius        : 8px
Height        : 48px
Focus Ring    : 2px solid #4DAF48, border #4DAF48
Label         : above input, font 14px SemiBold, color #374151
Error State   : border #EF4444, error text 12px #EF4444 di bawah field
Placeholder   : #9CA3AF
Disabled      : bg #F9FAFB, text #9CA3AF

#### CARDS
Background    : #FFFFFF
Shadow        : 0 1px 3px rgba(0,0,0,0.08)
Radius        : 12px
Padding       : 16px
Hover         : shadow(0 8px 24px rgba(0,0,0,0.12)) translate-y(-2px)
                transition 200ms ease
Menu Card     : foto 16:9 → badge kategori → nama → harga →
                min porsi → [+ Tambah]
                Badge highlight hijau jika sudah di keranjang (AMD-001)
Paket Card    : header gradient → list menu → harga → counter →
                [+ Tambah ke Keranjang] → [Lihat Detail →]

#### PAGE SHELL
Max Width     : 1280px
Padding       : 16px mobile / 24px tablet / 32px desktop
Background    : #F9FAFB

#### LOADING STATE
Jenis         : Skeleton screen (BUKAN spinner — tanpa kecuali)
Warna         : bg-gray-200 animated pulse
Berlaku       : semua halaman, semua section yang fetch data

---

### MOBILE UX PATTERNS

- Bottom Navigation Bar (thumb-friendly, admin)
- Swipe horizontal (galeri, testimoni, filter chip)
- Sticky bottom CTA (checkout flow, detail menu)
- Cart Bar sticky bottom pill (AMD-001)
- Cart Drawer bottom sheet (AMD-001)
- Skeleton screen loading (bukan spinner)
- Toast notification bottom center (feedback aksi)
- Lazy load + WebP (Next.js Image)
- Single column form, full-width input
- Touch target min 44×44px (WCAG 2.1)
- Modal overlay untuk konfirmasi aksi penting
- Floating WhatsApp button fixed bottom-right

---

### HOMEPAGE LAYOUT

Navbar sticky (Beranda | Menu | Cek Pesanan | Kontak | [Pesan Sekarang])
↓
Hero full-width foto makanan (min 60vh)
  Overlay: gradient(135deg, rgba(77,175,72,0.85), rgba(150,184,61,0.7))
  Tagline : "Dipercaya Ratusan Event di Semarang —
             Lezat, Tepat Waktu, Tanpa Ongkir"
  White text + CTA gradient button + CTA secondary button
↓
Trust Bar (5 poin):
  🍽️ Cita Rasa Terjamin
  🚚 Gratis Ongkir Seluruh Semarang
  ⭐ Dipercaya Banyak Client
  ⏰ Selalu Tepat Waktu
  💰 Harga untuk Semua Kalangan
  + counter: "X pesanan selesai bulan ini" (real-time dari DB)
↓
Menu Unggulan (2-col mobile / 4-col desktop)
  AddToCartButton per card
  [Lihat Semua Menu] Secondary → /menu
↓
Paket Unggulan (1-col mobile / 3-col desktop)
  max 3 paket featured dari API-03
  [Lihat Detail] per card → /menu/paket/[id]
  [Lihat Semua Paket →] Secondary → /menu/paket
↓
Cara Pesan 3 Step (icon + teks)
  Step 1: Pilih Menu dari Keranjang
  Step 2: Isi Data Pemesan
  Step 3: Konfirmasi & Bayar
↓
Galeri (2-col mobile / 3-col masonry desktop)
  Data dari API-40 (CMS Web Profile)
  Max 9 foto ditampilkan
↓
Testimoni (swipe carousel mobile / 3-col desktop)
  Data dari API-45
  Max 6 testimoni
↓
Kontak (anchor: #kontak)
  Info: alamat, WA, email, jam operasional
  Link Google Maps
  CTA: [Chat WhatsApp] gradient
↓
CTA Banner
  bg gradient #4DAF48→#96B83D
  Tombol [Pesan Sekarang] white bg text #4DAF48
↓
Footer

Floating WA Button: fixed bottom-right mobile, z-50

---

### CATALOG TABS LAYOUT (/menu dan /menu/paket)

Page Header
  H1 "Katalog Menu"
  Breadcrumb kontekstual
  ↓
Catalog Tabs (shared component)
  [ 🍽️ Menu Pilihan (active) ]  [ 📦 Paket Bundling ]
  pill rounded, navigate antar route
  ↓
Filter Bar (hanya di /menu — tidak ada di /menu/paket)
  chip kategori horizontal scroll + search input
  ↓
Grid / List konten

---

### FORM ORDER FLOW (F2 — AMD-001)

Progress: [1. Review Pesanan] → [2. Data Pemesan] → [3. Konfirmasi]

STEP 1 — Review Pesanan (dari keranjang):
  Guard: jika keranjang kosong → empty state + [Lihat Menu]
  List item dari keranjang:
    foto 64px | nama | tipe badge (Menu/Paket) |
    caption min-porsi | [−] porsi [+] | subtotal | [🗑️]
  Konfirmasi hapus: inline (bukan modal)
  Tombol [+ Tambah Menu Lagi] → navigate /menu (keranjang tetap)
  Ringkasan subtotal per item + Total Bold #4DAF48
  Tombol [Lanjut ke Data Pemesan →]

  Validasi background saat mount:
  → Cek status setiap item via API-05
  → Jika menu nonaktif: hapus otomatis + warning banner
    "⚠ [Nama Menu] tidak lagi tersedia dan telah dihapus dari keranjang."

  Cart expiry check saat mount:
  → Jika cart expired (>24 jam): clearCart() + toast warning
    "Sesi keranjang kamu sudah kedaluwarsa"

STEP 2 — Data Pemesan:
  Single column, full-width input
  Nama pemesan | No. HP (+62 prefix) | Alamat event (textarea)
  Tanggal acara (kalender, H+7 minimum, disable tanggal diblokir)
  Waktu acara | Catatan khusus (opsional, max 300 char)
  Error: inline 12px #EF4444 per field

STEP 3 — Konfirmasi & Pembayaran:
  Ringkasan order: nama, HP, tanggal, waktu, alamat, list item
  [Edit] text-link per section → kembali step terkait

  Breakdown:
    Subtotal         : Rp XXX
    Ongkir           : Gratis ✓ (seluruh Semarang)
    ─────────────────────────────
    Total Bayar      : Rp XXX

  Pilihan pembayaran (radio card):
    Full Payment     : bayar total sekarang
    DP [N]%          : bayar sebagian, sisa sebelum acara

  Info rekening transfer (conditional):
    bg #FFFBEB border #F59E0B
    Bank | Nomor | Atas Nama | [Salin Nomor]

  Consent checkbox (wajib true untuk enable submit):
    "Saya setuju dengan Syarat & Ketentuan dan Kebijakan Privasi"

  Tombol [Konfirmasi & Pesan] gradient full-width 56px
    disabled jika consent false
    loading: disabled + spinner 20px white saat submit

  Submit payload:
    {nama, no_hp, alamat_event, tanggal_acara, waktu_acara,
     catatan, tipe_bayar, consent: true,
     items: cart.items.map({id, item_type, porsi}),
     source: 'customer'}

  Sukses: clearCart() → redirect /pesan/sukses

---

### ADMIN DASHBOARD LAYOUT

Desktop: Sidebar kiri 240px fixed + Konten utama

Summary Cards (5 card — atas fold):
  [Pesanan Baru 🔴]     jumlah pesanan masuk hari ini belum diproses
  [Menunggu Bayar 🟡]   pesanan konfirmasi tapi belum bayar lunas
  [Diproses 🔄]         pesanan status persiapan/aktif
  [Selesai Hari Ini ✅]  pesanan completed hari ini
  [Refund Pending 🟠]   pesanan yang ada permintaan refund

Tabel pesanan: sortable header desktop → card list mobile
Detail pesanan: timeline status visual
Kalender mini: 7-day strip dengan status ketersediaan
Quick Actions: 4 card (Buat Manual, Kelola Menu, Laporan, QR Code)

Modal WA (auto-muncul setiap admin ubah status pesanan):
┌─────────────────────────────────────────┐
│ 💬 Template WA — [Nama Status]          │
│ Kepada: [Nama] ([No HP])                │
│ ┌─────────────────────────────────────┐ │
│ │ [Template auto-filled, editable]    │ │
│ │ Karakter: XX/300                    │ │
│ └─────────────────────────────────────┘ │
│ [📋 Copy Pesan]  [💬 Buka WA Nama]     │
│ ☐ WA sudah terkirim (wajib dicentang)  │
│ ⚠️ Email otomatis akan terkirim         │
│ [✅ Simpan Status]    [← Batal]         │
└─────────────────────────────────────────┘

Modal WA rules:
  - Auto-muncul setiap kali status pesanan diubah
  - Template pre-filled sesuai status baru
  - Admin bisa edit template sebelum copy
  - Checkbox "WA sudah terkirim" wajib dicentang
    sebelum [Simpan Status] bisa diklik
  - Jika batal: status TIDAK berubah

---

## SITEMAP

/
├── /                           Homepage (Web Profile)
├── /menu                       Katalog Menu (tab: Menu Pilihan)
│   └── /menu/[id]              Detail Menu
├── /menu/paket                 Katalog Paket (tab: Paket Bundling)
│   └── /menu/paket/[id]        Detail Paket
├── /pesan                      Form Order 3-step (AMD-001)
│   └── /pesan/sukses           Halaman Sukses Bayar
├── /cek-pesanan                Input Nomor Pesanan
│   └── /cek-pesanan/[nomor]    Detail Status Pesanan
├── /testimoni/[token]          Form Testimoni Customer
├── /kebijakan-privasi          Privacy Policy (UU PDP)
├── /syarat-ketentuan           Terms of Service
├── /maintenance                Maintenance Mode
└── /admin (semua guarded proxy.ts)
    ├── /admin/login
    ├── /admin/dashboard
    ├── /admin/pesanan
    │   ├── /admin/pesanan/[id]
    │   └── /admin/pesanan/buat
    ├── /admin/menu
    │   ├── /admin/menu/baru
    │   ├── /admin/menu/[id]/edit
    │   └── /admin/menu/paket
    │       ├── /admin/menu/paket/baru
    │       └── /admin/menu/paket/[id]/edit
    ├── /admin/kalender
    ├── /admin/laporan
    │   └── /admin/laporan/export
    ├── /admin/testimoni
    ├── /admin/qr-code
    ├── /admin/web-profile
    └── /admin/settings

Total route : 30
Catatan     : /menu dan /menu/paket adalah route sejajar (bukan nested)
              untuk menghindari konflik dengan dynamic segment [id]

---

## PAGE SPECS — Index (B5c-Lite)

| No | Nama Halaman            | Route                    | Role   | API-ID Utama                   |
|----|-------------------------|--------------------------|--------|--------------------------------|
| 1  | Homepage                | /                        | public | API-44, API-10, API-03, API-45 |
| 2  | Katalog Menu            | /menu                    | public | API-01                         |
| 3  | Detail Menu             | /menu/[id]               | public | API-02, API-01                 |
| 4  | Katalog Paket           | /menu/paket              | public | API-03                         |
| 5  | Detail Paket            | /menu/paket/[id]         | public | API-04, API-03                 |
| 6  | Form Order              | /pesan                   | public | API-05, API-06, API-08         |
| 7  | Sukses Bayar            | /pesan/sukses            | public | — (sessionStorage)             |
| 8  | Cek Pesanan Input       | /cek-pesanan             | public | —                              |
| 9  | Detail Cek Pesanan      | /cek-pesanan/[nomor]     | public | API-07                         |
| 10 | Form Testimoni Customer | /testimoni/[token]       | public | API-11, API-12                 |
| 11 | Privacy Policy          | /kebijakan-privasi       | public | — (static)                     |
| 12 | Terms of Service        | /syarat-ketentuan        | public | — (static)                     |
| 13 | Maintenance             | /maintenance             | public | — (env var)                    |
| 14 | Admin Login             | /admin/login             | public | API-13                         |
| 15 | Admin Dashboard         | /admin/dashboard         | admin  | API-15                         |
| 16 | List Pesanan Admin      | /admin/pesanan           | admin  | API-15                         |
| 17 | Detail Pesanan Admin    | /admin/pesanan/[id]      | admin  | API-16, API-17, API-19         |
| 18 | Buat Order Manual       | /admin/pesanan/buat      | admin  | API-18, API-05, API-06         |
| 19 | List Menu Admin         | /admin/menu              | admin  | API-20                         |
| 20 | Buat/Edit Menu          | /admin/menu/baru         | admin  | API-21, API-22, API-24         |
| 21 | List Paket Admin        | /admin/menu/paket        | admin  | API-25                         |
| 22 | Buat/Edit Paket         | /admin/menu/paket/baru   | admin  | API-26, API-27, API-20         |
| 23 | Kalender Admin          | /admin/kalender          | admin  | API-29, API-30                 |
| 24 | Laporan Pendapatan      | /admin/laporan           | admin  | API-31                         |
| 25 | Export Rekap            | /admin/laporan/export    | admin  | API-32                         |
| 26 | Kelola Testimoni        | /admin/testimoni         | admin  | API-33, API-34, API-35         |
| 27 | QR Code Manager         | /admin/qr-code           | admin  | API-36, API-37, API-38, API-39 |
| 28 | CMS Web Profile         | /admin/web-profile       | admin  | API-40, API-41, API-24         |
| 29 | Settings Admin          | /admin/settings          | admin  | API-42, API-43                 |
| 30 | 404 / 500 Error         | not-found / error        | public | — (static)                     |

---

## PAGE SPECS — Form Summary

| No | Halaman             | Fields Utama                                        | Validasi Kritis                              |
|----|---------------------|-----------------------------------------------------|----------------------------------------------|
| 6  | Form Order          | items[] (dari cart), nama, no_hp, alamat_event,     | consent wajib true, tanggal min H+7,         |
|    |                     | tanggal_acara, waktu_acara, tipe_bayar, consent     | porsi ≥ min_porsi, HP format Indonesia       |
| 10 | Form Testimoni      | nama (pre-filled disabled), teks, rating            | teks max 500 char, rating min 1, 1x per token|
| 14 | Admin Login         | email, password                                     | error selalu generic, rate limit 10x/15m     |
| 18 | Buat Order Manual   | identik F2 + status_bayar (belum/dp/lunas)          | source=admin_manual, tanggal min besok       |
| 20 | Buat/Edit Menu      | nama, kategori, harga, foto, min_porsi, status      | harga > 0, foto wajib, min_porsi > 0         |
| 22 | Buat/Edit Paket     | nama, harga, items[menu_id, keterangan], min_order  | 1–10 menu per paket, harga > 0, no duplicate |
| 28 | CMS Web Profile     | konten_hero, keunggulan[], galeri[], kontak          | konten kosong = placeholder, tidak error     |
| 29 | Settings Admin      | kapasitas_customer, kapasitas_porsi, dp_pct,        | integer ≥ 0, 0 = tidak terbatas,             |
|    |                     | lead_time, rekening, notif_wa, notif_email          | lead_time min 1                              |

---

## PAGE SPECS — State Summary

| No | Loading          | Empty State Heading                    | Success Type                      |
|----|------------------|----------------------------------------|-----------------------------------|
| 1  | skeleton grid    | section collapse graceful              | — (non-form)                      |
| 2  | skeleton card    | "Menu belum tersedia"                  | toast add-to-cart                 |
| 4  | skeleton card    | "Paket belum tersedia"                 | toast add-to-cart                 |
| 6  | skeleton step    | "Keranjang kamu masih kosong"          | redirect /pesan/sukses            |
| 9  | skeleton timeline| "Pesanan tidak ditemukan"              | — (read-only)                     |
| 10 | skeleton card    | "Link tidak valid atau sudah digunakan"| replace form (in-place)           |
| 15 | skeleton card    | "Belum ada pesanan masuk"              | — (dashboard)                     |
| 16 | skeleton table   | "Belum ada pesanan"                    | — (list)                          |
| 17 | skeleton detail  | — (404 jika tidak ada)                 | toast "Status berhasil diubah"    |
| 19 | skeleton grid    | "Belum ada menu"                       | toast "Status menu diperbarui"    |
| 21 | skeleton card    | "Belum ada paket"                      | toast "Status paket diperbarui"   |
| 23 | skeleton grid    | — (cell tetap render hijau)            | toast "Tanggal berhasil diblokir" |
| 24 | skeleton chart   | "Belum ada data periode ini"           | — (laporan)                       |
| 26 | skeleton card    | "Belum ada testimoni"                  | toast "Testimoni disetujui"       |
| 27 | skeleton grid    | "Belum ada QR code dibuat"             | toast "QR code berhasil dibuat"   |

---

## PAGE SPECS — Detail (B5c-Detail)

Semua 30 halaman sudah di-generate lengkap.
Tersimpan sebagai referensi coding Phase 3.

Format per halaman:
  ROUTE | ROLE | DATA SOURCE
  ANATOMY (tabel section → teknis → data)
  STATES (Loading / Empty / Error / Success — teks eksak)
  INTERAKSI (aksi → API call → feedback)
  FORM FIELDS (jika ada)
  RESPONSIVE (Mobile / Tablet / Desktop)
  DATA MOCK (JSON realistis)

---

## ERROR PAGES

### 404 Not Found
File    : app/not-found.tsx
Layout  : Standalone (tanpa navbar/sidebar/footer)
Ikon    : Ilustrasi piring kosong SVG 120px
Kode    : "404" 72px Bold #4DAF48
Heading : "Halaman Tidak Ditemukan"
Subtext : "Sepertinya halaman yang kamu cari sudah pindah
           atau tidak ada. Yuk kembali ke beranda."
Tombol  : [Kembali ke Beranda] gradient → /
Link    : [Lihat Menu] text-link #4DAF48 → /menu

### 500 Server Error
File    : app/error.tsx
Layout  : Standalone (tanpa navbar/sidebar/footer)
Ikon    : Ilustrasi spatula SVG 120px
Kode    : "500" 72px Bold #F59E0B
Heading : "Terjadi Kesalahan Sistem"
Subtext : "Dapur kami sedang ada masalah teknis.
           Mohon coba lagi dalam beberapa saat."
Tombol  : [Coba Lagi] gradient → reset() error boundary
Link    : "Atau hubungi kami via WhatsApp" → wa.me/[WA_NUMBER]

### Maintenance
File    : app/maintenance/page.tsx
Layout  : Standalone (tanpa navbar/sidebar/footer)
Trigger : MAINTENANCE_MODE=true di env
          middleware.ts redirect semua → /maintenance
          kecuali /maintenance dan /admin/login
Logo    : Logo Lavanda Catering SVG 64px center
Ikon    : Tools/wrench SVG 80px #4DAF48
Heading : "Sedang Dalam Pemeliharaan"
Subtext : "Kami sedang meningkatkan sistem untuk melayani
           kamu lebih baik."
Estimasi: conditional jika MAINTENANCE_END env ada:
          "Estimasi selesai: [waktu]" badge #FFFBEB text #F59E0B
Tombol  : [Hubungi Kami] gradient → wa.me/[NEXT_PUBLIC_WA_BISNIS]

---

## AMENDMENT LOG

### AMD-001 — Cart UX (CONFIRMED ✅)
Tanggal : Phase 2
Dampak  :
  - Navbar public: Beranda | Menu | Cek Pesanan | Kontak | [Pesan Sekarang]
  - /menu: add-to-cart tanpa redirect, CartBar sticky, CartDrawer
  - /menu/[id]: AddToCartButton dari detail page
  - /menu/paket: add-to-cart paket, CartBar, CartDrawer
  - /menu/paket/[id]: AddToCartButton paket dari detail
  - /pesan: Step 1=Review Keranjang, Step 2=Data, Step 3=Konfirmasi
  - CatalogTabs: shared component, pill rounded, navigate antar route
  - Galeri: section di homepage, data dari API-40 (CMS)
  - Paket Unggulan: section di homepage, data dari API-03

Komponen baru:
  src/components/order/CartDrawer.tsx
  src/components/order/CartBar.tsx
  src/components/order/AddToCartButton.tsx
  src/components/order/CartItemRow.tsx
  src/components/catalog/CatalogTabs.tsx

Hook update:
  src/hooks/useCart.ts
    addItem(item)        → tambah atau increment porsi
    removeItem(id)       → hapus dari cart
    updatePorsi(id, n)   → n >= min_porsi
    clearCart()          → kosongkan + hapus localStorage
    isInCart(id)         → boolean
    getTotal()           → sum subtotal
    getItemCount()       → sum semua item
    isExpired()          → cek 24 jam expiry

Breaking change: tidak ada (API/DB tidak berubah)