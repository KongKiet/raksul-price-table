import styles from './CartButton.module.css'

export function CartButton() {
  return (
    <button className={styles.cartButton} type="button" aria-label="View cart">
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
  )
}
