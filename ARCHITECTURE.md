# ARCHITECTURE.md

# Lavanda Catering — Web Platform

# Blueprint Phase 2 v4.2 FINAL + AMD-001

---

## MASTER REFERENCES

### DB Tables (14)

kategori, menu, paket, paket_items, pesanan, pesanan_items,
pembayaran, kalender_config, settings, log_status,
log_notifikasi, testimoni, konten_web, qr_codes

### API IDs (46)

API-01 GET /api/v1/menu
API-02 GET /api/v1/menu/[id]
API-03 GET /api/v1/paket
API-04 GET /api/v1/paket/[id]
API-05 GET /api/v1/kalender/availability
API-06 POST /api/v1/pesanan
API-07 GET /api/v1/pesanan/cek
API-08 POST /api/v1/pembayaran/initiate
API-09 POST /api/v1/pembayaran/webhook
API-10 GET /api/v1/testimoni/public
API-11 GET /api/v1/testimoni/form/[token]
API-12 POST /api/v1/testimoni/submit
API-13 POST /api/v1/admin/auth/login
API-14 POST /api/v1/admin/auth/logout
API-15 GET /api/v1/admin/pesanan
API-16 GET /api/v1/admin/pesanan/[id]
API-17 PATCH /api/v1/admin/pesanan/[id]/status
API-18 POST /api/v1/admin/pesanan/manual
API-19 POST /api/v1/admin/pesanan/[id]/konfirmasi-bayar
API-20 GET /api/v1/admin/menu
API-21 POST /api/v1/admin/menu
API-22 PUT /api/v1/admin/menu/[id]
API-23 DELETE /api/v1/admin/menu/[id]
API-24 POST /api/v1/admin/menu/[id]/upload-foto
→ khusus foto menu, terikat menu ID
API-24b POST /api/v1/admin/upload
→ general upload (galeri CMS, foto paket, dll)
→ tidak terikat entity ID
→ response: { url: string, public_id: string }
API-25 GET /api/v1/admin/paket
API-26 POST /api/v1/admin/paket
API-27 PUT /api/v1/admin/paket/[id]
API-28 DELETE /api/v1/admin/paket/[id]
API-29 GET /api/v1/admin/kalender
API-30 POST /api/v1/admin/kalender/block
API-31 GET /api/v1/admin/laporan
API-32 GET /api/v1/admin/laporan/export
API-33 GET /api/v1/admin/testimoni
API-34 PATCH /api/v1/admin/testimoni/[id]
API-35 POST /api/v1/admin/testimoni
API-36 GET /api/v1/admin/qr-codes
API-37 POST /api/v1/admin/qr-codes
API-38 PUT /api/v1/admin/qr-codes/[id]
API-39 PATCH /api/v1/admin/qr-codes/[id]/archive
API-40 GET /api/v1/admin/konten-web
API-41 PUT /api/v1/admin/konten-web
API-42 GET /api/v1/admin/settings
API-43 PUT /api/v1/admin/settings
API-44 GET /api/v1/konten-web
API-45 GET /api/v1/stats/pesanan-selesai

Total : 46 endpoint (API-01 s/d API-45 + API-24b)

Upload routing:
API-24 → foto utama menu (terikat /admin/menu/[id])
API-24b → semua upload lain: galeri homepage, foto paket,
foto testimoni admin, aset CMS lainnya

### REQ IDs (44)

REQ-001 s/d REQ-044
(detail lengkap lihat B3 di dokumen blueprint)

### Routes (30)

/
/menu
/menu/[id]
/menu/paket
/menu/paket/[id]
/pesan
/pesan/sukses
/cek-pesanan
/cek-pesanan/[nomor]
/testimoni/[token]
/kebijakan-privasi
/syarat-ketentuan
/maintenance
/admin/login
/admin/dashboard
/admin/pesanan
/admin/pesanan/[id]
/admin/pesanan/buat
/admin/menu
/admin/menu/baru
/admin/menu/[id]/edit
/admin/menu/paket
/admin/menu/paket/baru
/admin/menu/paket/[id]/edit
/admin/kalender
/admin/laporan
/admin/laporan/export
/admin/testimoni
/admin/qr-code
/admin/web-profile
/admin/settings

Catatan routing:
/menu dan /menu/paket adalah route SEJAJAR (bukan nested)
untuk menghindari konflik dengan dynamic segment [id]
Next.js 16: semua dynamic params wajib async/await (BC3)

### TASK IDs (77)

TASK-001 s/d TASK-077
(detail lengkap lihat TASKS.md)

### Roles

Customer (public) — order, bayar, cek status, testimoni
Admin (auth) — kelola pesanan, menu, konten, settings

### Security

Sesuai SECURITY_DEFAULTS.md (letakkan di root project)

---

## TECH STACK

Framework : Next.js 16 (App Router + Turbopack)
CSS/UI : Tailwind CSS v4.x + shadcn/ui (AMD-002: CSS-based @theme config)
Backend : Next.js API Routes + Server Actions
DB : Supabase (PostgreSQL) region ap-southeast-1
ORM : Prisma 5.x
Auth : Supabase Auth (email + password + JWT)
Deploy : Cloudflare Pages (branch: main + staging)
Storage : Cloudinary (media foto) + Supabase Storage (dokumen)
Payment : DOKU (QRIS + Virtual Account) — hosted checkout
Email : Resend (T0–T7, free 3.000/bulan)
Monitor : Sentry + Cloudflare Analytics + GA4
Node.js : 20.9.0 minimum (.nvmrc = "20")

---

## BREAKING CHANGES WAJIB (Next.js 16)

