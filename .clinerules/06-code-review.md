# Code Review Rules

## General Principles

Write code as if it will be maintained for years.

Prefer readability over clever solutions.

Avoid unnecessary complexity.

---

## Existing Code

Prefer extending the existing implementation instead of rewriting it.

Follow the project's naming conventions.

Keep the current folder structure.

Reuse existing utilities whenever possible.

---

## Components

Keep components focused on a single responsibility.

Avoid very large components.

Extract reusable code only when it is actually reused.

---

## State

Do not mutate state.

Always use immutable updates.

Avoid duplicated state.

Keep state as local as possible.

---

## Types

Prefer explicit types.

Never use `any`.

Reuse existing domain models.

Avoid duplicated interfaces.

---

## Performance

Avoid unnecessary renders.

Avoid unnecessary effects.

Avoid unnecessary object recreation.

Prefer simple solutions unless optimization is clearly needed.

---

## Quality

Do not leave TODO comments.

Do not leave unused imports.

Do not leave unused variables.

Do not leave dead code.

Prefer small, reviewable changes.

---

## Before Finishing

Before completing a task, verify that:

- Only the required files were modified.
- No unrelated refactoring was performed.
- The implementation matches the requested scope.
- The project builds successfully.