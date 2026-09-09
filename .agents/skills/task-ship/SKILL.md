---
name: task-ship
description: Prepare and carry out authorized task commits and pushes by task ID after checking scope, verification, review disposition, and destination.
---

# Task ship

## Input and context

Ordinary invocation: `$task-ship T02`. Resolve the requested action and destination from established user authorization, optional prompt refinements, and repository context.

Resolve paths from the repository root. Read `AGENTS.md`, `docs/plan.md`, `docs/assignment.md`, `docs/decisions.md`, applicable nested instructions, and `docs/tasks/<ID>.md`. Follow `AGENTS.md` for shared rules. This skill does not grant commit or push permission by itself, and a configured remote establishes a possible destination, not authorization. Honor authorization already provided in the current conversation without asking again.

## Workflow

1. Inspect the branch, working tree, index, configured remotes, and task evidence. Determine the exact task files or hunks, requested commit/push action, and destination remote and branch. Do not display remote credentials. If essential intent or destination is unresolved, inspect existing review evidence, complete available verification, and prepare the proposed file list and commit message, then ask only for the missing information before the dependent mutation. Do not invent a remote or change Git configuration to supply missing context.
2. Require implementation `VERIFIED` and confirm that acceptance-criterion and diff inspection evidence covers the candidate source, including relevant untracked files. Review must be either `REVIEWED` with no unresolved blocking findings or explicitly `DEFERRED` under the consolidated-review policy. `DEFERRED` is not a passed review. Refuse shipping for failing required checks, stale affected evidence, unresolved known blocking bugs, or ambiguous task scope; do not silently review or rebuild within shipping.
3. Confirm current-source evidence for the required checks in `AGENTS.md`: appropriate tests, lint, formatting checks, production build, and browser verification for visual or interaction changes. Reuse valid recorded evidence when source, tests, configuration, criteria, and relevant environment are unchanged. Run only affected, missing, stale, or previously failing checks and record actual outcomes. For T00 only, its truthful reviewed empty-suite exception remains historical; T01 and later source must preserve the mandatory formatter unit tests. Never claim tests passed or enable `passWithNoTests` to conceal failure.
4. After commit authorization is established, stage only task files or hunks, including intended task documentation, and inspect the complete staged diff. Preserve unrelated staged changes: isolate the task commit without including or silently unstaging them; if safe separation is unclear, ask before altering the user's index. Do not use blanket staging for a mixed working tree. On a repository with no commits, do not treat every untracked scaffold file as task-owned automatically.
5. Commit with a descriptive English message reflecting the final task scope. Inspect the resulting commit and record its SHA separately from implementation and review. Set shipping to `COMMITTED` after commit success; it must remain short of `SHIPPED` until push succeeds. For a retry after an earlier successful task commit, verify and reuse the recorded commit instead of creating a duplicate or unrelated commit.
6. Push only with authorization to the resolved remote and branch. Verify the remote's effective push destination, including any separate push URL, and use an explicit source and destination branch so Git defaults cannot send the task elsewhere. Inspect outgoing commits so the push does not silently include unrelated work outside authorized scope. If the push fails, stop the shipping attempt, report the successful commit separately from the failed push, and retain shipping `COMMITTED`. Do not force-push, rewrite shared history, merge automatically, or retry blindly. A retry needs an understood and resolved cause within existing authorization.
7. Only after confirmed push success, set shipping to `SHIPPED` in the task document and index. Do not alter implementation `VERIFIED` or review `DEFERRED`/`REVIEWED` merely because shipping succeeded. Record the shipped implementation SHA, remote and branch, and push confirmation. As defined in `docs/plan.md`, `SHIPPED` means committed and pushed, not merged or deployed. Keep this post-success evidence as a local documentation update for the next authorized commit when appropriate; never create recurring commits solely to record the previous commit SHA.

## Outputs and boundaries

Report implementation, review, and shipping states separately. Report commit SHA/outcome separately from push destination/outcome, plus verification limits and any local evidence updates. If commit-only work is authorized, complete that scope, set shipping to `COMMITTED`, and explicitly report push as not run. Do not implement fixes or expand authorization to other tasks, publication, merges, or deployment.
