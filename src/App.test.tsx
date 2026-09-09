import { StrictMode } from 'react'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PriceResponse } from './api/prices'
import { fetchPrices } from './api/prices'
import App from './App'

vi.mock('./api/prices', () => ({
  fetchPrices: vi.fn(),
}))

const fetchPricesMock = vi.mocked(fetchPrices)

function createPrices(): PriceResponse {
  return {
    paper_size: 'A4',
    prices: [
      [
        { business_day: 3, price: 800, quantity: 10 },
        { business_day: 1, price: 1_000, quantity: 10 },
        { business_day: 2, price: 900, quantity: 10 },
      ],
      [
        { business_day: 3, price: 1_300, quantity: 20 },
        { business_day: 1, price: 1_500, quantity: 20 },
      ],
      [{ business_day: 2, price: 2_000, quantity: 30 }],
      [{ business_day: 1, price: 2_500, quantity: 40 }],
      [{ business_day: 1, price: 3_000, quantity: 50 }],
      [{ business_day: 1, price: 3_500, quantity: 60 }],
    ],
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

beforeEach(() => {
  fetchPricesMock.mockReset()
})

describe('App', () => {
  it('shows a loading state while the A4 request is pending', () => {
    fetchPricesMock.mockReturnValue(new Promise<PriceResponse>(() => {}))

    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading A4 prices')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenCalledWith('A4', expect.any(AbortSignal))
  })

  it('renders five rows with sorted business days and identity-based cells', async () => {
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const table = await screen.findByRole('table', {
      name: 'A4 price table',
    })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual([
      'Quantity',
      '1 business day',
      '2 business days',
      '3 business days',
    ])
    expect(
      within(table)
        .getAllByRole('rowheader')
        .map((header) => header.textContent),
    ).toEqual(['10', '20', '30', '40', '50'])
    expect(within(table).queryByRole('rowheader', { name: '60' })).toBeNull()

    const firstRow = within(table)
      .getByRole('rowheader', { name: '10' })
      .closest('tr')
    const sparseRow = within(table)
      .getByRole('rowheader', { name: '20' })
      .closest('tr')

    expect(firstRow).not.toBeNull()
    expect(sparseRow).not.toBeNull()
    expect(
      within(firstRow as HTMLTableRowElement)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['1,000', '900', '800'])
    expect(
      within(sparseRow as HTMLTableRowElement)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['1,500', '—Unavailable', '1,300'])
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it('renders all rows when fewer than five are available', async () => {
    const response = createPrices()
    response.prices = response.prices.slice(0, 2)
    fetchPricesMock.mockResolvedValue(response)

    render(<App />)

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('rowheader')).toHaveLength(2)
  })

  it('shows an empty state when the response has no usable rows', async () => {
    fetchPricesMock.mockResolvedValue({
      paper_size: 'A4',
      prices: [[], []],
    })

    render(<App />)

    expect(
      await screen.findByText('No prices are currently available for A4.'),
    ).toHaveAttribute('role', 'status')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('recovers from an error when Retry succeeds', async () => {
    const user = userEvent.setup()
    fetchPricesMock
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(createPrices())

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not load prices. Please try again.',
    )
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('table', { name: 'A4 price table' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenCalledTimes(2)
  })

  it('ignores stale success and completion from an aborted request', async () => {
    const staleRequest = deferred<PriceResponse>()
    const currentRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockReturnValueOnce(staleRequest.promise)
      .mockReturnValueOnce(currentRequest.promise)

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    await waitFor(() => expect(fetchPricesMock).toHaveBeenCalledTimes(2))
    const staleSignal = fetchPricesMock.mock.calls[0][1]
    expect(staleSignal.aborted).toBe(true)

    await act(async () => {
      staleRequest.resolve({
        paper_size: 'A4',
        prices: [[{ business_day: 1, price: 999_999, quantity: 999 }]],
      })
    })

    expect(screen.getByRole('status')).toHaveTextContent('Loading A4 prices')
    expect(screen.queryByText('999,999')).not.toBeInTheDocument()

    await act(async () => {
      currentRequest.resolve(createPrices())
    })

    expect(await screen.findByText('1,000')).toBeInTheDocument()
    expect(screen.queryByText('999,999')).not.toBeInTheDocument()
  })

  it('ignores stale failure and completion from an aborted request', async () => {
    const staleRequest = deferred<PriceResponse>()
    const currentRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockReturnValueOnce(staleRequest.promise)
      .mockReturnValueOnce(currentRequest.promise)

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    await waitFor(() => expect(fetchPricesMock).toHaveBeenCalledTimes(2))

    await act(async () => {
      staleRequest.reject(new Error('late failure'))
    })

    expect(screen.getByRole('status')).toHaveTextContent('Loading A4 prices')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await act(async () => {
      currentRequest.resolve(createPrices())
    })

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
