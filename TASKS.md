# TASKS.md

# Lavanda Catering — Sprint Tasks

# Blueprint Phase 2 v4.2 FINAL + AMD-001

---

## STATE SNAPSHOT TERAKHIR

Task selesai : TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006 ✅
Task berikutnya : TASK-010 (Run codemod BC1+BC3)
Berhenti di : none
File diubah : .env, .env.example
Amendment aktif : AMD-001 (Cart UX), AMD-002 (Tailwind v4 — DONE)
Senior Flag aktif:
⚠️ pesanan_items.harga_satuan = snapshot — JANGAN JOIN ke menu.harga
⚠️ DOKU webhook WAJIB return 200 < 200ms, proses berat = async
⚠️ Supabase auto-pause — TASK-018 anti-idle WAJIB Sprint 1 🔴
⚠️ Hero foto min 60vh — priority={true} + Cloudinary WebP, target LCP <2s
⚠️ Menu nonaktif di keranjang → validasi saat buka /pesan Step 1
⚠️ wa_template_dikirim wajib true sebelum status pesanan bisa disimpan
⚠️ Upload max 5MB, MIME type scan wajib (bukan cek ekstensi)
MASTER REF valid: ✅ (14 tabel, 46 API, 44 REQ, 30 route, 78 task)
Catatan : TASK-001 selesai. Next.js 16.2.6 + Tailwind v4 (AMD-002). Repo pushed.

---

## DEFINITION OF DONE

✅ Kode lengkap (no TODO / no placeholder)
✅ Security sesuai SECURITY_DEFAULTS.md
✅ Happy path + min 1 edge case ditest
✅ Loading + error state dihandle
✅ Commit format: feat/fix/chore: TASK-ID deskripsi singkat
✅ [🔴] Reviewed manual — dicatat di commit message

---

## SP REFERENCE

SP 1 : < 2 jam — install library, verifikasi config
SP 2 : 2–4 jam — setup folder, 1 model DB sederhana
SP 3 : 4–8 jam — 1 endpoint CRUD, 1 komponen UI
SP 5 : 1–2 hari — 1 halaman penuh, setup project
SP 8 : 2–3 hari — auth penuh, integrasi payment
SP 13 : 3–5 hari — infrastruktur kompleks

Kapasitas : 15–25 SP per sprint (1 sprint = 1 minggu)
Buffer : sisakan 3–5 SP untuk bug + revisi

---

## RISK LEGEND

🔴 Review manual 100% — auth, payment, DB migration, security, env
🟡 Review sampel ≥50% — API logic, validasi, kalkulasi
🟢 Spot check — UI stateless, styling, utility

---

## SPRINT 0 — Infrastructure & Config (3 hari)

**Goal**: Semua infra ready — developer bisa coding mulai hari ke-4
**SP Max**: 25 | **Buffer**: 2 SP

| NO  | ID       | TASK                                                      | SP  | DEPENDS ON | RISK |
| --- | -------- | --------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-001 | GitHub repo private + .nvmrc "20"                         | 1   | —          | 🟢   |
| 2   | TASK-002 | Setup 2 Supabase project (prod+staging) + .env            | 2   | TASK-001   | 🔴   |
| 3   | TASK-003 | Cloudflare Pages 2 branch (main+staging) + Node 20        | 2   | TASK-001   | 🟡   |
| 4   | TASK-004 | Cloudinary folder lavanda-catering/ + upload preset       | 1   | TASK-001   | 🟢   |
| 5   | TASK-005 | Resend domain verify (prod + staging)                     | 1   | TASK-001   | 🟢   |
| 6   | TASK-006 | DOKU Sandbox account + mulai KYC merchant                 | 2   | —          | 🔴   |
| 7   | TASK-010 | Run codemod BC1+BC3: npx @next/codemod@canary upgrade     | 1   | TASK-001   | 🔴   |
| 8   | TASK-011 | Setup proxy.ts + auth guard (BUKAN middleware.ts)         | 3   | TASK-010   | 🔴   |
| 9   | TASK-012 | Prisma schema 14 tabel + singleton + build command        | 5   | TASK-002   | 🔴   |
| 10  | TASK-013 | ESLint Flat Config (eslint.config.mjs) + Prettier + Husky | 1   | TASK-001   | 🟢   |
| 11  | TASK-014 | next.config.ts images.remotePatterns + next-sitemap       | 1   | TASK-001   | 🟢   |
| 12  | TASK-015 | Halaman /maintenance + env MAINTENANCE_MODE               | 1   | TASK-010   | 🟢   |
| 13  | TASK-016 | src/lib/env.ts validasi startup semua 24 env var          | 2   | TASK-002   | 🔴   |

**Total SP**: 23 | **Buffer**: 2 SP
**Deliverable**: Push ke staging → build berhasil, DB migration jalan, proxy.ts aktif

---

## SPRINT 1 — Design System + Brand + Anti-idle (1 minggu)

**Goal**: Design system selesai, anti-idle live, brand assets ready
**SP Max**: 25 | **Buffer**: 4 SP