BC1: proxy.ts (BUKAN middleware.ts) + double auth check di setiap Server Action
BC2: eslint.config.mjs (Flat Config)
jalankan: npx eslint . (BUKAN next lint)
BC3: Semua dynamic route params wajib async/await
BENAR : const { id } = await params
SALAH : const id = params.id ← crash di Next.js 16
BC4: Node.js 20.9.0 minimum
.nvmrc = "20"
Set Node.js 20.x di Cloudflare Pages build settings
BC5: next.config.ts pakai images.remotePatterns
(images.domains deprecated, akan error di Next.js 16)
BC6: revalidateTag() wajib 2 argumen
BENAR : revalidateTag('menu-list', 'max')
SALAH : revalidateTag('menu-list') ← type error

---

## DATABASE SCHEMA

### Konvensi Penamaan

Tabel : snake*case plural
Kolom : snake_case
PK : id (uuid, gen_random_uuid())
FK : [tabel_singular]\_id
Timestamp : created_at, updated_at (semua tabel)
Soft del : deleted_at (menu, paket, pesanan)
Boolean : prefix is* atau has\_

### Tabel 1: kategori

id uuid PK DEFAULT gen_random_uuid()
nama varchar(100) NOT NULL UNIQUE
urutan integer NOT NULL DEFAULT 0
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()

INDEX: urutan (ORDER BY katalog)
SEED : ('Nasi Box',1), ('Prasmanan',2), ('Snack',3),
('Minuman',4), ('Dessert',5)

### Tabel 2: menu

id uuid PK DEFAULT gen_random_uuid()
kategori_id uuid FK→kategori.id ON DELETE RESTRICT
nama varchar(200) NOT NULL
deskripsi text
harga decimal(12,2) NOT NULL CHECK (harga > 0)
foto_url varchar(500)
status varchar(20) NOT NULL DEFAULT 'aktif'
CHECK status IN ('aktif','nonaktif')
min_porsi integer NOT NULL DEFAULT 10
CHECK (min_porsi > 0)
urutan_dalam_kategori integer NOT NULL DEFAULT 0
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
deleted_at timestamptz

INDEX: (kategori_id, status), nama gin_tsvector (FTS)
SOFT DELETE: deleted_at IS NOT NULL = dihapus

### Tabel 3: paket

id uuid PK DEFAULT gen_random_uuid()
nama varchar(200) NOT NULL
subtitle varchar(200)
deskripsi text
harga decimal(12,2) NOT NULL CHECK (harga > 0)
foto_url varchar(500)
min_order integer NOT NULL DEFAULT 10
CHECK (min_order > 0)
status varchar(20) NOT NULL DEFAULT 'aktif'
CHECK status IN ('aktif','nonaktif')
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
deleted_at timestamptz

### Tabel 4: paket_items

id uuid PK DEFAULT gen_random_uuid()
paket_id uuid FK→paket.id ON DELETE CASCADE
menu_id uuid FK→menu.id ON DELETE RESTRICT
keterangan varchar(100) (contoh: "1 porsi/orang")
porsi_per_paket integer NOT NULL CHECK (porsi_per_paket > 0)

UNIQUE (paket_id, menu_id)
INDEX : paket_id
RULE : min 1 item, max 10 item per paket (enforced di aplikasi)

### Tabel 5: pesanan ⭐ TABEL UTAMA

id uuid PK DEFAULT gen_random_uuid()
nomor_order varchar(30) NOT NULL UNIQUE
FORMAT: LVC-YYYYMMDD-XXX
contoh: LVC-20250820-001
counter 3 digit reset tiap hari
generated di: src/lib/utils.ts → generateNomorOrder()
nama varchar(200) NOT NULL
no_hp varchar(20) NOT NULL
alamat_event text NOT NULL
tanggal_acara date NOT NULL
waktu_acara time NOT NULL
catatan text
total_porsi integer NOT NULL
subtotal decimal(12,2) NOT NULL
tipe_bayar varchar(10) NOT NULL DEFAULT 'dp'
CHECK tipe_bayar IN ('dp','lunas')
pct_dp integer NOT NULL DEFAULT 50
nominal_dp decimal(12,2) NOT NULL
nominal_sisa decimal(12,2) NOT NULL
status_pesanan varchar(30) NOT NULL DEFAULT 'menunggu_konfirmasi'
source varchar(20) NOT NULL DEFAULT 'customer_web'
CHECK source IN ('customer_web','admin_manual')
consent_given boolean NOT NULL DEFAULT false
consent_timestamp timestamptz
consent_version varchar(10) NOT NULL DEFAULT 'v1.0'
refund_status varchar(20) NOT NULL DEFAULT 'none'
refund_nominal decimal(12,2)
refund_timestamp timestamptz
refund_metode varchar(100)
refund_notes text
cancellation_type varchar(20)
cancellation_date date
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
deleted_at timestamptz

STATUS FLOW (wajib urut, validasi server-side):
menunggu_konfirmasi → dikonfirmasi → sedang_diproses → selesai
dari mana saja → dibatalkan → refund_pending → refund_selesai

INDEX: tanggal_acara, status_pesanan, no_hp,
nomor_order UNIQUE, created_at DESC

### Tabel 6: pesanan_items

id uuid PK DEFAULT gen_random_uuid()
pesanan_id uuid FK→pesanan.id ON DELETE CASCADE
item_type varchar(10) NOT NULL
CHECK item_type IN ('menu','paket')
menu_id uuid FK→menu.id ON DELETE RESTRICT NULLABLE
paket_id uuid FK→paket.id ON DELETE RESTRICT NULLABLE
porsi integer NOT NULL CHECK (porsi > 0)
harga_satuan decimal(12,2) NOT NULL
subtotal decimal(12,2) NOT NULL

INDEX: pesanan_id

⚠️ SENIOR FLAG: harga_satuan adalah SNAPSHOT harga saat order dibuat.
JANGAN pernah JOIN ke menu.harga untuk kalkulasi historis atau invoice.
Gunakan SELALU pesanan_items.harga_satuan untuk semua kalkulasi.

