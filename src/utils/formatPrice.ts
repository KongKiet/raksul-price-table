export function formatPrice(price: number): string {
  const digits = String(price)
  const firstGroupLength = digits.length % 3 || 3
  const groups = [digits.slice(0, firstGroupLength)]

  for (let index = firstGroupLength; index < digits.length; index += 3) {
    groups.push(digits.slice(index, index + 3))
  }

  return groups.join(',')
}
