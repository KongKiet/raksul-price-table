---
name: task-plan
description: Create or revise a detailed plan for a task ID in this repository's task index, without implementing the task.
---

# Task plan

## Input and context

Ordinary invocation: `$task-plan T02`. Accept a task ID and optional context refining the current request.

Resolve all paths from the repository root. Read `AGENTS.md`, `docs/plan.md`, `docs/assignment.md`, `docs/decisions.md`, and any applicable nested instructions. Follow `AGENTS.md` instead of restating its project rules. Resolve the task by ID and use `docs/tasks/<ID>.md` for its detailed document. Ask only for essential information that cannot be resolved from the repository or current conversation; do not require the user to repeat documented requirements.

## Workflow

1. Inspect the working tree and existing task document before editing. Read relevant code and configuration, dependency-task documents, and the documented visual reference when available.
2. Check dependency capabilities and evidence, not just status labels. Record missing prerequisites as blockers to implementation; planning may proceed with those dependencies explicit.
3. Create the detailed task document if absent, deriving its content from the index, assignment, and decisions. Preserve existing user content and useful evidence when updating it. Additional context may narrow the immediate work but must not silently remove acceptance criteria.
4. Write the goal, acceptance criteria, dependencies, scope and non-goals, relevant files, implementation steps, test cases, risks, separately labeled assumptions, and unresolved blockers. Include places for progress, verification, review, and shipping evidence so the document supports handoff across sessions.
5. When the plan is ready, set implementation to `PLANNED` in the task document and index. For a new task, initialize review to `PENDING` and shipping to `NOT_SHIPPED`. If essential information prevents a usable plan, record what is missing and do not claim planning is complete. Preserve existing implementation, review, and shipping history when replanning an active, reviewed, committed, or shipped task.

## Outputs and boundaries

Produce `docs/tasks/<ID>.md` and the corresponding index update; update `docs/decisions.md` only for a material planning assumption that needs recording. Summarize the plan, dependencies, and unresolved inputs. Only edit planning documents. Do not implement, install packages, commit, or push.

For T00, plan tooling verification honestly even if no functional tests exist yet. Do not propose `passWithNoTests` to manufacture a passing check. T01 supplies the first functional verification of the test runner.
