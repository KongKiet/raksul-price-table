import styles from './CartNotification.module.css'

interface CartNotificationProps {
  title: string
  description: string
  closing: boolean
  onClose: () => void
}

export function CartNotification({
  title,
  description,
  closing,
  onClose,
}: CartNotificationProps) {
  return (
    <div
      className={
        closing
          ? `${styles.notification} ${styles.closing}`
          : styles.notification
      }
      role="status"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">
        i
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <button
        className={styles.closeButton}
        type="button"
        aria-label="Close notification"
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  )
}
