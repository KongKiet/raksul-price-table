import { useEffect, useState } from 'react'

import { type PaperSize } from '../api/prices'

export interface CartLine {
  paperSize: PaperSize
  quantity: number
  businessDay: number
  price: number
  cartQuantity: number
}

export interface CartItem {
  paperSize: PaperSize
  quantity: number
  businessDay: number
  price: number
}

export const CART_STORAGE_KEY = 'raksul-price-table:cart'
const PAPER_SIZES: readonly PaperSize[] = ['A4', 'A5', 'B4', 'B5']

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.paperSize === 'string' &&
    PAPER_SIZES.some((paperSize) => paperSize === candidate.paperSize) &&
    isPositiveInteger(candidate.quantity) &&
    isPositiveInteger(candidate.businessDay) &&
    isPositiveInteger(candidate.price) &&
    isPositiveInteger(candidate.cartQuantity)
  )
}

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed.filter(isCartLine) : []
  } catch {
    return []
  }
}

function writeCart(lines: CartLine[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Ignore storage failures (disabled storage, quota exceeded, etc.).
  }
}

function isSameLine(line: CartLine, item: CartItem): boolean {
  return (
    line.paperSize === item.paperSize &&
    line.quantity === item.quantity &&
    line.businessDay === item.businessDay
  )
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>(() => readCart())

  useEffect(() => {
    writeCart(lines)
  }, [lines])

  function addItem(item: CartItem) {
    setLines((current) => {
      const existingIndex = current.findIndex((line) => isSameLine(line, item))

      if (existingIndex === -1) {
        return [{ ...item, cartQuantity: 1 }, ...current]
      }

      return current.map((line, index) =>
        index === existingIndex
          ? { ...line, cartQuantity: line.cartQuantity + 1 }
          : line,
      )
    })
  }

  function incrementLine(target: CartLine) {
    setLines((current) =>
      current.map((line) =>
        isSameLine(line, target)
          ? { ...line, cartQuantity: line.cartQuantity + 1 }
          : line,
      ),
    )
  }

  function decrementLine(target: CartLine) {
    setLines((current) =>
      current
        .map((line) =>
          isSameLine(line, target)
            ? { ...line, cartQuantity: line.cartQuantity - 1 }
            : line,
        )
        .filter((line) => line.cartQuantity > 0),
    )
  }

  function removeLine(target: CartLine) {
    setLines((current) => current.filter((line) => !isSameLine(line, target)))
  }

  const total = lines.reduce(
    (sum, line) => sum + line.price * line.cartQuantity,
    0,
  )
  const itemCount = lines.reduce((sum, line) => sum + line.cartQuantity, 0)

  return {
    lines,
    total,
    itemCount,
    addItem,
    incrementLine,
    decrementLine,
    removeLine,
  }
}