### Tabel 7: pembayaran

id uuid PK DEFAULT gen_random_uuid()
pesanan_id uuid FK→pesanan.id ON DELETE RESTRICT
tipe varchar(20) NOT NULL
CHECK tipe IN ('dp','pelunasan','lunas','refund')
nominal decimal(12,2) NOT NULL
mdr_nominal decimal(12,2) NOT NULL DEFAULT 0
total_charged decimal(12,2) NOT NULL
doku_transaction_id varchar(200) UNIQUE
doku_invoice_number varchar(200)
status varchar(20) NOT NULL DEFAULT 'pending'
CHECK status IN ('pending','paid','failed',
'expired','refunded')
metode_bayar varchar(30)
timestamp_bayar timestamptz
webhook_payload jsonb
settlement_estimated_date date
confirmation_type varchar(10)
CHECK confirmation_type IN ('webhook','manual')
idempotency_key varchar(200) UNIQUE NOT NULL
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()

INDEX: pesanan_id, doku_transaction_id UNIQUE,
idempotency_key UNIQUE, status

### Tabel 8: kalender_config

id uuid PK DEFAULT gen_random_uuid()
tanggal date NOT NULL UNIQUE
kapasitas_customer integer NOT NULL DEFAULT 10
kapasitas_porsi integer NOT NULL DEFAULT 500
is_blocked boolean NOT NULL DEFAULT false
alasan_block text
created_by varchar(100)
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()

INDEX: tanggal UNIQUE, is_blocked

### Tabel 9: settings

id uuid PK DEFAULT gen_random_uuid()
key varchar(100) NOT NULL UNIQUE
value text NOT NULL
keterangan text
updated_at timestamptz NOT NULL DEFAULT now()

SEED (wajib ada sebelum go-live):
('kapasitas_customer_default', '10', 'Maks customer per hari, 0=tak terbatas')
('kapasitas_porsi_default', '500', 'Maks porsi per hari, 0=tak terbatas')
('dp_default_pct', '50', 'Persentase DP default')
('lead_time_hari', '7', 'Min hari sebelum acara untuk pesan')
('jam_buka', '07:00','Jam mulai terima order')
('jam_tutup', '20:00','Jam tutup terima order')
('area_layanan', 'Seluruh Semarang', 'Area delivery')
('maintenance_mode', 'false','true = aktifkan maintenance page')
('wa_bisnis_number', '6281234567890', 'Nomor WA bisnis (62xxx)')
('nama_bisnis', 'Lavanda Catering', 'Nama bisnis')
('tagline', 'Dipercaya Ratusan Event di Semarang', '')

WA number source: tabel settings key='wa_bisnis_number'
→ dibaca via API-42 GET /admin/settings
→ untuk floating WA button, footer, dan template WA
→ ENV var NEXT_PUBLIC_WA_BISNIS sebagai FALLBACK jika settings belum seed

### Tabel 10: log_status

id uuid PK DEFAULT gen_random_uuid()
pesanan_id uuid FK→pesanan.id ON DELETE RESTRICT
status_lama varchar(30)
status_baru varchar(30) NOT NULL
catatan_admin text
alasan_batal text (wajib min 10 char jika status_baru='dibatalkan')
wa_template_dikirim boolean NOT NULL DEFAULT false
wa_timestamp timestamptz
template_text_used text
source varchar(20) NOT NULL
CHECK source IN ('webhook','manual','admin_create')
refund_eligibility jsonb
admin_id varchar(200)
created_at timestamptz NOT NULL DEFAULT now()

INDEX: pesanan_id, created_at DESC

Modal WA flow:

1. Admin klik [Simpan Status] di panel ubah status
2. Modal WA muncul otomatis (pre-filled dari wa-templates.ts)
3. Admin edit template jika perlu (max 300 char)
4. Admin centang checkbox "WA sudah terkirim" (WAJIB)
5. Klik [✅ Simpan Status] → PATCH API-17
6. API-17 update:
   pesanan.status_pesanan = status_baru
   insert log_status {
   wa_template_dikirim: true,
   wa_timestamp: now(),
   template_text_used: teks_yang_dipakai
   }
7. Jika admin klik [← Batal] di modal → status TIDAK berubah

### Tabel 11: log_notifikasi

id uuid PK DEFAULT gen_random_uuid()
pesanan_id uuid FK→pesanan.id ON DELETE RESTRICT
tipe varchar(10) NOT NULL CHECK tipe IN ('email','wa')
event varchar(30) NOT NULL (T0, T1, T2, T3, T4, T5, T6, T7)
penerima varchar(200) NOT NULL
status varchar(20) NOT NULL
CHECK status IN ('sent','failed','retry')
timestamp timestamptz NOT NULL DEFAULT now()
error_message text
retry_count integer NOT NULL DEFAULT 0

INDEX: pesanan_id, (event, status)

### Tabel 12: testimoni

id uuid PK DEFAULT gen_random_uuid()
sumber varchar(20) NOT NULL
CHECK sumber IN ('admin','customer')
pesanan_id uuid FK→pesanan.id ON DELETE SET NULL NULLABLE
nama varchar(200) NOT NULL
peran varchar(200)
teks text NOT NULL CHECK (char_length(teks) <= 500)
rating smallint NOT NULL DEFAULT 5
CHECK (rating >= 1 AND rating <= 5)
foto_url varchar(500)
status varchar(20) NOT NULL DEFAULT 'pending'
CHECK status IN ('pending','approved','rejected','hidden')
token_link varchar(200) UNIQUE
token_expires_at timestamptz
created_by varchar(200)
approved_by varchar(200)
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()

INDEX: status, token_link UNIQUE, (sumber, status)

### Tabel 13: konten_web

