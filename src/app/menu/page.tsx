/**
 * src/app/menu/page.tsx — /menu
 * F1 Katalog Menu — tab Menu Pilihan
 *
 * Server Component: fetch initial data API-01 + kategori
 * Client: MenuGrid handles filter + search
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import CatalogTabs from '@/components/catalog/CatalogTabs'
import MenuGrid from '@/components/menu/MenuGrid'
import type { MenuCardData } from '@/components/menu/MenuCard'

export const metadata: Metadata = {
  title: 'Katalog Menu — Lavanda Catering',
  description:
    'Jelajahi ratusan pilihan menu katering Lavanda Catering: nasi box, prasmanan, paket seminar, pernikahan, dan lebih banyak lagi. Gratis ongkir seluruh Semarang.',
  openGraph: {
    title: 'Katalog Menu — Lavanda Catering',
    description: 'Pilih menu favoritmu dari katalog Lavanda Catering Semarang.',
    type: 'website',
  },
}

// Revalidate tiap 60 detik atau via revalidateTag
export const revalidate = 60

async function getMenuData(): Promise<{
  menu: MenuCardData[]
  kategori: { id: string; nama: string; urutan: number }[]
}> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  try {
    const [menuRes, kategoriRes] = await Promise.all([
      fetch(`${baseUrl}/api/v1/menu?per_page=50&status=aktif`, {
        next: { tags: ['menu-list'] },
      }),
      fetch(`${baseUrl}/api/v1/kategori`, {
        next: { tags: ['kategori-list'] },
      }),
    ])

    const menuJson = menuRes.ok ? await menuRes.json() : { data: [] }
    const kategoriJson = kategoriRes.ok ? await kategoriRes.json() : { data: [] }

    return {
      menu: menuJson.data ?? [],
      kategori: kategoriJson.data ?? [],
    }
  } catch (err) {
    console.error('[/menu] Server fetch error:', err)
    return { menu: [], kategori: [] }
  }
}

// Skeleton for Suspense fallback
function MenuGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] animate-pulse"
        >
          <div className="aspect-video bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-9 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function MenuGridServer() {
  const { menu, kategori } = await getMenuData()

  return <MenuGrid initialMenu={menu} kategoriList={kategori} />
}

export default function KatalogMenuPage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <section className="bg-white py-12 rounded-xl mt-4 md:mt-6 border border-gray-100 shadow-sm text-center px-4 mb-8">
          <div className="text-xs text-neutral-mid mb-2">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Beranda
            </Link>
            <span className="mx-1">/</span>
            <span className="text-neutral-dark font-medium">Menu</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-dark mb-1 tracking-tight">
            Katalog Menu
          </h1>
          <p className="text-neutral-mid text-sm">Temukan menu terbaik untuk acara Anda.</p>
        </section>

        {/* CatalogTabs — antara Page Header dan Filter Bar */}
        <CatalogTabs />

        {/* Menu Grid dengan Search + Filter */}
        <Suspense fallback={<MenuGridSkeleton />}>
          <MenuGridServer />
        </Suspense>

        {/* Banner Paket */}
        <section className="mt-16 bg-white border border-gray-100 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="grow">
            <h2 className="text-2xl font-bold text-neutral-dark mb-2">Butuh Paket Lengkap?</h2>
            <p className="text-sm text-neutral-mid mb-4 max-w-xl">
              Kami menyediakan paket bundling hemat untuk acara pernikahan, khitanan, atau corporate
              event Anda. Praktis dan lezat!
            </p>
            <Link
              href="/menu/paket"
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-[#F0FDF4] text-brand-primary font-semibold text-sm hover:bg-[#DCFCE7] transition-colors"
            >
              Lihat Pilihan Paket
            </Link>
          </div>
          <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden relative shadow-inner">
            <Image
              alt="Catering Event"
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_fzuwfnLeVMOICoaqosC6jh28HNYGp9pHM0T1ZoLfTX1pTUqMwvBjnegtkpmST_mCPifjDrO5UuJkc5DhFluy5uVj1GMCvQ5KcB3nNwT47HnwnavZrzB5O6axAvLT7sz-PYOXYaBwtTmaGXssu6VPDo1VOcFfAZjjHsM-wZ2OEPNAf1pFQ35eDBRpuGydjHavyE_U3kWaiKl9bx6VdWIsJgM-khAEAWQ8Xx0bkmH_qbOzwILVy9yoRxeOzpg0G-RZTrOodYnB2A-l"
            />
          </div>
        </section>
      </div>
    </main>
  )
}
