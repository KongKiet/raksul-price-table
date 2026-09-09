# Project instructions

Use English for communication, documentation, code comments, and commit messages. These instructions apply throughout this repository.

## Sources of truth

- `docs/assignment.md`: product requirements.
- The reference image at the path documented in `docs/assignment.md`: visual reference, when available. The image is currently missing from the repository; do not invent a path or substitute image.
- `docs/decisions.md`: technical decisions and implementation assumptions, separate from assignment requirements.
- `docs/plan.md`: task index.
- `docs/tasks/*.md`: detailed task plans, progress, and verification evidence, identified by task ID.

Read applicable instructions, the assignment, decisions, and the active task documents before implementation. The task index and task documents may not exist during initial preparation; report missing inputs rather than inventing prior plans or evidence. Do not assume access to conversations outside this repository. Do not silently modify requirements to match implementation. Report material conflicts and keep assumptions explicitly labeled.

## Selected stack

- React, TypeScript strict mode, and Vite.
- CSS Modules and semantic HTML.
- Native Fetch with AbortController.
- React local state.
- Vitest, React Testing Library, user-event, jest-dom, and jsdom.
- npm, ESLint, and Prettier.

This is the selected target stack, not a claim that every part is already configured. Consult `docs/decisions.md` for rationale and preparation gaps.

## Assignment restrictions

- Do not use utility libraries such as jQuery, Lodash, or Underscore.
- Do not use CSS frameworks such as Bootstrap or Foundation, or UI component libraries.
- Do not use `toLocaleString()` or `Intl.NumberFormat()` for price formatting.
- The price formatter must have unit tests.

## Implementation principles

- Keep changes scoped to the active task.
- Inspect existing code before adding abstractions or dependencies. Document material assumptions and justify new dependencies.
- Separate API access from presentation.
- Keep hover state separate from selection.
- Derive Order price from current data and selection; avoid independently stored price state.
- Identify cells by `quantity` and `business_day`.
- Prevent stale requests from updating current data, loading, or error state, including in completion and cleanup paths. Use AbortController and guard updates so superseded requests cannot affect the current request.
- Use accessible native controls, semantic HTML, and visible keyboard focus.
- Do not silently substitute mock data when the production API fails.

## Task workflow

- Default workflow: plan, implement and verify, commit/push when authorized, then perform one consolidated final review.
- A separate `task-review` run for each task is optional. When it is intentionally skipped under this policy, record the task's review status as `DEFERRED`, never `PASSED` or `REVIEWED`.
- Track implementation, review, and shipping separately. `VERIFIED` means the implementation meets its acceptance criteria and required checks; `REVIEWED` is reserved for a completed review; `SHIPPED` means the authorized task commit was pushed.
- Preserve truthful historical review and shipping records. Later source changes may make evidence stale, but do not rewrite or relabel a review that actually occurred.
- Neither deferred review nor shipping permission allows known blocking bugs or failing required checks to be bypassed.

## Verification

- Test observable behavior and meaningful edge cases.
- Automated tests must not depend on the live API; use controlled fixtures or request mocks.
- During task implementation, check every acceptance criterion, inspect the task diff, and obtain current-source evidence for appropriate tests, lint, formatting checks, and the production build.
- The price formatter must retain meaningful unit tests. Never treat a build or manual inspection as a substitute for those tests.
- Verify visual and interaction changes in a real latest Chrome or Firefox browser before they are eligible to ship. If a browser is unavailable, record the check as outstanding rather than treating it as complete.
- Reuse valid evidence when it already covers unchanged source, configuration, acceptance criteria, and relevant environment. Rerun affected, missing, stale, or previously failing checks; do not rerun unchanged checks solely to duplicate evidence.
- Report passed, failed, and not-run checks accurately, with relevant reasons and limitations.
- Never weaken tests or disable checks to hide failures.
- When no tests exist during initial setup, explicitly report that fact rather than claiming tests passed.

## Git and handoff

- Inspect the working tree before editing and preserve unrelated changes, including untracked files.
- Stage only files belonging to the task.
- Do not commit secrets or generated build output.
- Commit and push only within the user's authorized scope.
- Do not force-push, rewrite shared history, or merge automatically.
- Store progress and verification evidence in the relevant task documents, including remaining work and blockers.
- Skills may rely on documented inputs so ordinary invocations need only a task ID. Keep the task index and task documents sufficient to locate scope, requirements, decisions, and evidence without undocumented conversation context.
