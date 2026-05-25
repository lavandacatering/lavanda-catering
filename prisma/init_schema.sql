-- CreateTable
CREATE TABLE "kategori" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama" VARCHAR(100) NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kategori_id" UUID NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "deskripsi" TEXT,
    "harga" DECIMAL(12,2) NOT NULL,
    "foto_url" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "min_porsi" INTEGER NOT NULL DEFAULT 10,
    "urutan_dalam_kategori" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama" VARCHAR(200) NOT NULL,
    "subtitle" VARCHAR(200),
    "deskripsi" TEXT,
    "harga" DECIMAL(12,2) NOT NULL,
    "foto_url" VARCHAR(500),
    "min_order" INTEGER NOT NULL DEFAULT 10,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paket_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paket_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "keterangan" VARCHAR(100),
    "porsi_per_paket" INTEGER NOT NULL,

    CONSTRAINT "paket_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesanan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nomor_order" VARCHAR(30) NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "no_hp" VARCHAR(20) NOT NULL,
    "alamat_event" TEXT NOT NULL,
    "tanggal_acara" DATE NOT NULL,
    "waktu_acara" TIME(6) NOT NULL,
    "catatan" TEXT,
    "total_porsi" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tipe_bayar" VARCHAR(10) NOT NULL DEFAULT 'dp',
    "pct_dp" INTEGER NOT NULL DEFAULT 50,
    "nominal_dp" DECIMAL(12,2) NOT NULL,
    "nominal_sisa" DECIMAL(12,2) NOT NULL,
    "status_pesanan" VARCHAR(30) NOT NULL DEFAULT 'menunggu_konfirmasi',
    "source" VARCHAR(20) NOT NULL DEFAULT 'customer_web',
    "consent_given" BOOLEAN NOT NULL DEFAULT false,
    "consent_timestamp" TIMESTAMPTZ(6),
    "consent_version" VARCHAR(10) NOT NULL DEFAULT 'v1.0',
    "refund_status" VARCHAR(20) NOT NULL DEFAULT 'none',
    "refund_nominal" DECIMAL(12,2),
    "refund_timestamp" TIMESTAMPTZ(6),
    "refund_metode" VARCHAR(100),
    "refund_notes" TEXT,
    "cancellation_type" VARCHAR(20),
    "cancellation_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesanan_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pesanan_id" UUID NOT NULL,
    "item_type" VARCHAR(10) NOT NULL,
    "menu_id" UUID,
    "paket_id" UUID,
    "porsi" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "pesanan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pesanan_id" UUID NOT NULL,
    "tipe" VARCHAR(20) NOT NULL,
    "nominal" DECIMAL(12,2) NOT NULL,
    "mdr_nominal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_charged" DECIMAL(12,2) NOT NULL,
    "doku_transaction_id" VARCHAR(200),
    "doku_invoice_number" VARCHAR(200),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "metode_bayar" VARCHAR(30),
    "timestamp_bayar" TIMESTAMPTZ(6),
    "webhook_payload" JSONB,
    "settlement_estimated_date" DATE,
    "confirmation_type" VARCHAR(10),
    "idempotency_key" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kalender_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tanggal" DATE NOT NULL,
    "kapasitas_customer" INTEGER NOT NULL DEFAULT 10,
    "kapasitas_porsi" INTEGER NOT NULL DEFAULT 500,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "alasan_block" TEXT,
    "created_by" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kalender_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "keterangan" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_status" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pesanan_id" UUID NOT NULL,
    "status_lama" VARCHAR(30),
    "status_baru" VARCHAR(30) NOT NULL,
    "catatan_admin" TEXT,
    "alasan_batal" TEXT,
    "wa_template_dikirim" BOOLEAN NOT NULL DEFAULT false,
    "wa_timestamp" TIMESTAMPTZ(6),
    "template_text_used" TEXT,
    "source" VARCHAR(20) NOT NULL,
    "refund_eligibility" JSONB,
    "admin_id" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_notifikasi" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pesanan_id" UUID NOT NULL,
    "tipe" VARCHAR(10) NOT NULL,
    "event" VARCHAR(30) NOT NULL,
    "penerima" VARCHAR(200) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "log_notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimoni" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sumber" VARCHAR(20) NOT NULL,
    "pesanan_id" UUID,
    "nama" VARCHAR(200) NOT NULL,
    "peran" VARCHAR(200),
    "teks" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL DEFAULT 5,
    "foto_url" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "token_link" VARCHAR(200),
    "token_expires_at" TIMESTAMPTZ(6),
    "created_by" VARCHAR(200),
    "approved_by" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimoni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konten_web" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "konten_hero" JSONB,
    "tentang_kami" JSONB,
    "keunggulan" JSONB,
    "galeri" JSONB,
    "kontak" JSONB,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(200),

    CONSTRAINT "konten_web_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama_label" VARCHAR(200) NOT NULL,
    "tipe" VARCHAR(10) NOT NULL,
    "url_tujuan" VARCHAR(2000) NOT NULL,
    "preset_key" VARCHAR(50),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kategori_nama_key" ON "kategori"("nama");

