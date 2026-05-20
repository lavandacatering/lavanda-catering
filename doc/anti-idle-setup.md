# Panduan Setup Anti-Idle Supabase (TASK-007)

Dokumentasi ini menjelaskan cara mengonfigurasi **cron-job.org** untuk secara berkala memicu endpoint `GET /api/v1/ping` guna mencegah Supabase database (free tier) masuk ke mode auto-pause (hibernasi).

---

## 📋 Parameter Endpoint

- **Method**: `GET`
- **URL**: `https://<YOUR_DEPLOYED_DOMAIN>/api/v1/ping?secret=<ANTI_IDLE_SECRET>`
- **Alternatif (Rekomendasi Keamanan)**:
  - **URL**: `https://<YOUR_DEPLOYED_DOMAIN>/api/v1/ping`
  - **Header**: `Authorization: Bearer <ANTI_IDLE_SECRET>`

> [!IMPORTANT]
> Ganti `<YOUR_DEPLOYED_DOMAIN>` dengan domain staging/production Anda (misal: Cloudflare Pages domain).  
> Ganti `<ANTI_IDLE_SECRET>` dengan string acak 32 karakter yang sama dengan nilai di dashboard environment variables Anda.

---

## 🛠️ Langkah Setup di cron-job.org

1. **Daftar/Login**: Masuk ke [cron-job.org](https://cron-job.org).
2. **Buat Cronjob Baru**:
   - Klik tombol **"Create Cronjob"** di dashboard.
   - **Title**: `Lavanda Catering - Supabase Anti-Idle (Staging/Prod)`
   - **Address**: Isi dengan URL endpoint di atas.
3. **Konfigurasi Jadwal (Schedule)**:
   - **Execution**: Pilih **"User-defined"** atau **"Days interval"**.
   - **Interval**: Pilih setiap **5 hari** sekali.
   - _Catatan_: Supabase mendeteksi keaktifan database dan mematikan project gratis jika tidak ada query selama 7 hari. Interval 5 hari sangat aman untuk menjaga database tetap aktif.
4. **Request Headers (Sangat Direkomendasikan)**:
   - Jika Anda memilih melewatkan secret via Header demi keamanan:
     - Klik **"Advanced"** di bagian bawah konfigurasi.
     - Di bagian **Headers**, tambahkan baris baru:
       - **Key**: `Authorization`
       - **Value**: `Bearer <ANTI_IDLE_SECRET_ANDA>`
5. **Notification**:
   - Aktifkan **"Send email on failure"** jika ingin menerima email notifikasi bila endpoint gagal diakses (misal terjadi database down).
6. **Simpan**: Klik **"Create"**.

---

## 🧪 Verifikasi & Monitoring

Setelah disimpan, Anda dapat menguji jalannya cron job:

1. Klik tombol **"Test run"** pada baris cron job yang baru Anda buat.
2. Periksa response status code. Harus mengembalikan `200 OK` dengan body:
   ```json
   {
     "status": "success",
     "data": {
       "ping": "pong",
       "database": "connected",
       "timestamp": "2026-05-20T11:47:00.000Z"
     }
   }
   ```
3. Jika mengembalikan status `401 Unauthorized`, periksa kembali apakah nilai `secret` di cron-job.org sudah sama persis dengan variabel lingkungan `ANTI_IDLE_SECRET` di environment Anda.
