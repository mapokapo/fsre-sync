import type { TimetableDatabaseDto } from "@/features/timetable-database/dtos/timetable-database.dto.ts";

import { parseEdupageTimetableDatabase } from "@/features/edupage/helpers/database.parser.ts";
import { fetchEdupageTimetableDatabase } from "@/features/edupage/repositories/database.repository.ts";
import { TimetableDatabaseNotLoaded } from "@/features/timetable-database/errors/timetable-database.errors.ts";
import { timetableDatabaseCache } from "@/features/timetable-database/helpers/timetable-database-cache.ts";

export async function fetchTimetableDatabase(): Promise<TimetableDatabaseDto> {
  const body = await fetchEdupageTimetableDatabase();
  return parseEdupageTimetableDatabase(body);
}

export function getTimetableDatabase(): TimetableDatabaseDto {
  const database = timetableDatabaseCache.get();
  if (!database) {
    throw new TimetableDatabaseNotLoaded();
  }
  return database;
}

export function setTimetableDatabase(database: TimetableDatabaseDto): void {
  timetableDatabaseCache.set(database);
}
