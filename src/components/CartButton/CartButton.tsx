import styles from './CartButton.module.css'

const MAX_BADGE_COUNT = 99

interface CartButtonProps {
  onClick: () => void
  itemCount: number
  glowTrigger: number
  glowDurationMs: number
}

export function CartButton({
  onClick,
  itemCount,
  glowTrigger,
  glowDurationMs,
}: CartButtonProps) {
  return (
    <span className={styles.wrapper}>
      {glowTrigger > 0 && (
        <span
          key={glowTrigger}
          className={styles.glow}
          aria-hidden="true"
          data-testid="cart-glow"
          style={{ animationDuration: `${glowDurationMs}ms` }}
        />
      )}
      <button
        className={styles.cartButton}
        type="button"
        aria-label="View cart"
        onClick={onClick}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-1.5 4h11M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          />
        </svg>
      </button>
      {itemCount > 0 && (
        <span
          className={styles.badge}
          aria-hidden="true"
          data-testid="cart-badge"
        >
          {itemCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : itemCount}
        </span>
      )}
    </span>
  )
}
