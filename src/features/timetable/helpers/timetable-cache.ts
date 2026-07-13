import type { TimetableKeyDto } from "@/features/timetable/dtos/timetable-key.dto.ts";
import type { TimetableDto } from "@/features/timetable/dtos/timetable.dto.ts";

import { createCache } from "@/lib/cache.ts";

export function timetableCacheKey(key: TimetableKeyDto): string {
  return `${key.studyProgramId?.toString() ?? "all"}:${key.yearWeek.toString()}`;
}

export const timetableCache = createCache<TimetableDto, TimetableKeyDto>(
  timetableCacheKey
);
