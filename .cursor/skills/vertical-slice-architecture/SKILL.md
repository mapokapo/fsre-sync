---
name: vertical-slice-architecture
description: Enforce strict vertical slice architecture (VSA) for TypeScript backends, especially Elysia projects. Use whenever the user is starting a new feature, adding a route/plugin, refactoring folder structure, asking where a file should live, or asking whether one feature is "allowed" to import from another. Defines exactly which folders may import from which others (features, contracts, integrations, orchestration, lib, db, plugins) and how to enforce those boundaries with dependency-cruiser instead of relying on memory or code review. Trigger this proactively any time a new top-level folder is proposed or an import crosses a feature boundary.
---

# Vertical Slice Architecture — strict layer rules

The goal: any feature can be added or deleted by deleting one folder, and no
feature needs to know another feature exists. This is enforced with a linter,
not with discipline — see [Enforcement](#enforcement).

## The layer graph

```
composition root (app.ts, lib/startup.ts, lib/cron.ts)
   │  may import anything
   ▼
orchestration/            ← only layer allowed to import 2+ features
   │  imports: features/*, contracts/
   ▼
features/*                ← independent, one folder per feature
   │  imports: contracts/, integrations/ (own), lib/, db/, plugins/
   ▼
integrations/*, contracts/, lib/, db/, plugins/     ← leaves
      import nothing above this line
```

Imports only ever point downward. Nothing below the line knows anything
above it exists. If you're about to add an import that points upward or
sideways across a feature boundary, stop — the thing you're reaching for
belongs in a different layer, not in the feature you're importing it into.

## The eight rules

1. **A feature never imports another feature.** No exceptions, no
   "just this once," no `A → B` with a promise that `B → A` won't happen
   later. If two features need the same thing, that thing doesn't belong
   in either of them.

2. **A feature exposes exactly one public entry point:**
   `features/{name}/index.ts`. Everything else in the folder
   (`services/`, `repositories/`, `dtos/`, `helpers/`, `errors/`,
   `requests/`, `responses/`) is private to that feature. Nothing outside
   the folder imports past `index.ts`.

3. **Don't abstract until the second consumer exists.** If only one
   feature needs something, it stays inside that feature even if it looks
   reusable. Moving it to a shared layer on spec, "because it'll probably
   be needed later," is how shared layers turn into junk drawers. Promote
   it the moment a second feature genuinely needs the same thing.

4. **`contracts/` is types only.** Interfaces and DTOs shared by 2+
   features/integrations. No runtime logic, no framework imports
   (no Elysia, no DB client), no side effects. It's the one folder that
   is safe for literally everything else to import, because it can never
   import anything back.

5. **`integrations/` holds adapters to things outside this codebase**
   (a third-party API, another internal service reached over HTTP, etc.).
   No `routes/` — it's not independently invocable, it's a client library.
   An integration never imports a feature. A feature may import an
   integration it owns; other features get at that integration's data
   only through the owning feature's public API, or through
   `orchestration/`.

6. **`orchestration/` is the only place allowed to import more than one
   feature.** A file here composes 2+ features' public entry points into
   a workflow (e.g. "on a new timetable event, resolve related messaging
   recipients and send a notification"). It contains sequencing and
   translation between features' contracts — no business logic that
   belongs to a single feature, and no `routes/` of its own; either a
   feature's route calls into it, or the composition root wires it
   directly into a cron job / event handler.

7. **`lib/`, `db/`, `plugins/` are generic infrastructure** — logger,
   config, cache, DB client, migrations, cross-cutting Elysia plugins
   (auth guard, rate limiter). Zero business/domain vocabulary lives
   here. They're importable from any layer, but they never import
   upward from `features/`, `orchestration/`, or `integrations/`. A
   plugin used by exactly one feature lives inside that feature's own
   `plugins/` subfolder, not in top-level `plugins/` — promote it only
   when a second feature needs it (see rule 3).

8. **The litmus test for "is this a feature":** does it have its own
   `routes/` (or another independent trigger — a queue consumer, a cron
   entry, a CLI command)? If not, it's not independently invocable, so
   it isn't a feature. It's `integrations/`, `orchestration/`, or `lib/`
   depending on what it does. A folder with no `routes/` sitting inside
   `features/` is the single most common VSA violation — it accumulates
   imports from real features because nothing stops it, since it was
   never actually a peer to them.

## Folder layout

```
src/
├── features/
│   ├── {feature-name}/
│   │   ├── index.ts          # public entry point — the ONLY importable file
│   │   ├── routes/           # required — see rule 8
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── dtos/
│   │   ├── requests/
│   │   ├── responses/
│   │   ├── errors/
│   │   ├── helpers/
│   │   └── plugins/          # feature-local Elysia plugins (rule 7)
│   └── ...
├── orchestration/
│   └── {workflow-name}.ts    # composes 2+ features, imported by composition root
├── contracts/
│   └── {shared-type}.ts      # types only — rule 4
├── integrations/
│   └── {external-system}/    # adapters, no routes/ — rule 5
├── lib/                      # generic infra, framework glue
├── db/                       # shared client + migrations
├── plugins/                  # Elysia plugins used by 2+ features
└── app.ts                    # composition root
```

## Elysia-specific pattern: one feature = one plugin

`features/{name}/index.ts` exports a single named Elysia plugin. This is
the direct analogue of the "one public entry point" rule and lines up with
how Elysia's `.use()` composition already works — no extra machinery
needed.

```ts
// features/messaging/index.ts
import { Elysia } from 'elysia';
import { messagingRoutes } from './routes/messaging.routes';
import { createMessagingService } from './services/messaging.service';

export const messagingFeature = new Elysia({ name: 'messaging' })
  .decorate('messagingService', createMessagingService())
  .use(messagingRoutes);
```

```ts
// app.ts — composition root, the only file allowed to see every feature
import { Elysia } from 'elysia';
import { messagingFeature } from './features/messaging';
import { timetableFeature } from './features/timetable';
import { registerReminderWorkflow } from './orchestration/reminders';

const app = new Elysia()
  .use(messagingFeature)
  .use(timetableFeature);

registerReminderWorkflow(app); // wires cross-feature workflow via orchestration/
```

For a feature that needs data owned by another feature's persistence layer
(the classic `timetable` ↔ `timetable-database` situation), don't import
across the boundary — invert it with a structurally-typed interface defined
where it's consumed, and satisfy it at the composition root:

```ts
// features/timetable/services/timetable.service.ts
interface EventRepository {
  getEventsInRange(start: Date, end: Date): Promise<TimetableEvent[]>;
}
export function createTimetableService(repo: EventRepository) { /* ... */ }
```

```ts
// app.ts
import { createEventRepository } from './features/timetable-database/repositories/event.repository';
import { createTimetableService } from './features/timetable/services/timetable.service';

const timetableService = createTimetableService(createEventRepository(db));
```

`timetable` never imports `timetable-database`, or vice versa. Only the
composition root knows both exist.

## Enforcement

None of this holds under memory alone — TypeScript's `import`/`export`
gives you zero directionality control. Enforce it with
[dependency-cruiser](https://github.com/sverweij/dependency-cruiser) in
CI. Copy the template from
[references/dependency-cruiser.config.cjs](references/dependency-cruiser.config.cjs)
to `dependency-cruiser.config.cjs` at the project root (adjust path
constants if your `src/` layout differs). It checks:

- no feature imports another feature
- nothing outside a feature imports past its `index.ts`
- `contracts/` never imports anything (true leaf)
- `integrations/` never imports `features/`
- only `orchestration/` may import more than one feature
- `lib/`, `db/`, `plugins/` never import `features/`, `orchestration/`,
  or `integrations/`

### Bun and TypeScript

dependency-cruiser is a **Node.js CLI** — it does not run inside the Bun
runtime. That is fine: invoke it with `bunx depcruise` (Bun projects) or
`npx depcruise` (npm/pnpm/yarn). The config file **must stay CommonJS**
(`.cjs` with `module.exports`) because dependency-cruiser loads configs
through Node's module system; do not convert it to ESM or Bun-native syntax.

For TypeScript resolution, the template sets `tsConfig.fileName` and
`tsPreCompilationDeps: true` so type-only imports and path aliases are
visible to the linter.

For Bun **runtime** projects (code executed with `bun run`), add Bun
built-ins to `options.builtInModules.add` in the config, or run
`depcruise --init` once in the repo — it detects Bun and seeds the right
built-in list. Imports like `bun:sqlite` are then treated as core modules
instead of missing dependencies.

Install as a dev dependency: `bun add -d dependency-cruiser` or
`npm install --save-dev dependency-cruiser`.

Wire scripts in `package.json` (use `bunx` or `npx` to match your package
manager):

```json
{
  "scripts": {
    "arch:check": "depcruise --config dependency-cruiser.config.cjs --output-type err src",
    "arch:graph": "depcruise --config dependency-cruiser.config.cjs --output-type dot src | dot -T svg > architecture.svg"
  }
}
```

Run `arch:check` in CI on every PR. A violation should fail the build, the
same way a type error does — this is what actually makes the boundary
permanent instead of aspirational.
