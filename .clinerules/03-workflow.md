# Workflow Rules

## Before Coding

Read the relevant files.

Understand the current implementation before making changes.

Do not make assumptions about missing functionality.

---

## Scope

Only implement the requested task.

Do not expand the scope.

Do not add "nice-to-have" improvements.

If something is unclear, ask before coding.

---

## Code Style

Write clean and readable code.

Prefer small functions.

Keep naming consistent with the existing project.

Avoid unnecessary comments.

---

## Safety

Do not delete files.

Do not change routing unless requested.

Do not change Supabase schema unless requested.

Do not create new API endpoints unless requested.

Do not install packages unless requested.

Do not perform git operations such as:

- commit
- push
- reset
- checkout
- restore
- merge

unless explicitly requested.

---

## Build

Run:

npm run build

Only fix build errors caused by the current task.

---

## Task Summary

At the end of every task, return only:

- Created/modified files
- Short summary
- Build result