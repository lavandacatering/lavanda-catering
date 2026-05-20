# AGENT.md

# Baca file ini sebelum melakukan apapun di project ini.

# Berlaku di seluruh session. Tidak boleh diabaikan.

## FILE MAP

- AGENT.md → Rules & behavior (ini)
- ARCHITECTURE.md → DB schema, API endpoints, folder structure
- DESIGN.md → Design system, UI spec per halaman
- TASKS.md → Sprint aktif & task tracker

Verifikasi semua keputusan kode ke file-file di atas.
Jika tidak ada di sana → STOP, jangan menebak.

---

## SECURITY DEFAULTS

bcrypt : 12 rounds
Login limit : 5x / 15 menit / IP
API limit : 100 req/menit / user
JWT access : 15 menit
JWT refresh : 7 hari
HTTPS : wajib
CORS : domain eksplisit, bukan \*
Auth middleware : semua protected route
Env validation : saat startup, throw jika tidak ada
No hardcode : tidak ada secret di kode
ORM only : tidak ada raw SQL tanpa binding
Log wajib : login + aksi admin
Log dilarang : password, token, OTP, kartu, secret
Error message : generic ("Email atau password salah")

Security headers:
HSTS : max-age=31536000; includeSubDomains
X-Content-Type : nosniff
X-Frame-Options : DENY
Referrer-Policy : strict-origin-when-cross-origin

---

## EXECUTION RULES

1.  Tidak ada di ARCHITECTURE.md → STOP, jangan menebak.
2.  Auth/payment/DB/security ambigu → STOP, tanya user.
3.  Maks 3 pertanyaan per pesan.
4.  Output executable. Tidak ada TODO/placeholder.
5.  Naming konsisten sesuai ARCHITECTURE.md.
6.  Context panjang → pakai ID reference.
7.  Output terpotong → lanjut otomatis:
    "LANJUTAN TASK-[ID] Part [X/N]. Dari [posisi]."
8.  Satu task = satu output = satu konfirmasi.
9.  Jangan gabungkan beberapa task dalam satu output.
10. Semua asumsi baru WAJIB ditampilkan ke user sebelum lanjut.

---

## ANTI-HALLUCINATION

DILARANG KERAS:
→ Membuat tabel/endpoint/route/ID baru tanpa ada di ARCHITECTURE.md
→ Mengubah security values tanpa konfirmasi user
→ Menulis kode dengan nilai security berbeda dari SECURITY DEFAULTS
→ Menyembunyikan Senior Flag
→ Berasumsi untuk auth/payment/DB/security
→ Melanjutkan jika ada konflik yang belum resolved

---

## SECURITY VALIDATION

Setiap generate kode auth/DB/API, verifikasi:
[ ] bcrypt 12 rounds
[ ] Login error selalu generic
[ ] CORS tidak menggunakan \*
[ ] Tidak ada raw SQL tanpa binding
[ ] Env vars divalidasi startup
[ ] Tidak ada secret hardcoded

Jika ada yang tidak sesuai → STOP + perbaiki dulu.

---

## LOGGING & OBSERVABILITY

### Prinsip Utama

- **Setiap API route WAJIB memiliki prefix log unik** dalam format `[NAMA-MODUL]`, contoh: `[API-PING]`, `[API-ORDER]`, `[AUTH-LOGIN]`.
- **Jangan pernah melempar error 500 tanpa log `console.error`** yang menyertakan konteks lengkap.
- **Error harus dikembalikan dalam format JSON terstruktur**, bukan plain text, agar mudah di-parse oleh monitoring tools dan cron job validators.

### Format Respons Error Wajib

Semua API route yang mengalami error HARUS mengembalikan JSON dengan field berikut:

```json
{
  "status": "error",
  "code": "KODE_ERROR_SPESIFIK",
  "message": "Deskripsi yang bisa dibaca manusia",
  "diagnostics": { "...boolean flags env vars..." },
  "details": { "message": "...", "stack": "..." }
}
```

- `code`: Identifikasi jenis error (`UNAUTHORIZED`, `DATABASE_ERROR`, `SERVER_CONFIG_ERROR`, `SUPABASE_CONFIG_ERROR`).
- `diagnostics`: Objek boolean yang menunjukkan apakah setiap env var kritis terdeteksi di runtime (tanpa membocorkan nilainya). Contoh: `{ "ANTI_IDLE_SECRET": true, "SUPABASE_SERVICE_ROLE_KEY": false }`.
- `details`: Hanya diisi saat bukan di production publik, atau hanya mencantumkan `message` tanpa informasi sensitif.

### Logging untuk Edge Runtime / Cloudflare Pages

Karena proyek ini di-deploy di Cloudflare Pages (Edge Workers), perhatikan pola logging berikut:

