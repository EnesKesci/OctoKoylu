# OctoKöylü Project Rules

## Project

OctoKöylü is a mobile-first web application that helps Vampire Village (Vampir Köylü) moderators distribute roles quickly and manage game lobbies.

Current project status:

- MVP development
- Frontend-first
- Future-proof architecture

---

## Tech Stack

- React
- TypeScript
- Vite
- Zustand
- TanStack Query
- Tailwind CSS v4
- shadcn/ui
- Supabase

---

## Technology Rules

- Use TypeScript strict typing.
- Never use `any`.
- Use `import type` when appropriate.
- Use existing project utilities before creating new ones.
- Do not introduce new dependencies unless explicitly requested.
- Use existing shadcn/ui components before creating custom UI components.
- Use Tailwind utilities instead of writing custom CSS whenever possible.

---

## MVP Scope

The project is currently focused only on role distribution.

Current MVP includes:

- Role catalog
- Role templates
- Manual role configuration
- Role validation
- Random role assignment
- Moderator preview
- Role confirmation
- Player role screen
- Vampire teammates visibility

The following features are NOT part of the current MVP:

- Night actions
- Doctor protection
- Detective investigation
- Sniper shooting
- Silencer ability
- Vampire target voting
- Godfather night decision
- Day voting
- Win conditions

Do not implement MVP-out-of-scope features unless explicitly requested.