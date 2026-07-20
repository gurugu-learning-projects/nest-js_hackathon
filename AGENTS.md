# js-mastery__hackathon

## Stack

- **Language / Runtime**: TypeScript 5.7, Node.js
- **Framework**: NestJS 11 with Express
- **Key dependencies**: RxJS 7, Reflect Metadata, Jest 30, Supertest 7
- **Package manager**: npm

## Build approach

<TBD, set by /scope>

## Commands

```bash
npm install
npm run start:dev
npm run build
npm test
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.

## Rules

- Keep strict TypeScript types. Do not use `any`, and model all expected cases explicitly.
- Organize code by feature. Keep each NestJS module, controller, service, types, and tests together.
- Give each class one reason to change. Keep classes focused and extract responsibilities as they grow.
- Depend on small abstractions. Wire concrete dependencies through NestJS constructor injection.
- Prefer composition over inheritance. Do not use service locators or global dependency registries.
- Extend behavior with new classes or composition when practical, without weakening existing contracts.
- Use one consistent error handling pattern across controllers and services.
- Validate environment variables when the application starts.
- Follow consistent NestJS and TypeScript naming conventions.
- Use conventional commit messages.

## Tooling

- Keep ESLint and Prettier as the linting and formatting tools.
- Before every commit, run lint, format checks, and TypeScript checks.
- Use Jest for unit and integration tests.
- Continuous integration must run lint, type checks, and tests on every push.

## Agent skills

- [architect](.agents/skills/architect/): `JavaScript-Mastery-Pro/skills`, records architecture decisions and specifications.
- [audit](.agents/skills/audit/): `JavaScript-Mastery-Pro/skills`, maintains project context files.
- [check](.agents/skills/check/): `JavaScript-Mastery-Pro/skills`, verifies changes in the real application.
- [debug](.agents/skills/debug/): `JavaScript-Mastery-Pro/skills`, finds and fixes root causes.
- [develop](.agents/skills/develop/): `JavaScript-Mastery-Pro/skills`, implements approved features and tooling.
- [document](.agents/skills/document/): `JavaScript-Mastery-Pro/skills`, writes change documents for people.
- [scope](.agents/skills/scope/): `JavaScript-Mastery-Pro/skills`, maintains product scope.
- [sync](.agents/skills/sync/): `JavaScript-Mastery-Pro/skills`, keeps durable project knowledge current.
- [test](.agents/skills/test/): `JavaScript-Mastery-Pro/skills`, creates test suites for changed behavior.

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
