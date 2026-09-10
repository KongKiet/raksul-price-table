# Technical decisions and implementation assumptions

## Relationship to assignment requirements

[`assignment.md`](assignment.md) is the source of product requirements. This document records the user-selected technical approach and implementation assumptions; these are not verbatim original assignment requirements. The documented reference image is a visual reference when available.

The assignment leaves Apply and Cart behavior unspecified. The Apply assumption below resolves an implementation decision without changing that assignment wording. Cart behavior remains unspecified. No material conflicts with existing project instructions or assignment requirements were found.

## Selected stack and rationale

| Decision                             | Rationale                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| React                                | Fits the required JavaScript framework and the existing project scaffold.                                                    |
| TypeScript strict mode               | Makes data and state contracts explicit and helps catch nullability and type errors.                                         |
| Vite                                 | Retains the existing development server and production build pipeline.                                                       |
| CSS Modules and semantic HTML        | Scopes component styles while using native document and control semantics without CSS or UI frameworks.                      |
| Native Fetch with AbortController    | Uses browser APIs for requests and cancellation without an HTTP client dependency. Stale state updates still require guards. |
| React local state                    | Keeps the small table interaction model close to its consumers without a global store.                                       |
| Vitest                               | Provides unit and component test execution alongside the Vite toolchain.                                                     |
| React Testing Library and user-event | Tests observable UI behavior through realistic user interactions.                                                            |
| jest-dom and jsdom                   | Provide DOM assertions and a simulated DOM for automated tests; real-browser visual checks remain separate.                  |
| npm                                  | Retains the existing package manager and `package-lock.json`.                                                                |
| ESLint and Prettier                  | Provide consistent static checks and formatting using existing project dependencies.                                         |

The testing package names are `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, and `jsdom`.

## Implementation assumptions

The following assumptions are supplied by the user for implementation. They are separate from the assignment requirements and do not expand the original assignment wording.

### Paper size and table state

- Initial paper size is A4.
- Changing the dropdown alone does not update the table.
- Apply applies the selected paper size. Keep the dropdown choice distinct from the applied paper size.
- Changing the applied paper size clears selection and hover and resets the table to five rows.

### Selection and Order price

- Before selection, Order price displays an em dash (`—`).
- Order price equals the selected cell's price, without multiplying by quantity.
- Derive Order price from the current data and the selected `quantity` and `business_day` pair.

### Rows, columns, and unavailable prices

- See more reveals already-loaded rows without requesting another page.
- Derive business-day columns from the response and sort them numerically.
- Match entries by `business_day` rather than array position.
- Missing quantity/business-day combinations are unavailable and cannot be selected.

### Scope boundaries

- Cart behavior was unspecified in the original assignment; checkout was outside scope.
- Routing, a global store, and a backend are outside the current scope.

### Cart scope (advanced tasks, added 2026-09-10)

The user requested three additional advanced tasks that bring cart behavior into scope, tracked as T07–T09 in `docs/plan.md`: component structure optimization, cart-ready UI layout, and Add to Cart functionality. These are user-supplied implementation decisions, not a change to the original assignment text in `assignment.md`.

- Add to Cart is enabled only when a table cell is selected; clicking it adds the selected paper size, quantity, business day, and price to cart state and shows a small success notification.
- A cart modal, opened from a new cart icon, lists cart contents with quantity increase/decrease and removal controls, a total price, and a Checkout button.
- Still outside scope: real checkout/payment processing, routing, and a backend.
- Cart state uses React local state, consistent with the existing stack decision; it does not introduce a global store.
- The cart icon and any status/notification UI are built with native elements and existing CSS Modules/tokens, consistent with the "no UI component libraries" restriction.

### Cart persistence (added 2026-09-10)

The user requested that cart contents survive a page refresh.

- Cart contents are persisted to the browser's `localStorage` so a page refresh restores the same cart (line items and quantities) instead of clearing it. This supersedes the earlier "not persisted across page reloads" assumption recorded above.
- Persistence is `localStorage` only: cart state itself remains plain React local state during the session (per the decision above); `localStorage` is read once to initialize that state and written on every cart change. This does not introduce a global store, context, or backend, and does not conflict with the "React local state" or "no backend" scope boundaries.
- If `localStorage` is unavailable, empty, or holds data that fails to parse or validate, the cart starts empty rather than the app crashing or surfacing an error.

## Current preparation status

At the time these decisions were recorded, the application remained the React and Vite starter. TypeScript strict mode was not enabled, styles used global CSS, and the requested testing dependencies, test configuration, and tests were absent. ESLint and Prettier dependencies existed, but formatting scripts and explicit Prettier configuration were absent. These are preparation gaps, not changes to the selected stack.

The original assignment text and a copyable reference image remain unavailable, as documented in `assignment.md`. No reference image path is invented here. `docs/plan.md` contains the task index. Detailed plans and evidence in `docs/tasks/*.md` are future outputs and have not yet been created.

This documentation task does not configure tooling or implement these decisions. Existing assignment text, README content, application code, and configuration are preserved.