| NO  | ID       | TASK                                                       | SP  | DEPENDS ON | RISK |
| --- | -------- | ---------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-018 | GET /api/v1/ping anti-idle 🔴 WAJIB TASK PERTAMA           | 1   | TASK-011   | 🔴   |
| 2   | TASK-007 | cron-job.org anti-idle ping Supabase tiap 5 hari           | 1   | TASK-018   | 🔴   |
| 3   | TASK-008 | GitHub Actions pg_dump weekly backup                       | 2   | TASK-002   | 🔴   |
| 4   | TASK-009 | Sentry setup + GA4 property Lavanda Catering               | 1   | TASK-003   | 🟢   |
| 5   | TASK-017 | Tailwind config design tokens (warna, font, spacing)       | 2   | TASK-001   | 🟢   |
| 6   | TASK-019 | shadcn/ui setup + komponen dasar                           | 3   | TASK-017   | 🟢   |
| 7   | TASK-020 | Brand assets: favicon, og-image, logo di /public/brand/    | 1   | TASK-017   | 🟢   |
| 8   | TASK-021 | Error pages branded: not-found.tsx, error.tsx, loading.tsx | 2   | TASK-019   | 🟢   |
| 9   | TASK-022 | Root layout.tsx + Navbar + Footer + metadata default       | 3   | TASK-019   | 🟢   |
|     |          | Navbar public: Beranda│Menu│Cek Pesanan│Kontak│[Pesan]     |     |            |      |
|     |          | 4 link AMD-001, FloatingWAButton dari settings.wa_bisnis   |     |            |      |
| 10  | TASK-023 | GA4 pasang via @next/third-parties di layout               | 1   | TASK-022   | 🟢   |
| 11  | TASK-029 | Halaman /kebijakan-privasi + /syarat-ketentuan (static)    | 2   | TASK-022   | 🟢   |
| 12  | TASK-042 | Settings admin: API-42/43 key-value store                  | 2   | TASK-012   | 🟡   |
|     |          | Termasuk seed 11 key: wa_bisnis_number sebagai primary     |     |            |      |
|     |          | source WA number — FloatingWAButton + footer + template WA |     |            |      |
|     |          | ENV NEXT_PUBLIC_WA_BISNIS hanya sebagai fallback           |     |            |      |

**Total SP**: 21 | **Buffer**: 4 SP
**Deliverable**: Homepage shell bisa di-deploy, anti-idle jalan, halaman legal ada,
settings DB seed dengan wa_bisnis_number

---

## SPRINT 2 — Web Profile + CMS + Testimoni Admin (1 minggu)

**Goal**: Homepage Lavanda Catering bisa dilihat publik dengan seed data
**SP Max**: 25 | **Buffer**: 6 SP

