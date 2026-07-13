import { getDay, parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import type { TimetableDatabaseDto } from "@/features/timetable-database/dtos/timetable-database.dto.ts";
import type { TimetableEventDto } from "@/features/timetable/dtos/timetable-event.dto.ts";
import type { TimetableDto } from "@/features/timetable/dtos/timetable.dto.ts";

import {
  determineTimetableEventDepartment,
  determineTimetableEventDirections,
  determineTimetableEventType,
  determineTimetableEventYear,
} from "@/features/edupage/helpers/parsing.ts";
import { lookupStudyProgramName } from "@/features/timetable-database/helpers/lookups.ts";
import { TimetableParseFailed } from "@/features/timetable/errors/timetable.errors.ts";
import { emptyTimetable } from "@/features/timetable/helpers/timetable-operations.ts";

const DAY_BY_INDEX = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const satisfies readonly (keyof TimetableDto)[];

interface EdupageTimetableItem {
  classids?: string[];
  classroomids?: string[];
  date?: string;
  endtime?: string;
  name?: string;
  starttime?: string;
  subjectid?: string;
  teacherids?: string[];
  type?: string;
}

interface EdupageTimetableResponse {
  r?: { ttitems?: EdupageTimetableItem[] };
}

const EDUPAGE_TIMEZONE = "Europe/Sarajevo";

export function parseEdupageTimetable(
  body: string,
  database: TimetableDatabaseDto
): TimetableDto {
  try {
    const items =
      (JSON.parse(body) as EdupageTimetableResponse).r?.ttitems ?? [];
    const timetable = emptyTimetable();

    for (const item of items) {
      if (item.type !== "event") continue;
      if (
        !item.date ||
        !item.starttime ||
        !item.endtime ||
        !item.name ||
        !item.subjectid
      ) {
        continue;
      }

      const studyProgramIds = parseIds(item.classids);
      const studyProgramNames = studyProgramIds.map(
        id => lookupStudyProgramName(database, id) ?? ""
      );
      const firstProgramName = studyProgramNames[0] ?? "";
      const directions = determineTimetableEventDirections(
        studyProgramNames
      ).filter((d): d is string => d !== null);

      const event: TimetableEventDto = {
        classRoomIds: parseIds(item.classroomids),
        classRoomNames: [],
        department: determineTimetableEventDepartment(firstProgramName),
        directions: directions.length > 0 ? directions : null,
        endDateTime: edupageDateTimeToUtcIso(item.date, item.endtime),
        id: Number(item.subjectid),
        name: item.name,
        startDateTime: edupageDateTimeToUtcIso(item.date, item.starttime),
        studyProgramIds,
        studyProgramNames: [],
        teacherIds: parseIds(item.teacherids),
        teacherNames: [],
        type: determineTimetableEventType(item.name),
        year: determineTimetableEventYear(firstProgramName),
      };

      const dayField =
        DAY_BY_INDEX[getDay(new Date(`${item.date}T12:00:00Z`))] ?? "monday";
      timetable[dayField].push(event);
    }

    return timetable;
  } catch (error) {
    throw new TimetableParseFailed(error);
  }
}

function edupageDateTimeToUtcIso(date: string, time: string): string {
  const local = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return fromZonedTime(local, EDUPAGE_TIMEZONE).toISOString();
}

function parseIds(ids: string[] | undefined): number[] {
  return (ids ?? []).filter(id => id.length > 0).map(Number);
}
