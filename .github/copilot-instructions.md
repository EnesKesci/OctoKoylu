# OctoKöylü Engineering Handbook

## Project Vision

OctoKöylü is a mobile-first Progressive Web App that helps moderators run Werewolf (Vampir Köylü) games quickly and reliably.

Primary goals:

- Excellent mobile experience
- Fast game setup
- Simple user experience
- Clean architecture
- Long-term maintainability

Never optimize for visual complexity over usability.

---

# Engineering Principles

Always prioritize:

- Readability
- Simplicity
- Scalability
- Maintainability

Follow:

- KISS
- DRY
- YAGNI

Avoid premature optimization.

---

# Architecture

Use Feature-Based Architecture.

Example:

src/

    app/

    features/

    shared/

Do not organize by component type.

Avoid creating large global folders containing unrelated code.

---

# React

Prefer:

- Functional Components
- Composition over inheritance
- Small reusable components

Avoid:

- Large JSX files
- Business logic inside UI
- Deep prop drilling

---

# State Management

Use local state for local UI.

Use Zustand for global client state.

Use TanStack Query for server state.

Never mix server state with client state.

---

# Styling

Use:

- Tailwind CSS
- shadcn/ui

Avoid:

- CSS Modules
- styled-components
- custom CSS unless necessary

Always design mobile first.

---

# TypeScript

Never use any.

Prefer explicit types.

Create shared domain models when reused.

Use interfaces for domain entities.

---

# Components

A component should have a single responsibility.

Extract reusable UI when duplication appears.

Keep components focused.

Prefer composition.

---

# Folder Structure

Each feature owns:

- components
- hooks
- services
- types

Keep shared code inside shared/.

Do not create unnecessary abstractions.

---

# Imports

Prefer absolute imports if configured.

Keep imports organized.

Remove unused imports.

---

# Naming

Components:

PascalCase

Hooks:

useSomething

Functions:

camelCase

Constants:

UPPER_SNAKE_CASE only for true constants.

---

# Error Handling

Fail gracefully.

Handle loading states.

Handle empty states.

Handle error states.

Avoid silent failures.

---

# Performance

Avoid unnecessary re-renders.

Memoize only when needed.

Optimize after measuring.

---

# Accessibility

Use semantic HTML.

Buttons should always be real buttons.

Inputs should have labels.

---

# AI Workflow

Before generating code:

1. Understand the task.
2. Analyze existing architecture.
3. Reuse existing patterns.
4. Produce production-ready code.
5. Explain major decisions when useful.

Never generate placeholder architecture that will immediately need replacement.

Always assume this project will grow.