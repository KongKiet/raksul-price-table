# Raksul price table

An interactive price table for paper printing products (A4, A5, B4, B5), organized by delivery business days and quantity, built with React, TypeScript, and Vite.

## Setup

```sh
npm install
npm run dev
```

The dev server prints a local URL (Vite picks the next free port starting at 5173). The app requests live prices from the production pricing API for A4, A5, B4, and B5 paper sizes; no local mock server or `.env` configuration is required.

## Workflow commands

| Command                | Purpose                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with HMR.                                             |
| `npm run build`        | Type-check (`tsc -b`) and produce a production build (`vite build`) in `dist/`. |
| `npm run preview`      | Serve the production build locally.                                             |
| `npm run lint`         | Run ESLint over the project.                                                    |
| `npm run test`         | Run the full Vitest suite once.                                                 |
| `npm run test:watch`   | Run Vitest in watch mode.                                                       |
| `npm run format`       | Apply Prettier formatting.                                                      |
| `npm run format:check` | Check Prettier formatting without writing.                                      |

## Product behavior

- **Paper size and Apply.** A4 is selected initially. Changing the dropdown alone does not change the displayed table — only clicking **Apply** loads and displays that size. Applying a different size clears any selection and hover state and resets the table to its initial five visible rows.
- **Price table.** Prices are shown by quantity (rows) and delivery business days (columns), derived from the API response rather than assumed from array position; a missing quantity/business-day combination renders as unavailable and cannot be selected. Loading, error (with **Retry**), and empty states are shown as needed.
- **See more.** The table initially shows five quantity rows; **See more** reveals the remaining already-loaded rows (no extra request is made — the full response is fetched once per Apply).
- **Selection and Order price.** Clicking (or activating via keyboard) an available price cell selects it; the cell stays highlighted and its price is shown as **Order price** (the selected price itself, not multiplied by quantity). Before any selection, no Order price is shown.
- **Hover highlighting.** Hovering an available price strongly highlights that cell and weakly highlights its row and column. Hover is independent of selection: moving or leaving the pointer never changes what is selected.
- **Cart.** With a cell selected, **Add to Cart** adds a line (paper size, quantity, business day, price) to the cart and shows a brief notification; adding the same combination again increases that line's quantity instead of duplicating it. The cart icon (with an item-count badge) opens a modal listing cart contents, with per-line quantity +/− and remove controls, a computed total, and a **Checkout** button that is enabled only when the cart has items. Checkout does not perform any real checkout, payment, or network request — this is intentionally out of scope (see Assumptions). Cart contents are saved to the browser's `localStorage` and restored on page load, so a refresh does not clear the cart.

## Assumptions and scope boundaries

The original requirements left some behavior unspecified; the following implementation choices fill those gaps:

- Apply, not the dropdown alone, controls what table is displayed; changing the applied size resets selection, hover, and the five-row view.
- Order price is the selected cell's price as returned by the API, not multiplied by quantity.
- Cart, checkout, and persistence were added as explicit follow-on scope on top of the original assignment. Checkout performs no real payment/order processing, and there is no routing, global state store, or backend — cart state is plain React state, persisted only to `localStorage`.
- No CSS framework, UI component library, or utility library (e.g. Bootstrap, jQuery, Lodash) is used, per the assignment's technical restrictions; styling uses CSS Modules and design tokens (`src/index.css`), and the cart icon, modal, and notification are built from native elements.
- The price formatter (`src/utils/formatPrice.ts`) inserts thousands separators without `toLocaleString()`/`Intl.NumberFormat()`, per the assignment restriction, and has dedicated unit tests.

## Verification

- `npm run format:check`, `npm run lint`, `npm run test`, and `npm run build` are expected to pass on `main`; run all four before considering a change complete.
- Automated tests (`src/**/*.test.ts(x)`) use React Testing Library, `user-event`, and controlled/mocked responses — they never depend on the live API. They cover table loading/mapping, Apply and stale-request handling, selection and Order price, See more, hover, and the full cart flow (add/increment, notification, modal open/close, quantity/removal controls, total, Checkout's disabled state, and `localStorage` persistence, including invalid/missing stored data).
- Visual and interaction changes are additionally verified manually in a real, latest Chrome or Firefox before shipping, since automated tests run in a simulated DOM (jsdom) and cannot confirm real rendering, native focus behavior, or CSS layout.

## Known limitations

- **Reference image unavailable.** A mockup was shown during requirements gathering but its image file was never available to save into this repository. Rendered output could not be compared against it pixel-for-pixel; the implementation follows the mockup's described elements (selector, Apply, price table, Order price, cart) rather than a saved reference.
- **Narrow-width (≤640px) layout is pattern-verified, not live-rendered, in this project's own browser-automation sessions.** The CSS follows the same `@media (max-width: 640px)` responsive rules already used consistently across components, but the automation tooling used during development (`resize_window`) does not change the page's actual effective viewport (confirmed via `window.innerWidth`), so this layout could not be exercised in a live narrow render during automated verification. A manual check by resizing an actual browser window, or using its device toolbar, is recommended before relying on narrow-width layout in production.
