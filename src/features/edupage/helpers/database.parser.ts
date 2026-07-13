import type {
  IdNamePairDto,
  StudyProgramDto,
  TimetableDatabaseDto,
} from "@/features/timetable-database/dtos/timetable-database.dto.ts";

import {
  determineTimetableEventDepartment,
  determineTimetableEventDirections,
  determineTimetableEventYear,
} from "@/features/edupage/helpers/parsing.ts";
import { TimetableDatabaseParseFailed } from "@/features/timetable-database/errors/timetable-database.errors.ts";
import { logger } from "@/lib/logger.ts";

interface EdupageDatabaseResponse {
  r?: { tables?: { data_rows?: EdupageRow[] }[] };
}

interface EdupageRow {
  id?: number | string;
  name?: string;
  short?: string;
}

const EDUPAGE_DATABASE_TABLE = {
  CLASS_ROOMS: 2,
  EVENT_TYPES: 4,
  STUDY_PROGRAMS: 3,
  SUBJECTS: 1,
  TEACHERS: 0,
} as const;

export function parseEdupageTimetableDatabase(
  body: string
): TimetableDatabaseDto {
  try {
    const tables =
      (JSON.parse(body) as EdupageDatabaseResponse).r?.tables ?? [];

    const studyPrograms = parseLongIdNamePairs(
      tables[EDUPAGE_DATABASE_TABLE.STUDY_PROGRAMS]?.data_rows ?? [],
      false
    )
      .map((pair): null | StudyProgramDto => {
        const studyYear = determineTimetableEventYear(pair.name);
        const department = determineTimetableEventDepartment(pair.name);

        if (!studyYear || !department) {
          logger.warn(`Could not parse study program: ${pair.name}`);
          return null;
        }

        return {
          department,
          direction: determineTimetableEventDirections([pair.name])[0] ?? null,
          id: pair.id,
          name: pair.name,
          studyYear,
        };
      })
      .filter((p): p is StudyProgramDto => p !== null);

    return {
      classRooms: parseLongIdNamePairs(
        tables[EDUPAGE_DATABASE_TABLE.CLASS_ROOMS]?.data_rows ?? [],
        true
      ),
      eventTypes: parseStringIdNamePairs(
        tables[EDUPAGE_DATABASE_TABLE.EVENT_TYPES]?.data_rows ?? []
      ),
      studyPrograms,
      subjects: parseLongIdNamePairs(
        tables[EDUPAGE_DATABASE_TABLE.SUBJECTS]?.data_rows ?? [],
        false
      ),
      teachers: parseLongIdNamePairs(
        tables[EDUPAGE_DATABASE_TABLE.TEACHERS]?.data_rows ?? [],
        true
      ),
    };
  } catch (error) {
    throw new TimetableDatabaseParseFailed(error);
  }
}

function parseLongIdNamePairs(
  rows: EdupageRow[],
  useShortName: boolean
): IdNamePairDto<number>[] {
  return rows
    .filter(row => row.id != null)
    .map(row => ({
      id: Number(row.id),
      name: (useShortName ? row.short : row.name) ?? "",
    }));
}

function parseStringIdNamePairs(rows: EdupageRow[]): IdNamePairDto<string>[] {
  return rows
    .filter(row => row.id != null)
    .map(row => ({ id: String(row.id), name: row.name ?? "" }));
}
