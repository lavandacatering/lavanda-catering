import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAndLockDateCapacity, toLocalDateString } from '@/lib/availability'
import { generateNomorOrder } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      nama,
      no_hp,
      alamat_event,
      tanggal_acara,
      waktu_acara,
      catatan,
      items,
      tipe_bayar,
      consent_given,
      consent_version = 'v1.0',
    } = body

    // 1. Validasi field required dasar (422)
    if (!nama || !no_hp || !alamat_event || !tanggal_acara || !waktu_acara || !tipe_bayar) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Format tidak lengkap. Pastikan semua field wajib terisi.',
          errors: [],
        },
        { status: 422 }
      )
    }

    if (!consent_given) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Anda harus menyetujui ketentuan pemrosesan data (PDP).',
          errors: [],
        },
        { status: 422 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Daftar item pesanan tidak boleh kosong.',
          errors: [],
        },
        { status: 422 }
      )
    }

    // 2. Validasi format nama penerima/pemesan (hanya alfabet, minimal 3 karakter)
    const nameRegex = /^[A-Za-z\s'.`-]+$/
    if (!nama || !nameRegex.test(nama.trim())) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_NAME',
          message: 'Nama lengkap penerima hanya boleh berisi huruf (tidak boleh ada angka).',
          errors: [],
        },
        { status: 400 }
      )
    }
    if (nama.trim().length < 3) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_NAME',
          message: 'Nama lengkap penerima terlalu pendek, minimal 3 karakter.',
          errors: [],
        },
        { status: 400 }
      )
    }

    // 2. Validasi format no HP (400)
    const hpRegex = /^(?:\+62|08)[0-9]{8,12}$/
    if (!hpRegex.test(no_hp)) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_PHONE',
          message: 'Format nomor handphone tidak valid. Harus diawali 08 atau +62 (10-14 digit).',
          errors: [],
        },
        { status: 400 }
      )
    }

    // 3. Validasi alamat minimal 10 karakter (400)
    if (alamat_event.trim().length < 10) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_ADDRESS',
          message: 'Alamat detail acara minimal 10 karakter.',
          errors: [],
        },
        { status: 400 }
      )
    }

    // 4. Ambil lead_time_hari dari settings
    const leadTimeSetting = await prisma.settings.findUnique({
      where: { key: 'lead_time_hari' },
    })
    const leadTimeDays = parseInt(leadTimeSetting?.value || '7', 10)

    const targetDate = new Date(tanggal_acara)
    targetDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const leadTimeLimit = new Date(today)
    leadTimeLimit.setDate(leadTimeLimit.getDate() + leadTimeDays)

    if (isNaN(targetDate.getTime()) || targetDate < leadTimeLimit) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_DATE',
          message: `Jadwal acara minimal H+${leadTimeDays} dari hari ini.`,
          errors: [],
        },
        { status: 400 }
      )
    }

    // Parse waktu_acara HH:MM
    const timeMatch = waktu_acara.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    if (!timeMatch) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_TIME',
          message: 'Format waktu tidak valid (wajib HH:MM).',
          errors: [],
        },
        { status: 400 }
      )
    }
    const [hours, minutes] = waktu_acara.split(':').map(Number)
    const waktuAcaraDate = new Date(1970, 0, 1, hours, minutes, 0)

    // 5. Validasi porsi & ambil harga snapshot dari DB (mencegah manipulasi harga klien)
    interface SnapshotItem {
      item_type: 'menu' | 'paket'
      menu_id: string | null
      paket_id: string | null
      porsi: number
      harga_satuan: number
      subtotal: number
    }
    const snapshotItems: SnapshotItem[] = []
    let totalPorsi = 0
    let subtotal = 0

    for (const item of items) {
      if (item.item_type === 'menu') {
        const itemDb = await prisma.menu.findUnique({
          where: { id: item.id, status: 'aktif', deleted_at: null },
        })
        if (!itemDb) {
          return NextResponse.json(
            {
              status: 'error',
              code: 'ITEM_NOT_AVAILABLE',
              message: `Menu pilihan dengan ID ${item.id} tidak aktif atau sudah dihapus.`,
              errors: [],
            },
            { status: 400 }
          )
        }
        if (item.porsi < itemDb.min_porsi) {
          return NextResponse.json(
            {
              status: 'error',
              code: 'MINIMUM_PORTION_NOT_MET',
              message: `Pesanan menu "${itemDb.nama}" minimal ${itemDb.min_porsi} porsi.`,
              errors: [],
            },
            { status: 400 }
          )
        }
        const itemHarga = Number(itemDb.harga)
        const itemSubtotal = itemHarga * item.porsi

        snapshotItems.push({
          item_type: 'menu',
          menu_id: itemDb.id,
          paket_id: null,
          porsi: item.porsi,
          harga_satuan: itemHarga,
          subtotal: itemSubtotal,
        })
        totalPorsi += item.porsi
        subtotal += itemSubtotal
      } else if (item.item_type === 'paket') {
        const itemDb = await prisma.paket.findUnique({
          where: { id: item.id, status: 'aktif', deleted_at: null },
        })
        if (!itemDb) {
          return NextResponse.json(
            {
              status: 'error',
              code: 'ITEM_NOT_AVAILABLE',
              message: `Paket bundling dengan ID ${item.id} tidak aktif atau sudah dihapus.`,
              errors: [],
            },
            { status: 400 }
          )
        }
        if (item.porsi < itemDb.min_order) {
          return NextResponse.json(
            {
              status: 'error',
              code: 'MINIMUM_PORTION_NOT_MET',
              message: `Pesanan Paket "${itemDb.nama}" minimal ${itemDb.min_order} porsi.`,
              errors: [],
            },
            { status: 400 }
          )
        }
        const itemHarga = Number(itemDb.harga)
        const itemSubtotal = itemHarga * item.porsi

        snapshotItems.push({
          item_type: 'paket',
          menu_id: null,
          paket_id: itemDb.id,
          porsi: item.porsi,
          harga_satuan: itemHarga,
          subtotal: itemSubtotal,
        })
        totalPorsi += item.porsi
        subtotal += itemSubtotal
      } else {
        return NextResponse.json(
          {
            status: 'error',
            code: 'INVALID_ITEM_TYPE',
            message: 'Tipe jenis pesanan tidak valid.',
            errors: [],
          },
          { status: 400 }
        )
      }
    }

    // Kalkulasi nominal DP / Lunas
    const pct_dp = tipe_bayar === 'dp' ? 50 : 100
    const nominal_dp = tipe_bayar === 'dp' ? subtotal * 0.5 : subtotal
    const nominal_sisa = subtotal - nominal_dp

    // TASK-050: MDR Calculation server-side (QRIS 0.7%)
    const mdr_nominal = Math.round(nominal_dp * 0.007)
    const total_charged = nominal_dp + mdr_nominal

    // 6. DB Transactional locking block
    const dateStr = toLocalDateString(targetDate)

    const result = await prisma.$transaction(async (tx) => {
      // Periksa kapasitas kalender dengan row-level lock
      const lockResult = await checkAndLockDateCapacity(tx, dateStr, totalPorsi)
      if (!lockResult.allowed) {
        throw new Error(lockResult.reason || 'Kapasitas kalender terlampaui.')
      }

      // Generate daily unique sequential nomor_order
      const nomorOrder = await generateNomorOrder(tx)

      // Simpan pesanan utama
      const order = await tx.pesanan.create({
        data: {
          nomor_order: nomorOrder,
          nama,
          no_hp,
          alamat_event,
          tanggal_acara: targetDate,
          waktu_acara: waktuAcaraDate,
          catatan,
          total_porsi: totalPorsi,
          subtotal,
          tipe_bayar,
          pct_dp,
          nominal_dp,
          nominal_sisa,
          consent_given,
          consent_timestamp: new Date(),
          consent_version,
          status_pesanan: 'menunggu_konfirmasi',
          source: 'customer_web',
        },
      })

      // Simpan pesanan items snapshot
      await tx.pesanan_items.createMany({
        data: snapshotItems.map((s) => ({
          pesanan_id: order.id,
          item_type: s.item_type,
          menu_id: s.menu_id,
          paket_id: s.paket_id,
          porsi: s.porsi,
          harga_satuan: s.harga_satuan,
          subtotal: s.subtotal,
        })),
      })

      return {
        pesanan_id: order.id,
        nomor_order: order.nomor_order,
        nominal_dp,
        nominal_sisa,
        mdr_nominal,
        total_charged,
      }
    })

    return NextResponse.json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    const err = error as Error
    console.error('API-06 Order error:', err)
    if (err.message && err.message.includes('Kapasitas')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'CAPACITY_CONFLICT',
          message: err.message,
          errors: [],
        },
        { status: 409 }
      )
    }
    return NextResponse.json(
      {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'Gagal membuat pesanan baru. Silakan coba kembali.',
        errors: [],
      },
      { status: 500 }
    )
  }
}
