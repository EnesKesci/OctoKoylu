# OctoKöylü - Product Requirements Document

Version: 1.0
Status: Draft
Owner: Tech Lead & Frontend Developer

---

# 1. Product Vision

OctoKöylü is a mobile-first Progressive Web Application that helps moderators organize and manage Vampir Köylü (Werewolf) games quickly, reliably and with minimal manual effort.

The primary goal is to reduce the time required to start a game.

Current process:
3–5 minutes

Target:
Less than 1 minute

---

# 2. Problem Statement

Today, moderators spend too much time on repetitive tasks:

- Creating player list
- Assigning roles manually
- Waiting for everyone
- Checking readiness
- Explaining who is in the game

This reduces actual play time.

OctoKöylü eliminates these manual steps.

---

# 3. Target Users

Primary Users

- Office teams
- Friend groups
- Communities playing Vampir Köylü

Typical Room Size

8–14 players

---

# 4. User Roles

## Moderator

Can:

- Create room
- Share invitation link
- View participants
- View ready status
- Select role template
- Configure custom roles
- Randomize roles
- Edit randomized roles
- Confirm role distribution

---

## Player

Can:

- Create profile
- Join room
- Mark themselves ready
- View only their own role

Players can never see another player's role.

---

# 5. MVP Scope

Included

✅ Local profile creation

✅ Room creation

✅ Invite link

✅ Join room

✅ Lobby

✅ Ready system

✅ Role templates

✅ Manual role configuration

✅ Random role distribution

✅ Moderator confirmation

✅ Player role screen

Not Included

❌ AI generated avatars

❌ Night phase management

❌ Game history

❌ Statistics

❌ Voice effects

❌ Notifications

---

# 6. User Flow

Moderator

Open App

↓

Create Profile (first launch only)

↓

Home

↓

Create Room

↓

Lobby

↓

Select Roles

↓

Randomize

↓

Review

↓

Confirm

↓

Players receive roles

---

Player

Open Invite Link

↓

Create Profile (if needed)

↓

Lobby

↓

Ready

↓

Receive Role

---

# 7. Screens

## Home

Purpose

Main entry screen.

Actions

- Create Room
- Edit Profile

---

## Profile

Purpose

Create or edit local profile.

Fields

- Display Name
- Avatar

---

## Lobby

Purpose

Display joined players.

Moderator sees:

- Room name
- Invite link
- Ready count
- Participant list
- Start role assignment

Players see:

- Joined players
- Ready button

---

## Role Configuration

Moderator can:

- Use template
- Configure manually
- Randomize
- Edit assignments
- Confirm

---

## My Role

Player sees only:

- Assigned role
- Role description
- Continue button

---

# 8. Non Functional Requirements

Application must be:

- Mobile First
- Responsive
- Fast
- Simple
- Dark Theme
- Touch Friendly

---

# 9. Technical Goals

Frontend

React

TypeScript

Tailwind

shadcn/ui

Zustand

TanStack Query

Supabase

Architecture

Feature Based

Reusable

Scalable

Production Ready

---

# 10. Success Criteria

The MVP is successful when:

- 8–14 players can join a room.
- Moderator can assign roles.
- Players receive only their own role.
- A complete game setup takes under one minute.