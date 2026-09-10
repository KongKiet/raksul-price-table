import { formatPrice } from '../../utils/formatPrice'
import styles from './OrderPriceSummary.module.css'

interface OrderPriceSummaryProps {
  price: number | undefined
}

export function OrderPriceSummary({ price }: OrderPriceSummaryProps) {
  return (
    <div className={styles.orderPrice}>
      <span className={styles.orderPriceLabel} id="order-price-label">
        Order price
      </span>
      <span
        className={styles.orderPriceValue}
        aria-labelledby="order-price-label"
        aria-live="polite"
      >
        {price === undefined ? '—' : formatPrice(price)}
      </span>
    </div>
  )
}
