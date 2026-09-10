import { type PriceCellIdentity } from '../PriceTable/PriceTable'
import { OrderPriceSummary } from '../OrderPriceSummary/OrderPriceSummary'
import styles from './AddToCartBar.module.css'

interface AddToCartBarProps {
  selectedCell: PriceCellIdentity | null
  selectedPrice: number | undefined
  onAddToCart: () => void
}

export function AddToCartBar({
  selectedCell,
  selectedPrice,
  onAddToCart,
}: AddToCartBarProps) {
  return (
    <div className={styles.bar}>
      {selectedCell !== null && <OrderPriceSummary price={selectedPrice} />}
      <button
        className={styles.addButton}
        type="button"
        disabled={selectedCell === null}
        onClick={onAddToCart}
      >
        Add to Cart
      </button>
    </div>
  )
}
