import type { TimetableDatabaseDto } from "@/contracts/timetable-database.ts";

import { createCache } from "@/lib/cache.ts";

export const timetableDatabaseCache = createCache<TimetableDatabaseDto>(
  () => "__singleton__"
);
