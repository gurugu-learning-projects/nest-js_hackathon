# 0001. Better Auth email password identity for the NestJS API

**Date**: 2026-07-30
**Status**: Proposed

## Summary

This project needs sign up, sign in, sign out, and a way for the API to know who is calling. We use Better Auth with email and password, cookie sessions, and NestJS wiring through `@thallesp/nestjs-better-auth`. Every new user gets role `PARTICIPANT`. Only a seed or direct database write can create an `ADMIN`. Role cannot be sent at sign up.

## Context

The NestJS API has Prisma and PostgreSQL in place, Arcjet for request security, and Better Auth env placeholders, but no identity layer. Without auth, every later feature that needs a user (hackathon participation, admin tools) has nowhere to attach.

The product needs two roles from day one: `PARTICIPANT` (default) and `ADMIN`. Sign up must not accept a client supplied role, or anyone could self promote. This slice is API only: clients call Better Auth HTTP routes and one Nest endpoint. No auth UI pages.

Build approach is not recorded in `AGENTS.md` or scope. This spec assumes Tracer Bullet slices (thin end to end path first, then harden).

## Requirements

**User stories**:
- As a new user, I want to sign up with email and password so that I can use the API as a participant.
- As a returning user, I want to sign in and call a protected endpoint so that the API knows who I am and what role I have.
- As an operator, I want one admin account created outside sign up so that admin work is possible without opening role elevation to the public.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: A new user can sign up with email, password, and name; the stored role is always `PARTICIPANT`.
- **AC-2**: Sign up rejects or ignores any attempt to set `role` from the client (`input: false` on the field).
- **AC-3**: A user with valid credentials can sign in and receives a Better Auth session cookie.
- **AC-4**: An authenticated client can call `GET /users/me` and receive user `id`, `email`, `name`, and `role` from the session.
- **AC-5**: Sign out clears the session; a later `GET /users/me` is unauthorized.
- **AC-6**: Unauthenticated `GET /users/me` is unauthorized.
- **AC-7**: An `ADMIN` user can be created via seed or script (not via public sign up).
- **AC-8**: `GET /` remains reachable without a session (anonymous health or hello).
- **AC-9**: After schema replace, Prisma generate and migrate succeed so Better Auth tables exist in PostgreSQL.

## Options considered

### Option 1: Better Auth with `@thallesp/nestjs-better-auth`

Use Better Auth for email and password, Prisma adapter, cookie sessions, and the community NestJS module for route mounting and a global AuthGuard.

**Pros**:
- Matches the stack and the NestJS integration guide already chosen
- Role as `additionalFields` with `input: false` fits the product rule cleanly

**Cons**:
- Community maintained Nest package (not first party Better Auth)
- Global guard means every new route must opt out if public

### Option 2: Passport local strategy in NestJS

Build credential auth with Passport, JWT or sessions, and hand written user tables.

**Pros**:
- Fully first party Nest ecosystem patterns

**Cons**:
- More custom code for hashing, sessions, CSRF, and rate limits
- Duplicates work Better Auth already solves

### Option 3: Hosted auth provider (Clerk, Auth0, or similar)

Outsource identity to a hosted service and validate tokens in Nest.

**Pros**:
- Less auth code to maintain

**Cons**:
- Extra vendor, cost, and network dependency for a hackathon API
- Role defaults and sign up rules still need app side enforcement

## Decision

**Chosen option**: Option 1: Better Auth with `@thallesp/nestjs-better-auth`

Adopt Better Auth email and password with Prisma on PostgreSQL, cookie sessions, Nest `AuthModule.forRoot`, body parser disabled, global AuthGuard, public Better Auth routes plus anonymous `GET /`, and `GET /users/me` for the session user including `role`.

