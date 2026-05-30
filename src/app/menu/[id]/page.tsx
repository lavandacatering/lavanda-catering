/**
 * src/app/menu/[id]/page.tsx — /menu/[id]
 * Detail Menu — Server Component + Client interaction
 *
 * BC3: async params (Next.js 16 wajib)
 * - generateMetadata() dynamic OG
 * - JSON-LD Product schema (TASK-036 integrated)
 * - notFound() jika menu tidak ada atau deleted
 * - Mobile sticky CTA
 * - Menu Lainnya section
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import MenuDetailClient from '@/components/menu/MenuDetailClient'
import MenuImageGallery from '@/components/menu/MenuImageGallery'
import { formatRupiah } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getMenu(id: string) {
  try {
    const menu = await prisma.menu.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        kategori: {
          select: { id: true, nama: true, urutan: true },
        },
      },
    })

    if (!menu) return null

    // Fetch menu lainnya — same kategori, exclude current, max 4, status aktif
    let menuLainnya = await prisma.menu.findMany({
      where: {
        kategori_id: menu.kategori_id,
        id: { not: id },
        status: 'aktif',
        deleted_at: null,
      },
      include: {
        kategori: {
          select: { id: true, nama: true },
        },
      },
      orderBy: { urutan_dalam_kategori: 'asc' },
      take: 4,
    })

    // Fallback: Jika tidak ada menu di kategori yang sama, ambil menu dari kategori lain agar rekomendasi tidak kosong
    if (menuLainnya.length === 0) {
      menuLainnya = await prisma.menu.findMany({
        where: {
          id: { not: id },
          status: 'aktif',
          deleted_at: null,
        },
        include: {
          kategori: {
            select: { id: true, nama: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 4,
      })
    }

    return {
      id: menu.id,
      nama: menu.nama,
      deskripsi: menu.deskripsi,
      harga: parseFloat(menu.harga.toString()),
      foto_url: menu.foto_url,
      status: menu.status,
      min_porsi: menu.min_porsi,
      urutan_dalam_kategori: menu.urutan_dalam_kategori,
      kategori: menu.kategori,
      created_at: menu.created_at,
      updated_at: menu.updated_at,
      menu_lainnya: menuLainnya.map((m) => ({
        id: m.id,
        nama: m.nama,
        deskripsi: m.deskripsi,
        harga: parseFloat(m.harga.toString()),
        foto_url: m.foto_url,
        min_porsi: m.min_porsi,
        status: m.status,
        kategori: m.kategori,
      })),
    }
  } catch (error) {
    console.error('[MenuDetailPage] Error fetching menu directly from DB:', error)
    return null
  }
}

// BC3 — generateMetadata with async params
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const menu = await getMenu(id)

  if (!menu) {
    return {
      title: 'Menu Tidak Ditemukan — Lavanda Catering',
    }
  }

  const description = menu.deskripsi
    ? `${menu.deskripsi} Min. ${menu.min_porsi} porsi. Harga mulai ${formatRupiah(menu.harga)}/porsi.`
    : `${menu.nama} dari Lavanda Catering Semarang. Min. ${menu.min_porsi} porsi. Harga ${formatRupiah(menu.harga)}/porsi.`

  const firstFoto = menu.foto_url ? menu.foto_url.split(',')[0] : null

  return {
    title: `${menu.nama} — Lavanda Catering`,
    description,
    openGraph: {
      title: `${menu.nama} — Lavanda Catering`,
      description,
      images: firstFoto
        ? [{ url: firstFoto, width: 1200, height: 630, alt: `Foto ${menu.nama}` }]
        : [],
      type: 'website',
    },
  }
}

export default async function MenuDetailPage({ params }: PageProps) {
  const { id } = await params
  const menu = await getMenu(id)

  if (!menu || menu.status === 'nonaktif') {
    notFound()
  }

  const firstFoto = menu.foto_url ? menu.foto_url.split(',')[0] : undefined

  // JSON-LD Product schema — TASK-036
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: menu.nama,
    description: menu.deskripsi ?? `Menu katering ${menu.nama} dari Lavanda Catering`,
    image: firstFoto,
    offers: {
      '@type': 'Offer',
      price: menu.harga,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Lavanda Catering',
      },
    },
    category: menu.kategori?.nama,
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-brand-bg font-sans pt-[64px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          {/* Breadcrumb */}
          <nav
            className="flex items-center text-xs text-neutral-mid space-x-1.5"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-1.5 flex-wrap font-medium">
              <li>
                <Link href="/" className="hover:text-brand-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 text-neutral-mid/60" />
              </li>
              <li>
                <Link href="/menu" className="hover:text-brand-primary transition-colors">
                  Katalog Menu
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 text-neutral-mid/60" />
              </li>
              <li
                className="text-neutral-dark font-semibold truncate max-w-[200px]"
                aria-current="page"
              >
                {menu.nama}
              </li>
            </ol>
          </nav>

          {/* Back Button */}
          <div className="flex items-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 px-3 py-1.5 -ml-3 text-xs sm:text-sm font-semibold text-neutral-dark rounded-lg border border-transparent hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-primary transition-all group"
            >
              <ChevronLeft className="w-4 h-4 text-brand-primary transition-transform group-hover:-translate-x-0.5" />
              Kembali ke Menu
            </Link>
          </div>

          {/* Product Detail Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start mb-8">
            {/* Left Side: Images */}
            <div className="space-y-4">
              <MenuImageGallery
                fotoUrls={menu.foto_url ? menu.foto_url.split(',').filter(Boolean) : []}
                nama={menu.nama}
                kategoriNama={menu.kategori?.nama ?? 'Catering'}
              />
            </div>

            {/* Right Side: Details Configurator */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-5">
              <MenuDetailClient menu={menu} />
            </div>
          </section>

          {/* Recommendations Section — Styled to match code.html reference template */}
          {menu.menu_lainnya && menu.menu_lainnya.length > 0 && (
            <section className="mt-16 pt-12 border-t border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-dark text-center mb-10 tracking-tight">
                Menu Pilihan Lainnya
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {menu.menu_lainnya.map((item) => {
                  const unit = item.kategori?.nama.toLowerCase() === 'prasmanan' ? 'pax' : 'porsi'
                  const itemFoto = item.foto_url ? item.foto_url.split(',')[0] : null

                  return (
                    <Link
                      key={item.id}
                      href={`/menu/${item.id}`}
                      className="group bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                    >
                      {/* Photo Container */}
                      <div className="relative aspect-4/3 overflow-hidden bg-gray-50 shrink-0">
                        {itemFoto ? (
                          <Image
                            src={itemFoto}
                            alt={item.nama}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-brand-primary/5 to-brand-secondary/10 text-brand-primary">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                              Lavanda Signature
                            </span>
                          </div>
                        )}

                        {/* Kategori Badge */}
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-neutral-dark text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                          {item.kategori?.nama}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 grow flex flex-col justify-between">
                        <div className="mb-3">
                          <h3 className="font-bold text-sm text-neutral-dark truncate group-hover:text-brand-primary transition-colors">
                            {item.nama}
                          </h3>
                          {item.deskripsi && (
                            <p className="text-xs text-neutral-mid line-clamp-2 mt-1 leading-relaxed font-semibold">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>

                        {/* Footer info (Price & action arrow) */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                          <span className="font-bold text-sm text-brand-primary">
                            {formatRupiah(item.harga)}
                            <span className="text-[10px] text-neutral-mid font-normal">
                              /{unit}
                            </span>
                          </span>
                          <div className="text-neutral-mid group-hover:text-brand-primary transition-colors flex items-center">
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
