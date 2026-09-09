import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchPrices } from './prices'

function responseWith(
  body: unknown,
  options?: { ok?: boolean; status?: number },
) {
  return {
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchPrices', () => {
  it('requests the documented paper size and forwards the abort signal', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      responseWith({
        paper_size: 'a4',
        prices: [
          [
            {
              business_day: 1,
              price: 1_000,
              quantity: 10,
            },
          ],
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    await expect(fetchPrices('A4', controller.signal)).resolves.toEqual({
      paper_size: 'A4',
      prices: [
        [
          {
            business_day: 1,
            price: 1_000,
            quantity: 10,
          },
        ],
      ],
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://us-central1-fe-ws-test.cloudfunctions.net/prices?paper_size=A4',
      { signal: controller.signal },
    )
  })

  it('rejects a non-successful HTTP response', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(responseWith(null, { ok: false, status: 503 })),
    )

    await expect(
      fetchPrices('A4', new AbortController().signal),
    ).rejects.toThrow('status 503')
  })

  it.each([
    { paper_size: 'a4', prices: 'not-an-array' },
    {
      paper_size: 'a4',
      prices: [[{ business_day: 1, price: -1, quantity: 10 }]],
    },
    {
      paper_size: 'letter',
      prices: [],
    },
  ])('rejects malformed response data', async (body) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(responseWith(body)),
    )

    await expect(
      fetchPrices('A4', new AbortController().signal),
    ).rejects.toThrow()
  })
})
