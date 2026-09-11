import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { type PaperSize } from './api/prices'
import { type PriceCellIdentity } from './components/PriceTable/PriceTable'
import { CartButton } from './components/CartButton/CartButton'
import { CartModal } from './components/CartModal/CartModal'
import { CartNotification } from './components/CartNotification/CartNotification'
import { PaperSizeForm } from './components/PaperSizeForm/PaperSizeForm'
import { PricePanel } from './components/PricePanel/PricePanel'
import { useCart } from './hooks/useCart'
import { usePrices } from './hooks/usePrices'
import styles from './App.module.css'

const PAPER_SIZES: readonly PaperSize[] = ['A4', 'A5', 'B4', 'B5']
const NOTIFICATION_DURATION_MS = 3000
const NOTIFICATION_CLOSE_ANIMATION_MS = 200

interface CartNotificationContent {
  title: string
  description: string
}

function App() {
  const [draftPaperSize, setDraftPaperSize] = useState<PaperSize>('A4')
  const [appliedPaperSize, setAppliedPaperSize] = useState<PaperSize>('A4')
  const [selectedCell, setSelectedCell] = useState<PriceCellIdentity | null>(
    null,
  )
  const [showAllRows, setShowAllRows] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] =
    useState<CartNotificationContent | null>(null)
  const [isNotificationClosing, setIsNotificationClosing] = useState(false)
  const [cartGlowTrigger, setCartGlowTrigger] = useState(0)
  const { data, error, loading, retry } = usePrices(appliedPaperSize)
  const cart = useCart()
  const selectedPrice = useMemo(
    () =>
      data?.prices
        .flatMap((row) => row)
        .find(
          (entry) =>
            entry.quantity === selectedCell?.quantity &&
            entry.business_day === selectedCell.businessDay,
        )?.price,
    [data, selectedCell],
  )

  useEffect(() => {
    if (notification === null) {
      return
    }

    const timeoutId = setTimeout(
      () => setIsNotificationClosing(true),
      NOTIFICATION_DURATION_MS,
    )

    return () => clearTimeout(timeoutId)
  }, [notification])

  useEffect(() => {
    if (!isNotificationClosing) {
      return
    }

    const timeoutId = setTimeout(() => {
      setNotification(null)
      setIsNotificationClosing(false)
    }, NOTIFICATION_CLOSE_ANIMATION_MS)

    return () => clearTimeout(timeoutId)
  }, [isNotificationClosing])

  function applyPaperSize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (draftPaperSize !== appliedPaperSize) {
      setSelectedCell(null)
      setShowAllRows(false)
      setAppliedPaperSize(draftPaperSize)
    }
  }

  function addSelectedCellToCart() {
    if (selectedCell === null || selectedPrice === undefined) {
      return
    }

    cart.addItem({
      paperSize: appliedPaperSize,
      quantity: selectedCell.quantity,
      businessDay: selectedCell.businessDay,
      price: selectedPrice,
    })
    setIsNotificationClosing(false)
    setNotification({
      title: 'Added to cart',
      description: `${appliedPaperSize}, quantity ${selectedCell.quantity}, ${selectedCell.businessDay} business ${selectedCell.businessDay === 1 ? 'day' : 'days'}`,
    })
    setCartGlowTrigger((trigger) => trigger + 1)
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

        <div className={styles.topRow}>
          <PaperSizeForm
            paperSizes={PAPER_SIZES}
            draftPaperSize={draftPaperSize}
            onDraftPaperSizeChange={setDraftPaperSize}
            onSubmit={applyPaperSize}
          />
          <CartButton
            onClick={() => setIsCartOpen(true)}
            itemCount={cart.itemCount}
            glowTrigger={cartGlowTrigger}
            glowDurationMs={NOTIFICATION_DURATION_MS}
          />
        </div>

        <PricePanel
          appliedPaperSize={appliedPaperSize}
          data={data}
          loading={loading}
          error={error}
          onRetry={retry}
          selectedCell={selectedCell}
          onSelect={setSelectedCell}
          showAllRows={showAllRows}
          onShowAllRows={() => setShowAllRows(true)}
          selectedPrice={selectedPrice}
          onAddToCart={addSelectedCellToCart}
        />
      </div>

      <CartModal
        open={isCartOpen}
        lines={cart.lines}
        total={cart.total}
        onClose={() => setIsCartOpen(false)}
        onIncrement={cart.incrementLine}
        onDecrement={cart.decrementLine}
        onRemove={cart.removeLine}
      />

      {notification !== null && (
        <CartNotification
          title={notification.title}
          description={notification.description}
          closing={isNotificationClosing}
          onClose={() => setIsNotificationClosing(true)}
        />
      )}
    </main>
  )
}

export default App