1. **Identifikasi Error Database Spesifik**:
   - Kode error PostgREST (`PGRST205`, `PGRST301`, dll.) WAJIB di-log dan ditangani secara eksplisit.
   - `PGRST205` (tabel tidak ditemukan di schema cache) → log sebagai warning, bukan error fatal. Artinya koneksi DB berhasil tapi tabel belum di-deploy.
   - Contoh:
     ```typescript
     if (dbError.code === 'PGRST205') {
       console.warn(`[API-PING] DB schema empty — table not found: ${dbError.message}`)
       databaseStatus = 'connected_but_empty'
     } else {
       console.error(`[API-PING] DB query failed:`, dbError)
       throw dbError
     }
     ```

2. **Diagnosa Env Vars di Setiap API Route Kritis**:
   - Setiap API route yang bergantung pada env vars WAJIB mengumpulkan diagnostik boolean sebelum melakukan operasi utama.
   - Jika env var kritis tidak ada, kembalikan `500` dengan `code: SERVER_CONFIG_ERROR` dan sertakan `diagnostics` agar developer/admin tahu variabel mana yang hilang — **tanpa membocorkan nilainya**.

3. **Log Unauthorized Access dengan IP**:
   - Setiap percobaan akses tidak sah WAJIB di-log dengan IP client:
     ```typescript
     console.warn(`[API-PING] Unauthorized attempt from IP: ${clientIp}`)
     ```

4. **Log Build & Bundler Issues**:
   - Jika terjadi error runtime terkait bundling (`ChunkLoadError`, `TypeError: Cannot read properties of undefined`), log harus mencatat:
     - Compiler yang digunakan (Webpack vs Turbopack)
     - Versi Next.js dan OpenNext
     - Nama modul/chunk yang gagal dimuat
   - ⚠️ SENIOR FLAG: Next.js 16 default menggunakan Turbopack. OpenNext 1.x TIDAK kompatibel dengan Turbopack. WAJIB gunakan `--webpack` flag pada `next build`.

5. **Jangan Log Data Sensitif** (sesuai SECURITY DEFAULTS):
   - ❌ Nilai env var, token, secret key, password
   - ✅ Keberadaan env var (boolean), kode error, timestamp, IP pemanggil

### Checklist Logging untuk Setiap API Route Baru

Sebelum merge, verifikasi:

- [ ] Ada prefix log unik `[NAMA-MODUL]`
- [ ] `console.error` dipanggil di setiap catch block dengan konteks lengkap
- [ ] Respons error dalam format JSON terstruktur (bukan plain text)
- [ ] Diagnostik env vars boolean disertakan di respons error
- [ ] Error database di-handle per kode error (bukan catch-all generik)
- [ ] IP client di-log untuk setiap akses tidak sah
- [ ] Tidak ada data sensitif yang ter-log

---

## SENIOR THINKING LAYER

Sebelum setiap output, verifikasi:

1. Apakah ini bisa gagal di production?
2. Apakah ada edge case yang belum ditangani?
3. Apakah ada dependency yang terlewat?
4. Apakah ini over-engineered untuk MVP?
5. Apakah ini menyulitkan perubahan nanti?

Jika ada risiko → wajib tampilkan:
⚠️ SENIOR FLAG: [risiko spesifik] → [rekomendasi konkret]
Tidak boleh generik. Tidak boleh disembunyikan.

---

## AI-RISK LEVELS

🔴 Review manual 100%:
auth, payment, DB migration, security, env/secrets
→ Setelah generate: "Sudah review 🔴 ini? Ketik 'reviewed' untuk lanjut."

🟡 Review sampel ≥50%:
API logic, validasi, transformasi data

🟢 Spot check:
UI stateless, styling, utility

---

## RECOVERY COMMANDS

"jalankan senior thinking layer" → jalankan 5 checklist, tampilkan eksplisit
"stop — [penjelasan]" → STOP, tampilkan apa yang hendak dilakukan
"format ulang" → ulangi output terakhir, tidak ada perubahan konten
"acknowledge rules" → baca ulang AGENT.md, konfirmasi siap
"handoff" → generate HANDOFF SUMMARY sekarang
"hotfix TASK-[ID]" → jalankan HOTFIX PROTOCOL

---

## GSB-COMPACT (pakai ini jika context panjang)

SECURITY: bcrypt 12|login 5x/15m|API 100/m|JWT 15m/7d
CORS eksplisit|ORM only|env validate startup
no hardcode|log login+admin|error generic
headers: HSTS,nosniff,DENY,strict-origin
RULES: no guess|no new entity tanpa ARCHITECTURE.md
STOP jika auth/payment/DB ambigu|max 3 tanya
no TODO|satu task satu output satu konfirmasi
ANTI-HALLUCINATION: dilarang buat entity baru tanpa ref
SENIOR-FLAG: wajib|tidak generik|ada rekomendasi konkret
ASSUMPTION: tampilkan ke user sebelum lanjut
TRIGGER-COMPACT: >15 pesan|no senior flag|no validasi otomatis
LOGGING: prefix [MODUL]|JSON error response wajib|diagnostics boolean env vars
error DB per kode (PGRST205=warn)|log IP unauthorized|no secret di log
build: wajib --webpack (Turbopack inkompatibel OpenNext)|log bundler+versi
