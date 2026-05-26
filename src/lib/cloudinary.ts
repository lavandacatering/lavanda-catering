/**
 * src/lib/cloudinary.ts
 * Cloudinary upload wrapper (signed upload, server-side only)
 *
 * SECURITY: API secret tidak pernah dikirim ke client.
 * Semua upload melalui server-side signed URL.
 * MIME type scan: cek magic bytes, bukan cek ekstensi saja.
 */

import { v2 as cloudinary } from 'cloudinary'

// Magic bytes validation for MIME type (complying with SECURITY_DEFAULTS.md)

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * Validasi MIME type berdasarkan magic bytes, bukan ekstensi file
 * @returns 'image/jpeg' | 'image/png' | 'image/webp' | null (invalid)
 */
export function validateMIMEType(buffer: Buffer): string | null {
  // Baca 4 byte pertama
  const hex = buffer.subarray(0, 4).toString('hex')

  // JPEG: FF D8 FF
  if (hex.startsWith('ffd8ff')) return 'image/jpeg'

  // PNG: 89 50 4E 47
  if (hex.startsWith('89504e47')) return 'image/png'

  // WEBP: Cek RIFF di byte 0-3, WEBP di byte 8-11
  if (hex.startsWith('52494646')) {
    const webpMarker = buffer.subarray(8, 12).toString('ascii')
    if (webpMarker === 'WEBP') return 'image/webp'
  }

  return null // Bukan format yang diizinkan
}

/**
 * Validasi ukuran file — max 5MB
 */
export function validateFileSize(buffer: Buffer): boolean {
  return buffer.length <= MAX_FILE_SIZE_BYTES
}

/**
 * Upload file ke Cloudinary (signed upload)
 * @param buffer - Buffer dari file
 * @param folder - Folder tujuan di Cloudinary (contoh: 'lavanda-catering/menu')
 * @param publicId - Optional public ID, auto-generated jika tidak ada
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'lavanda-catering',
  publicId?: string
): Promise<{ url: string; public_id: string; secure_url: string }> {
  // Konfigurasi Cloudinary dari env (WAJIB ada)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 900, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    }

    if (publicId) {
      uploadOptions.public_id = publicId
    }

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error('Upload gagal'))
        return
      }
      resolve({
        url: result.url,
        secure_url: result.secure_url,
        public_id: result.public_id,
      })
    })

    uploadStream.end(buffer)
  })
}

/**
 * Hapus file dari Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  await cloudinary.uploader.destroy(publicId)
}
