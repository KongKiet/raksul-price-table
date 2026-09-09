import { describe, expect, it } from 'vitest'

import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it.each([
    [1, '1'],
    [999, '999'],
  ])('leaves a price below 1,000 without separators', (price, expected) => {
    expect(formatPrice(price)).toBe(expected)
  })

  it.each([
    [1_000, '1,000'],
    [12_345, '12,345'],
  ])('formats the first digit-group boundary for %i', (price, expected) => {
    expect(formatPrice(price)).toBe(expected)
  })

  it('inserts multiple separators from the right', () => {
    expect(formatPrice(1_234_567)).toBe('1,234,567')
  })
})
