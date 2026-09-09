---
name: task-build
description: Implement and verify an existing detailed task plan by task ID, including acceptance checks, meaningful tests, and diff evidence, without committing or pushing.
---

# Task build

## Input and context

Ordinary invocation: `$task-build T02`. Accept optional review findings or narrowed scope as refinements of the current request.

Resolve paths from the repository root. Read `AGENTS.md`, `docs/plan.md`, `docs/assignment.md`, `docs/decisions.md`, applicable nested instructions, and `docs/tasks/<ID>.md`. Follow the shared rules in `AGENTS.md`. Require an existing detailed plan: if absent, report the missing path and that planning is needed; do not invent an implementation plan and proceed. Ask only for essential unresolved information after checking repository and current conversation context.

## Workflow

1. Inspect the current branch, working tree, relevant code, dependency capabilities, and recorded task evidence. Identify task-owned changes and preserve unrelated work. Record prerequisite blockers rather than implementing other tasks implicitly.
2. Set implementation to `IN_PROGRESS` in the task document and index when work begins. Keep review and shipping fields distinct. Preserve truthful prior review and shipping history, while marking evidence stale when source, tests, configuration, or acceptance criteria invalidate it.
3. Verify supplied review findings against the current source and a concrete failure scenario before fixing them. Record confirmed, already resolved, or unsupported findings with reasons.
4. Implement the agreed scope and meaningful tests following the detailed plan. Record material deviations and assumptions. If the request narrows the work, retain unmet full-task criteria in the handoff rather than treating the partial result as complete.
5. Check every acceptance criterion against the implementation and meaningful tests, then inspect the complete task-owned diff, including relevant untracked files. Run appropriate tests, lint, formatting checks, and the production build using actual project commands. Visual or interaction changes also require real-browser verification under `AGENTS.md`. Record commands, outcomes, source scope, failures, and not-run checks. Reuse earlier evidence only when it demonstrably covers unchanged current source, configuration, criteria, and environment; rerun anything affected, stale, missing, or previously failing.
6. Set implementation to `VERIFIED` only when all acceptance criteria are met, the diff is scoped, required checks pass, browser verification is complete when applicable, and no known blocking bug remains. Under the default consolidated-review policy, set review to `DEFERRED` and state that the separate review was intentionally postponed; never label deferred review `PASSED` or `REVIEWED`. Leave shipping unchanged. Otherwise retain implementation `IN_PROGRESS`, keep review `PENDING` or its truthful prior value, and record remaining work or blockers.

## Outputs and boundaries

Produce scoped implementation and tests, updated task evidence, and separate implementation/review/shipping fields. Summarize changes, actual checks, reused evidence and its freshness basis, and remaining work. Do not commit or push. Do not add dependencies or resources without a concrete task need and documented justification.

T00 may have no functional tests yet. Run the applicable tooling checks and report an empty test suite and its actual exit result honestly; never enable `passWithNoTests` merely to appear successful. This documented initial exception does not by itself prevent T00's implementation from becoming `VERIFIED` when its configuration criteria are met. T01 supplies and must preserve the mandatory formatter unit tests and provides the first functional verification of the test runner.
