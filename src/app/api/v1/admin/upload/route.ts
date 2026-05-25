import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'
import { serverEnv } from '@/lib/env'

// Helper to generate SHA-256 hash using Web Crypto API (Edge-compatible)
async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Deep MIME magic byte inspection (SECURITY_DEFAULTS requirement: MIME type scan mandatory)
function inspectMagicBytes(bytes: Uint8Array): { valid: boolean; mime: string } {
  if (bytes.length < 4) return { valid: false, mime: '' }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { valid: true, mime: 'image/png' }
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: true, mime: 'image/jpeg' }
  }

  // WEBP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 && // 'RIFF'
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50 // 'WEBP'
  ) {
    return { valid: true, mime: 'image/webp' }
  }

  return { valid: false, mime: '' }
}

// POST /api/v1/admin/upload — General upload endpoint (Admin Only)
export async function POST(request: NextRequest) {
  console.log('[API-ADMIN-UPLOAD] Upload process initiated by admin...')

  try {
    // 1. Double auth check (BC1 + SECURITY_DEFAULTS)
    const admin = await checkAdminAuth()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const context = (formData.get('context') as string) || 'other'

    if (!file) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Berkas file tidak ditemukan dalam request.',
        },
        { status: 422 }
      )
    }

    // 2. Validate file size (max 5MB as per SECURITY_DEFAULTS)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'FILE_TOO_LARGE',
          message: 'Ukuran file melebihi batas maksimal 5MB.',
        },
        { status: 400 }
      )
    }

    // 3. Mandatory MIME verification via magic byte scan
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const byteCheck = inspectMagicBytes(bytes)

    if (!byteCheck.valid) {
      console.warn(
        `[API-ADMIN-UPLOAD] File upload rejected. Magic bytes signature failed for user: ${admin.email}`
      )
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_FILE_TYPE',
          message: 'Format file tidak diizinkan. Hanya menerima JPEG, PNG, dan WEBP.',
        },
        { status: 400 }
      )
    }

    console.info(`[API-ADMIN-UPLOAD] File bytes signature verified: ${byteCheck.mime}`)

    // 4. Cloudinary Signed REST Upload (Edge-compatible, bypasses heavy Node SDK)
    const cloudName = serverEnv.cloudinaryCloudName
    const apiKey = serverEnv.cloudinaryApiKey
    const apiSecret = serverEnv.cloudinaryApiSecret

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[API-ADMIN-UPLOAD] Cloudinary config missing in server environment.')
      return NextResponse.json(
        {
          status: 'error',
          code: 'SERVER_CONFIG_ERROR',
          message: 'Konfigurasi Cloudinary di server tidak lengkap.',
        },
        { status: 500 }
      )
    }

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const folder = `lavanda-catering/${context}`

    // Calculate signed signature
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = await sha256(signatureString)

    // Construct multipart form data for Cloudinary
    const cloudinaryFormData = new FormData()
    const blob = new Blob([bytes], { type: byteCheck.mime })
    cloudinaryFormData.append('file', blob, file.name)
    cloudinaryFormData.append('api_key', apiKey)
    cloudinaryFormData.append('timestamp', timestamp)
    cloudinaryFormData.append('folder', folder)
    cloudinaryFormData.append('signature', signature)

    console.log(`[API-ADMIN-UPLOAD] Fetching Cloudinary signature-upload...`)
    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    })

    if (!cloudinaryRes.ok) {
      const errorText = await cloudinaryRes.text()
      console.error('[API-ADMIN-UPLOAD] Cloudinary REST failure response:', errorText)
      throw new Error('Gagal mengunggah file ke server penyimpanan awan.')
    }

    const cloudinaryData = await cloudinaryRes.json()
    console.info(
      `[API-ADMIN-UPLOAD] Admin ${admin.email} successfully uploaded image: ${cloudinaryData.secure_url}`
    )

    return NextResponse.json({
      status: 'success',
      data: {
        url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id,
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[API-ADMIN-UPLOAD] POST error:', err)

    if (err.message?.includes('Akses ditolak') || err.message?.includes('Unauthorised')) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Anda tidak memiliki hak akses untuk mengunggah file.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        code: 'UPLOAD_ERROR',
        message: err.message || 'Gagal mengunggah berkas.',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'edge' // Fully Edge-Compatible!
