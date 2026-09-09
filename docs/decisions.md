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

- Cart behavior is unspecified; checkout is outside scope.
- Routing, a global store, and a backend are outside the current scope.

## Current preparation status

At the time these decisions were recorded, the application remained the React and Vite starter. TypeScript strict mode was not enabled, styles used global CSS, and the requested testing dependencies, test configuration, and tests were absent. ESLint and Prettier dependencies existed, but formatting scripts and explicit Prettier configuration were absent. These are preparation gaps, not changes to the selected stack.

The original assignment text and a copyable reference image remain unavailable, as documented in `assignment.md`. No reference image path is invented here. `docs/plan.md` contains the task index. Detailed plans and evidence in `docs/tasks/*.md` are future outputs and have not yet been created.

This documentation task does not configure tooling or implement these decisions. Existing assignment text, README content, application code, and configuration are preserved.
