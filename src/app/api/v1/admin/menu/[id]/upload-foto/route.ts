/**
 * API-24: POST /api/v1/admin/menu/[id]/upload-foto
 * Upload foto menu dan update menu.foto_url di DB
 *
 * Validasi:
 * - max 5MB (SECURITY_DEFAULTS)
 * - MIME type scan via magic bytes — bukan cek ekstensi (SECURITY_DEFAULTS)
 * - Format: jpg, png, webp saja
 *
 * BC3: async params
 * Auth: checkAdminAuth()
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth } from '@/lib/admin-auth'
import { validateMIMEType, validateFileSize, uploadToCloudinary } from '@/lib/cloudinary'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let adminSession
  try {
    adminSession = await checkAdminAuth()
  } catch {
    const clientIp =
      request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'
    console.warn(`[API-24] Unauthorized upload attempt from IP: ${clientIp}`)
    return NextResponse.json(
      { status: 'error', code: 'UNAUTHORIZED', message: 'Akses ditolak.', errors: [] },
      { status: 401 }
    )
  }

  const { id } = await params

  // Cek menu ada
  const menu = await prisma.menu.findFirst({
    where: { id, deleted_at: null },
  })
  if (!menu) {
    return NextResponse.json(
      { status: 'error', code: 'NOT_FOUND', message: 'Menu tidak ditemukan.', errors: [] },
      { status: 404 }
    )
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('foto') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'File foto wajib diunggah.',
          errors: [{ field: 'foto', message: 'File foto wajib diunggah.' }],
        },
        { status: 422 }
      )
    }

    // Hitung jumlah total foto (existing + new)
    const existingUrls = menu.foto_url ? menu.foto_url.split(',').filter(Boolean) : []
    if (existingUrls.length + files.length > 5) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: `Total foto melebihi batas maksimal 5. (Saat ini ada ${existingUrls.length} foto, Anda mencoba menambah ${files.length} foto).`,
          errors: [{ field: 'foto', message: 'Maksimal 5 foto untuk satu menu.' }],
        },
        { status: 422 }
      )
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Baca file sebagai buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Validasi ukuran file — max 5MB (SECURITY_DEFAULTS)
      if (!validateFileSize(buffer)) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'FILE_TOO_LARGE',
            message: `Ukuran file "${file.name}" melebihi batas 5MB.`,
            errors: [{ field: 'foto', message: 'Ukuran file maksimal 5MB.' }],
          },
          { status: 422 }
        )
      }

      // Validasi MIME type via magic bytes (SECURITY_DEFAULTS)
      const mimeType = validateMIMEType(buffer)
      if (!mimeType) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'INVALID_FILE_TYPE',
            message: `Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, atau WebP.`,
            errors: [{ field: 'foto', message: 'Format file harus JPG, PNG, atau WebP.' }],
          },
          { status: 422 }
        )
      }

      // Upload ke Cloudinary dengan dynamic public ID yang unik
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const uploadResult = await uploadToCloudinary(
        buffer,
        'lavanda-catering/menu',
        `menu-${id}-${uniqueSuffix}`
      )
      uploadedUrls.push(uploadResult.secure_url)
    }

    // Gabungkan foto lama dan baru
    const combinedUrls = [...existingUrls, ...uploadedUrls].slice(0, 5)

    // Update foto_url di DB
    await prisma.menu.update({
      where: { id },
      data: { foto_url: combinedUrls.join(',') },
    })

    console.info(
      `[API-24] Admin ${adminSession.email} uploaded ${files.length} photos for menu: ${id}`
    )

    return NextResponse.json({
      status: 'success',
      data: {
        foto_url: combinedUrls.join(','),
      },
    })
  } catch (error) {
    console.error(`[API-24] POST upload-foto error for menu ${id}:`, error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'UPLOAD_ERROR',
        message: 'Gagal mengupload foto. Coba lagi.',
        errors: [],
      },
      { status: 500 }
    )
  }
}
