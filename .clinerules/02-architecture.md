# Architecture Rules

## Folder Structure

Use the existing feature-based architecture.

Create new code inside the correct feature whenever possible.

Do not move files between features unless explicitly requested.

---

## State Management

Use the existing architecture:

- Local UI State → React
- Client State → Zustand
- Server State → TanStack Query
- Realtime → Supabase

Do not introduce additional state management solutions.

---

## Components

Keep components focused on a single responsibility.

Avoid large components.

Extract reusable UI only when it is actually reused.

---

## Types

Prefer existing types.

Avoid duplicated models.

Keep domain models inside their feature.

---

## Helpers

Create helper functions only when they have a clear reusable purpose.

Avoid unnecessary abstractions.

---

## Refactoring

Do not refactor unrelated code.

Do not rename files unless requested.

Do not reorganize folders unless requested.

Only touch the files required for the current task.