-- CreateIndex
CREATE INDEX "kategori_urutan_idx" ON "kategori"("urutan");

-- CreateIndex
CREATE INDEX "menu_kategori_id_status_idx" ON "menu"("kategori_id", "status");

-- CreateIndex
CREATE INDEX "paket_items_paket_id_idx" ON "paket_items"("paket_id");

-- CreateIndex
CREATE UNIQUE INDEX "paket_items_paket_id_menu_id_key" ON "paket_items"("paket_id", "menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "pesanan_nomor_order_key" ON "pesanan"("nomor_order");

-- CreateIndex
CREATE INDEX "pesanan_tanggal_acara_idx" ON "pesanan"("tanggal_acara");

-- CreateIndex
CREATE INDEX "pesanan_status_pesanan_idx" ON "pesanan"("status_pesanan");

-- CreateIndex
CREATE INDEX "pesanan_no_hp_idx" ON "pesanan"("no_hp");

-- CreateIndex
CREATE INDEX "pesanan_created_at_idx" ON "pesanan"("created_at" DESC);

-- CreateIndex
CREATE INDEX "pesanan_items_pesanan_id_idx" ON "pesanan_items"("pesanan_id");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_doku_transaction_id_key" ON "pembayaran"("doku_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_idempotency_key_key" ON "pembayaran"("idempotency_key");

-- CreateIndex
CREATE INDEX "pembayaran_pesanan_id_idx" ON "pembayaran"("pesanan_id");

-- CreateIndex
CREATE INDEX "pembayaran_status_idx" ON "pembayaran"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kalender_config_tanggal_key" ON "kalender_config"("tanggal");

-- CreateIndex
CREATE INDEX "kalender_config_is_blocked_idx" ON "kalender_config"("is_blocked");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "log_status_pesanan_id_idx" ON "log_status"("pesanan_id");

-- CreateIndex
CREATE INDEX "log_status_created_at_idx" ON "log_status"("created_at" DESC);

-- CreateIndex
CREATE INDEX "log_notifikasi_pesanan_id_idx" ON "log_notifikasi"("pesanan_id");

-- CreateIndex
CREATE INDEX "log_notifikasi_event_status_idx" ON "log_notifikasi"("event", "status");

-- CreateIndex
CREATE UNIQUE INDEX "testimoni_token_link_key" ON "testimoni"("token_link");

-- CreateIndex
CREATE INDEX "testimoni_status_idx" ON "testimoni"("status");

-- CreateIndex
CREATE INDEX "testimoni_sumber_status_idx" ON "testimoni"("sumber", "status");

-- CreateIndex
CREATE UNIQUE INDEX "konten_web_key_key" ON "konten_web"("key");

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paket_items" ADD CONSTRAINT "paket_items_paket_id_fkey" FOREIGN KEY ("paket_id") REFERENCES "paket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paket_items" ADD CONSTRAINT "paket_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_items" ADD CONSTRAINT "pesanan_items_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_items" ADD CONSTRAINT "pesanan_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_items" ADD CONSTRAINT "pesanan_items_paket_id_fkey" FOREIGN KEY ("paket_id") REFERENCES "paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_status" ADD CONSTRAINT "log_status_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_notifikasi" ADD CONSTRAINT "log_notifikasi_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

