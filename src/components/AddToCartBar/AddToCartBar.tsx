import { type PriceCellIdentity } from '../PriceTable/PriceTable'
import { OrderPriceSummary } from '../OrderPriceSummary/OrderPriceSummary'
import styles from './AddToCartBar.module.css'

interface AddToCartBarProps {
  selectedCell: PriceCellIdentity | null
  selectedPrice: number | undefined
}

export function AddToCartBar({
  selectedCell,
  selectedPrice,
}: AddToCartBarProps) {
  return (
    <div className={styles.bar}>
      <OrderPriceSummary price={selectedPrice} />
      <button
        className={styles.addButton}
        type="button"
        disabled={selectedCell === null}
      >
        Add to Cart
      </button>
    </div>
  )
}
