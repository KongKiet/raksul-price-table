import { useState, type FormEvent } from 'react'

import { type PaperSize } from './api/prices'
import { type PriceCellIdentity } from './components/PriceTable/PriceTable'
import { PaperSizeForm } from './components/PaperSizeForm/PaperSizeForm'
import { PricePanel } from './components/PricePanel/PricePanel'
import { usePrices } from './hooks/usePrices'
import styles from './App.module.css'

const PAPER_SIZES: readonly PaperSize[] = ['A4', 'A5', 'B4', 'B5']

function App() {
  const [draftPaperSize, setDraftPaperSize] = useState<PaperSize>('A4')
  const [appliedPaperSize, setAppliedPaperSize] = useState<PaperSize>('A4')
  const [selectedCell, setSelectedCell] = useState<PriceCellIdentity | null>(
    null,
  )
  const [hoveredCell, setHoveredCell] = useState<PriceCellIdentity | null>(null)
  const [showAllRows, setShowAllRows] = useState(false)
  const { data, error, loading, retry } = usePrices(appliedPaperSize)
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

        <PaperSizeForm
          paperSizes={PAPER_SIZES}
          draftPaperSize={draftPaperSize}
          onDraftPaperSizeChange={setDraftPaperSize}
          onSubmit={applyPaperSize}
        />

        <PricePanel
          appliedPaperSize={appliedPaperSize}
          data={data}
          loading={loading}
          error={error}
          onRetry={retry}
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
          selectedPrice={selectedPrice}
        />
      </div>
    </main>
  )
}

export default App