id uuid PK DEFAULT gen_random_uuid()
key varchar(100) NOT NULL UNIQUE
konten_hero jsonb
struktur: {
judul: string,
sub: string,
teks_cta: string,
foto_url: string
}
tentang_kami jsonb
struktur: {
teks: string,
foto: string,
berdiri_sejak: string,
sertifikasi: string[]
}
keunggulan jsonb
struktur: [{icon: string, judul: string, deskripsi: string}]
min 1, max 6 item
galeri jsonb
struktur: [{foto_url: string, caption: string, urutan: int}]
max 12 foto, sorted by urutan ASC
kontak jsonb
struktur: {
alamat: string,
telepon: string,
email: string,
maps_url: string,
jam_operasional: string,
area_layanan: string
}
catatan: wa_number diambil dari settings.wa_bisnis_number
bukan dari kolom kontak ini
updated_at timestamptz NOT NULL DEFAULT now()
updated_by varchar(200)

SEED: 1 row key='main' dengan placeholder data

### Tabel 14: qr_codes

id uuid PK DEFAULT gen_random_uuid()
nama_label varchar(200) NOT NULL CHECK (char_length(nama_label) >= 3)
tipe varchar(10) NOT NULL
CHECK tipe IN ('preset','custom')
url_tujuan varchar(2000) NOT NULL
preset_key varchar(50)
CHECK preset_key IN ('homepage','katalog','order','wa','cek')
is_archived boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()

### FK Verification Summary

FK-01 menu.kategori_id → kategori.id RESTRICT ✅
FK-02 paket_items.paket_id → paket.id CASCADE ✅
FK-03 paket_items.menu_id → menu.id RESTRICT ✅
FK-04 pesanan_items.pesanan_id → pesanan.id CASCADE ✅
FK-05 pesanan_items.menu_id → menu.id RESTRICT ✅
FK-06 pesanan_items.paket_id → paket.id RESTRICT ✅
FK-07 pembayaran.pesanan_id → pesanan.id RESTRICT ✅
FK-08 log_status.pesanan_id → pesanan.id RESTRICT ✅
FK-09 log_notifikasi.pesanan_id → pesanan.id RESTRICT ✅
FK-10 testimoni.pesanan_id → pesanan.id SET NULL ✅
Total : 10/10 LULUS ✅

---

## API ENDPOINTS

### Standard Response Format

Sukses:
{
"status": "success",
"data": {},
"meta": { "page": 1, "total": 100, "per_page": 20 }
}

Error:
{
"status": "error",
"code": "KODE_ERROR",
"message": "pesan ramah user dalam Bahasa Indonesia",
"errors": [{"field": "nama_field", "message": "pesan error"}]
}

Rules:
errors → ISI hanya untuk HTTP 422 (validation error)
errors → KOSONG [] untuk semua error lainnya
Auth error → SELALU generic "Email atau password salah"
tidak pernah spesifik field mana yang salah
HTTP codes → 200 OK, 201 Created, 400 Bad Request,
401 Unauthorized, 403 Forbidden, 404 Not Found,
409 Conflict, 422 Unprocessable, 429 Too Many Requests,
500 Internal Server Error

### Endpoint Detail Kritis

[API-06] POST /api/v1/pesanan
Auth : public
Body :
nama string required max 200
no_hp string required format 08xx/+62xx, 10-14 digit
alamat_event string required min 10 char
tanggal_acara date required min today + lead_time_hari (dari settings)
waktu_acara time required format HH:MM
catatan string optional max 1000 char
items[] array required min 1 item
item_type string required 'menu' | 'paket'
id uuid required
porsi integer required min = min_porsi item di DB
tipe_bayar string required 'dp' | 'lunas'
consent_given boolean required must be true
consent_version string optional default 'v1.0'
source string auto 'customer_web' (set server-side)

Response 201:
pesanan_id, nomor_order, nominal_dp, nominal_sisa,
mdr_nominal, total_charged

Errors:
400 → tanggal < lead_time | HP format salah | porsi < min_porsi
409 → tanggal sudah penuh kapasitas
422 → consent false | items kosong | field required kosong

SENIOR FLAG:
MDR dihitung server-side, tidak dari client
Race condition tanggal penuh → DB row-level lock
Harga item diambil SNAPSHOT dari DB saat order, bukan dari request body

[API-08] POST /api/v1/pembayaran/initiate
Auth : public
Body : pesanan_id, tipe ('dp'|'lunas')
Response: doku_payment_url, invoice_number, expired_at
SENIOR: idempotency_key wajib di-generate dan disimpan sebelum call DOKU

[API-09] POST /api/v1/pembayaran/webhook
Auth : public + WAJIB verifikasi DOKU HMAC signature
Logic :

1. Verifikasi signature DOKU (DOKU_WEBHOOK_SECRET)
   → Jika gagal: return 400, jangan proses
2. Cek idempotency_key → skip dan return 200 jika sudah diproses
3. Update pembayaran.status
4. Update pesanan.status_pesanan
5. Insert log_status (source: 'webhook')
6. Trigger email Resend async (event T1/T2) via queue
7. Return 200 dalam < 200ms

SENIOR FLAG:
WAJIB return 200 cepat
DOKU retry webhook jika response > 5 detik
Semua proses berat (email, log) harus async/non-blocking

[API-17] PATCH /api/v1/admin/pesanan/[id]/status
Auth : admin
Body :
status_baru string required enum valid
catatan_admin string optional
alasan_batal string conditional wajib min 10 char
jika status_baru = 'dibatalkan'
cancellation_type string conditional
cancellation_date date conditional
wa_template_dikirim boolean required harus true (dari Modal WA)
template_text_used string required teks WA yang dipakai

Response 200:
status_baru, refund_eligibility, wa_template (untuk Modal WA pre-fill)

