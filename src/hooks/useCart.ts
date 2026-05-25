'use client'

import { useState, useEffect } from 'react'

export interface CartItem {
  id: string
  item_type: 'menu' | 'paket'
  nama: string
  foto_url: string | null
  harga: number
  porsi: number
  min_porsi: number
  subtotal: number
}

export interface CartState {
  items: CartItem[]
  expiresAt: string // ISO timestamp, expire 24 jam
}

const CART_STORAGE_KEY = 'lavanda_cart'

export function useCart() {
  const [cart, setCart] = useState<CartState>({ items: [], expiresAt: '' })
  const [isMounted, setIsMounted] = useState(false)

  // Initialize cart from localStorage on mount and sync on storage / custom event
  useEffect(() => {
    const handleCartSync = () => {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CartState
          // Check if expired
          if (parsed.expiresAt) {
            const expiry = new Date(parsed.expiresAt)
            if (expiry < new Date()) {
              console.warn('[useCart] Cart session expired, clearing cart...')
              const newCart = { items: [], expiresAt: '' }
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))
              setCart(newCart)
            } else {
              setCart(parsed)
            }
          } else {
            setCart(parsed)
          }
        } catch (err) {
          console.error('[useCart] Failed to parse cart from localStorage:', err)
        }
      } else {
        setCart({ items: [], expiresAt: '' })
      }
    }

    handleCartSync()
    setTimeout(() => setIsMounted(true), 0)

    window.addEventListener('cart-updated', handleCartSync)
    window.addEventListener('storage', handleCartSync)

    return () => {
      window.removeEventListener('cart-updated', handleCartSync)
      window.removeEventListener('storage', handleCartSync)
    }
  }, [])

  // Helper to save to localStorage and state
  const saveCart = (newItems: CartItem[]) => {
    let expiresAt = cart.expiresAt
    // Set 24 hour expiry on first item added
    if (newItems.length > 0 && !expiresAt) {
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + 24)
      expiresAt = expiry.toISOString()
    } else if (newItems.length === 0) {
      expiresAt = ''
    }

    const newCart = { items: newItems, expiresAt }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))
    setCart(newCart)

    // Dispatch custom event to notify all useCart hook instances on the same page
    window.dispatchEvent(new Event('cart-updated'))
  }

  const addItem = (item: Omit<CartItem, 'subtotal'>) => {
    const existingIndex = cart.items.findIndex((i) => i.id === item.id)
    const newItems = [...cart.items]

    if (existingIndex > -1) {
      // Increment porsi by the added porsi amount
      const existingItem = newItems[existingIndex]
      const newPorsi = existingItem.porsi + item.porsi
      newItems[existingIndex] = {
        ...existingItem,
        porsi: newPorsi,
        subtotal: newPorsi * existingItem.harga,
      }
    } else {
      // Add new item
      newItems.push({
        ...item,
        subtotal: item.porsi * item.harga,
      })
    }

    saveCart(newItems)
  }

  const removeItem = (id: string) => {
    const newItems = cart.items.filter((i) => i.id !== id)
    saveCart(newItems)
  }

  const updatePorsi = (id: string, porsi: number) => {
    const index = cart.items.findIndex((i) => i.id === id)

    if (index > -1) {
      const item = cart.items[index]
      if (porsi <= 0) {
        const newItems = cart.items.filter((i) => i.id !== id)
        saveCart(newItems)
      } else {
        const validatedPorsi = Math.max(porsi, item.min_porsi)
        const newItems = [...cart.items]
        newItems[index] = {
          ...item,
          porsi: validatedPorsi,
          subtotal: validatedPorsi * item.harga,
        }
        saveCart(newItems)
      }
    }
  }

  const clearCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY)
    setCart({ items: [], expiresAt: '' })
  }

  const isInCart = (id: string): boolean => {
    return cart.items.some((i) => i.id === id)
  }

  const getCartItem = (id: string): CartItem | undefined => {
    return cart.items.find((i) => i.id === id)
  }

  const getTotal = (): number => {
    return cart.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const getItemCount = (): number => {
    return cart.items.length
  }

  const isExpired = (): boolean => {
    if (!cart.expiresAt) return false
    return new Date(cart.expiresAt) < new Date()
  }

  return {
    items: isMounted ? cart.items : [],
    expiresAt: isMounted ? cart.expiresAt : '',
    addItem,
    removeItem,
    updatePorsi,
    clearCart,
    isInCart,
    getCartItem,
    getTotal,
    getItemCount,
    isExpired,
    isMounted,
  }
}
