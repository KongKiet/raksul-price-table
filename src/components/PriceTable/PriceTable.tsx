import type { PriceRow } from '../../api/prices'
import { formatPrice } from '../../utils/formatPrice'
import styles from './PriceTable.module.css'

interface PriceTableProps {
  paperSize: string
  prices: PriceRow[]
  selectedCell: PriceCellIdentity | null
  onSelect: (cell: PriceCellIdentity) => void
  hoveredCell: PriceCellIdentity | null
  onHover: (cell: PriceCellIdentity) => void
  onHoverEnd: (cell: PriceCellIdentity) => void
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
  hoveredCell,
  onHover,
  onHoverEnd,
  showAllRows,
  onShowAllRows,
}: PriceTableProps) {
  const availableRows = prices.filter((row) => row.length > 0)
  const rows = showAllRows ? availableRows : availableRows.slice(0, 5)
  const hasMoreRows = !showAllRows && availableRows.length > rows.length
  const businessDays = getBusinessDays(prices)

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
                <th
                  className={
                    hoveredCell?.businessDay === businessDay
                      ? styles.weakHighlight
                      : undefined
                  }
                  data-hover-highlight={
                    hoveredCell?.businessDay === businessDay
                      ? 'weak'
                      : undefined
                  }
                  scope="col"
                  key={businessDay}
                >
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
                  <th
                    className={isHoveredRow ? styles.weakHighlight : undefined}
                    data-hover-highlight={isHoveredRow ? 'weak' : undefined}
                    scope="row"
                  >
                    {formatPrice(quantity)}
                  </th>
                  {businessDays.map((businessDay) => {
                    const entry = entriesByBusinessDay.get(businessDay)
                    const isHoveredColumn =
                      hoveredCell?.businessDay === businessDay
                    const isHoveredCell =
                      isHoveredRow && isHoveredColumn && entry !== undefined
                    const hoverClass = isHoveredCell
                      ? styles.strongHighlight
                      : isHoveredRow || isHoveredColumn
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
                        data-hover-highlight={
                          isHoveredCell
                            ? 'strong'
                            : isHoveredRow || isHoveredColumn
                              ? 'weak'
                              : undefined
                        }
                        key={businessDay}
                      >
                        {entry ? (
                          <button
                            className={styles.priceButton}
                            type="button"
                            aria-label={`Select ${formatPrice(entry.price)}, quantity ${formatPrice(quantity)}, ${businessDay} business ${businessDay === 1 ? 'day' : 'days'}`}
                            aria-pressed={
                              selectedCell?.quantity === quantity &&
                              selectedCell.businessDay === businessDay
                            }
                            onClick={() => onSelect({ quantity, businessDay })}
                            onPointerEnter={() =>
                              onHover({ quantity, businessDay })
                            }
                            onPointerLeave={() =>
                              onHoverEnd({ quantity, businessDay })
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