Errors:
400 → status tidak valid
409 → status sudah final (selesai/refund_selesai)
422 → alasan_batal kurang dari 10 char
wa_template_dikirim false (modal WA belum dikonfirmasi)

SENIOR FLAG:
Validasi status transition server-side (tidak boleh skip step)
Hitung H-7 dari tanggal_acara untuk refund_eligibility otomatis
wa_template_dikirim WAJIB true sebelum status bisa disimpan

[API-24] POST /api/v1/admin/menu/[id]/upload-foto
Auth : admin
Body : multipart/form-data, field: foto
Validasi:
max size : 5MB
format : jpg, png, webp
MIME scan : wajib (jangan percaya ekstensi saja)
Response: { foto_url: string }
Side effect: update menu.foto_url di DB

[API-24b] POST /api/v1/admin/upload
Auth : admin
Body : multipart/form-data, field: file, context: string
context: 'galeri' | 'paket' | 'testimoni' | 'hero' | 'other'
Validasi:
max size : 5MB
format : jpg, png, webp
MIME scan : wajib
Response: { url: string, public_id: string }
Note: tidak update DB apapun, URL dikembalikan ke client
client yang menyimpan URL ke form state masing-masing

---

## PRISMA CONFIGURATION

### .env (WAJIB 2 URL — jangan sampai tertukar)

DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

Penjelasan:
DATABASE_URL → port 6543, pgbouncer=true → untuk runtime query
DIRECT_URL → port 5432, tanpa pgbouncer → untuk migrate + generate

### schema.prisma

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
directUrl = env("DIRECT_URL")
}

generator client {
provider = "prisma-client-js"
}

### src/lib/prisma.ts (SINGLETON — wajib, jangan buat instance baru)

import { PrismaClient } from '@prisma/client'

declare global {
var prisma: PrismaClient | undefined
}

export const prisma =
global.prisma ??
new PrismaClient({
log: process.env.NODE_ENV === 'development'
? ['query', 'error', 'warn']
: ['error'],
})

if (process.env.NODE_ENV !== 'production') {
global.prisma = prisma
}

### Build Command (Cloudflare Pages — urutan wajib)

prisma generate && prisma migrate deploy && next build

### Migration Protocol

DEV : npx prisma migrate dev --name [nama_deskriptif]
PROD : npx prisma migrate deploy
JANGAN jalankan prisma migrate dev di production

---

## FOLDER STRUCTURE

