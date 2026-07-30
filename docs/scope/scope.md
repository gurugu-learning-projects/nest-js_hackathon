# Scope: Hackathon API

NestJS API for a hackathon product. Identity first, then domain features.

**Build approach:** Tracer Bullet (thin end to end slices through every layer).
**Workflow:** Medium (after develop: check verify, then test).

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Better Auth email password | Foundation | in-progress |

## Foundations

### 1. Better Auth email password · in-progress
Sign up, sign in, sign out, and a session protected who am I endpoint. Roles are `PARTICIPANT` (default) and `ADMIN` (seed only). Role cannot be set at sign up.
**Done when:** a user can register and sign in with email and password, `GET /users/me` returns id, email, name, and role, sign out clears the session, and an ADMIN can be created via seed.
- [x] Design it (spec): `/architect better auth email password`
- [ ] Build it: `/develop better auth email password`
   - [ ] Schema replace + Prisma generate and migrate (AC-1, AC-9)
   - [ ] Better Auth config + Nest AuthModule wiring (AC-1, AC-2, AC-3)
   - [ ] `GET /users/me`, anonymous `GET /`, sign out path (AC-4, AC-5, AC-6, AC-8)
   - [ ] ADMIN seed or script + end to end smoke (AC-7, AC-1..9)
- [ ] Verify it: `/check verify better auth email password`
- [ ] Test it: `/test better auth email password`
Spec [0001](../specs/0001-better-auth-email-password.md) · code (filled by /develop)

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Separate frontend trusted origins**: CORS and Better Auth trusted origins for another origin · from spec 0001
- **Runtime role promotion API**: ADMIN only endpoint to change roles · from spec 0001
- **Email verification and password reset**: once a real email provider exists · from spec 0001

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`.

**Feature lifecycle**: `planned` → `in-progress` → `done` (plus `existing` / `dropped`).

- **Next step** = the first unticked box.
- **Atomic build tasks** live in the spec `## Build plan`, not here.
- **Pointer line**: spec link from `/architect`, code path from `/develop`.
