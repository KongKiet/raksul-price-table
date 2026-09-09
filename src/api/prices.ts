const PRICES_ENDPOINT =
  'https://us-central1-fe-ws-test.cloudfunctions.net/prices'

export type PaperSize = 'A4' | 'A5' | 'B4' | 'B5'

export interface PriceEntry {
  business_day: number
  price: number
  quantity: number
}

export type PriceRow = PriceEntry[]

export interface PriceResponse {
  paper_size: PaperSize
  prices: PriceRow[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0
}

function parsePaperSize(value: unknown): PaperSize {
  if (typeof value !== 'string') {
    throw new Error('The price response has an invalid paper size.')
  }

  const normalized = value.toUpperCase()

  if (
    normalized !== 'A4' &&
    normalized !== 'A5' &&
    normalized !== 'B4' &&
    normalized !== 'B5'
  ) {
    throw new Error('The price response has an unsupported paper size.')
  }

  return normalized
}

function parsePriceEntry(value: unknown): PriceEntry {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.business_day) ||
    !isPositiveInteger(value.price) ||
    !isPositiveInteger(value.quantity)
  ) {
    throw new Error('The price response contains an invalid price entry.')
  }

  return {
    business_day: value.business_day,
    price: value.price,
    quantity: value.quantity,
  }
}

function parsePriceRow(value: unknown): PriceRow {
  if (!Array.isArray(value)) {
    throw new Error('The price response contains an invalid price row.')
  }

  const row = value.map(parsePriceEntry)
  const quantity = row[0]?.quantity
  const businessDays = new Set<number>()

  for (const entry of row) {
    if (entry.quantity !== quantity) {
      throw new Error('A price row contains inconsistent quantities.')
    }

    if (businessDays.has(entry.business_day)) {
      throw new Error('A price row contains duplicate business days.')
    }

    businessDays.add(entry.business_day)
  }

  return row
}

function parsePriceResponse(value: unknown): PriceResponse {
  if (!isRecord(value) || !Array.isArray(value.prices)) {
    throw new Error('The price response has an invalid structure.')
  }

  return {
    paper_size: parsePaperSize(value.paper_size),
    prices: value.prices.map(parsePriceRow),
  }
}

export async function fetchPrices(
  paperSize: PaperSize,
  signal: AbortSignal,
): Promise<PriceResponse> {
  const response = await fetch(
    `${PRICES_ENDPOINT}?paper_size=${encodeURIComponent(paperSize)}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(`The price request failed with status ${response.status}.`)
  }

  return parsePriceResponse(await response.json())
}