lavanda-catering/
├── .github/
│ └── workflows/
│ ├── backup.yml → pg_dump weekly ke Supabase Storage
│ └── deploy.yml → CI/CD Cloudflare Pages
├── .husky/
│ └── pre-commit → ESLint + Prettier check
├── public/
│ └── brand/
│ ├── favicon.ico → 32×32px
│ ├── apple-touch-icon.png → 180×180px
│ ├── og-default.jpg → 1200×630px
│ ├── logo.svg
│ └── logo-white.svg
├── prisma/
│ ├── schema.prisma
│ ├── seed.ts → seed settings + konten_web + kategori
│ └── migrations/
├── src/
│ ├── app/ → Next.js App Router (SEMUA route di sini)
│ │ ├── layout.tsx → Root layout, font, providers
│ │ ├── page.tsx → Homepage /
│ │ ├── not-found.tsx → 404 branded (piring kosong SVG)
│ │ ├── error.tsx → 500 branded (spatula SVG)
│ │ ├── loading.tsx → Root skeleton
│ │ ├── maintenance/
│ │ │ └── page.tsx
│ │ ├── menu/
│ │ │ ├── page.tsx → /menu Katalog Menu (tab: Menu Pilihan)
│ │ │ ├── [id]/
│ │ │ │ └── page.tsx → /menu/[id] async params (BC3)
│ │ │ └── paket/
│ │ │ ├── page.tsx → /menu/paket (tab: Paket Bundling)
│ │ │ └── [id]/
│ │ │ └── page.tsx → /menu/paket/[id] async params (BC3)
│ │ ├── pesan/
│ │ │ ├── page.tsx → /pesan Form Order 3-step
│ │ │ └── sukses/
│ │ │ └── page.tsx → /pesan/sukses
│ │ ├── cek-pesanan/
│ │ │ ├── page.tsx → /cek-pesanan Input nomor
│ │ │ └── [nomor]/
│ │ │ └── page.tsx → async params (BC3)
│ │ ├── testimoni/
│ │ │ └── [token]/
│ │ │ └── page.tsx → async params (BC3)
│ │ ├── kebijakan-privasi/
│ │ │ └── page.tsx
│ │ ├── syarat-ketentuan/
│ │ │ └── page.tsx
│ │ ├── api/
│ │ │ └── v1/ → SEMUA API Routes di dalam app/api/v1/
│ │ │ ├── ping/
│ │ │ │ └── route.ts → Anti-idle Supabase 🔴
│ │ │ ├── menu/
│ │ │ │ ├── route.ts → API-01
│ │ │ │ └── [id]/route.ts → API-02 async params (BC3)
│ │ │ ├── paket/
│ │ │ │ ├── route.ts → API-03
│ │ │ │ └── [id]/route.ts → API-04 async params (BC3)
│ │ │ ├── kalender/
│ │ │ │ └── availability/route.ts → API-05
│ │ │ ├── pesanan/
│ │ │ │ ├── route.ts → API-06
│ │ │ │ └── cek/route.ts → API-07
│ │ │ ├── pembayaran/
│ │ │ │ ├── initiate/route.ts → API-08
│ │ │ │ └── webhook/route.ts → API-09 🔴 HMAC verify
│ │ │ ├── testimoni/
│ │ │ │ ├── public/route.ts → API-10
│ │ │ │ ├── form/[token]/route.ts → API-11 async params
│ │ │ │ └── submit/route.ts → API-12
│ │ │ ├── konten-web/
│ │ │ │ └── route.ts → API-44
│ │ │ ├── stats/
│ │ │ │ └── pesanan-selesai/route.ts → API-45
│ │ │ └── admin/
│ │ │ ├── auth/
│ │ │ │ ├── login/route.ts → API-13 🔴 rate limit
│ │ │ │ └── logout/route.ts → API-14
│ │ │ ├── pesanan/
│ │ │ │ ├── route.ts → API-15
│ │ │ │ ├── manual/route.ts → API-18
│ │ │ │ └── [id]/
│ │ │ │ ├── route.ts → API-16 async params
│ │ │ │ ├── status/route.ts → API-17 🔴
│ │ │ │ └── konfirmasi-bayar/route.ts → API-19
│ │ │ ├── menu/
│ │ │ │ ├── route.ts → API-20, API-21
│ │ │ │ └── [id]/
│ │ │ │ ├── route.ts → API-22, API-23
│ │ │ │ └── upload-foto/route.ts → API-24
│ │ │ ├── upload/
│ │ │ │ └── route.ts → API-24b (general)
│ │ │ ├── paket/
│ │ │ │ ├── route.ts → API-25, API-26
│ │ │ │ └── [id]/route.ts → API-27, API-28
│ │ │ ├── kalender/
│ │ │ │ ├── route.ts → API-29
│ │ │ │ └── block/route.ts → API-30
│ │ │ ├── laporan/
│ │ │ │ ├── route.ts → API-31
│ │ │ │ └── export/route.ts → API-32
│ │ │ ├── testimoni/
│ │ │ │ ├── route.ts → API-33, API-35
│ │ │ │ └── [id]/route.ts → API-34
│ │ │ ├── qr-codes/
│ │ │ │ ├── route.ts → API-36, API-37
│ │ │ │ └── [id]/
│ │ │ │ ├── route.ts → API-38
│ │ │ │ └── archive/route.ts → API-39
│ │ │ ├── konten-web/
│ │ │ │ └── route.ts → API-40, API-41
│ │ │ └── settings/
│ │ │ └── route.ts → API-42, API-43
│ │ └── admin/
│ │ ├── login/page.tsx
│ │ ├── dashboard/page.tsx
│ │ ├── pesanan/
│ │ │ ├── page.tsx
│ │ │ ├── buat/page.tsx
│ │ │ └── [id]/page.tsx → async params (BC3)
│ │ ├── menu/
│ │ │ ├── page.tsx
│ │ │ ├── baru/page.tsx
│ │ │ ├── [id]/
│ │ │ │ └── edit/page.tsx → async params (BC3)
│ │ │ └── paket/
│ │ │ ├── page.tsx
│ │ │ ├── baru/page.tsx
│ │ │ └── [id]/
│ │ │ └── edit/page.tsx → async params (BC3)
│ │ ├── kalender/page.tsx
│ │ ├── laporan/
│ │ │ ├── page.tsx
│ │ │ └── export/page.tsx
│ │ ├── testimoni/page.tsx
│ │ ├── qr-code/page.tsx
│ │ ├── web-profile/page.tsx
│ │ └── settings/page.tsx
│ ├── components/
│ │ ├── ui/ → shadcn/ui (auto-generated, jangan edit)
│ │ ├── layout/
│ │ │ ├── Navbar.tsx → public navbar (4 link + CTA)
│ │ │ ├── Footer.tsx → public footer (charcoal)
│ │ │ ├── AdminSidebar.tsx → sidebar 240px desktop
│ │ │ └── AdminBottomNav.tsx → bottom nav mobile admin
│ │ ├── catalog/
│ │ │ └── CatalogTabs.tsx → shared tab pill Menu Pilihan|Paket Bundling
│ │ │ usePathname() untuk active state
│ │ │ navigate antar route /menu ↔ /menu/paket
│ │ ├── menu/
│ │ │ ├── MenuCard.tsx → card dengan badge highlight cart
│ │ │ ├── MenuList.tsx → grid dengan skeleton
│ │ │ ├── SearchBar.tsx → debounce 300ms
│ │ │ ├── CategoryFilter.tsx → chip horizontal scroll
│ │ │ └── AddToCartButton.tsx → AMD-001
│ │ │ state: default | ditambahkan
│ │ │ klik → useCart.addItem()
│ │ ├── order/
│ │ │ ├── OrderForm.tsx → 3-step form controller
│ │ │ ├── CartBar.tsx → sticky bottom pill AMD-001
│ │ │ │ fixed bottom-6 left-1/2 z-40
│ │ │ │ slide-up 250ms saat cart tidak kosong
│ │ │ ├── CartDrawer.tsx → bottom sheet mobile / side panel desktop
│ │ │ │ AMD-001, max-h-85vh mobile, w-420px desktop
│ │ │ ├── CartItemRow.tsx → 1 baris item di drawer
│ │ │ │ foto 56px | nama | counter | subtotal | hapus
│ │ │ ├── CalendarPicker.tsx → react-day-picker v8 (PIN jangan upgrade)
│ │ │ └── PaymentBreakdown.tsx → subtotal, ongkir gratis, total, DP
│ │ ├── admin/
│ │ │ ├── PesananTable.tsx → sortable, filter, pagination
│ │ │ ├── StatusBadge.tsx → pill per status enum
│ │ │ ├── ModalWA.tsx 🔴 → auto-muncul saat ubah status
│ │ │ │ template pre-filled + editable
│ │ │ │ checkbox wa_terkirim wajib
│ │ │ ├── RefundCalculator.tsx 🔴 → hitung eligibility H-7
│ │ │ ├── SummaryCards.tsx → 5 card dashboard
│ │ │ └── RevenueChart.tsx → recharts line/bar
│ │ └── shared/
│ │ ├── SkeletonCard.tsx → animated pulse placeholder
│ │ ├── EmptyState.tsx → ikon + heading + subtext + CTA
│ │ ├── FloatingWAButton.tsx → fixed bottom-right mobile
│ │ │ nomor dari settings.wa_bisnis_number
│ │ └── InvoiceGenerator.tsx → jspdf export
│ ├── lib/
│ │ ├── prisma.ts 🔴 → Singleton (lihat config di atas)
│ │ ├── supabase.ts → client + server instance
│ │ ├── env.ts → validasi semua env var saat startup
│ │ │ throw Error jika WAJIB tidak ada
│ │ ├── doku.ts 🔴 → DOKU API wrapper
│ │ │ initiate payment, verify HMAC webhook
│ │ ├── resend.ts → email T0–T7 templates
│ │ ├── cloudinary.ts → upload wrapper (signed upload)
│ │ ├── ratelimit.ts → Upstash rate limiter
│ │ └── utils.ts → cn(), formatRupiah(),
│ │ generateNomorOrder() → LVC-YYYYMMDD-XXX
│ ├── actions/ → Server Actions 🔴 (double auth check)
│ │ ├── pesanan.ts
│ │ ├── menu.ts
│ │ ├── paket.ts
│ │ ├── pembayaran.ts
│ │ ├── testimoni.ts
│ │ └── konten-web.ts
│ ├── types/
│ │ ├── pesanan.ts → PesananStatus enum, CartItem interface
│ │ ├── menu.ts → Menu, Paket, KategoriMenu
│ │ ├── pembayaran.ts → Pembayaran, DOKUWebhook
│ │ └── api.ts → ApiResponse<T>, ApiError
│ ├── hooks/
│ │ ├── useCart.ts → AMD-001
│ │ │ interface CartItem {
│ │ │ id: string
│ │ │ item_type: 'menu' | 'paket'
│ │ │ nama: string
│ │ │ foto_url: string | null
│ │ │ harga: number
│ │ │ porsi: number
│ │ │ min_porsi: number
│ │ │ subtotal: number
│ │ │ }
│ │ │ interface CartState {
│ │ │ items: CartItem[]
│ │ │ expiresAt: string // ISO timestamp, expire 24 jam
│ │ │ }
│ │ │ methods:
│ │ │ addItem(item) → tambah atau increment porsi
│ │ │ removeItem(id) → hapus dari items[]
│ │ │ updatePorsi(id, n) → n >= min_porsi, jika n=0 hapus
│ │ │ clearCart() → kosongkan + hapus localStorage
│ │ │ isInCart(id) → boolean
│ │ │ getTotal() → sum semua subtotal
│ │ │ getItemCount() → sum semua item (bukan porsi)
│ │ │ isExpired() → cek expiresAt < now()
│ │ storage: localStorage key='lavanda_cart'
│ │ expiry : 24 jam dari addItem pertama
│ ├── useAvailability.ts → fetch API-05, disable tanggal
│ └── useDebounce.ts → debounce 300ms untuk search
│ └── constants/
│ ├── status.ts → STATUS_PESANAN enum + label + color
│ ├── wa-templates.ts → template T0–T7, interpolasi nama+detail
│ └── routes.ts → semua route constant

