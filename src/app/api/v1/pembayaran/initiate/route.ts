import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serverEnv, publicEnv } from '@/lib/env'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pesanan_id, tipe } = body

    if (!pesanan_id || !tipe) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Parameter pesanan_id dan tipe pembayaran wajib diisi.',
          errors: [],
        },
        { status: 422 }
      )
    }

    if (tipe !== 'dp' && tipe !== 'lunas') {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Tipe pembayaran harus "dp" atau "lunas".',
          errors: [],
        },
        { status: 422 }
      )
    }

    // 1. Verifikasi pesanan ada di database
    const order = await prisma.pesanan.findUnique({
      where: { id: pesanan_id },
      include: {
        pesanan_items: {
          include: {
            menu: true,
            paket: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'ORDER_NOT_FOUND',
          message: 'Pesanan tidak ditemukan.',
          errors: [],
        },
        { status: 404 }
      )
    }

    // Hitung nominal bayar berdasarkan tipe
    let nominalToPay = 0
    if (tipe === 'dp') {
      nominalToPay = Number(order.nominal_dp)
    } else {
      nominalToPay = Number(order.subtotal) // lunas = full subtotal
    }

    // Hitung MDR nominal (0.7% untuk QRIS sandbox default)
    const mdrNominal = Math.round(nominalToPay * 0.007)
    const totalCharged = nominalToPay + mdrNominal

    // Idempotency Key check: 'initiate-{orderId}-{tipe}'
    const idempotencyKey = `initiate-${pesanan_id}-${tipe}`

    // Periksa apakah pembayaran sudah lunas / sukses sebelumnya
    const existingSuccessfulPayment = await prisma.pembayaran.findFirst({
      where: {
        pesanan_id,
        tipe,
        status: 'paid',
      },
    })

    if (existingSuccessfulPayment) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'PAYMENT_ALREADY_PAID',
          message: 'Pembayaran untuk tahap ini sudah lunas.',
          errors: [],
        },
        { status: 400 }
      )
    }

    // Cek jika sudah ada transaksi pending dengan idempotencyKey ini
    const existingPendingPayment = await prisma.pembayaran.findFirst({
      where: {
        idempotency_key: idempotencyKey,
        status: 'pending',
      },
    })

    // Ganti invoice number agar unik jika re-initiate
    const paymentCount = await prisma.pembayaran.count({
      where: { pesanan_id, tipe },
    })
    const attemptSuffix = paymentCount > 0 ? `-${paymentCount + 1}` : ''
    const dokuInvoiceNumber = `${order.nomor_order}${attemptSuffix}`

    // 2. Siapkan DOKU Sandbox request payload
    // Kita gunakan detail line items dari pesanan_items
    const factor = tipe === 'dp' ? 0.5 : 1.0
    const lineItems = order.pesanan_items.map((item) => {
      const name = item.item_type === 'menu' ? item.menu?.nama : item.paket?.nama
      return {
        name: (name || 'Katering Item')
          .replace(/[()]/g, '') // remove parentheses to prevent DOKU validation error
          .substring(0, 50),
        price: Math.round(Number(item.harga_satuan) * factor),
        quantity: item.porsi,
      }
    })

    // Hitung total sum line items (sebelum MDR) untuk penyesuaian pembulatan
    const sumLineItems = lineItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const diff = nominalToPay - sumLineItems

    // Jika ada selisih pembulatan, masukkan pembulatan penyesuaian
    if (diff !== 0) {
      lineItems.push({
        name: 'Penyesuaian Pembulatan',
        price: diff,
        quantity: 1,
      })
    }

    // Tambah MDR sebagai line item di DOKU agar breakdown match
    if (mdrNominal > 0) {
      lineItems.push({
        name: 'MDR QRIS 0.7%', // remove parentheses to prevent DOKU validation error
        price: mdrNominal,
        quantity: 1,
      })
    }

    // Detail payload untuk DOKU Hosted Checkout V1
    const dokuPayload = {
      order: {
        amount: totalCharged,
        invoice_number: dokuInvoiceNumber,
        currency: 'IDR',
        callback_url: `${publicEnv.baseUrl}/pesan/sukses?order_no=${order.nomor_order}`,
        line_items: lineItems,
      },
      payment: {
        payment_due_date: 60, // 60 menit batas bayar
      },
      customer: {
        name: order.nama,
        phone: order.no_hp,
        address: order.alamat_event.substring(0, 100),
      },
    }

    // 3. Generate DOKU HMAC-SHA256 signature
    const clientId = serverEnv.dokuClientId
    const secretKey = serverEnv.dokuSecretKey
    const requestId = crypto.randomUUID()
    const requestTimestamp = new Date().toISOString().substring(0, 19) + 'Z'
    const requestTarget = '/checkout/v1/payment'

    const bodyString = JSON.stringify(dokuPayload)
    const digest = crypto.createHash('sha256').update(bodyString, 'utf-8').digest('base64')

    const signatureComponent =
      `Client-Id:${clientId}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${requestTimestamp}\n` +
      `Request-Target:${requestTarget}\n` +
      `Digest:${digest}`

    const hmacSignature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureComponent)
      .digest('base64')

    const signatureHeader = `HMACSHA256=${hmacSignature}`

    // 4. Kirim request ke DOKU Sandbox
    const dokuEndpoint =
      serverEnv.dokuEnv === 'production'
        ? 'https://api.doku.com/checkout/v1/payment'
        : 'https://api-sandbox.doku.com/checkout/v1/payment'

    console.log(`Sending API-08 payout initiation to DOKU sandbox URL: ${dokuEndpoint}`)

    const dokuRes = await fetch(dokuEndpoint, {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        Signature: signatureHeader,
        'Content-Type': 'application/json',
      },
      body: bodyString,
    })

    if (!dokuRes.ok) {
      const errorText = await dokuRes.text()
      console.error(`DOKU payment initiation error. Status ${dokuRes.status}: ${errorText}`)
      throw new Error(`DOKU Sandbox API returned error status: ${dokuRes.status}`)
    }

    const dokuData = await dokuRes.json()
    const dokuPaymentUrl = dokuData.response?.payment?.url

    if (!dokuPaymentUrl) {
      console.error('Invalid response payload from DOKU sandbox:', dokuData)
      throw new Error('DOKU did not return a valid hosted payment url.')
    }

    // 5. Simpan catatan pembayaran di database (idempotent, save attempt)
    // Jika record dengan idempotencyKey sudah ada tapi status: pending, kita update dengan invoice doku yang baru
    if (existingPendingPayment) {
      await prisma.pembayaran.update({
        where: { id: existingPendingPayment.id },
        data: {
          doku_invoice_number: dokuInvoiceNumber,
          nominal: nominalToPay,
          mdr_nominal: mdrNominal,
          total_charged: totalCharged,
          updated_at: new Date(),
        },
      })
    } else {
      await prisma.pembayaran.create({
        data: {
          pesanan_id,
          tipe,
          nominal: nominalToPay,
          mdr_nominal: mdrNominal,
          total_charged: totalCharged,
          doku_invoice_number: dokuInvoiceNumber,
          status: 'pending',
          idempotency_key: idempotencyKey,
        },
      })
    }

    return NextResponse.json({
      status: 'success',
      data: {
        doku_payment_url: dokuPaymentUrl,
        invoice_number: dokuInvoiceNumber,
        expired_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 menit dari sekarang
      },
    })
  } catch (error) {
    const err = error as Error
    console.error('API-08 Payment initiation core error:', err)
    return NextResponse.json(
      {
        status: 'error',
        code: 'PAYMENT_INIT_FAILED',
        message: 'Gagal menginisiasi gerbang pembayaran DOKU. Silakan coba beberapa saat lagi.',
        errors: [],
      },
      { status: 500 }
    )
  }
}
