import type { TimetableDatabaseDto } from "@/features/timetable-database/dtos/timetable-database.dto.ts";
import type { TimetableKeyDto } from "@/features/timetable/dtos/timetable-key.dto.ts";
import type { TimetableDto } from "@/features/timetable/dtos/timetable.dto.ts";

import { parseEdupageTimetable } from "@/features/edupage/helpers/timetable.parser.ts";
import { fetchEdupageTimetable } from "@/features/edupage/repositories/timetable.repository.ts";
import {
  lookupName,
  lookupStudyProgramName,
} from "@/features/timetable-database/helpers/lookups.ts";
import { getTimetableDatabase } from "@/features/timetable-database/services/timetable-database.service.ts";
import { TimetableFetchFailed } from "@/features/timetable/errors/timetable.errors.ts";
import { timetableCache } from "@/features/timetable/helpers/timetable-cache.ts";
import {
  deduplicateTimetable,
  getWeekDays,
  mergeTimetables,
} from "@/features/timetable/helpers/timetable-operations.ts";

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
  const body = await fetchEdupageTimetable(studyProgramId, key.yearWeek);
  const timetable = parseEdupageTimetable(body, database);
  return enrichTimetable(timetable, database);
}