**Implementation skills**: `create-auth` (`better-auth/skills`, `.agents/skills/create-auth/`) · `better-auth-best-practices` (`better-auth/skills`, `.agents/skills/better-auth-best-practices/`) · `better-auth-security-best-practices` (`better-auth/skills`, `.agents/skills/better-auth-security-best-practices/`) · `email-and-password-best-practices` (`better-auth/skills`, `.agents/skills/email-and-password-best-practices/`)

## Rationale

Better Auth is already the chosen library (env placeholders and project skills). The Nest integration package matches the guide the engineer linked and avoids hand wiring Express handlers. Passport would recreate session and credential plumbing. A hosted provider adds cost and coupling without buying much for an API only first slice.

Role as a Better Auth `additionalFields` entry with default `PARTICIPANT` and `input: false` is the smallest way to enforce "cannot set role at sign up" without a separate roles table. ADMIN via seed keeps elevation out of the public API for this slice.

## Feature design

**Data model sketch**:
- **user**: `id` string PK (Better Auth generated), `name` string required, `email` string unique required, `emailVerified` boolean, `image` string nullable, `role` string enum values `PARTICIPANT` | `ADMIN` default `PARTICIPANT` (not client input), `createdAt`, `updatedAt`
- **session**: `id` string PK, `expiresAt`, `token` unique, `userId` FK → user, `ipAddress` nullable, `userAgent` nullable, `createdAt`, `updatedAt`
- **account**: `id` string PK, `accountId`, `providerId`, `userId` FK → user, credential or OAuth token fields per Better Auth schema, `createdAt`, `updatedAt`
- **verification**: `id` string PK, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt` (present for Better Auth completeness; email verification is not required in this slice)
- **Removed**: starter Prisma `User` and `Post` models
- **Relationships**: user 1:N session, user 1:N account

**State transitions**:
- Session: absent → created on sign in or sign up session → cleared on sign out or expiry
- User role: created as `PARTICIPANT` → may become `ADMIN` only via seed or direct DB write (no runtime API)

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /api/auth/sign-up/email | POST | email, password, name (role not accepted) | user + session cookie | public | validation, duplicate email |
| /api/auth/sign-in/email | POST | email, password | user + session cookie | public | invalid credentials (generic) |
| /api/auth/sign-out | POST | session cookie | cleared cookie | session | unauthorized if no session |
| /api/auth/get-session | GET | session cookie | session + user (incl. role) | public (null if none) | none critical |
| /users/me | GET | session cookie | id, email, name, role | authenticated | 401 unauthorized |
| / | GET | none | hello or health string | anonymous | none |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Sign up | user.role = PARTICIPANT | Better Auth `user.additionalFields.role` default; `input: false` |
| Sign up | user.id | Better Auth / adapter id generation |
| Sign in | session cookie | Better Auth session store + cookie |
| GET /users/me | id, email, name, role | AuthGuard session user loaded from DB |
| Sign out | cleared session | Better Auth sign out deletes or invalidates session |
| Seed ADMIN | user.role = ADMIN | Seed or script writes DB (or Better Auth admin API internal to script), not public sign up |

**Key invariants**:
- Email is unique on `user`
- Every user created through public sign up has `role = PARTICIPANT`
- Clients cannot set `role` through Better Auth sign up input
- Protected Nest routes require a valid session unless marked `@AllowAnonymous()` or `@OptionalAuth()`
- Better Auth routes under `/api/auth/*` remain reachable for sign up and sign in

**Security model**:
- Roles: `PARTICIPANT` (default), `ADMIN` (seed or DB only in this slice)
- Public: `/api/auth/*` (Better Auth), `GET /`
- Authenticated: `GET /users/me` and all other Nest routes by default (global AuthGuard)
- No runtime role change endpoint
- Cookie sessions; trust origin from `BETTER_AUTH_URL` for now
- Rate limiting: Better Auth defaults (enabled in production)
- Email verification not required; no password reset in this slice
- Do not log emails, passwords, or session tokens

**Configuration required**:
- `BETTER_AUTH_SECRET`: signing and encryption secret (min 32 chars); validate at startup
- `BETTER_AUTH_URL`: public base URL of the API (e.g. `http://localhost:3000`); drives baseURL and trusted origin
- `DATABASE_URL`: already required; used by Prisma adapter
- `PORT`: already present

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: sign up → sign in → `GET /users/me` returns PARTICIPANT user fields → sign out → `GET /users/me` unauthorized, verifies **AC-1**, **AC-3**, **AC-4**, **AC-5**
- Failure case: sign up with an email that already exists returns Better Auth conflict or validation error without creating a second user, verifies **AC-1** (uniqueness) and Stage (f) duplicate handling
- Auth/permission: unauthenticated `GET /users/me` is 401; sign up body including `role: ADMIN` still stores `PARTICIPANT`, verifies **AC-2**, **AC-6**
- Seed: running the admin seed creates a user with `role = ADMIN`, verifies **AC-7**
- Smoke: `GET /` works without cookies after global guard is on, verifies **AC-8**
- Migrate: Prisma generate and migrate apply Better Auth tables, verifies **AC-9**

## Build plan

Ordered for Tracer Bullet (end to end auth path first). Migration first per confirmed data model.

1. Replace starter Prisma models with Better Auth user, session, account, and verification schema (including `role` on user); run Prisma generate and a fresh migrate, satisfies **AC-9**, **AC-1** (schema default)
2. Install `better-auth` and `@thallesp/nestjs-better-auth`; add `src/auth/auth.ts` with Prisma adapter, `emailAndPassword.enabled`, and `user.additionalFields.role` (`PARTICIPANT` | `ADMIN`, default `PARTICIPANT`, `input: false`), satisfies **AC-1**, **AC-2**
3. Validate `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in `src/config/env.ts`; wire `AuthModule.forRoot({ auth })` in `AppModule`; set `bodyParser: false` in `main.ts`, satisfies **AC-3** (runtime wiring)
4. Mark `GET /` with `@AllowAnonymous()`; add `GET /users/me` Nest controller using `@Session()` returning id, email, name, role, satisfies **AC-4**, **AC-6**, **AC-8**
5. Confirm sign out via Better Auth clears the session for a follow up `/users/me`, satisfies **AC-5**
6. Add a seed or script that creates one `ADMIN` user (document usage in README or script header), satisfies **AC-7**
7. Smoke check: sign up, sign in (cookie), `/users/me`, sign out, anonymous `/`, and `GET /api/auth/ok` if available, satisfies **AC-1** through **AC-9**

## Consequences

**Positive**:
- Identity exists for every later feature that needs a user
- Role rule is enforced at the auth field layer, not only by convention
- Nest guards and decorators give a clear pattern for protected routes

**Negative / tradeoffs**:
- Community Nest package may lag Better Auth releases
- Global AuthGuard means forgetting `@AllowAnonymous()` breaks public routes
- Dropping starter `User`/`Post` destroys any local demo rows

**Neutral**:
- Email verification and password reset are deferred
- Separate frontend origins need `trustedOrigins` later
- Runtime role promotion is deferred

## Follow-up

- [ ] When a browser frontend is added on another origin, extend trusted origins (and CORS with credentials) beyond `BETTER_AUTH_URL`
- [ ] Add a runtime ADMIN only role change API if product needs promotion without DB access
- [ ] Consider email verification and password reset once an email provider is real (mock was acceptable; not in this slice)
- [ ] `/sync`: record declined Agent Skills / MCP offer for `nestjs-better-auth`, extra NestJS skills, and `@better-auth/mcp` so later runs do not re offer them
- [ ] Capture auth conventions in `src/auth/AGENTS.md` after build (area scoped); keep root `AGENTS.md` to a one line pointer
- [ ] Record project build approach in `AGENTS.md` or scope (this spec assumed Tracer Bullet)