├── proxy.ts 🔴 → Auth guard admin (BUKAN middleware.ts)
│ redirect /admin/_ → /admin/login jika !auth
│ kecuali /admin/login dan /maintenance
├── next.config.ts → images.remotePatterns (BC5)
│ domain: res.cloudinary.com, supabase.co
├── eslint.config.mjs → Flat Config ESLint 9 (BC2)
├── postcss.config.mjs → @tailwindcss/postcss plugin (Tailwind v4)
│   Design tokens via @theme in src/app/globals.css, no tailwind.config.ts
├── tsconfig.json → strict: true, path alias @/_
├── .nvmrc → "20"
├── .env.example → semua 24 var dengan contoh nilai
├── .gitignore → .env, node_modules, .next, dist
├── package.json
├── ARCHITECTURE.md → file ini
├── DESIGN.md → v4.2 FINAL
├── TASKS.md → 77 task sprint planning
├── AGENT.md → Phase 3 coding agent rules
└── SECURITY_DEFAULTS.md → security checklist per generate

---

## ENV VARS (24 variabel)

DATABASE_URL string WAJIB postgresql://...6543/?pgbouncer=true
DIRECT_URL string WAJIB postgresql://...5432/
NEXT_PUBLIC_SUPABASE_URL string WAJIB https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY string WAJIB eyJ...
SUPABASE_SERVICE_ROLE_KEY string WAJIB eyJ... (server only, jangan expose)
DOKU_CLIENT_ID string WAJIB sandbox-xxx / prod-xxx
DOKU_SECRET_KEY string WAJIB jangan di-log
DOKU_ENV string WAJIB sandbox / production
DOKU_WEBHOOK_SECRET string WAJIB untuk verifikasi HMAC signature
RESEND_API_KEY string WAJIB re_xxx
RESEND_FROM_EMAIL string WAJIB noreply@lavandacatering.com
CLOUDINARY_CLOUD_NAME string WAJIB lavanda-catering
CLOUDINARY_API_KEY string WAJIB
CLOUDINARY_API_SECRET string WAJIB jangan di-log
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME string WAJIB lavanda-catering
NEXT_PUBLIC_GA_MEASUREMENT_ID string opsional G-XXXXXXX
SENTRY_DSN string opsional
NEXT_PUBLIC_SENTRY_DSN string opsional
MAINTENANCE_MODE string WAJIB default 'false'
NEXT_PUBLIC_BASE_URL string WAJIB https://lavandacatering.com
UPSTASH_REDIS_REST_URL string WAJIB https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN string WAJIB
ANTI_IDLE_SECRET string WAJIB random 32 char
NEXT_PUBLIC_WA_BISNIS string WAJIB 628xxx
FALLBACK jika settings DB belum seed
Primary source: settings.wa_bisnis_number

