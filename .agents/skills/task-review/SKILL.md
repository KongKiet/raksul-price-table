---
name: task-review
description: Perform an optional targeted task review or the final consolidated review, recording actionable findings and revision-specific evidence without changing application code.
---

# Task review

## Input and context

Targeted invocation: `$task-review T02`. Final invocation: `$task-review final`. Accept an optional commit range, task set, diff scope, or other context refining the review.

Resolve paths from the repository root. Read `AGENTS.md`, `docs/plan.md`, `docs/assignment.md`, `docs/decisions.md`, applicable nested instructions, and each in-scope `docs/tasks/<ID>.md`. Follow `AGENTS.md` for shared project and verification rules. If a required detailed task document is missing, report it rather than inventing acceptance evidence. Resolve task context from these documents and the current conversation; ask only when essential information or review scope remains unresolved.

## Workflow

1. Determine whether the request is an optional targeted review or the final consolidated review. For a final review, enumerate the included tasks and resolve their shipped commit ranges or other explicit submission scope; do not assume that every repository commit belongs to the submission.
2. Inspect the branch and working tree. Use the explicitly requested scope when supplied. Otherwise, for a targeted task review use its uncommitted task changes or recorded task commit range; for a final review use the resolved consolidated submission scope. Read relevant untracked files directly because ordinary diffs may omit them. If scope is ambiguous, ask rather than choosing an arbitrary latest commit. Exclude unrelated changes from conclusions.
3. Record the reviewed file/diff scope and relevant source revision. For a commit range, record its endpoints. For uncommitted source, record the base HEAD (or its absence), content hashes of reviewed task files and relevant configuration including untracked files, and an explicit list of deleted paths. Record enough information to detect source changes after review; a branch name or HEAD alone cannot identify uncommitted content. Identify the reviewed acceptance criteria separately from evidence sections so appending review evidence does not invalidate its own record.
4. Compare implementation and meaningful tests against assignment requirements, documented decisions, and task acceptance criteria. Inspect interacting code as necessary and run relevant checks without source-fixing options. Checks may generate normal ignored build or test artifacts; do not edit application source or configuration. Record actual results and limitations, including any browser verification still needed.
5. Each finding must include severity, file and location, concrete failure scenario, and suggested correction. State whether it blocks readiness and why; distinguish confirmed defects from questions and optional improvements. Recheck earlier findings before marking them resolved.
6. Store the scope, revision evidence, checks, findings, resolutions, and conclusion in each applicable detailed task document. Set review to `REVIEWED` only for tasks whose full current scope was reviewed with no blocking findings; do not change implementation or shipping merely to encode review completion. A narrow targeted review records its limited outcome without upgrading the whole task. A final consolidated review may set every fully covered task to `REVIEWED`. If a blocking defect disproves `VERIFIED`, set implementation to `IN_PROGRESS` and record the required correction while preserving truthful review and shipping history.

## Outputs and boundaries

Edit only review evidence and the distinct implementation/review fields in the applicable task documents and `docs/plan.md`. Do not modify application code or configuration, apply fixes, commit, or push. Summarize findings by severity, reviewed scope, and verification limits. Review freshness concerns source, tests, configuration, and acceptance changes; additions to review evidence itself do not invalidate their own review. Keep this skill available for optional targeted reviews and the final consolidated review; `DEFERRED` is not a successful review result.

For T00, an honestly documented absence of functional tests is an allowed initial tooling limitation, not a passing test suite or automatically a blocking defect. Check the configuration against its criteria. Do not recommend `passWithNoTests` to conceal the absence; T01 provides the first functional test-runner verification.
