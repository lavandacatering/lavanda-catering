'use client'

import { useEffect, useState } from 'react'

export default function FloatingWAButton() {
  const [waNumber, setWaNumber] = useState('')

  useEffect(() => {
    // Dynamic fetch of wa_bisnis_number from settings endpoint
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/v1/settings')
        if (res.ok) {
          const json = await res.json()
          if (json.status === 'success' && json.data?.wa_bisnis_number) {
            setWaNumber(json.data.wa_bisnis_number)
            return
          }
        }
      } catch (err) {
        console.warn(
          '[WA-BUTTON] Failed to fetch settings dynamically, falling back to env/default:',
          err
        )
      }

      // Fallback to environment variable or standard default
      setWaNumber(process.env.NEXT_PUBLIC_WA_BISNIS || '6281234567890')
    }

    fetchSettings()
  }, [])

  if (!waNumber) return null

  const waLink = `https://wa.me/${waNumber}?text=Halo%20Lavanda%20Catering%2C%20saya%20tertarik%20untuk%20bertanya%20mengenai%20layanan%20catering.`

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group"
      aria-label="Chat WhatsApp"
    >
      {/* Tooltip */}
      <span className="absolute right-14 bg-neutral-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Tanya Kami via WhatsApp
      </span>
      {/* WhatsApp SVG Icon */}
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.025 14.068.995 11.45.995 6.015.995 1.588 5.37 1.584 10.8c-.001 1.762.476 3.483 1.382 5.017l-.92 3.364 3.447-.905c1.479.807 3.125 1.233 4.554 1.233zM18.06 14.93c-.33-.165-1.937-.954-2.231-1.06-.294-.105-.509-.16-.724.162-.215.318-.83.162-1.019-.374-.188-.53-.404-1.127-.615-1.516-.211-.389-.415-.417-.611-.427-.196-.01-.42-.012-.647-.012-.227 0-.596.085-.909.427-.312.342-1.192 1.166-1.192 2.842 0 1.677 1.223 3.298 1.393 3.526.17.226 2.402 3.668 5.821 5.145.813.35 1.448.56 1.943.717.818.26 1.563.223 2.152.135.656-.098 1.936-.791 2.209-1.52.274-.73.274-1.355.193-1.487-.083-.13-.306-.21-.636-.375z" />
      </svg>
    </a>
  )
}
