import { useMemo, useState } from 'react'

import type { PriceRow } from '../../api/prices'
import { formatPrice } from '../../utils/formatPrice'
import styles from './PriceTable.module.css'

interface PriceTableProps {
  paperSize: string
  prices: PriceRow[]
  selectedCell: PriceCellIdentity | null
  onSelect: (cell: PriceCellIdentity) => void
  showAllRows: boolean
  onShowAllRows: () => void
  onShowLessRows: () => void
}

export interface PriceCellIdentity {
  quantity: number
  businessDay: number
}

function getBusinessDays(prices: PriceRow[]): number[] {
  return [
    ...new Set(prices.flatMap((row) => row.map((entry) => entry.business_day))),
  ].sort((first, second) => first - second)
}

export function PriceTable({
  paperSize,
  prices,
  selectedCell,
  onSelect,
  showAllRows,
  onShowAllRows,
  onShowLessRows,
}: PriceTableProps) {
  const [hoveredQuantity, setHoveredQuantity] = useState<number | null>(null)
  const [renderedPaperSize, setRenderedPaperSize] = useState(paperSize)

  if (paperSize !== renderedPaperSize) {
    setRenderedPaperSize(paperSize)
    setHoveredQuantity(null)
  }

  const availableRows = useMemo(
    () => prices.filter((row) => row.length > 0),
    [prices],
  )
  const rows = showAllRows ? availableRows : availableRows.slice(0, 5)
  const hasMoreRows = !showAllRows && availableRows.length > rows.length
  const businessDays = useMemo(() => getBusinessDays(prices), [prices])

  function handleHoverEnd(quantity: number) {
    setHoveredQuantity((currentQuantity) =>
      currentQuantity === quantity ? null : currentQuantity,
    )
  }

  return (
    <>
      <div
        className={styles.scrollRegion}
        role="region"
        aria-label={`Scrollable ${paperSize} price table`}
        tabIndex={0}
      >
        <table className={styles.table} id="price-table">
          <caption>{paperSize} price table</caption>
          <thead>
            <tr>
              <th scope="col">Quantity</th>
              {businessDays.map((businessDay) => (
                <th scope="col" key={businessDay}>
                  {businessDay} business {businessDay === 1 ? 'day' : 'days'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const quantity = row[0].quantity
              const isHoveredRow = hoveredQuantity === quantity
              const entriesByBusinessDay = new Map(
                row.map((entry) => [entry.business_day, entry]),
              )

              return (
                <tr key={quantity}>
                  <th scope="row">{formatPrice(quantity)}</th>
                  {businessDays.map((businessDay) => {
                    const entry = entriesByBusinessDay.get(businessDay)
                    const hoverHighlight = isHoveredRow ? 'weak' : undefined
                    const hoverClass =
                      hoverHighlight === 'weak'
                        ? styles.weakHighlight
                        : undefined

                    return (
                      <td
                        className={[
                          entry ? styles.available : styles.unavailable,
                          hoverClass,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        data-hover-highlight={hoverHighlight}
                        key={businessDay}
                      >
                        {entry ? (
                          <button
                            className={styles.priceButton}
                            data-hover-surface={hoverHighlight}
                            type="button"
                            aria-label={`Select ${formatPrice(entry.price)}, quantity ${formatPrice(quantity)}, ${businessDay} business ${businessDay === 1 ? 'day' : 'days'}`}
                            aria-pressed={
                              selectedCell?.quantity === quantity &&
                              selectedCell.businessDay === businessDay
                            }
                            onClick={() => onSelect({ quantity, businessDay })}
                            onPointerEnter={() => setHoveredQuantity(quantity)}
                            onPointerLeave={() => handleHoverEnd(quantity)}
                          >
                            {formatPrice(entry.price)}
                          </button>
                        ) : (
                          <>
                            <span aria-hidden="true">&mdash;</span>
                            <span className={styles.visuallyHidden}>
                              Unavailable
                            </span>
                          </>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {hasMoreRows && (
        <div className={styles.seeMore}>
          <button
            className={styles.seeMoreButton}
            type="button"
            aria-controls="price-table"
            onClick={onShowAllRows}
          >
            See more
          </button>
        </div>
      )}
      {!hasMoreRows && (
        <div className={styles.seeMore}>
          <button
            className={styles.seeMoreButton}
            type="button"
            aria-controls="price-table"
            onClick={onShowLessRows}
          >
            See less
          </button>
        </div>
      )}
    </>
  )
}
