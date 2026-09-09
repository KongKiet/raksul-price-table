import type { PriceRow } from '../../api/prices'
import { formatPrice } from '../../utils/formatPrice'
import styles from './PriceTable.module.css'

interface PriceTableProps {
  paperSize: string
  prices: PriceRow[]
}

function getBusinessDays(prices: PriceRow[]): number[] {
  return [
    ...new Set(prices.flatMap((row) => row.map((entry) => entry.business_day))),
  ].sort((first, second) => first - second)
}

export function PriceTable({ paperSize, prices }: PriceTableProps) {
  const rows = prices.filter((row) => row.length > 0).slice(0, 5)
  const businessDays = getBusinessDays(prices)

  return (
    <div
      className={styles.scrollRegion}
      role="region"
      aria-label={`Scrollable ${paperSize} price table`}
      tabIndex={0}
    >
      <table className={styles.table}>
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
            const entriesByBusinessDay = new Map(
              row.map((entry) => [entry.business_day, entry]),
            )

            return (
              <tr key={quantity}>
                <th scope="row">{formatPrice(quantity)}</th>
                {businessDays.map((businessDay) => {
                  const entry = entriesByBusinessDay.get(businessDay)

                  return (
                    <td
                      className={entry ? undefined : styles.unavailable}
                      key={businessDay}
                    >
                      {entry ? (
                        formatPrice(entry.price)
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
  )
}
