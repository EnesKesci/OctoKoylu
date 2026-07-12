# Product Rules

## Product Vision

OctoKöylü is a mobile-first web application designed to help Vampire Village (Vampir Köylü) moderators create games and distribute roles as quickly as possible.

Every implementation should prioritize simplicity, speed and maintainability.

---

## UX Principles

Always minimize the number of clicks required by the moderator.

Prefer sensible defaults over empty states.

Manual configuration should always start from the default role template.

Do not introduce unnecessary dialogs or confirmation steps.

Keep the moderator workflow fast and intuitive.

---

## Product Decisions

Player count is always calculated excluding the moderator.

Default role templates are the starting point for every room.

Manual role configuration edits the default template instead of creating a new one from scratch.

Only the moderator can configure and distribute roles.

---

## Current MVP Scope

The current MVP focuses only on role distribution.

Included:

- Role catalog
- Default role templates
- Manual role configuration
- Role validation
- Random role assignment
- Moderator preview
- Role confirmation
- Player role screen
- Vampire teammates visibility

Not included:

- Night actions
- Doctor protection
- Detective investigation
- Sniper shooting
- Silencer ability
- Vampire target voting
- Godfather night decision
- Day voting
- Win conditions

Do not implement features outside the current MVP unless explicitly requested.

---

## Current Milestone

v0.5.0 — Role Configuration

Current focus:

- Role catalog
- Role templates
- Manual role configuration
- Role validation

Do not implement future milestones unless explicitly requested.