/**
 * src/app/menu/paket/page.tsx — /menu/paket
 * F1 Katalog Menu — tab Paket Bundling
 *
 * Server Component: fetch initial data from database
 * Displays a beautiful grid of active packages using CatalogTabs & PaketCard
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CatalogTabs from '@/components/catalog/CatalogTabs'
import PaketCard from '@/components/catalog/PaketCard'
import type { PaketCardData } from '@/components/catalog/PaketCard'
import { Info, HelpCircle, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Katalog Paket Bundling — Lavanda Catering',
  description:
    'Temukan paket catering bundling terbaik di Semarang untuk pernikahan, khitanan, seminar, corporate event, atau syukuran dengan rasa bintang lima dan harga hemat terjangkau.',
  openGraph: {
    title: 'Katalog Paket Bundling — Lavanda Catering',
    description: 'Pilih paket katering hemat & lengkap terbaik untuk acaramu di Semarang.',
    type: 'website',
  },
}

// Revalidate every 60 seconds
export const revalidate = 60

async function getPaketData(): Promise<PaketCardData[]> {
  try {
    const rawPaket = await prisma.paket.findMany({
      where: {
        status: 'aktif',
        deleted_at: null,
      },
      include: {
        paket_items: {
          include: {
            menu: {
              select: {
                id: true,
                nama: true,
                harga: true,
                foto_url: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return rawPaket.map((item) => ({
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
            }
          : null,
      })),
    }))
  } catch (err) {
    console.error('[/menu/paket] Database query failed:', err)
    return []
  }
}

export default async function KatalogPaketPage() {
  const packages = await getPaketData()

  return (
    <main className="min-h-screen bg-brand-bg font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Section 1: Header */}
        <section className="bg-white py-12 rounded-xl mt-4 md:mt-6 border border-gray-100 shadow-sm text-center px-4">
          <nav className="text-xs text-neutral-mid mb-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Beranda
            </Link>
            <span className="mx-1.5">/</span>
            <Link href="/menu" className="hover:text-brand-primary transition-colors">
              Menu
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-neutral-dark font-medium">Paket</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-neutral-dark mb-1.5 tracking-tight">
            Katalog Menu
          </h1>
          <p className="text-neutral-mid text-sm font-medium">
            Temukan solusi lengkap untuk kelancaran acara Anda.
          </p>
        </section>

        {/* Section 2: Tab Pill */}
        <CatalogTabs />

        {/* Section 3: Info Banner */}
        <section className="bg-[#eaf1ff]/70 border border-[#d9e3f6] rounded-xl p-4 md:p-5 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-neutral-dark font-semibold leading-relaxed">
            Semua paket sudah termasuk peralatan makan standar, pengantaran, dan servis meja saji.
            Harga tertera berdasarkan pemenuhan jumlah minimum order per paket.
          </p>
        </section>

        {/* Section 4: Paket Grid */}
        {packages.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkt) => (
              <PaketCard key={pkt.id} paket={pkt} />
            ))}
          </section>
        ) : (
          // Empty state
          <section className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-dark mb-1">Belum Ada Paket Tersedia</h3>
            <p className="text-xs text-neutral-mid max-w-sm">
              Saat ini belum ada paket katering aktif yang tersedia. Hubungi admin kami untuk
              memesan menu kustomisasi secara langsung.
            </p>
          </section>
        )}

        {/* Section 5: Custom Order Banner */}
        <section className="bg-neutral-dark rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md border border-white/5">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-white/10 p-3 rounded-full shrink-0">
              <HelpCircle className="w-8 h-8 text-white stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Butuh paket kustomisasi?
              </h3>
              <p className="text-xs md:text-sm text-gray-300 mt-1 font-medium leading-relaxed max-w-xl">
                Tim katering kami siap membantu merancang susunan menu prasmanan atau nasi box
                khusus yang sesuai dengan anggaran dan preferensi acara Anda.
              </p>
            </div>
          </div>
          <Link
            href="https://wa.me/6281234567890"
            target="_blank"
            className="w-full md:w-auto bg-white text-neutral-dark font-bold text-xs tracking-wider px-6 py-3 rounded-lg hover:bg-gray-100 transition-all text-center flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            Chat WhatsApp Admin
          </Link>
        </section>
      </div>
    </main>
  )
}
