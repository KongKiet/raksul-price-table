import { PriceTable } from './components/PriceTable/PriceTable'
import { usePrices } from './hooks/usePrices'
import styles from './App.module.css'

function App() {
  const { data, error, loading, retry } = usePrices('A4')
  const hasPrices = data?.prices.some((row) => row.length > 0) ?? false

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

        <section
          className={styles.panel}
          aria-labelledby="price-table-heading"
          aria-busy={loading}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle} id="price-table-heading">
                A4 price table
              </h2>
              <p className={styles.panelDescription}>
                Prices by quantity and delivery business days
              </p>
            </div>
            <span className={styles.paperBadge}>A4</span>
          </div>

          {loading && (
            <div className={styles.state} role="status" aria-live="polite">
              <div className={styles.stateContent}>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Loading A4 prices...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className={styles.state} role="alert">
              <div className={styles.stateContent}>
                <span>{error}</span>
                <button
                  className={styles.retryButton}
                  type="button"
                  onClick={retry}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && data && !hasPrices && (
            <p className={styles.state} role="status">
              No prices are currently available for A4.
            </p>
          )}

          {!loading && !error && data && hasPrices && (
            <PriceTable paperSize="A4" prices={data.prices} />
          )}
        </section>
      </div>
    </main>
  )
}

export default App
