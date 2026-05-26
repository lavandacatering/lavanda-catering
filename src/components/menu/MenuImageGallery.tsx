'use client'

/**
 * src/components/menu/MenuImageGallery.tsx
 * Client component untuk galeri foto interaktif di detail menu
 * - Klik thumbnail untuk ganti foto utama
 * - Hover / active state borders
 * - Menggunakan foto menu utama + foto related menus untuk mengisi galeri
 */

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Utensils } from 'lucide-react'

interface MenuImageGalleryProps {
  mainFotoUrl: string | null
  nama: string
  kategoriNama: string
  relatedFotos: string[]
}

export default function MenuImageGallery({
  mainFotoUrl,
  nama,
  kategoriNama,
  relatedFotos,
}: MenuImageGalleryProps) {
  // Gabungkan foto utama dengan foto dari menu lainnya (maksimal 5 foto)
  const allFotos = [mainFotoUrl, ...relatedFotos].filter((url): url is string => !!url).slice(0, 5)
  const [activeIdx, setActiveIdx] = useState(0)

  const activeFoto = allFotos[activeIdx] ?? null

  return (
    <div className="space-y-4 font-sans">
      {/* Big Active Image */}
      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xs">
        {activeFoto ? (
          <Image
            src={activeFoto}
            alt={`Foto ${nama} — Lavanda Catering`}
            fill
            priority
            className="object-cover transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 55vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-neutral-mid/30">
            <Utensils className="w-16 h-16 stroke-[1.5] text-neutral-300" />
          </div>
        )}

        {/* Badge Kategori */}
        <span className="absolute top-4 left-4 bg-brand-primary text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">
          {kategoriNama}
        </span>
      </div>

      {/* Thumbnails grid */}
      {allFotos.length > 1 && (
        <div
          className={cn(
            'grid gap-3',
            allFotos.length === 5
              ? 'grid-cols-5'
              : allFotos.length === 4
                ? 'grid-cols-4'
                : allFotos.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2'
          )}
        >
          {allFotos.map((foto, idx) => {
            const isActive = idx === activeIdx
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  'aspect-square rounded-lg overflow-hidden border transition-all relative cursor-pointer outline-hidden bg-gray-50',
                  isActive
                    ? 'border-brand-primary ring-2 ring-brand-primary/20 opacity-100'
                    : 'border-gray-100 opacity-60 hover:opacity-100'
                )}
                aria-label={`Lihat foto ${idx + 1}`}
              >
                <Image
                  src={foto}
                  alt={`Thumbnail ${nama} ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 20vw, 12vw"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
