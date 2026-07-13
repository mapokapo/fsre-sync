# Tests

Tests mirror the `src/` layout (Java-style), for example:

- `src/features/edupage/helpers/parsing.ts` →
  `test/features/edupage/helpers/parsing.test.ts`
- `src/lib/year-week.ts` → `test/lib/year-week.test.ts`

Run the suite with:

```bash
bun test
```

No test files exist yet. This folder is reserved for a future testing pass.

## Conventions

**Keep production function signatures clean.** Do not add optional dependency
parameters for testability. Use Bun's built-in tooling instead.

### Pure code

Helpers with no I/O (parsers, diff, `YearWeek`, Zod mappers in `requests/` /
`responses/`) are tested directly — import and assert. No setup.

### Services

Use [`mock.module`](https://bun.sh/docs/cli/test#mock-modules) from `bun:test`
to replace imported modules (repositories, caches, notification senders) with
fakes. Service functions stay unchanged.

```typescript
import { mock } from "bun:test";

mock.module(
  "@/features/messaging/repositories/messaging.repository.ts",
  () => ({
    findByStudyProgramId: async () => [/* fixture */],
  })
);
```

### Repositories

Use `createDb(':memory:')` from [`db/client.ts`](../src/db/client.ts), run
migrations, then either:

- call repository functions after
  `mock.module('@/db/client', () => ({ getDb: () => testDb }))`, or
- test repository logic against the in-memory Kysely instance directly in
  integration-style tests.

Do not open a file-backed SQLite database in tests.

### Caches

Generic factory: [`lib/cache.ts`](../src/lib/cache.ts) — `createCache` with a
`keyMapper`:

- `(key: K) => string` → keyed cache (`get`/`set`/`has`/`delete` take `K`)
- `() => string` → singleton slot (`get`/`set`/`has`/`clear`, no key arg)

```typescript
import { createCache } from "@/lib/cache.ts";
import { timetableCacheKey } from "@/features/timetable/helpers/timetable-cache.ts";

const cache = createCache<TimetableDto, TimetableKeyDto>(timetableCacheKey);
const slot = createCache<TimetableDatabaseDto>(() => "__singleton__");
```

Feature modules export a production singleton (one-liner over `createCache`);
see [`timetable-cache.ts`](../src/features/timetable/helpers/timetable-cache.ts)
and
[`timetable-database-cache.ts`](../src/features/timetable-database/helpers/timetable-database-cache.ts).
For isolated instances in tests, call `createCache` with the same `keyMapper`,
or `mock.module` the feature helper.

Caches are ephemeral by design — never persist to disk.

### HTTP layer

- `requests/*.ts` — Zod schema + `to*Dto()` mapper (request → service DTO). Test
  mappers without HTTP.
- `responses/*.ts` — Zod schema + `to*Response()` mapper (DTO → response). Test
  mappers without HTTP.

DTO files stay mapping-free (service layer only).

### Email / Firebase

Mail transport and Firebase are lazy-initialized (not at import time). In tests,
`mock.module` the service module or stub the transport before calling send
functions.
