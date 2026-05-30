'use client'

/**
 * src/components/catalog/PaketImageGallery.tsx
 * Client Component untuk halaman detail paket.
 * Menampilkan gallery gambar dengan list thumbnail interaktif.
 */

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Coffee, ChevronLeft, ChevronRight } from 'lucide-react'

interface PaketImageGalleryProps {
  fotoUrls: string[]
  nama: string
}

export default function PaketImageGallery({ fotoUrls, nama }: PaketImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Filter out any empty/null strings
  const images = (fotoUrls || []).map((url) => url.trim()).filter(Boolean)

  if (images.length === 0) {
    return (
      <div className="aspect-4/3 relative rounded-xl overflow-hidden border border-gray-150 bg-white shadow-xs">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-brand-primary/5 to-brand-secondary/10 text-brand-primary">
          <Coffee className="w-16 h-16 stroke-[1.2] opacity-40 mb-2 animate-pulse" />
          <span className="text-xs uppercase font-extrabold tracking-wider opacity-60">
            Lavanda Signature Package
          </span>
        </div>
      </div>
    )
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="aspect-4/3 relative rounded-xl overflow-hidden border border-gray-150 bg-white shadow-xs group">
        <Image
          src={images[activeIndex]}
          alt={`Detail ${nama} - Foto ${activeIndex + 1}`}
          fill
          priority
          className="object-cover transition-all duration-300 ease-in-out hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Carousel Overlay Navigation controls if multi item */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-dark shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10 duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-dark" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-dark shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10 duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-neutral-dark" />
            </button>

            {/* Position indicator */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 text-white font-extrabold text-[10px] tracking-wider pointer-events-none z-10">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {images.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'aspect-square relative rounded-lg overflow-hidden border transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
                activeIndex === idx
                  ? 'border-brand-primary shadow-xs opacity-100 scale-102 bg-brand-primary/5 ring-1 ring-brand-primary'
                  : 'border-gray-250 opacity-60 hover:opacity-90 bg-white'
              )}
            >
              <Image
                src={url}
                alt={`${nama} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
