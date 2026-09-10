# Project task index

## Context and sources

Build an interactive price table for paper printing products, organized by delivery business days and quantity, with A4, A5, B4, and B5 paper sizes.

- [`../AGENTS.md`](../AGENTS.md) defines project instructions, restrictions, verification, and handoff rules.
- [`assignment.md`](assignment.md) defines product requirements and the API contract.
- [`decisions.md`](decisions.md) records the selected stack and implementation assumptions, including Apply behavior and scope boundaries.
- Use the reference image at the path documented in the assignment when available. It is currently missing from the repository.

Acceptance criteria below include both assignment requirements and the separately documented implementation decisions; they do not alter the assignment. Do not silently change requirements to match implementation.

## Task workflow and evidence

Default workflow: plan → implement and verify → commit/push when authorized → final consolidated review. Individual task reviews remain available but are optional.

Track three independent fields:

| Field          | Values                                          | Meaning                                                                                                                                                     |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implementation | `TODO` → `PLANNED` → `IN_PROGRESS` → `VERIFIED` | `VERIFIED` means the implementation satisfies its acceptance criteria and required verification, including diff inspection. It is not a review result.      |
| Review         | `PENDING`, `DEFERRED`, or `REVIEWED`            | `DEFERRED` means the separate task review was intentionally postponed to the final consolidated review. Only an actual completed review may use `REVIEWED`. |
| Shipping       | `NOT_SHIPPED` → `COMMITTED` → `SHIPPED`         | `COMMITTED` means an authorized commit exists but has not been confirmed pushed. `SHIPPED` means pushed, not merged or deployed.                            |

A task may ship with review `DEFERRED` when implementation is `VERIFIED`, required evidence covers the current source, and no failing check or known blocking defect remains. Keep truthful review history, including T00's completed review. A later source change may make prior evidence stale, but does not erase the historical record.

Detailed plans live in `docs/tasks/*.md`, using `docs/tasks/<ID>.md` for each task, such as `docs/tasks/T00.md`. No detailed task plans are created by this index.

This index and the assignment must provide enough context for `task-plan` to accept only a task ID. Planning should resolve the ID here, read the linked instructions and decisions, inspect current code and dependency-task evidence, and create or update the corresponding detailed task document. It must not require undocumented conversation history. The repository skills live in `.agents/skills/<skill-name>/SKILL.md`, using repository-root paths: `task-plan`, `task-build`, `task-review`, and `task-ship`.

Record progress, review findings or explicit deferral, resolutions, verification commands and results, limitations, and remaining manual checks in the detailed task document. Keep the index concise and update implementation, review, and shipping fields independently. Dependencies identify prerequisite capabilities; they do not authorize implementation, commits, or pushes.

Record commit and push outcomes separately. After an authorized commit, record its hash and use shipping `COMMITTED` until the authorized push succeeds. Only then use `SHIPPED` and record the destination remote and branch plus push confirmation. Evidence may remain as a local documentation update until the next authorized commit; do not create repeated bookkeeping commits merely to record the commit containing shipping evidence. Refer to the shipped implementation commit rather than trying to make an evidence commit record its own hash.

## Shared acceptance expectations

All tasks follow `AGENTS.md`, use the selected stack, preserve unrelated work, and document material assumptions separately from requirements. Tests cover observable behavior and meaningful edge cases using controlled data, without depending on the live API; the formatter's unit tests remain mandatory. Implementation verification checks acceptance criteria and the task diff and obtains current-source evidence for appropriate tests, lint, formatting checks, and the production build. Visual and interaction changes require real-browser verification in the latest Chrome or Firefox before shipping. Valid evidence may be reused for unchanged source; affected, stale, missing, or failing checks must run and be reported accurately.

## T00 — Development tooling and test configuration

- **ID:** T00
- **Goal:** Verify and complete development tooling and test configuration.
- **Dependencies:** None.
- **Implementation:** VERIFIED
- **Review:** REVIEWED
- **Shipping:** COMMITTED
- **Detailed plan:** [T00](tasks/T00.md)

High-level acceptance criteria:

- Verify the existing setup and complete React, TypeScript strict mode, Vite, CSS Modules support, npm, ESLint, and Prettier configuration without replacing unrelated user work.
- Configure Vitest, React Testing Library, user-event, jest-dom, and jsdom for isolated unit and component tests.
- Provide usable commands for development, formatting checks, lint, tests, and production builds; verify applicable commands and report accurately if no tests exist yet.
- Ensure ignore rules cover dependencies, build output, coverage, and local environment files; record runtime or Git environment blockers.

