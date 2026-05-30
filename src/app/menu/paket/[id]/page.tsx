/**
 * src/app/menu/paket/[id]/page.tsx
 * Halaman detail paket katering publik
 *
 * BC3: async params
 * Includes dynamic metadata, porsi configurator, items list, and related packages grid
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatRupiah } from '@/lib/utils'
import PaketDetailConfigurator from '@/components/catalog/PaketDetailConfigurator'
import PaketImageGallery from '@/components/catalog/PaketImageGallery'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award,
  Truck,
  Star,
  ArrowRight,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const item = await prisma.paket.findFirst({
      where: { id, status: 'aktif', deleted_at: null },
    })

    if (!item) return { title: 'Paket Tidak Ditemukan — Lavanda Catering' }

    return {
      title: `${item.nama} — Lavanda Catering Semarang`,
      description:
        item.deskripsi || `Pesan ${item.nama} lezat berkualitas di Lavanda Catering Semarang.`,
      openGraph: {
        title: `${item.nama} — Lavanda Catering`,
        description:
          item.deskripsi || `Pesan ${item.nama} lezat berkualitas di Lavanda Catering Semarang.`,
        type: 'website',
      },
    }
  } catch {
    return { title: 'Detail Paket — Lavanda Catering' }
  }
}

export default async function PaketDetailPage({ params }: PageProps) {
  const { id } = await params

  // Fetch package details
  const item = await prisma.paket.findFirst({
    where: {
      id,
      status: 'aktif',
      deleted_at: null,
    },
    include: {
      paket_items: {
        include: {
          menu: true,
        },
      },
    },
  })

  if (!item) {
    notFound()
  }

  // Fetch alternative packages
  const otherPackages = await prisma.paket.findMany({
    where: {
      id: { not: id },
      status: 'aktif',
      deleted_at: null,
    },
    take: 3,
    orderBy: { created_at: 'desc' },
  })

  // Format data for presentation
  const detailData = {
    id: item.id,
    nama: item.nama,
    subtitle: item.subtitle,
    deskripsi: item.deskripsi,
    harga: parseFloat(item.harga.toString()),
    foto_url: item.foto_url,
    min_order: item.min_order,
    status: item.status,
    paket_items: item.paket_items.map((pi) => ({
      id: pi.id,
      keterangan: pi.keterangan,
      porsi_per_paket: pi.porsi_per_paket,
      menu: pi.menu
        ? {
            id: pi.menu.id,
            nama: pi.menu.nama,
            harga: parseFloat(pi.menu.harga.toString()),
            foto_url: pi.menu.foto_url,
            deskripsi: pi.menu.deskripsi,
          }
        : null,
    })),
  }

  return (
    <main className="min-h-screen bg-brand-bg font-sans pt-[64px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav
          className="flex items-center text-xs text-neutral-mid space-x-1.5"
          aria-label="Breadcrumb"
        >
          <Link href="/menu" className="hover:text-brand-primary transition-colors">
            Menu
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-mid/60" />
          <Link href="/menu/paket" className="hover:text-brand-primary transition-colors">
            Paket
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-mid/60" />
          <span className="text-neutral-dark font-medium truncate max-w-[200px] sm:max-w-xs">
            {detailData.nama}
          </span>
        </nav>

        {/* Back Button */}
        <div className="flex items-center">
          <Link
            href="/menu/paket"
            className="inline-flex items-center gap-1 px-3 py-1.5 -ml-3 text-xs sm:text-sm font-semibold text-neutral-dark rounded-lg border border-transparent hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-primary transition-all group"
          >
            <ChevronLeft className="w-4 h-4 text-brand-primary transition-transform group-hover:-translate-x-0.5" />
            Kembali ke Katalog Paket
          </Link>
        </div>

        {/* Hero Product Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start mb-8">
          {/* Left Side: Images */}
          <div className="space-y-4">
            <PaketImageGallery
              fotoUrls={detailData.foto_url ? detailData.foto_url.split(',') : []}
              nama={detailData.nama}
            />
          </div>

          {/* Right Side: Product Details Configurator */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-5">
            <div className="space-y-2">
              <span className="inline-block bg-brand-primary/10 text-brand-primary font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full">
                Paket Bundling Hemat
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-dark tracking-tight leading-snug">
                {detailData.nama}
              </h1>
              <div className="text-2xl font-black text-brand-primary">
                {formatRupiah(detailData.harga)}
                <span className="text-sm font-normal text-neutral-mid">/porsi</span>
              </div>
            </div>

            {detailData.deskripsi && (
              <div className="text-xs sm:text-sm text-neutral-mid leading-relaxed font-semibold border-t border-b border-gray-100 py-4">
                <p>{detailData.deskripsi}</p>
              </div>
            )}

            {/* Highlights */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-brand-primary/5 px-2.5 py-1 rounded-md text-xs font-bold text-brand-primary">
                <Award className="w-3.5 h-3.5" />
                Peralatan Lengkap
              </div>
              <div className="flex items-center gap-1 bg-brand-primary/5 px-2.5 py-1 rounded-md text-xs font-bold text-brand-primary">
                <Star className="w-3.5 h-3.5" />
                Waitress Saji
              </div>
              <div className="flex items-center gap-1 bg-brand-primary/5 px-2.5 py-1 rounded-md text-xs font-bold text-brand-primary">
                <Truck className="w-3.5 h-3.5" />
                Gratis Ongkir (S&K)
              </div>
            </div>

            {/* Porsi Selector & Cart Action (Client Component) */}
            <PaketDetailConfigurator
              id={detailData.id}
              nama={detailData.nama}
              harga={detailData.harga}
              minOrder={detailData.min_order}
              fotoUrl={detailData.foto_url}
            />
          </div>
        </section>

        {/* Isi Paket Bento-Grid style */}
        <section className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-xl font-extrabold text-neutral-dark text-center tracking-tight">
            Menu Konstituen Paket
          </h2>
          <div className="w-12 h-0.5 bg-brand-primary mx-auto rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {detailData.paket_items.map((pi) => (
              <div
                key={pi.id}
                className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 flex gap-3 shadow-xs"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-neutral-dark leading-snug">
                    {pi.menu?.nama || 'Menu Pilihan'}
                  </h3>
                  {pi.keterangan && (
                    <p className="text-[11px] text-neutral-mid font-semibold">
                      Keterangan: {pi.keterangan}
                    </p>
                  )}
                  {pi.menu?.deskripsi && (
                    <p className="text-xs text-neutral-mid/80 line-clamp-2 leading-relaxed">
                      {pi.menu.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Packages (Paket Lainnya) */}
        {otherPackages.length > 0 && (
          <section className="space-y-4 mt-6">
            <h2 className="text-xl font-extrabold text-neutral-dark text-center tracking-tight">
              Pilihan Paket Lainnya
            </h2>
            <div className="w-12 h-0.5 bg-brand-primary mx-auto rounded-full mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPackages.map((other) => (
                <div
                  key={other.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="bg-linear-to-r from-brand-primary to-brand-secondary p-4 text-white">
                    <h3 className="font-bold text-base line-clamp-1">{other.nama}</h3>
                    <p className="text-[11px] text-white/90 truncate">{other.subtitle}</p>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-xs text-neutral-mid line-clamp-2 leading-relaxed font-semibold">
                      {other.deskripsi}
                    </p>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                      <div>
                        <span className="text-sm font-extrabold text-brand-primary">
                          {formatRupiah(parseFloat(other.harga.toString()))}
                        </span>
                        <span className="text-[10px] text-neutral-mid block">
                          Min. {other.min_order} porsi
                        </span>
                      </div>
                      <Link
                        href={`/menu/paket/${other.id}`}
                        className="text-brand-primary hover:text-brand-secondary font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                      >
                        Detail <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
