import { type FormEvent } from 'react'

import { type PaperSize } from '../../api/prices'
import styles from './PaperSizeForm.module.css'

interface PaperSizeFormProps {
  paperSizes: readonly PaperSize[]
  draftPaperSize: PaperSize
  onDraftPaperSizeChange: (paperSize: PaperSize) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function PaperSizeForm({
  paperSizes,
  draftPaperSize,
  onDraftPaperSizeChange,
  onSubmit,
}: PaperSizeFormProps) {
  return (
    <form className={styles.controls} onSubmit={onSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="paper-size">
          Paper size
        </label>
        <select
          className={styles.select}
          id="paper-size"
          value={draftPaperSize}
          onChange={(event) => {
            const { value } = event.target

            if (paperSizes.some((paperSize) => paperSize === value)) {
              onDraftPaperSizeChange(value as PaperSize)
            }
          }}
        >
          {paperSizes.map((paperSize) => (
            <option key={paperSize} value={paperSize}>
              {paperSize}
            </option>
          ))}
        </select>
      </div>
      <button className={styles.applyButton} type="submit">
        Apply
      </button>
    </form>
  )
}
