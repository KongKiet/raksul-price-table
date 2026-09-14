import { type PaperSize, type PriceResponse } from '../../api/prices'
import { AddToCartBar } from '../AddToCartBar/AddToCartBar'
import { PriceStatusMessage } from '../PriceStatusMessage/PriceStatusMessage'
import { PriceTable, type PriceCellIdentity } from '../PriceTable/PriceTable'
import styles from './PricePanel.module.css'

interface PricePanelProps {
  appliedPaperSize: PaperSize
  data: PriceResponse | null
  loading: boolean
  error: string | null
  onRetry: () => void
  retryDisabled: boolean
  selectedCell: PriceCellIdentity | null
  onSelect: (cell: PriceCellIdentity) => void
  showAllRows: boolean
  onShowAllRows: () => void
  onShowLessRows: () => void
  selectedPrice: number | undefined
  onAddToCart: () => void
}

export function PricePanel({
  appliedPaperSize,
  data,
  loading,
  error,
  onRetry,
  retryDisabled,
  selectedCell,
  onSelect,
  showAllRows,
  onShowAllRows,
  onShowLessRows,
  selectedPrice,
  onAddToCart,
}: PricePanelProps) {
  const hasPrices = data?.prices.some((row) => row.length > 0) ?? false

  return (
    <section
      className={styles.panel}
      aria-labelledby="price-table-heading"
      aria-busy={loading}
    >
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle} id="price-table-heading">
            Price table
          </h2>
          <p className={styles.panelDescription}>
            Prices by quantity and delivery business days
          </p>
        </div>
        <span className={styles.paperBadge}>{appliedPaperSize}</span>
      </div>

      {loading && (
        <PriceStatusMessage status="loading" paperSize={appliedPaperSize} />
      )}

      {!loading && error && (
        <PriceStatusMessage
          status="error"
          message={error}
          onRetry={onRetry}
          retryDisabled={retryDisabled}
        />
      )}

      {!loading && !error && data && !hasPrices && (
        <PriceStatusMessage status="empty" paperSize={appliedPaperSize} />
      )}

      {!loading && !error && data && hasPrices && (
        <PriceTable
          paperSize={appliedPaperSize}
          prices={data.prices}
          selectedCell={selectedCell}
          onSelect={onSelect}
          showAllRows={showAllRows}
          onShowAllRows={onShowAllRows}
          onShowLessRows={onShowLessRows}
        />
      )}

      <AddToCartBar
        selectedCell={selectedCell}
        selectedPrice={selectedPrice}
        onAddToCart={onAddToCart}
      />
    </section>
  )
}
