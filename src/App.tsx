import { useState, type FormEvent } from 'react'

import { type PaperSize } from './api/prices'
import {
  PriceTable,
  type PriceCellIdentity,
} from './components/PriceTable/PriceTable'
import { usePrices } from './hooks/usePrices'
import { formatPrice } from './utils/formatPrice'
import styles from './App.module.css'

const PAPER_SIZES: readonly PaperSize[] = ['A4', 'A5', 'B4', 'B5']

function isPaperSize(value: string): value is PaperSize {
  return PAPER_SIZES.some((paperSize) => paperSize === value)
}

function App() {
  const [draftPaperSize, setDraftPaperSize] = useState<PaperSize>('A4')
  const [appliedPaperSize, setAppliedPaperSize] = useState<PaperSize>('A4')
  const [selectedCell, setSelectedCell] = useState<PriceCellIdentity | null>(
    null,
  )
  const [hoveredCell, setHoveredCell] = useState<PriceCellIdentity | null>(null)
  const [showAllRows, setShowAllRows] = useState(false)
  const { data, error, loading, retry } = usePrices(appliedPaperSize)
  const hasPrices = data?.prices.some((row) => row.length > 0) ?? false
  const selectedPrice = data?.prices
    .flatMap((row) => row)
    .find(
      (entry) =>
        entry.quantity === selectedCell?.quantity &&
        entry.business_day === selectedCell.businessDay,
    )?.price

  function applyPaperSize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (draftPaperSize !== appliedPaperSize) {
      setSelectedCell(null)
      setHoveredCell(null)
      setShowAllRows(false)
      setAppliedPaperSize(draftPaperSize)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Paper printing</p>
          <h1 className={styles.title}>Clear prices, ready when you are.</h1>
          <p className={styles.lede}>
            Compare printing prices by quantity and delivery time.
          </p>
        </header>

        <form className={styles.controls} onSubmit={applyPaperSize}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="paper-size">
              Paper size
            </label>
            <select
              className={styles.select}
              id="paper-size"
              value={draftPaperSize}
              onChange={(event) => {
                if (isPaperSize(event.target.value)) {
                  setDraftPaperSize(event.target.value)
                }
              }}
            >
              {PAPER_SIZES.map((paperSize) => (
                <option key={paperSize} value={paperSize}>
                  {paperSize}
                </option>
              ))}
            </select>
          </div>
          <button className={styles.applyButton} type="submit">
            Apply
          </button>
        </form>

        <section
          className={styles.panel}
          aria-labelledby="price-table-heading"
          aria-busy={loading}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle} id="price-table-heading">
                {appliedPaperSize} price table
              </h2>
              <p className={styles.panelDescription}>
                Prices by quantity and delivery business days
              </p>
            </div>
            <div className={styles.panelSummary}>
              <div className={styles.orderPrice}>
                <span className={styles.orderPriceLabel} id="order-price-label">
                  Order price
                </span>
                <span
                  className={styles.orderPriceValue}
                  aria-labelledby="order-price-label"
                  aria-live="polite"
                >
                  {selectedPrice === undefined
                    ? '\u2014'
                    : formatPrice(selectedPrice)}
                </span>
              </div>
              <span className={styles.paperBadge}>{appliedPaperSize}</span>
            </div>
          </div>

          {loading && (
            <div className={styles.state} role="status" aria-live="polite">
              <div className={styles.stateContent}>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Loading {appliedPaperSize} prices...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className={styles.state} role="alert">
              <div className={styles.stateContent}>
                <span>{error}</span>
                <button
                  className={styles.retryButton}
                  type="button"
                  onClick={retry}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && data && !hasPrices && (
            <p className={styles.state} role="status">
              No prices are currently available for {appliedPaperSize}.
            </p>
          )}

          {!loading && !error && data && hasPrices && (
            <PriceTable
              paperSize={appliedPaperSize}
              prices={data.prices}
              selectedCell={selectedCell}
              onSelect={setSelectedCell}
              hoveredCell={hoveredCell}
              onHover={setHoveredCell}
              onHoverEnd={(cell) => {
                setHoveredCell((currentCell) =>
                  currentCell?.quantity === cell.quantity &&
                  currentCell.businessDay === cell.businessDay
                    ? null
                    : currentCell,
                )
              }}
              showAllRows={showAllRows}
              onShowAllRows={() => setShowAllRows(true)}
            />
          )}
        </section>
      </div>
    </main>
  )
}

export default App
