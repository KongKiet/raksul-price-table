import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  // Guard against a fake-timer test failing before it restores real timers:
  // without this, every subsequent test's real-timer-based waits (findBy*,
  // userEvent) would hang until the suite's overall timeout.
  vi.useRealTimers()
  // The app persists selection state to the URL via history.replaceState,
  // which otherwise leaks into the next test since jsdom's location isn't
  // reset between tests.
  window.history.replaceState(null, '', '/')
})

// jsdom does not implement HTMLDialogElement.showModal()/close() (see
// https://github.com/jsdom/jsdom/issues/3294), so <dialog> tests need a
// minimal polyfill: showModal()/close() toggle the `open` attribute and
// dispatch the "close" event, and Escape mirrors the browser's native
// cancel-then-close behavior for an open modal dialog.
if (
  typeof HTMLDialogElement !== 'undefined' &&
  typeof HTMLDialogElement.prototype.showModal !== 'function'
) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }

  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return
    }

    const openDialog = document.querySelector('dialog[open]')

    if (!openDialog) {
      return
    }

    const notPrevented = openDialog.dispatchEvent(
      new Event('cancel', { cancelable: true }),
    )

    if (notPrevented) {
      ;(openDialog as HTMLDialogElement).close()
    }
  })
}