Semua WAJIB → throw Error('Missing required env var: [NAMA]') saat startup
Implementasi: src/lib/env.ts

---

## LIBRARIES (versi terkunci — jangan upgrade sembarangan)

next@16.x
react@19.x
react-dom@19.x
tailwindcss@4.x              <- AMD-002: CSS-based config via @theme
@prisma/client@5.x
prisma@5.x
@supabase/supabase-js@2.x
zod@3.x
resend@3.x
@sentry/nextjs@8.x
recharts@2.x
qrcode.react@3.x
jspdf@2.x
xlsx@0.18.x
@next/third-parties@latest
next-sitemap@4.x
react-day-picker@8.x ← PIN di v8, JANGAN upgrade ke v9 (breaking API)
sonner@1.x ← toast library
@upstash/ratelimit@latest
@upstash/redis@latest
date-fns@3.x
vitest@1.x
@playwright/test@1.x
eslint@9.x
prettier@3.x
husky@9.x

---

## SECURITY CHECKLIST (wajib per generate)

[ ] bcrypt 12 rounds (bukan 10, bukan 8)
[ ] Login error selalu generic (tidak spesifik field)
[ ] CORS tidak menggunakan wildcard \*
[ ] Tidak ada raw SQL tanpa parameterized binding (Prisma only)
[ ] Semua env vars divalidasi di src/lib/env.ts saat startup
[ ] Tidak ada secret hardcoded di source code
[ ] DOKU webhook: verifikasi HMAC signature wajib sebelum proses
[ ] Upload: max 5MB, jpg/png/webp, MIME type scan (bukan cek ekstensi)
[ ] Rate limit:
login admin : 10x / 15 menit
POST pesanan : 30x / menit per IP
API publik lain : 60x / menit per IP
[ ] Admin route: proxy.ts guard + Server Action double auth check
[ ] Session JWT admin: 8 jam, auto-refresh aktif
[ ] wa_template_dikirim wajib true sebelum status pesanan bisa disimpan

---

## AMENDMENT LOG

### AMD-001 — Cart UX + Navigation Update (CONFIRMED ✅)

Tanggal: Phase 2

Perubahan UI/UX:

- Navbar public: 4 link (Beranda|Menu|Cek Pesanan|Kontak) + [Pesan Sekarang]
- /menu: add-to-cart tanpa redirect, CartBar sticky, CartDrawer
- /menu/[id]: AddToCartButton dari halaman detail
- /menu/paket: add-to-cart paket, CartBar, CartDrawer
- /menu/paket/[id]: AddToCartButton paket dari detail
- /pesan: Step 1=Review Keranjang, Step 2=Data Pemesan, Step 3=Konfirmasi
- CatalogTabs: shared pill component, navigate /menu ↔ /menu/paket
- Homepage: tambah Section Paket Unggulan (API-03, max 3 featured)
- Homepage: tambah Section Galeri (API-40/konten_web.galeri)
- Homepage: tambah Section Kontak (anchor #kontak)
- Homepage: tambah CTA Banner sebelum footer
- Admin Dashboard: 5 summary cards
  (Pesanan Baru, Menunggu Bayar, Diproses, Selesai Hari Ini, Refund Pending)
- Area layanan: dikonfirmasi = Seluruh Semarang

Komponen baru:
src/components/catalog/CatalogTabs.tsx
src/components/order/CartDrawer.tsx
src/components/order/CartBar.tsx
src/components/order/CartItemRow.tsx
src/components/menu/AddToCartButton.tsx

Hook update (useCart.ts) — 8 methods:
addItem(item) → tambah atau increment porsi min_porsi
removeItem(id) → hapus dari items[]
updatePorsi(id, n) → n >= min_porsi, jika n=0 hapus otomatis
clearCart() → kosongkan + hapus localStorage
isInCart(id) → boolean untuk highlight badge
getTotal() → sum semua subtotal
getItemCount() → sum jumlah item (bukan total porsi)
isExpired() → cek expiresAt < now() (24 jam expiry)

Edge cases yang wajib dihandle:
item sudah ada di cart → increment porsi, bukan buat entry baru
porsi dikurangi ke 0 → hapus item otomatis
porsi < min_porsi → tombol [−] disabled, tidak bisa kurang
cart expire 24 jam → clearCart() + toast warning saat mount /pesan
menu dinonaktif admin → warning + hapus otomatis saat /pesan Step 1
drawer terbuka + scroll → overlay dim, klik luar = tutup

API baru:
API-24b POST /api/v1/admin/upload → general upload (bukan terikat menu ID)

Konfirmasi settings:
Nomor order format : LVC-YYYYMMDD-XXX (prefix LVC, counter 3 digit)
WA number source : tabel settings key='wa_bisnis_number'
ENV NEXT_PUBLIC_WA_BISNIS sebagai fallback
Area layanan : Seluruh Semarang (di settings + konten_web + footer)

Breaking change: tidak ada (API/DB existing tidak berubah)

### AMD-002 — Tailwind v4 Migration (CONFIRMED ✅)

Tanggal: Sprint 0 TASK-001

Perubahan:
- tailwindcss@3.4.x → tailwindcss@4.x
- Config via CSS `@theme` block di globals.css (bukan tailwind.config.ts)
- PostCSS plugin: @tailwindcss/postcss (bukan tailwindcss langsung)
- Design tokens tetap sama (warna, font, spacing dari DESIGN.md)
- shadcn/ui tetap kompatibel (menggunakan CSS variables)

Alasan: Next.js 16 default Tailwind v4, downgrade bisa cause compatibility issues
Breaking change: tidak ada (proyek baru, belum ada kode existing)
