import type { TimetableKeyDto } from "@/contracts/timetable.ts";
import type { TimetableDto } from "@/contracts/timetable.ts";

import { createCache } from "@/lib/cache.ts";

export function timetableCacheKey(key: TimetableKeyDto): string {
  return `${key.studyProgramId?.toString() ?? "all"}:${key.yearWeek.toString()}`;
}

export const timetableCache = createCache<TimetableDto, TimetableKeyDto>(
  timetableCacheKey
);
