import { useEffect, useRef } from 'react'

import { type CartLine } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'
import styles from './CartModal.module.css'

interface CartModalProps {
  open: boolean
  lines: CartLine[]
  total: number
  onClose: () => void
  onIncrement: (line: CartLine) => void
  onDecrement: (line: CartLine) => void
  onRemove: (line: CartLine) => void
}

function lineKey(line: CartLine): string {
  return `${line.paperSize}-${line.quantity}-${line.businessDay}`
}

function businessDayLabel(businessDay: number): string {
  return `${businessDay} business ${businessDay === 1 ? 'day' : 'days'}`
}

export function CartModal({
  open,
  lines,
  total,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
}: CartModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="cart-modal-heading"
      onClose={onClose}
    >
      <div className={styles.header}>
        <h2 className={styles.heading} id="cart-modal-heading">
          Your cart
        </h2>
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Close cart"
          onClick={() => dialogRef.current?.close()}
        >
          &times;
        </button>
      </div>

      {lines.length === 0 ? (
        <p className={styles.empty}>Your cart is empty.</p>
      ) : (
        <ul className={styles.list}>
          {lines.map((line) => (
            <li className={styles.line} key={lineKey(line)}>
              <div className={styles.lineDetails}>
                <span className={styles.linePaperSize}>{line.paperSize}</span>
                <span className={styles.lineMeta}>
                  Quantity {formatPrice(line.quantity)} &middot;{' '}
                  {businessDayLabel(line.businessDay)}
                </span>
              </div>
              <div className={styles.quantityControls}>
                <button
                  className={styles.quantityButton}
                  type="button"
                  aria-label={`Decrease quantity in cart for ${line.paperSize}, quantity ${line.quantity}, ${businessDayLabel(line.businessDay)}`}
                  onClick={() => onDecrement(line)}
                >
                  &minus;
                </button>
                <span
                  className={styles.quantityValue}
                  aria-live="polite"
                  aria-label={`Quantity in cart: ${line.cartQuantity}`}
                >
                  {line.cartQuantity}
                </span>
                <button
                  className={styles.quantityButton}
                  type="button"
                  aria-label={`Increase quantity in cart for ${line.paperSize}, quantity ${line.quantity}, ${businessDayLabel(line.businessDay)}`}
                  onClick={() => onIncrement(line)}
                >
                  &#43;
                </button>
              </div>
              <span className={styles.linePrice}>
                {formatPrice(line.price * line.cartQuantity)}
              </span>
              <button
                className={styles.removeButton}
                type="button"
                aria-label={`Remove ${line.paperSize}, quantity ${line.quantity}, ${businessDayLabel(line.businessDay)} from cart`}
                onClick={() => onRemove(line)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.footer}>
        <div className={styles.total}>
          <span className={styles.totalLabel} id="cart-total-label">
            Total
          </span>
          <span
            className={styles.totalValue}
            aria-labelledby="cart-total-label"
            aria-live="polite"
          >
            ¥{formatPrice(total)}
          </span>
        </div>
        <button
          className={styles.checkoutButton}
          type="button"
          disabled={lines.length === 0}
        >
          Checkout
        </button>
      </div>
    </dialog>
  )
}