## T01 — Price formatter

- **ID:** T01
- **Goal:** Implement the price formatter and unit tests.
- **Dependencies:** T00.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** COMMITTED
- **Detailed plan:** [T01](tasks/T01.md)

High-level acceptance criteria:

- Format positive integer prices with commas between groups of three digits counted from the right.
- Do not use `toLocaleString()`, `Intl.NumberFormat()`, or utility libraries.
- Unit tests cover values requiring no separator, digit-group boundaries, and multiple separators.

## T02 — Initial A4 price table

- **ID:** T02
- **Goal:** Load and display the A4 price table, including loading, error, retry, and empty states.
- **Dependencies:** T00, T01.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** COMMITTED
- **Detailed plan:** [T02](tasks/T02.md)

High-level acceptance criteria:

- Request A4 from the documented production API using native Fetch with AbortController, with API access separated from presentation and stale updates prevented.
- Display formatted prices by quantity and delivery business days using semantic HTML and CSS Modules, initially showing five quantity rows from the loaded response.
- Derive business-day columns from the response, sort numerically, and match entries by `business_day` rather than array position; show missing combinations as unavailable.
- Provide observable loading, error, retry, and empty states. Retry can recover from failure, and production failures never silently fall back to mock data.
- Automated tests verify these states and table mapping without live API requests.

## T03 — Paper-size selection and Apply

- **ID:** T03
- **Goal:** Implement paper-size selection and Apply, including stale-request protection.
- **Dependencies:** T02.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** SHIPPED
- **Detailed plan:** [T03](tasks/T03.md)

High-level acceptance criteria:

- Offer A4, A5, B4, and B5 through an accessible selector with A4 initially selected.
- Changing the dropdown alone leaves the applied table unchanged; Apply applies the selected size.
- Changing the applied size resets the visible row count to five. Selection and hover must clear when those features are added in T04 and T06; T05 verifies the reset after expansion.
- Superseded requests cannot update current data, loading, or error state, including delayed success, failure, and completion paths.
- Tests cover Apply behavior, supported sizes, and overlapping requests using controlled responses.

## T04 — Cell selection and Order price

- **ID:** T04
- **Goal:** Implement cell selection and Order price.
- **Dependencies:** T03.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** SHIPPED
- **Detailed plan:** [T04](tasks/T04.md)

High-level acceptance criteria:

- Selecting an available cell by pointer or keyboard keeps it highlighted and identifies it by `quantity` and `business_day`.
- Order price displays an em dash before selection and otherwise derives the formatted selected price from current data, without multiplying by quantity.
- Missing combinations cannot be selected; changing the applied paper size clears selection and returns Order price to an em dash.
- Tests verify selection, replacement selection, unavailable cells, and applied-size resets.

## T05 — See more

- **ID:** T05
- **Goal:** Implement See more.
- **Dependencies:** T03.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** SHIPPED
- **Detailed plan:** [T05](tasks/T05.md)

High-level acceptance criteria:

- Initially show five quantity rows; See more reveals all available loaded rows, including all ten rows in the specified response.
- Expansion does not request another page or otherwise fetch more data.
- Changing the applied paper size resets the table to five rows.
- The control is accessible, and tests verify expansion, request count, and reset behavior.

## T06 — Hover highlighting

- **ID:** T06
- **Goal:** Implement cell, row, and column hover highlighting.
- **Dependencies:** T04, T05.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** SHIPPED
- **Detailed plan:** [T06](tasks/T06.md)

High-level acceptance criteria:

- Hovering over an available price strongly highlights its cell and weakly highlights the corresponding quantity row and business-day column.
- Hover remains separate from persistent selection; moving or leaving the pointer does not change the selected price or remove its selected state.
- Highlighting works across expanded rows and matches cell identity rather than entry position.
- Changing the applied paper size clears hover; tests cover highlight transitions and interaction with selection.

## T07 — Component structure optimization

- **ID:** T07
- **Goal:** Decompose the application into logical, reusable components so `App.tsx` only composes them, without changing behavior.
- **Dependencies:** T00, T01, T02, T03, T04, T05, T06.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** SHIPPED
- **Detailed plan:** [T07](tasks/T07.md)

High-level acceptance criteria:

