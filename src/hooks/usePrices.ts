import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchPrices, type PaperSize, type PriceResponse } from '../api/prices'

export const PRICE_LOAD_ERROR = 'We could not load prices. Please try again.'

interface PriceRequestState {
  data: PriceResponse | null
  error: string | null
  loading: boolean
}

export function usePrices(paperSize: PaperSize) {
  const [state, setState] = useState<PriceRequestState>({
    data: null,
    error: null,
    loading: true,
  })
  const latestRequestRef = useRef(0)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const requestId = latestRequestRef.current + 1

    latestRequestRef.current = requestId

    void fetchPrices(paperSize, controller.signal)
      .then((data) => {
        if (
          latestRequestRef.current === requestId &&
          !controller.signal.aborted
        ) {
          setState((current) => ({ ...current, data }))
        }
      })
      .catch(() => {
        if (
          latestRequestRef.current === requestId &&
          !controller.signal.aborted
        ) {
          setState((current) => ({ ...current, error: PRICE_LOAD_ERROR }))
        }
      })
      .finally(() => {
        if (
          latestRequestRef.current === requestId &&
          !controller.signal.aborted
        ) {
          setState((current) => ({ ...current, loading: false }))
        }
      })
    return () => {
      latestRequestRef.current += 1
      controller.abort()
    }
  }, [paperSize, requestVersion])

  const retry = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: true,
    })
    setRequestVersion((version) => version + 1)
  }, [])

  return {
    ...state,
    retry,
  }
}