| NO  | ID       | TASK                                                 | SP  | DEPENDS ON | RISK |
| --- | -------- | ---------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-026 | API-44 GET konten-web publik + API-40/41 admin CMS   | 3   | TASK-012   | 🟡   |
| 2   | TASK-027 | Trust counter API-45 "X pesanan selesai bulan ini"   | 1   | TASK-012   | 🟢   |
| 3   | TASK-024 | F6 Homepage semua section:                           | 5   | TASK-026   | 🟡   |
|     |          | Hero + Trust Bar + Menu Unggulan (AddToCartButton) + |     |            |      |
|     |          | Paket Unggulan (API-03 max 3) + Cara Pesan +         |     |            |      |
|     |          | Galeri (API-40) + Testimoni + Kontak (#kontak) +     |     |            |      |
|     |          | CTA Banner + Floating WA Button                      |     |            |      |
| 4   | TASK-025 | CMS Admin semua section + API-24b upload galeri      | 5   | TASK-024   | 🟡   |
|     |          | API-24b POST /api/v1/admin/upload general (galeri,   |     |            |      |
|     |          | foto hero, foto paket — tidak terikat menu ID)       |     |            |      |
| 5   | TASK-028 | JSON-LD LocalBusiness schema + OG tags dinamis       | 2   | TASK-022   | 🟢   |
| 6   | TASK-030 | N6 Admin: input testimoni + approve + hide + publish | 3   | TASK-025   | 🟡   |

**Total SP**: 19 | **Buffer**: 6 SP
**Deliverable**: Homepage live semua 9 section, admin bisa edit konten via CMS,
API-24b general upload tersedia

---

## SPRINT 3 — Katalog Menu + Search (1 minggu)

**Goal**: Semua menu bisa dilihat customer, admin bisa CRUD menu
**SP Max**: 25 | **Buffer**: 8 SP

| NO  | ID       | TASK                                                       | SP  | DEPENDS ON | RISK |
| --- | -------- | ---------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-031 | API-01/02 menu list + detail + FTS Supabase + pagination   | 3   | TASK-012   | 🟢   |
| 2   | TASK-032 | F1 Katalog Menu UI: card grid + skeleton + CatalogTabs     | 3   | TASK-031   | 🟢   |
|     |          | CatalogTabs.tsx: pill rounded, Menu Pilihan│Paket Bundling |     |            |      |
|     |          | usePathname() active state, navigate /menu ↔ /menu/paket   |     |            |      |
|     |          | posisi: antara Page Header dan Filter Bar                  |     |            |      |
| 3   | TASK-033 | Detail menu halaman + dynamic metadata + alt text SEO      | 2   | TASK-031   | 🟢   |
| 4   | TASK-034 | N2 Search & filter: debounce 300ms, chip filter, FTS       | 3   | TASK-031   | 🟡   |
| 5   | TASK-035 | Admin CRUD menu + upload foto Cloudinary (API-20–24)       | 5   | TASK-012   | 🟡   |
|     |          | API-24: foto menu terikat menu ID                          |     |            |      |
|     |          | API-24b: sudah tersedia dari Sprint 2 (general upload)     |     |            |      |
| 6   | TASK-036 | JSON-LD Menu schema + revalidateTag('menu-list','max')     | 1   | TASK-035   | 🟢   |

**Total SP**: 17 | **Buffer**: 8 SP
**Deliverable**: Katalog menu tampil + CatalogTabs live, search jalan,
admin bisa kelola menu

---

## SPRINT 4 — Paket Bundling + Cart Components (AMD-001) (1 minggu)

**Goal**: Tab Paket live, admin CRUD paket, komponen cart AMD-001 siap
**SP Max**: 25 | **Buffer**: 14 SP

| NO  | ID        | TASK                                                    | SP  | DEPENDS ON | RISK |
| --- | --------- | ------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-037  | API paket: API-03/04 publik + API-25–28 admin           | 5   | TASK-012   | 🟡   |
| 2   | TASK-038  | N5 Frontend: Katalog Paket + CatalogTabs Paket Bundling | 3   | TASK-037   | 🟡   |
|     |           | tab Paket Bundling active di /menu/paket                |     |            |      |
|     |           | tab Menu Pilihan inactive → navigate /menu              |     |            |      |
|     |           | CatalogTabs sudah dibuat TASK-032, tinggal pakai        |     |            |      |
| 3   | TASK-043b | CartDrawer + CartBar sticky + AddToCartButton (AMD-001) | 3   | TASK-032   | 🟡   |
|     |           | CartBar: fixed bottom-6 pill charcoal slide-up 250ms    |     |            |      |
|     |           | CartDrawer: bottom sheet mobile / side panel desktop    |     |            |      |
|     |           | AddToCartButton: default│ditambahkan state              |     |            |      |
|     |           | CartItemRow: foto│nama│counter│subtotal│hapus inline    |     |            |      |
|     |           | counter [−] disabled jika porsi = min_porsi             |     |            |      |

**Total SP**: 11 | **Buffer**: 14 SP
**Catatan**: Buffer besar — gunakan untuk polish Sprint 1–3, research DOKU,
atau maju ke Sprint 5 jika timeline memungkinkan
**Deliverable**: Tab Paket live, admin CRUD paket, CartBar+CartDrawer siap dipakai

---

## SPRINT 5 — Form Order + Kalender + useCart (AMD-001) (1 minggu)

**Goal**: Customer bisa tambah ke keranjang, isi form lengkap, kalender jalan
**SP Max**: 25 | **Buffer**: 6 SP

| NO  | ID       | TASK                                                      | SP             | DEPENDS ON | RISK |
| --- | -------- | --------------------------------------------------------- | -------------- | ---------- | ---- | --- |
| 1   | TASK-039 | F7 API availability kalender: dual-limit + race condition | 5              | TASK-012   | 🔴   |
| 2   | TASK-040 | F7 CalendarPicker frontend + disabled state + label H-7   | 3              | TASK-039   | 🟡   |
| 3   | TASK-041 | Admin kalender: API-29/30 block tanggal + lihat count     | 3              | TASK-039   | 🟡   |
| 4   | TASK-046 | useCart hook 8 methods + localStorage expire 24 jam       | 3              | TASK-043b  | 🟡   |
|     |          | addItem, removeItem, updatePorsi, clearCart,              |                |            |      |
|     |          | isInCart, getTotal, getItemCount, isExpired               |                |            |      |
|     |          | storage key: 'lavanda_cart'                               | expiry: 24 jam |            |      |     |
|     |          | isExpired() → clearCart() + toast warning saat mount      |                |            |      |
| 5   | TASK-043 | F2 Step 1: Review keranjang UI (AMD-001)                  | 5              | TASK-046   | 🟡   |
|     |          | guard: cart kosong → empty state + [Lihat Menu]           |                |            |      |
|     |          | list item: foto│nama│counter│subtotal│hapus inline        |                |            |      |
|     |          | bg-check status menu aktif via API-05                     |                |            |      |
|     |          | warning banner jika menu dinonaktif admin                 |                |            |      |
|     |          | [+ Tambah Menu Lagi] → navigate /menu                     |                |            |      |
|     |          | cart expiry check saat mount → isExpired()                |                |            |      |

**Total SP**: 19 | **Buffer**: 6 SP
**Deliverable**: Add-to-cart di katalog+detail jalan, CartDrawer edit/hapus,
kalender availability tampil, Step 1 form = review keranjang

---

## SPRINT 6 — Form Order Lanjut + Inisiasi DOKU (1 minggu)

**Goal**: Flow order selesai end-to-end hingga redirect ke DOKU hosted checkout
**SP Max**: 25 | **Buffer**: 3 SP

| NO  | ID       | TASK                                                       | SP  | DEPENDS ON        | RISK |
| --- | -------- | ---------------------------------------------------------- | --- | ----------------- | ---- |
| 1   | TASK-044 | F2 Step 2: form data pemesan + validasi HP + tanggal       | 3   | TASK-043          | 🟡   |
|     |          | nama│no_hp (+62 prefix)│alamat│tanggal│waktu│catatan       |     |                   |      |
|     |          | tanggal: min H+lead_time_hari dari settings DB             |     |                   |      |
| 2   | TASK-045 | F2 Step 3: breakdown + DP/lunas + consent UU PDP           | 3   | TASK-044          | 🔴   |
|     |          | subtotal│ongkir gratis│total│DP│sisa bayar                 |     |                   |      |
|     |          | consent checkbox wajib true sebelum submit enabled         |     |                   |      |
| 3   | TASK-047 | API-06 POST pesanan server-side: validasi + race condition | 5   | TASK-012          | 🔴   |
|     |          | harga SNAPSHOT dari DB, bukan dari request body            |     |                   |      |
|     |          | race condition → DB row-level lock                         |     |                   |      |
|     |          | nomor order: LVC-YYYYMMDD-XXX (3 digit, reset tiap hari)   |     |                   |      |
| 4   | TASK-050 | MDR calculation server-side: QRIS 0.7%, VA flat            | 3   | TASK-047          | 🔴   |
| 5   | TASK-048 | DOKU Sandbox: API-08 initiate + idempotency + redirect     | 8   | TASK-006,TASK-047 | 🔴   |

**Total SP**: 22 | **Buffer**: 3 SP
**Deliverable**: Customer bisa order lengkap + redirect ke DOKU Sandbox checkout

---

## SPRINT 7 — DOKU Webhook + Admin Login (1 minggu)

**Goal**: Konfirmasi bayar otomatis via webhook, admin bisa login
**SP Max**: 25 | **Buffer**: 5 SP

| NO  | ID       | TASK                                                      | SP  | DEPENDS ON | RISK |
| --- | -------- | --------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-049 | DOKU webhook: API-09 + verifikasi HMAC + idempotency      | 8   | TASK-048   | 🔴   |
|     |          | return 200 < 200ms wajib                                  |     |            |      |
|     |          | proses berat (email, log) = async non-blocking            |     |            |      |
| 2   | TASK-051 | Refund flow: kalkulasi H-7 otomatis + status flow         | 5   | TASK-049   | 🔴   |
| 3   | TASK-052 | Halaman sukses bayar + nomor order + sessionStorage guard | 2   | TASK-049   | 🟡   |
|     |          | guard: !sessionStorage.order_result → redirect /          |     |            |      |
| 4   | TASK-053 | Admin login + session 8 jam + double-layer auth           | 5   | TASK-011   | 🔴   |

**Total SP**: 20 | **Buffer**: 5 SP
**Deliverable**: Payment dikonfirmasi otomatis via webhook, admin bisa login

---

## SPRINT 8 — Admin Dashboard Lengkap + Modal WA (1 minggu)

**Goal**: Admin bisa kelola semua pesanan, status flow jalan, WA modal aktif
**SP Max**: 25 | **Buffer**: 4 SP

| NO  | ID       | TASK                                                      | SP  | DEPENDS ON | RISK |
| --- | -------- | --------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-054 | Dashboard 5 summary cards + tabel pesanan sortable        | 5   | TASK-053   | 🟡   |
|     |          | Cards: Pesanan Baru│Menunggu Bayar│Diproses│              |     |            |      |
|     |          | Selesai Hari Ini│Refund Pending                           |     |            |      |
| 2   | TASK-055 | Detail pesanan + timeline status visual (API-16)          | 3   | TASK-053   | 🟡   |
| 3   | TASK-056 | Status flow server-side validation (API-17) wajib urut    | 5   | TASK-053   | 🔴   |
|     |          | validasi transition: tidak boleh skip step                |     |            |      |
|     |          | hitung H-7 otomatis untuk refund_eligibility              |     |            |      |
| 4   | TASK-057 | Modal WA: auto-muncul saat ubah status, template T1–T7    | 5   | TASK-056   | 🔴   |
|     |          | template pre-filled dari wa-templates.ts + editable       |     |            |      |
|     |          | checkbox wa_template_dikirim WAJIB dicentang              |     |            |      |
|     |          | [Simpan Status] disabled jika wa_template_dikirim = false |     |            |      |
|     |          | template_text_used disimpan ke log_status                 |     |            |      |
|     |          | [← Batal] → status TIDAK berubah                          |     |            |      |
| 5   | TASK-058 | Kalkulasi refund H-7 otomatis di modal batal              | 3   | TASK-056   | 🔴   |

**Total SP**: 21 | **Buffer**: 4 SP
**Deliverable**: Admin bisa ubah status, Modal WA muncul otomatis dengan
wa_template_dikirim wajib, refund eligibility terhitung

---

## SPRINT 9 — Admin Tools + Email + Testimoni Customer (1 minggu)

**Goal**: Konfirmasi manual, order manual, semua email T0–T7 jalan
**SP Max**: 25 | **Buffer**: 7 SP

| NO  | ID       | TASK                                                       | SP  | DEPENDS ON | RISK |
| --- | -------- | ---------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-059 | Konfirmasi bayar manual G6: API-19 + UI detail pesanan     | 3   | TASK-053   | 🔴   |
| 2   | TASK-060 | Admin create order manual G11: API-18 + form identik F2    | 5   | TASK-053   | 🔴   |
|     |          | source=admin_manual disimpan ke DB                         |     |            |      |
|     |          | tanggal min besok (admin lebih fleksibel dari H+7)         |     |            |      |
| 3   | TASK-061 | Email T0 ke admin saat order baru masuk (Resend)           | 2   | TASK-047   | 🟡   |
| 4   | TASK-062 | Email T1–T7 semua trigger + log notifikasi + retry 1x      | 5   | TASK-056   | 🟡   |
| 5   | TASK-063 | N6 Customer testimoni: token link + form publik + approval | 3   | TASK-056   | 🟡   |

**Total SP**: 18 | **Buffer**: 7 SP
**Deliverable**: Semua email jalan, konfirmasi manual bisa, testimoni customer aktif

---

## SPRINT 10 — Export + Laporan + Invoice + Tools Publik (1 minggu)

**Goal**: Semua 16 fitur P0 selesai, siap masuk QA
**SP Max**: 25 | **Buffer**: 6 SP

| NO  | ID       | TASK                                                      | SP  | DEPENDS ON | RISK |
| --- | -------- | --------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-064 | N3 Export PDF (jsPDF) + Excel (SheetJS) + filter range    | 3   | TASK-053   | 🟡   |
| 2   | TASK-065 | N4 Laporan Pendapatan: 4 cards + Recharts + refund deduct | 5   | TASK-053   | 🟡   |
| 3   | TASK-066 | G10 Invoice PDF: A4, logo Lavanda, watermark LUNAS/DP     | 3   | TASK-064   | 🟡   |
| 4   | TASK-067 | N1 Cek Pesanan publik: API-07 + rate limit + timeline     | 3   | TASK-047   | 🟡   |
| 5   | TASK-068 | "Pesan Lagi" pre-fill G7 + tombol di cek pesanan          | 2   | TASK-067   | 🟡   |
| 6   | TASK-069 | N7 QR Code: preset 5 + custom URL + PNG/SVG + list        | 3   | TASK-053   | 🟢   |

**Total SP**: 19 | **Buffer**: 6 SP
**Deliverable**: Semua 16 fitur P0 selesai di staging, siap QA Sprint 11

---

## SPRINT 11 — QA + Security Review (1 minggu)

**Goal**: Semua bug P0 fixed, security cleared, Lighthouse mobile ≥85
**SP Max**: 25 | **Buffer**: 4 SP

| NO  | ID       | TASK                                                   | SP  | DEPENDS ON | RISK |
| --- | -------- | ------------------------------------------------------ | --- | ---------- | ---- |
| 1   | TASK-070 | QA end-to-end staging: semua 16 fitur P0               | 8   | TASK-069   | 🔴   |
| 2   | TASK-071 | Security review 100% manual (lihat checklist di bawah) | 5   | TASK-070   | 🔴   |
| 3   | TASK-072 | Bug fix hasil QA + security review                     | 5   | TASK-071   | 🔴   |
| 4   | TASK-073 | Lighthouse mobile ≥85 + cross-browser Chrome/Safari/FF | 3   | TASK-071   | 🟡   |

**Total SP**: 21 | **Buffer**: 4 SP

**Security Review Checklist Sprint 11** (TASK-071):

- [ ] proxy.ts + double auth di semua Server Actions (BC1)
- [ ] DOKU webhook: verifikasi signature HMAC + idempotency
- [ ] Refund flow: kalkulasi H-7 + nominal benar
- [ ] MDR calculation: QRIS 0.7%, VA flat, server-side only
- [ ] Upload validator: max 5MB, MIME type scan (bukan cek ekstensi)
- [ ] DB query admin write/delete: auth check wajib
- [ ] Rate limiting: login 10x/15m, order 30/m, publik 60/m
- [ ] Async params semua dynamic routes (BC3)
- [ ] Consent disimpan ke DB + timestamp + version (G2)
- [ ] Cart state expire 24 jam — isExpired() jalan benar
- [ ] wa_template_dikirim = true wajib sebelum status tersimpan
- [ ] wa_bisnis_number dari settings DB, ENV hanya fallback
- [ ] npm audit: 0 HIGH, 0 CRITICAL
- [ ] npx eslint .: 0 error, 0 warning (BC2)
- [ ] nomor order format LVC-YYYYMMDD-XXX, counter reset tiap hari

**QA Checklist Tambahan** (TASK-070):

- [ ] CatalogTabs: navigate /menu ↔ /menu/paket, active state benar
- [ ] CartBar: muncul saat cart tidak kosong, slide-up 250ms
- [ ] CartDrawer: bottom sheet mobile, side panel desktop
- [ ] Cart highlight badge di card yang sudah ditambah
- [ ] isExpired(): cart 24 jam → clearCart + toast warning
- [ ] Menu nonaktif di cart → warning + auto-hapus saat Step 1
- [ ] FloatingWAButton: nomor dari settings.wa_bisnis_number
- [ ] Navbar 4 link: Beranda│Menu│Cek Pesanan│Kontak│[Pesan]
- [ ] Homepage 9 section semua tampil benar
- [ ] API-24b general upload: galeri, foto paket berhasil

**Deliverable**: 0 bug P0, security cleared, Lighthouse ≥85 mobile

---

## SPRINT 12 — Launch Lavanda Catering (3 hari)

**Goal**: 🚀 Lavanda Catering LIVE di production
**SP Max**: 10 | **Buffer**: 2 SP

| NO  | ID       | TASK                                                    | SP  | DEPENDS ON | RISK |
| --- | -------- | ------------------------------------------------------- | --- | ---------- | ---- |
| 1   | TASK-074 | Switch DOKU ke Production + final deploy + domain point | 3   | TASK-072   | 🔴   |
| 2   | TASK-075 | Seed data production: menu, paket, testimoni, konten,   | 2   | TASK-074   | 🟢   |
|     |          | settings (termasuk wa_bisnis_number production)         |     |            |      |
| 3   | TASK-076 | Submit sitemap GSC + verifikasi JSON-LD + OG test WA    | 1   | TASK-074   | 🟢   |
| 4   | TASK-077 | Handover admin + panduan penggunaan dashboard           | 2   | TASK-075   | 🟢   |

**Total SP**: 8 | **Buffer**: 2 SP
**Deliverable**: 🚀 Lavanda Catering LIVE — customer bisa order!

---

## LAUNCH CHECKLIST (Sprint 12)

### Pre-launch

- [ ] Semua 16 fitur P0 end-to-end bisa dipakai di staging
- [ ] Auth: login admin, logout, session expire 8 jam
- [ ] Error pages 404, 500, /maintenance tampil benar
- [ ] 4 states semua halaman P0 (loading, empty, error, success)
- [ ] Tidak ada data sensitif di console.log atau Sentry
- [ ] Env vars production semua diisi (bukan sandbox/dummy)
- [ ] npm audit — 0 HIGH / 0 CRITICAL
- [ ] pg_dump staging sudah diverifikasi bisa restore
- [ ] .env.example tidak berisi nilai asli
- [ ] Anti-idle cron aktif dan diverifikasi (ping log ada)
- [ ] DOKU KYC approved sebelum switch production
- [ ] Resend domain verified di production
- [ ] Cloudinary upload preset production aktif
- [ ] Supabase RLS aktif di production DB
- [ ] settings DB production ter-seed (termasuk wa_bisnis_number)

### Smoke Test (6 flow utama)

1. Tab navigation: /menu → [Paket Bundling] → /menu/paket →
   [Menu Pilihan] → /menu
   Expected: CatalogTabs active state benar, konten berganti

2. Order customer: browse /menu → tambah ke keranjang →
   badge highlight muncul → CartBar slide-up → CartDrawer →
   edit porsi → [Lanjut ke Pemesanan] → Step 1 review →
   Step 2 data → Step 3 konfirmasi → bayar QRIS Sandbox
   Expected: nomor LVC-YYYYMMDD-XXX muncul,
   email T1 ke admin + customer

3. Admin konfirmasi: login → pesanan baru → ubah status →
   Modal WA muncul → edit template → centang wa_terkirim →
   [Simpan Status]
   Expected: status = Dikonfirmasi, log_status tersimpan,
   email T3 terkirim

4. Pelunasan: admin trigger pelunasan → customer bayar →
   webhook DOKU
   Expected: status = Lunas, email T2 terkirim,
   return 200 < 200ms

5. Cek pesanan publik: /cek-pesanan → input nomor →
   /cek-pesanan/[nomor] → lihat timeline
   Expected: timeline status tampil benar

6. Order manual admin: Buat Order Manual → form →
   konfirmasi bayar manual → Modal WA
   Expected: source=admin_manual, email T0 ke admin,
   wa_bisnis_number dari settings DB

### Day-1

- [ ] Semua 6 smoke test berhasil
- [ ] Sentry alert aktif
- [ ] Login dengan akun admin real (bukan seed dev)
- [ ] Cek tampilan iPhone Safari + Android Chrome
- [ ] Catat baseline Lighthouse mobile score + LCP
- [ ] Verifikasi FloatingWAButton nomor dari settings DB

---

## ROLLBACK PROTOCOL

### Rollback WAJIB (langsung tanpa diskusi):

- Error rate >5% dalam 5 menit post-deploy
- Auth admin tidak bisa login
- DOKU initiate gagal
- DB tidak bisa connect
- Root cause tidak ketemu dalam 15 menit

### Hotfix BOLEH (tanpa rollback):

- Bug UI (typo, warna, layout)
- Root cause jelas + fix < 15 menit
- Tidak menyentuh auth/payment/data

### Timeline:

< 15 menit → hotfix langsung di branch terpisah
15–60 menit → rollback dulu, hotfix branch terpisah, test staging

> 60 menit → rollback, jadwalkan sprint berikutnya

---

## MONITORING ALERTS

| ALERT                | THRESHOLD           | AKSI                                     |
| -------------------- | ------------------- | ---------------------------------------- |
| Sentry error rate    | >5% dalam 1 menit   | Cek → rollback jika tidak clear 15 menit |
| DOKU webhook failure | >3 gagal berturutan | Notif admin, aktifkan konfirmasi manual  |
| Supabase connections | >45 connections     | Restart Cloudflare deployment            |
| Traffic spike        | 10x normal          | Monitor, siapkan upgrade Supabase Pro    |
| pg_dump cron         | Gagal 2x berturutan | Manual backup segera                     |
| Resend bounce rate   | >10%                | Cek template + domain reputation         |

---

## TASK FULL LIST (referensi cepat)

| ID        | TASK SINGKAT                                         | SP  | SPRINT | RISK |
| --------- | ---------------------------------------------------- | --- | ------ | ---- |
| TASK-001  | GitHub repo + .nvmrc "20"                            | 1   | S0     | 🟢   |
| TASK-002  | 2 Supabase project + .env                            | 2   | S0     | 🔴   |
| TASK-003  | Cloudflare Pages 2 branch + Node 20                  | 2   | S0     | 🟡   |
| TASK-004  | Cloudinary folder + upload preset                    | 1   | S0     | 🟢   |
| TASK-005  | Resend domain verify                                 | 1   | S0     | 🟢   |
| TASK-006  | DOKU Sandbox + mulai KYC                             | 2   | S0     | 🔴   |
| TASK-007  | cron-job.org anti-idle ping tiap 5 hari              | 1   | S1     | 🔴   |
| TASK-008  | GitHub Actions pg_dump weekly                        | 2   | S1     | 🔴   |
| TASK-009  | Sentry + GA4                                         | 1   | S1     | 🟢   |
| TASK-010  | Run codemod BC1+BC3                                  | 1   | S0     | 🔴   |
| TASK-011  | proxy.ts + auth guard admin                          | 3   | S0     | 🔴   |
| TASK-012  | Prisma schema 14 tabel + singleton + build cmd       | 5   | S0     | 🔴   |
| TASK-013  | ESLint Flat Config + Prettier + Husky                | 1   | S0     | 🟢   |
| TASK-014  | next.config.ts remotePatterns + next-sitemap         | 1   | S0     | 🟢   |
| TASK-015  | /maintenance + MAINTENANCE_MODE env                  | 1   | S0     | 🟢   |
| TASK-016  | env.ts validasi startup 24 env var                   | 2   | S0     | 🔴   |
| TASK-017  | Tailwind design tokens (warna, font, spacing)        | 2   | S1     | 🟢   |
| TASK-018  | GET /api/v1/ping anti-idle 🔴                        | 1   | S1     | 🔴   |
| TASK-019  | shadcn/ui + komponen dasar                           | 3   | S1     | 🟢   |
| TASK-020  | Brand assets favicon + og + logo                     | 1   | S1     | 🟢   |
| TASK-021  | Error pages branded 404 + 500 + loading              | 2   | S1     | 🟢   |
| TASK-022  | Root layout + Navbar (4 link AMD-001) + Footer       | 3   | S1     | 🟢   |
| TASK-023  | GA4 via @next/third-parties                          | 1   | S1     | 🟢   |
| TASK-024  | F6 Homepage 9 section + Floating WA Button           | 5   | S2     | 🟡   |
| TASK-025  | CMS Admin semua section + API-24b general upload     | 5   | S2     | 🟡   |
| TASK-026  | API-44 konten-web publik + API-40/41 CMS             | 3   | S2     | 🟡   |
| TASK-027  | Trust counter API-45                                 | 1   | S2     | 🟢   |
| TASK-028  | JSON-LD LocalBusiness + OG tags dinamis              | 2   | S2     | 🟢   |
| TASK-029  | /kebijakan-privasi + /syarat-ketentuan static        | 2   | S1     | 🟢   |
| TASK-030  | N6 Admin testimoni approve + hide + publish          | 3   | S2     | 🟡   |
| TASK-031  | API-01/02 menu list + detail + FTS + pagination      | 3   | S3     | 🟢   |
| TASK-032  | F1 Katalog Menu UI + CatalogTabs shared component    | 3   | S3     | 🟢   |
| TASK-033  | Detail menu + dynamic metadata + SEO alt             | 2   | S3     | 🟢   |
| TASK-034  | N2 Search & filter debounce 300ms + chip + FTS       | 3   | S3     | 🟡   |
| TASK-035  | Admin CRUD menu + Cloudinary upload (API-20–24)      | 5   | S3     | 🟡   |
| TASK-036  | JSON-LD Menu schema + revalidateTag 2 argumen        | 1   | S3     | 🟢   |
| TASK-037  | API paket: API-03/04 publik + API-25–28 admin        | 5   | S4     | 🟡   |
| TASK-038  | N5 Frontend Katalog Paket + CatalogTabs Paket active | 3   | S4     | 🟡   |
| TASK-039  | F7 API availability kalender dual-limit + race cond  | 5   | S5     | 🔴   |
| TASK-040  | F7 CalendarPicker frontend + disabled + H-7 label    | 3   | S5     | 🟡   |
| TASK-041  | Admin kalender API-29/30 block + count order         | 3   | S5     | 🟡   |
| TASK-042  | Settings admin API-42/43 + seed 11 key + wa_bisnis   | 2   | S1     | 🟡   |
| TASK-043  | F2 Step 1 review keranjang UI + guard + bg-check     | 5   | S5     | 🟡   |
| TASK-043b | CartDrawer + CartBar + AddToCartButton (AMD-001)     | 3   | S4     | 🟡   |
| TASK-044  | F2 Step 2 data pemesan + validasi HP + kalender      | 3   | S6     | 🟡   |
| TASK-045  | F2 Step 3 breakdown + DP/lunas + consent UU PDP      | 3   | S6     | 🔴   |
| TASK-046  | useCart hook 8 methods + localStorage expire 24 jam  | 3   | S5     | 🟡   |
| TASK-047  | API-06 POST pesanan server-side + snapshot + lock    | 5   | S6     | 🔴   |
| TASK-048  | DOKU Sandbox initiate + idempotency + redirect       | 8   | S6     | 🔴   |
| TASK-049  | DOKU webhook API-09 + HMAC + idempotency + async     | 8   | S7     | 🔴   |
| TASK-050  | MDR calculation server-side QRIS 0.7% VA flat        | 3   | S6     | 🔴   |
| TASK-051  | Refund flow kalkulasi H-7 otomatis + status flow     | 5   | S7     | 🔴   |
| TASK-052  | Halaman sukses bayar + sessionStorage guard          | 2   | S7     | 🟡   |
| TASK-053  | Admin login + session 8 jam + double-layer auth      | 5   | S7     | 🔴   |
| TASK-054  | Dashboard 5 summary cards + tabel pesanan sortable   | 5   | S8     | 🟡   |
| TASK-055  | Detail pesanan + timeline visual API-16              | 3   | S8     | 🟡   |
| TASK-056  | Status flow server-side validation API-17 urut       | 5   | S8     | 🔴   |
| TASK-057  | Modal WA T1–T7 + wa_template_dikirim wajib centang   | 5   | S8     | 🔴   |
| TASK-058  | Kalkulasi refund H-7 modal batal                     | 3   | S8     | 🔴   |
| TASK-059  | Konfirmasi bayar manual G6 API-19                    | 3   | S9     | 🔴   |
| TASK-060  | Admin order manual G11 API-18 source=admin_manual    | 5   | S9     | 🔴   |
| TASK-061  | Email T0 admin order baru Resend                     | 2   | S9     | 🟡   |
| TASK-062  | Email T1–T7 + log notifikasi + retry 1x              | 5   | S9     | 🟡   |
| TASK-063  | N6 Customer testimoni token + form publik            | 3   | S9     | 🟡   |
| TASK-064  | N3 Export PDF jsPDF + Excel SheetJS + filter         | 3   | S10    | 🟡   |
| TASK-065  | N4 Laporan + Recharts + refund deduct                | 5   | S10    | 🟡   |
| TASK-066  | G10 Invoice PDF A4 + watermark LUNAS/DP              | 3   | S10    | 🟡   |
| TASK-067  | N1 Cek Pesanan publik API-07 + rate limit            | 3   | S10    | 🟡   |
| TASK-068  | Pesan Lagi pre-fill G7 + tombol cek pesanan          | 2   | S10    | 🟡   |
| TASK-069  | N7 QR Code preset 5 + custom + PNG/SVG               | 3   | S10    | 🟢   |
| TASK-070  | QA end-to-end staging 16 fitur P0 + AMD-001 checks   | 8   | S11    | 🔴   |
| TASK-071  | Security review 100% manual + checklist 15 poin      | 5   | S11    | 🔴   |
| TASK-072  | Bug fix QA + security review                         | 5   | S11    | 🔴   |
| TASK-073  | Lighthouse ≥85 mobile + cross-browser                | 3   | S11    | 🟡   |
| TASK-074  | Switch DOKU prod + deploy final + domain point       | 3   | S12    | 🔴   |
| TASK-075  | Seed data production + settings wa_bisnis_number     | 2   | S12    | 🟢   |
| TASK-076  | Sitemap GSC + JSON-LD verify + OG test               | 1   | S12    | 🟢   |
| TASK-077  | Handover admin + panduan dashboard                   | 2   | S12    | 🟢   |

---

## SUMMARY

Total Task : 78 (TASK-001 s/d TASK-077 + TASK-043b)
Total SP : 239
Total Sprint : 13 (S0 + S1–S12)
Estimasi : ~13 minggu dari Sprint 0

SP per Sprint:
S0 : 23 SP | Buffer: 2 SP
S1 : 21 SP | Buffer: 4 SP
S2 : 19 SP | Buffer: 6 SP
S3 : 17 SP | Buffer: 8 SP
S4 : 11 SP | Buffer: 14 SP ← TASK-043b dipindah dari S5
S5 : 19 SP | Buffer: 6 SP ← lebih seimbang dari v4.1
S6 : 22 SP | Buffer: 3 SP
S7 : 20 SP | Buffer: 5 SP
S8 : 21 SP | Buffer: 4 SP
S9 : 18 SP | Buffer: 7 SP
S10 : 19 SP | Buffer: 6 SP
S11 : 21 SP | Buffer: 4 SP
S12 : 8 SP | Buffer: 2 SP
