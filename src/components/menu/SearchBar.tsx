'use client'

/**
 * src/components/menu/SearchBar.tsx
 * Search input dengan debounce 300ms
 * Controlled component — parent menghandle debounce via useEffect di MenuGrid
 */

import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Cari menu...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Search icon */}
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-mid w-4 h-4 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197M15.803 15.803A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        id="menu-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'w-full h-11 pl-10 pr-10 rounded-full border border-border bg-white',
          'text-sm text-neutral-dark placeholder:text-neutral-mid',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
          'transition-colors'
        )}
        aria-label="Cari menu"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-mid hover:text-neutral-dark transition-colors"
          aria-label="Hapus pencarian"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