- `App.tsx` owns state and wiring only; it renders extracted components for the paper-size form, the price panel (status states plus table), and the order-price display, rather than containing their markup directly.
- Extracted components follow existing data contracts (`PaperSize`, `PriceCellIdentity`, `usePrices`) and existing CSS Modules/design tokens; no visible layout, styling, or behavior changes result from this task.
- Each component has one clear responsibility and lives under `src/components/<Name>/`, matching the existing `PriceTable` folder convention.
- All existing automated tests continue to pass unchanged in behavior coverage; test files may be reorganized to match new component boundaries.
- This is a refactor: it introduces no cart UI or cart logic (see T08 and T09).

## T08 — Cart-ready UI layout

- **ID:** T08
- **Goal:** Update the UI layout to accommodate future cart logic: an Add to Cart action area below the table, a restyled `appliedPaperSize` badge, and a cart icon above the table.
- **Dependencies:** T07.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** COMMITTED
- **Detailed plan:** [T08](tasks/T08.md)

High-level acceptance criteria:

- Below the price table, add a component containing an "Add to Cart" button and the "Order price" of the currently selected cell; the button is disabled while no cell is selected and enabled once one is.
- Remove the Order price display currently shown beside `appliedPaperSize`.
- Enlarge the `appliedPaperSize` badge and give it a circular background wrapper.
- Above the table, alongside the paper-size selection form, add a shopping cart icon positioned on the opposite side of the row from the form, representing the cart entry point.
- This task is layout and wiring only, reusing existing selection state; Add to Cart and the cart icon perform no persistent action, notification, or modal yet (see T09).
- Layout remains responsive at existing breakpoints and preserves established accessibility conventions (semantic elements, accessible names, visible focus).

## T09 — Add to Cart functionality

- **ID:** T09
- **Goal:** Implement cart state and interactions: adding items with a success notification, a cart contents modal with quantity and removal controls plus a disabled-when-empty Checkout button, and persisting the cart to `localStorage` so a page refresh does not clear it.
- **Dependencies:** T08.
- **Implementation:** VERIFIED
- **Review:** DEFERRED
- **Shipping:** NOT_SHIPPED
- **Detailed plan:** [T09](tasks/T09.md)

High-level acceptance criteria:

- Clicking Add to Cart (enabled per T08 only when a cell is selected) adds the selected paper size, quantity, business day, and price to cart state, incrementing quantity when the same line already exists, and shows a small success notification styled consistently with the project's existing status/feedback conventions.
- Clicking the cart icon opens a modal listing current cart contents; the modal handles an empty-cart state and scrolls when the list is long, without a UI framework or component library.
- Each cart line shows paper size, quantity, and business days, with controls to increase or decrease quantity and to remove the line.
- The modal shows a computed total price (reusing the existing price formatter) and a Checkout button at the bottom; Checkout is disabled when the cart is empty and otherwise performs no real checkout processing.
- Cart state uses plain React state, persisted to `localStorage` so it survives a page refresh, and introduces no routing, global store, or backend, consistent with existing scope boundaries.

## T10 — Accessibility, regression verification, browser QA, and README

- **ID:** T10
- **Goal:** Complete accessibility checks, regression verification, browser QA, and README.
- **Dependencies:** T00, T01, T02, T03, T04, T05, T06, T07, T08, T09.
- **Implementation:** TODO
- **Review:** PENDING
- **Shipping:** NOT_SHIPPED

High-level acceptance criteria:

- Verify semantic table structure, accessible control names, keyboard operation, visible focus, and understandable loading, error, empty, and selection states.
- Regression checks cover formatter behavior, table mapping, Apply and stale requests, selection and Order price, See more, hover interactions, the component restructuring, and cart interactions (add to cart, notification, modal, quantity/removal controls, Checkout disabled state) together.
- Run formatting checks, lint, tests, and the production build; record results and resolve blocking failures without weakening checks.
- Perform browser QA in the latest Chrome or Firefox when available and compare against the documented visual reference when available. Record browser/version and findings, or the manual verification still needed and missing reference limitation.
- Update README with setup and workflow commands, product behavior, relevant assumptions, verification guidance, and known limitations while preserving applicable existing content.
- Confirm cart add-to-cart, notification, cart-contents modal behavior, and `localStorage` persistence across a refresh (T07–T09) are covered by the checks above; checkout processing, routing, a global store, and a backend remain outside scope.
