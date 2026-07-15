import type { TimetableDatabaseDto } from "@/contracts/timetable-database.ts";

import {
  TimetableDatabaseFetchFailed,
  TimetableDatabaseNotLoaded,
  TimetableDatabaseParseFailed,
} from "@/features/timetable/errors/timetable-database.errors.ts";
import { timetableDatabaseCache } from "@/features/timetable/helpers/timetable-database-cache.ts";
import {
  EdupageFetchError,
  EdupageParseError,
} from "@/integrations/edupage/errors.ts";
import { parseEdupageTimetableDatabase } from "@/integrations/edupage/helpers/database.parser.ts";
import { fetchEdupageTimetableDatabase } from "@/integrations/edupage/repositories/database.repository.ts";

export async function fetchTimetableDatabase(): Promise<TimetableDatabaseDto> {
  try {
    const body = await fetchEdupageTimetableDatabase();
    return parseEdupageTimetableDatabase(body);
  } catch (error) {
    if (error instanceof EdupageParseError) {
      throw new TimetableDatabaseParseFailed(error);
    }
    if (error instanceof EdupageFetchError) {
      throw new TimetableDatabaseFetchFailed(error);
    }
    throw error;
  }
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
