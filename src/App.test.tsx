import { StrictMode } from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PaperSize, PriceResponse } from './api/prices'
import { fetchPrices } from './api/prices'
import App from './App'
import { CART_STORAGE_KEY } from './hooks/useCart'

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
      [{ business_day: 1, price: 4_000, quantity: 70 }],
      [{ business_day: 1, price: 4_500, quantity: 80 }],
      [{ business_day: 1, price: 5_000, quantity: 90 }],
      [{ business_day: 1, price: 5_500, quantity: 100 }],
    ],
  }
}

function createPricesFor(
  paperSize: PaperSize,
  firstPrice = 1_000,
): PriceResponse {
  const response = createPrices()
  response.paper_size = paperSize
  const oneDayEntry = response.prices[0]?.find(
    (entry) => entry.business_day === 1,
  )

  if (oneDayEntry) {
    oneDayEntry.price = firstPrice
  }

  return response
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

async function selectPaperSize(
  user: ReturnType<typeof userEvent.setup>,
  paperSize: PaperSize,
) {
  await user.selectOptions(screen.getByLabelText('Paper size'), paperSize)
}

async function applyPaperSize(
  user: ReturnType<typeof userEvent.setup>,
  paperSize: PaperSize,
) {
  await selectPaperSize(user, paperSize)
  await user.click(screen.getByRole('button', { name: 'Apply' }))
}

function getOrderPrice() {
  const label = screen.getByText('Order price')
  const orderPrice = label.parentElement

  if (!orderPrice) {
    throw new Error('Order price container is missing')
  }

  return orderPrice
}

beforeEach(() => {
  fetchPricesMock.mockReset()
  window.localStorage.clear()
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
    expect(screen.getByRole('button', { name: 'See more' })).toHaveAttribute(
      'aria-controls',
      'price-table',
    )

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

  it('reveals all ten loaded rows without making another request', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const table = await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'See more' }))

    expect(
      within(table)
        .getAllByRole('rowheader')
        .map((header) => header.textContent),
    ).toEqual(['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'])
    expect(
      screen.queryByRole('button', { name: 'See more' }),
    ).not.toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it('highlights the hovered price cell strongly and identity-based row/column price cells weakly, excluding headers', async () => {
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const table = await screen.findByRole('table')
    const hoveredPrice = screen.getByRole('button', {
      name: 'Select 900, quantity 10, 2 business days',
    })
    const hoveredCell = hoveredPrice.closest('td')
    const hoveredRow = screen
      .getByRole('rowheader', { name: '10' })
      .closest('tr')
    const sparseRow = screen
      .getByRole('rowheader', { name: '20' })
      .closest('tr')

    expect(hoveredCell).not.toBeNull()
    expect(hoveredRow).not.toBeNull()
    expect(sparseRow).not.toBeNull()

    fireEvent.pointerEnter(hoveredPrice)

    expect(hoveredCell).toHaveAttribute('data-hover-highlight', 'strong')
    expect(
      within(table).getByRole('rowheader', { name: '10' }),
    ).not.toHaveAttribute('data-hover-highlight')
    expect(
      within(table).getByRole('columnheader', { name: '2 business days' }),
    ).not.toHaveAttribute('data-hover-highlight')

    const hoveredRowCells = within(
      hoveredRow as HTMLTableRowElement,
    ).getAllByRole('cell')
    expect(hoveredRowCells[0]).toHaveAttribute('data-hover-highlight', 'weak')
    expect(hoveredRowCells[1]).toHaveAttribute('data-hover-highlight', 'strong')
    expect(hoveredRowCells[2]).toHaveAttribute('data-hover-highlight', 'weak')

    const sparseUnavailableCell = within(
      sparseRow as HTMLTableRowElement,
    ).getAllByRole('cell')[1]
    expect(sparseUnavailableCell).toHaveAttribute(
      'data-hover-highlight',
      'weak',
    )
    expect(
      within(sparseUnavailableCell).getByText('Unavailable'),
    ).toBeInTheDocument()
    expect(
      screen
        .getByRole('rowheader', { name: '40' })
        .closest('tr')
        ?.querySelector('td'),
    ).not.toHaveAttribute('data-hover-highlight')
  })

  it('transfers hover without stale leave clearing and removes it on final exit', async () => {
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const firstPrice = await screen.findByRole('button', {
      name: 'Select 900, quantity 10, 2 business days',
    })
    const nextPrice = screen.getByRole('button', {
      name: 'Select 1,300, quantity 20, 3 business days',
    })

    fireEvent.pointerEnter(firstPrice)
    fireEvent.pointerEnter(nextPrice)
    fireEvent.pointerLeave(firstPrice)

    expect(nextPrice.closest('td')).toHaveAttribute(
      'data-hover-highlight',
      'strong',
    )
    expect(
      screen.getByRole('columnheader', { name: '3 business days' }),
    ).not.toHaveAttribute('data-hover-highlight')
    expect(
      screen.getByRole('columnheader', { name: '2 business days' }),
    ).not.toHaveAttribute('data-hover-highlight')

    fireEvent.pointerLeave(nextPrice)

    expect(document.querySelector('[data-hover-highlight]')).toBeNull()
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it('keeps selection and Order price independent from hover', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const selectedPrice = await screen.findByRole('button', {
      name: 'Select 1,000, quantity 10, 1 business day',
    })
    const hoveredPrice = screen.getByRole('button', {
      name: 'Select 2,000, quantity 30, 2 business days',
    })

    await user.click(selectedPrice)
    fireEvent.pointerEnter(hoveredPrice)

    expect(selectedPrice).toHaveAttribute('aria-pressed', 'true')
    expect(hoveredPrice).toHaveAttribute('aria-pressed', 'false')
    expect(hoveredPrice.closest('td')).toHaveAttribute(
      'data-hover-highlight',
      'strong',
    )
    expect(getOrderPrice()).toHaveTextContent('1,000')

    fireEvent.pointerLeave(hoveredPrice)
    fireEvent.pointerEnter(selectedPrice)

    expect(selectedPrice).toHaveAttribute('aria-pressed', 'true')
    expect(selectedPrice.closest('td')).toHaveAttribute(
      'data-hover-highlight',
      'strong',
    )

    fireEvent.pointerLeave(selectedPrice)

    expect(selectedPrice).toHaveAttribute('aria-pressed', 'true')
    expect(getOrderPrice()).toHaveTextContent('1,000')
    expect(document.querySelector('[data-hover-highlight]')).toBeNull()
  })

  it('highlights expanded rows without fetching and resets hover for a different applied size', async () => {
    const user = userEvent.setup()
    const nextRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockReturnValueOnce(nextRequest.promise)

    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'See more' }))
    const expandedPrice = screen.getByRole('button', {
      name: 'Select 5,500, quantity 100, 1 business day',
    })
    fireEvent.pointerEnter(expandedPrice)

    expect(expandedPrice.closest('td')).toHaveAttribute(
      'data-hover-highlight',
      'strong',
    )
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)

    await selectPaperSize(user, 'A5')
    expect(expandedPrice.closest('td')).toHaveAttribute(
      'data-hover-highlight',
      'strong',
    )

    await selectPaperSize(user, 'A4')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(expandedPrice.closest('td')).toHaveAttribute(
      'data-hover-highlight',
      'strong',
    )
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)

    await applyPaperSize(user, 'A5')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await act(async () => {
      nextRequest.resolve(createPricesFor('A5'))
    })

    await screen.findByRole('table', { name: 'A5 price table' })
    expect(document.querySelector('[data-hover-highlight]')).toBeNull()
    expect(fetchPricesMock).toHaveBeenCalledTimes(2)
  })

  it('paints the expanded last-row surface with the same weak column state', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'See more' }))
    const lastRowPrice = screen.getByRole('button', {
      name: 'Select 5,500, quantity 100, 1 business day',
    })
    await user.click(lastRowPrice)

    const hoveredPrice = screen.getByRole('button', {
      name: 'Select 3,000, quantity 50, 1 business day',
    })
    fireEvent.pointerEnter(hoveredPrice)

    expect(hoveredPrice).toHaveAttribute('data-hover-surface', 'strong')
    expect(lastRowPrice).toHaveAttribute('data-hover-surface', 'weak')
    expect(lastRowPrice.closest('td')).toHaveAttribute(
      'data-hover-highlight',
      'weak',
    )
    expect(lastRowPrice).toHaveAttribute('aria-pressed', 'true')
    expect(getOrderPrice()).toHaveTextContent('5,500')

    const weakSurfaces = document.querySelectorAll(
      '[data-hover-surface="weak"]',
    )
    expect(weakSurfaces.length).toBeGreaterThan(0)
    expect(
      [...weakSurfaces].every(
        (surface) => surface.getAttribute('data-hover-surface') === 'weak',
      ),
    ).toBe(true)
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('supports %s keyboard activation for See more', async (_name, key) => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const seeMore = await screen.findByRole('button', { name: 'See more' })
    seeMore.focus()
    await user.keyboard(key)

    expect(screen.getByRole('rowheader', { name: '100' })).toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it('counts only usable rows when deciding what to reveal', async () => {
    const user = userEvent.setup()
    const response = createPrices()
    response.prices.splice(2, 0, [])
    fetchPricesMock.mockResolvedValue(response)

    render(<App />)

    const table = await screen.findByRole('table')
    expect(
      within(table)
        .getAllByRole('rowheader')
        .map((header) => header.textContent),
    ).toEqual(['10', '20', '30', '40', '50'])

    await user.click(screen.getByRole('button', { name: 'See more' }))

    expect(within(table).getAllByRole('rowheader')).toHaveLength(10)
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it('starts without a selection and derives Order price from the selected cell', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    expect(screen.queryByText('Order price')).not.toBeInTheDocument()

    const firstPrice = await screen.findByRole('button', {
      name: 'Select 1,000, quantity 10, 1 business day',
    })
    await user.click(firstPrice)

    expect(firstPrice).toHaveAttribute('aria-pressed', 'true')
    const orderPrice = getOrderPrice()
    expect(orderPrice).toHaveTextContent('¥1,000')
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)

    const replacement = screen.getByRole('button', {
      name: 'Select 2,000, quantity 30, 2 business days',
    })
    await user.click(replacement)
    await user.click(replacement)

    expect(firstPrice).toHaveAttribute('aria-pressed', 'false')
    expect(replacement).toHaveAttribute('aria-pressed', 'true')
    expect(orderPrice).toHaveTextContent('2,000')
  })

  it('enables Add to Cart only while a cell is selected', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const addToCartButton = await screen.findByRole('button', {
      name: 'Add to Cart',
    })
    expect(addToCartButton).toBeDisabled()

    await user.click(
      screen.getByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )

    expect(addToCartButton).toBeEnabled()
  })

  it('disables Add to Cart again once a different size is applied', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    const addToCartButton = screen.getByRole('button', { name: 'Add to Cart' })
    expect(addToCartButton).toBeEnabled()

    await applyPaperSize(user, 'A5')

    expect(addToCartButton).toBeDisabled()
  })

  it('opens the cart modal from the cart icon without affecting the table', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const cartButton = screen.getByRole('button', { name: 'View cart' })
    await screen.findByRole('table')
    await user.click(cartButton)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Your cart' }),
    ).toBeInTheDocument()
  })

  it('adds the selected cell to the cart, shows a notification, and lists it in the cart modal', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    const notification = screen.getByRole('status')
    expect(notification).toHaveTextContent('Added to cart')
    expect(notification).toHaveTextContent('A4, quantity 10, 1 business day')

    await user.click(screen.getByRole('button', { name: 'View cart' }))
    const dialog = screen.getByRole('dialog', { name: 'Your cart' })

    expect(dialog).toHaveTextContent('A4')
    expect(dialog).toHaveTextContent('Quantity 10')
    expect(dialog).toHaveTextContent('1 business day')
    expect(dialog).toHaveTextContent('1,000')
  })

  it('supports keyboard activation of Add to Cart', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )

    const addToCartButton = screen.getByRole('button', { name: 'Add to Cart' })
    addToCartButton.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('status')).toHaveTextContent('Added to cart')
  })

  it('auto-dismisses the Added to cart notification after a short duration', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )

    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    const notification = screen.getByRole('status')
    expect(notification).toHaveTextContent('Added to cart')

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(notification.className).toMatch(/closing/)
    expect(notification).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('dismisses the Added to cart notification via its close button', async () => {
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const price = await screen.findByRole('button', {
      name: 'Select 1,000, quantity 10, 1 business day',
    })
    fireEvent.click(price)
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    const notification = screen.getByRole('status')
    expect(notification).toBeInTheDocument()

    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }))

    expect(notification.className).toMatch(/closing/)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('increments the same line instead of duplicating it when added to cart twice', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    const addToCartButton = screen.getByRole('button', { name: 'Add to Cart' })
    await user.click(addToCartButton)
    await user.click(addToCartButton)

    await user.click(screen.getByRole('button', { name: 'View cart' }))
    const dialog = screen.getByRole('dialog', { name: 'Your cart' })

    expect(within(dialog).getAllByText('A4')).toHaveLength(1)
    expect(dialog).toHaveTextContent('2,000')
  })

  it('closes the cart modal via the close button and via Escape', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'View cart' }))
    expect(
      screen.getByRole('dialog', { name: 'Your cart' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close cart' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View cart' }))
    expect(
      screen.getByRole('dialog', { name: 'Your cart' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('disables Checkout for an empty cart and enables it once an item is added', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'View cart' }))

    const dialog = screen.getByRole('dialog', { name: 'Your cart' })
    expect(within(dialog).getByText('Your cart is empty.')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Checkout' }),
    ).toBeDisabled()

    await user.click(within(dialog).getByRole('button', { name: 'Close cart' }))
    await user.click(
      screen.getByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))
    await user.click(screen.getByRole('button', { name: 'View cart' }))

    const reopenedDialog = screen.getByRole('dialog', { name: 'Your cart' })
    expect(
      within(reopenedDialog).getByRole('button', { name: 'Checkout' }),
    ).toBeEnabled()
  })

  it('increases and decreases cart quantity, removing the line when decreased to zero', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))
    await user.click(screen.getByRole('button', { name: 'View cart' }))

    const dialog = screen.getByRole('dialog', { name: 'Your cart' })
    const increaseButton = within(dialog).getByRole('button', {
      name: 'Increase quantity in cart for A4, quantity 10, 1 business day',
    })
    const decreaseButton = within(dialog).getByRole('button', {
      name: 'Decrease quantity in cart for A4, quantity 10, 1 business day',
    })

    await user.click(increaseButton)
    expect(dialog).toHaveTextContent('2,000')
    expect(
      within(dialog).getByLabelText('Quantity in cart: 2'),
    ).toHaveAttribute('aria-live', 'polite')

    await user.click(decreaseButton)
    await user.click(decreaseButton)

    expect(within(dialog).queryByText('A4')).not.toBeInTheDocument()
    expect(within(dialog).getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('removes a line via its remove control regardless of quantity', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))
    await user.click(screen.getByRole('button', { name: 'View cart' }))

    const dialog = screen.getByRole('dialog', { name: 'Your cart' })
    await user.click(
      within(dialog).getByRole('button', {
        name: 'Increase quantity in cart for A4, quantity 10, 1 business day',
      }),
    )
    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remove A4, quantity 10, 1 business day from cart',
      }),
    )

    expect(within(dialog).getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('computes the total across multiple distinct cart lines', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await user.click(
      screen.getByRole('button', {
        name: 'Select 1,500, quantity 20, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await user.click(screen.getByRole('button', { name: 'View cart' }))
    const dialog = screen.getByRole('dialog', { name: 'Your cart' })

    expect(dialog).toHaveTextContent('¥2,500')
    expect(within(dialog).getByLabelText('Total')).toHaveAttribute(
      'aria-live',
      'polite',
    )
  })

  it('lists cart lines newest first', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await user.click(
      screen.getByRole('button', {
        name: 'Select 1,500, quantity 20, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await user.click(screen.getByRole('button', { name: 'View cart' }))
    const dialog = screen.getByRole('dialog', { name: 'Your cart' })

    const removeButtons = within(dialog).getAllByRole('button', {
      name: /Remove/,
    })
    expect(removeButtons).toHaveLength(2)
    expect(removeButtons[0]).toHaveAccessibleName(
      'Remove A4, quantity 20, 1 business day from cart',
    )
    expect(removeButtons[1]).toHaveAccessibleName(
      'Remove A4, quantity 10, 1 business day from cart',
    )
  })

  it('lights up the cart icon after adding an item', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    expect(screen.queryByTestId('cart-glow')).not.toBeInTheDocument()

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    expect(screen.getByTestId('cart-glow')).toBeInTheDocument()
  })

  it('shows a cart badge with the total item count and hides it when the cart is emptied', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument()

    const firstPrice = await screen.findByRole('button', {
      name: 'Select 1,000, quantity 10, 1 business day',
    })
    await user.click(firstPrice)
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    expect(screen.getByTestId('cart-badge')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    expect(screen.getByTestId('cart-badge')).toHaveTextContent('2')

    await user.click(
      screen.getByRole('button', {
        name: 'Select 1,500, quantity 20, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    expect(screen.getByTestId('cart-badge')).toHaveTextContent('3')

    await user.click(screen.getByRole('button', { name: 'View cart' }))
    const dialog = screen.getByRole('dialog', { name: 'Your cart' })

    for (const removeButton of within(dialog).getAllByRole('button', {
      name: /Remove/,
    })) {
      await user.click(removeButton)
    }

    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument()
  })

  it('persists the cart across a page reload', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    const { unmount } = render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))

    unmount()
    render(<App />)

    await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'View cart' }))
    const dialog = screen.getByRole('dialog', { name: 'Your cart' })

    expect(dialog).toHaveTextContent('A4')
    expect(dialog).toHaveTextContent('Quantity 10')
  })

  it('restores a valid cart already stored in localStorage on load', async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        {
          paperSize: 'A4',
          quantity: 10,
          businessDay: 1,
          price: 1000,
          cartQuantity: 3,
        },
      ]),
    )

    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'View cart' }))
    const dialog = screen.getByRole('dialog', { name: 'Your cart' })

    expect(dialog).toHaveTextContent('A4')
    expect(dialog).toHaveTextContent('3,000')
  })

  it('starts with an empty cart when stored data is missing or invalid', async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, '{not-json')

    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'View cart' }))

    expect(screen.getByRole('dialog', { name: 'Your cart' })).toHaveTextContent(
      'Your cart is empty.',
    )
  })

  it('ignores stored cart entries with an invalid shape', async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ paperSize: 'A4' }, 'not-an-object', 42]),
    )

    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'View cart' }))

    expect(screen.getByRole('dialog', { name: 'Your cart' })).toHaveTextContent(
      'Your cart is empty.',
    )
  })

  it('supports native keyboard selection with Enter and Space', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const firstPrice = await screen.findByRole('button', {
      name: 'Select 900, quantity 10, 2 business days',
    })
    firstPrice.focus()
    await user.keyboard('{Enter}')
    expect(firstPrice).toHaveAttribute('aria-pressed', 'true')

    const secondPrice = screen.getByRole('button', {
      name: 'Select 1,300, quantity 20, 3 business days',
    })
    secondPrice.focus()
    await user.keyboard(' ')

    expect(firstPrice).toHaveAttribute('aria-pressed', 'false')
    expect(secondPrice).toHaveAttribute('aria-pressed', 'true')
    expect(getOrderPrice()).toHaveTextContent('1,300')
  })

  it('keeps equal prices distinct by quantity and business day', async () => {
    const user = userEvent.setup()
    const response = createPrices()
    response.prices[1][0].price = 1_000
    fetchPricesMock.mockResolvedValue(response)

    render(<App />)

    const duplicatePrices = await screen.findAllByRole('button', {
      name: /Select 1,000/,
    })
    expect(duplicatePrices).toHaveLength(2)

    await user.click(duplicatePrices[1])

    expect(duplicatePrices[0]).toHaveAttribute('aria-pressed', 'false')
    expect(duplicatePrices[1]).toHaveAttribute('aria-pressed', 'true')
  })

  it('leaves missing combinations unavailable and noninteractive', async () => {
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const table = await screen.findByRole('table')
    const sparseRow = within(table)
      .getByRole('rowheader', { name: '20' })
      .closest('tr')

    expect(sparseRow).not.toBeNull()
    expect(
      within(sparseRow as HTMLTableRowElement).getByText('Unavailable'),
    ).toBeInTheDocument()
    expect(
      within(sparseRow as HTMLTableRowElement).getAllByRole('button'),
    ).toHaveLength(2)
    expect(screen.queryByText('Order price')).not.toBeInTheDocument()
  })

  it('preserves selection for draft and same-size Apply changes', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    const price = await screen.findByRole('button', {
      name: 'Select 1,000, quantity 10, 1 business day',
    })
    await user.click(price)
    await selectPaperSize(user, 'A5')

    expect(price).toHaveAttribute('aria-pressed', 'true')
    expect(getOrderPrice()).toHaveTextContent('1,000')

    await selectPaperSize(user, 'A4')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(price).toHaveAttribute('aria-pressed', 'true')
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it('clears selection immediately when a different size is applied', async () => {
    const user = userEvent.setup()
    const nextRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockReturnValueOnce(nextRequest.promise)

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select 1,000, quantity 10, 1 business day',
      }),
    )
    await applyPaperSize(user, 'A5')

    expect(screen.queryByText('Order price')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { pressed: true })).toBeNull()

    await act(async () => {
      nextRequest.resolve(createPricesFor('A5', 11_000))
    })

    const nextTable = await screen.findByRole('table', {
      name: 'A5 price table',
    })
    expect(
      within(nextTable).queryByRole('button', { pressed: true }),
    ).toBeNull()
    expect(screen.queryByText('Order price')).not.toBeInTheDocument()
  })

  it('selects an expanded-row price and clears it with a size change', async () => {
    const user = userEvent.setup()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockResolvedValueOnce(createPricesFor('A5'))

    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'See more' }))
    const expandedPrice = screen.getByRole('button', {
      name: 'Select 5,500, quantity 100, 1 business day',
    })
    await user.click(expandedPrice)

    expect(expandedPrice).toHaveAttribute('aria-pressed', 'true')
    expect(getOrderPrice()).toHaveTextContent('5,500')

    await applyPaperSize(user, 'A5')

    const nextTable = await screen.findByRole('table', {
      name: 'A5 price table',
    })
    expect(within(nextTable).getAllByRole('rowheader')).toHaveLength(5)
    expect(screen.queryByText('Order price')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See more' })).toBeInTheDocument()
  })

  it('renders all rows when fewer than five are available', async () => {
    const response = createPrices()
    response.prices = response.prices.slice(0, 2)
    fetchPricesMock.mockResolvedValue(response)

    render(<App />)

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('rowheader')).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: 'See more' }),
    ).not.toBeInTheDocument()
  })

  it('preserves expansion for draft and same-size Apply, then resets it for a different size', async () => {
    const user = userEvent.setup()
    const nextRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockReturnValueOnce(nextRequest.promise)

    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'See more' }))
    await selectPaperSize(user, 'A5')

    expect(screen.getByRole('rowheader', { name: '100' })).toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)

    await selectPaperSize(user, 'A4')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('rowheader', { name: '100' })).toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)

    await applyPaperSize(user, 'A5')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await act(async () => {
      nextRequest.resolve(createPricesFor('A5'))
    })

    const nextTable = await screen.findByRole('table', {
      name: 'A5 price table',
    })
    expect(within(nextTable).getAllByRole('rowheader')).toHaveLength(5)
    expect(
      within(nextTable).queryByRole('rowheader', { name: '100' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See more' })).toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenCalledTimes(2)
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

  it('offers exactly the four supported paper sizes', () => {
    fetchPricesMock.mockReturnValue(new Promise<PriceResponse>(() => {}))

    render(<App />)

    const selector = screen.getByRole('combobox', { name: 'Paper size' })
    expect(selector).toHaveValue('A4')
    expect(
      within(selector)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['A4', 'A5', 'B4', 'B5'])
  })

  it('keeps a draft selection separate from the applied table', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await screen.findByRole('table', { name: 'A4 price table' })
    await selectPaperSize(user, 'A5')

    expect(screen.getByLabelText('Paper size')).toHaveValue('A5')
    expect(
      screen.getByRole('heading', { name: 'Price table' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('table', { name: 'A4 price table' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table', { name: 'A5 price table' })).toBeNull()
    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
  })

  it.each<PaperSize>(['A5', 'B4', 'B5'])(
    'applies %s with immediate clean loading and dynamic labels',
    async (paperSize) => {
      const user = userEvent.setup()
      const nextRequest = deferred<PriceResponse>()
      fetchPricesMock
        .mockResolvedValueOnce(createPrices())
        .mockReturnValueOnce(nextRequest.promise)

      render(<App />)

      await screen.findByRole('table', { name: 'A4 price table' })
      await applyPaperSize(user, paperSize)

      expect(screen.getByRole('status')).toHaveTextContent(
        `Loading ${paperSize} prices`,
      )
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Price table' }),
      ).toBeInTheDocument()
      expect(fetchPricesMock).toHaveBeenLastCalledWith(
        paperSize,
        expect.any(AbortSignal),
      )

      await act(async () => {
        nextRequest.resolve(createPricesFor(paperSize, 11_000))
      })

      const table = await screen.findByRole('table', {
        name: `${paperSize} price table`,
      })
      expect(within(table).getAllByRole('rowheader')).toHaveLength(5)
      expect(fetchPricesMock).toHaveBeenCalledTimes(2)
    },
  )

  it('does not request again when Apply keeps the current size', async () => {
    const user = userEvent.setup()
    fetchPricesMock.mockResolvedValue(createPrices())

    render(<App />)

    await screen.findByRole('table')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(fetchPricesMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('table', { name: 'A4 price table' })).toBeVisible()
  })

  it('submits the selected size with the keyboard', async () => {
    const user = userEvent.setup()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockResolvedValueOnce(createPricesFor('A5'))

    render(<App />)

    await screen.findByRole('table')
    await selectPaperSize(user, 'A5')
    screen.getByRole('button', { name: 'Apply' }).focus()
    await user.keyboard('{Enter}')

    expect(
      await screen.findByRole('table', { name: 'A5 price table' }),
    ).toBeInTheDocument()
    expect(fetchPricesMock).toHaveBeenLastCalledWith(
      'A5',
      expect.any(AbortSignal),
    )
  })

  it('retries the applied size rather than an unapplied draft', async () => {
    const user = userEvent.setup()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockRejectedValueOnce(new Error('A5 unavailable'))
      .mockResolvedValueOnce(createPricesFor('A5'))

    render(<App />)

    await screen.findByRole('table')
    await applyPaperSize(user, 'A5')
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await selectPaperSize(user, 'B4')
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('table', { name: 'A5 price table' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Paper size')).toHaveValue('B4')
    expect(fetchPricesMock).toHaveBeenLastCalledWith(
      'A5',
      expect.any(AbortSignal),
    )
  })

  it('ignores stale success and completion from an older applied size', async () => {
    const user = userEvent.setup()
    const staleRequest = deferred<PriceResponse>()
    const currentRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockReturnValueOnce(staleRequest.promise)
      .mockReturnValueOnce(currentRequest.promise)

    render(<App />)

    await screen.findByRole('table')
    await applyPaperSize(user, 'A5')
    await waitFor(() => expect(fetchPricesMock).toHaveBeenCalledTimes(2))
    await applyPaperSize(user, 'B4')
    await waitFor(() => expect(fetchPricesMock).toHaveBeenCalledTimes(3))

    expect(fetchPricesMock.mock.calls[1][1].aborted).toBe(true)

    await act(async () => {
      staleRequest.resolve(createPricesFor('A5', 901_000))
    })

    expect(screen.getByRole('status')).toHaveTextContent('Loading B4 prices')
    expect(screen.queryByText('901,000')).not.toBeInTheDocument()

    await act(async () => {
      currentRequest.resolve(createPricesFor('B4', 21_000))
    })

    expect(
      await screen.findByRole('table', { name: 'B4 price table' }),
    ).toBeInTheDocument()
    expect(screen.getByText('21,000')).toBeInTheDocument()
    expect(screen.queryByText('901,000')).not.toBeInTheDocument()
  })

  it('ignores stale failure and completion from an older applied size', async () => {
    const user = userEvent.setup()
    const staleRequest = deferred<PriceResponse>()
    const currentRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockReturnValueOnce(staleRequest.promise)
      .mockReturnValueOnce(currentRequest.promise)

    render(<App />)

    await screen.findByRole('table')
    await applyPaperSize(user, 'A5')
    await applyPaperSize(user, 'B5')
    await waitFor(() => expect(fetchPricesMock).toHaveBeenCalledTimes(3))

    await act(async () => {
      staleRequest.reject(new Error('late A5 failure'))
    })

    expect(screen.getByRole('status')).toHaveTextContent('Loading B5 prices')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await act(async () => {
      currentRequest.resolve(createPricesFor('B5', 31_000))
    })

    expect(
      await screen.findByRole('table', { name: 'B5 price table' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('clears an old error immediately when another size is applied', async () => {
    const user = userEvent.setup()
    const nextRequest = deferred<PriceResponse>()
    fetchPricesMock
      .mockRejectedValueOnce(new Error('A4 unavailable'))
      .mockReturnValueOnce(nextRequest.promise)

    render(<App />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    await applyPaperSize(user, 'A5')

    expect(screen.getByRole('status')).toHaveTextContent('Loading A5 prices')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await act(async () => {
      nextRequest.resolve(createPricesFor('A5'))
    })
  })

  it('uses the applied size in an empty-state message', async () => {
    const user = userEvent.setup()
    fetchPricesMock
      .mockResolvedValueOnce(createPrices())
      .mockResolvedValueOnce({ paper_size: 'B4', prices: [] })

    render(<App />)

    await screen.findByRole('table')
    await applyPaperSize(user, 'B4')

    expect(
      await screen.findByText('No prices are currently available for B4.'),
    ).toHaveAttribute('role', 'status')
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
