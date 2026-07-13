import type { TimetableDatabaseDto } from "@/features/timetable-database/dtos/timetable-database.dto.ts";

import { createCache } from "@/lib/cache.ts";

export const timetableDatabaseCache = createCache<TimetableDatabaseDto>(
  () => "__singleton__",
);
