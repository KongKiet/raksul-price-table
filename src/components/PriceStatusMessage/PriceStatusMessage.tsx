import { type PaperSize } from '../../api/prices'
import styles from './PriceStatusMessage.module.css'

const RETRY_EXHAUSTED_MESSAGE =
  'We still could not load prices after several attempts. Please refresh the page or try again later.'

type PriceStatusMessageProps =
  | { status: 'loading'; paperSize: PaperSize }
  | {
      status: 'error'
      message: string
      onRetry: () => void
      retryDisabled?: boolean
    }
  | { status: 'empty'; paperSize: PaperSize }

export function PriceStatusMessage(props: PriceStatusMessageProps) {
  if (props.status === 'loading') {
    return (
      <div className={styles.state} role="status" aria-live="polite">
        <div className={styles.stateContent}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Loading {props.paperSize} prices...</span>
        </div>
      </div>
    )
  }

  if (props.status === 'error') {
    return (
      <div className={styles.state} role="alert">
        <div className={styles.stateContent}>
          <span>
            {props.retryDisabled ? RETRY_EXHAUSTED_MESSAGE : props.message}
          </span>
          <button
            className={styles.retryButton}
            type="button"
            onClick={props.onRetry}
            disabled={props.retryDisabled}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <p className={styles.state} role="status">
      No prices are currently available for {props.paperSize}.
    </p>
  )
}
