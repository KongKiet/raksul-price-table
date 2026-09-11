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
}: PriceTableProps) {
  const [hoveredCell, setHoveredCell] = useState<PriceCellIdentity | null>(null)
  const [renderedPaperSize, setRenderedPaperSize] = useState(paperSize)

  if (paperSize !== renderedPaperSize) {
    setRenderedPaperSize(paperSize)
    setHoveredCell(null)
  }

  const availableRows = useMemo(
    () => prices.filter((row) => row.length > 0),
    [prices],
  )
  const rows = showAllRows ? availableRows : availableRows.slice(0, 5)
  const hasMoreRows = !showAllRows && availableRows.length > rows.length
  const businessDays = useMemo(() => getBusinessDays(prices), [prices])

  function handleHoverEnd(cell: PriceCellIdentity) {
    setHoveredCell((currentCell) =>
      currentCell?.quantity === cell.quantity &&
      currentCell.businessDay === cell.businessDay
        ? null
        : currentCell,
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
              const isHoveredRow = hoveredCell?.quantity === quantity
              const entriesByBusinessDay = new Map(
                row.map((entry) => [entry.business_day, entry]),
              )

              return (
                <tr key={quantity}>
                  <th scope="row">{formatPrice(quantity)}</th>
                  {businessDays.map((businessDay) => {
                    const entry = entriesByBusinessDay.get(businessDay)
                    const isHoveredColumn =
                      hoveredCell?.businessDay === businessDay
                    const isHoveredCell =
                      isHoveredRow && isHoveredColumn && entry !== undefined
                    const hoverHighlight = isHoveredCell
                      ? 'strong'
                      : isHoveredRow || isHoveredColumn
                        ? 'weak'
                        : undefined
                    const hoverClass =
                      hoverHighlight === 'strong'
                        ? styles.strongHighlight
                        : hoverHighlight === 'weak'
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
                            onPointerEnter={() =>
                              setHoveredCell({ quantity, businessDay })
                            }
                            onPointerLeave={() =>
                              handleHoverEnd({ quantity, businessDay })
                            }
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
    </>
  )
}
