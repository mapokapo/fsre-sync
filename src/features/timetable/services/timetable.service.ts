import type { TimetableDatabaseDto } from "@/contracts/timetable-database.ts";
import type { TimetableKeyDto } from "@/contracts/timetable.ts";
import type { TimetableDto } from "@/contracts/timetable.ts";

import {
  TimetableFetchFailed,
  TimetableParseFailed,
} from "@/features/timetable/errors/timetable.errors.ts";
import {
  lookupName,
  lookupStudyProgramName,
} from "@/features/timetable/helpers/lookups.ts";
import { timetableCache } from "@/features/timetable/helpers/timetable-cache.ts";
import {
  deduplicateTimetable,
  getWeekDays,
  mergeTimetables,
} from "@/features/timetable/helpers/timetable-operations.ts";
import { getTimetableDatabase } from "@/features/timetable/services/timetable-database.service.ts";
import {
  EdupageFetchError,
  EdupageParseError,
} from "@/integrations/edupage/errors.ts";
import { parseEdupageTimetable } from "@/integrations/edupage/helpers/timetable.parser.ts";
import { fetchEdupageTimetable } from "@/integrations/edupage/repositories/timetable.repository.ts";

export async function fetchTimetable(
  key: TimetableKeyDto
): Promise<TimetableDto> {
  const database = getTimetableDatabase();
  const studyProgramIds =
    key.studyProgramId != null
      ? [key.studyProgramId]
      : database.studyPrograms.map(p => p.id);

  const timetables = await Promise.all(
    studyProgramIds.map(id => fetchTimetableForProgram(id, key, database))
  );

  const combined = timetables.reduce<TimetableDto | undefined>(
    (acc, current) => {
      if (!acc) return current;
      mergeTimetables(acc, current);
      return acc;
    },
    undefined
  );

  if (!combined) throw new TimetableFetchFailed();

  deduplicateTimetable(combined);
  return combined;
}

export async function getOrFetchTimetable(
  key: TimetableKeyDto
): Promise<TimetableDto> {
  const cached = getTimetable(key);
  if (cached) return cached;

  const timetable = await fetchTimetable(key);
  setTimetable(key, timetable);
  return timetable;
}

export function getTimetable(key: TimetableKeyDto): TimetableDto | undefined {
  return timetableCache.get(key);
}

export function setTimetable(
  key: TimetableKeyDto,
  timetable: TimetableDto
): void {
  timetableCache.set(key, timetable);
}

function enrichTimetable(
  timetable: TimetableDto,
  database: TimetableDatabaseDto
): TimetableDto {
  for (const event of getWeekDays(timetable).flat()) {
    event.teacherNames = event.teacherIds
      .map(id => lookupName(database.teachers, id))
      .filter((name): name is string => name != null);
    event.classRoomNames = event.classRoomIds
      .map(id => lookupName(database.classRooms, id))
      .filter((name): name is string => name != null);
    event.studyProgramNames = event.studyProgramIds
      .map(id => lookupStudyProgramName(database, id))
      .filter((name): name is string => name != null);
  }
  return timetable;
}

async function fetchTimetableForProgram(
  studyProgramId: number,
  key: TimetableKeyDto,
  database: TimetableDatabaseDto
): Promise<TimetableDto> {
  try {
    const body = await fetchEdupageTimetable(studyProgramId, key.yearWeek);
    const timetable = parseEdupageTimetable(body, database);
    return enrichTimetable(timetable, database);
  } catch (error) {
    if (error instanceof EdupageParseError) {
      throw new TimetableParseFailed(error);
    }
    if (error instanceof EdupageFetchError) {
      throw new TimetableFetchFailed(error);
    }
    throw error;
  }
}
