import { getDay, parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import type { TimetableDatabaseDto } from "@/contracts/timetable-database.ts";
import type { TimetableEventDto } from "@/contracts/timetable-event.ts";
import type { TimetableDto } from "@/contracts/timetable.ts";

import { EdupageParseError } from "@/integrations/edupage/errors.ts";
import {
  determineTimetableEventDepartment,
  determineTimetableEventDirections,
  determineTimetableEventType,
  determineTimetableEventYear,
} from "@/integrations/edupage/helpers/parsing.ts";

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
    if (error instanceof EdupageParseError) throw error;
    throw new EdupageParseError(
      error instanceof Error ? error.message : "Failed to parse timetable",
      error
    );
  }
}

function edupageDateTimeToUtcIso(date: string, time: string): string {
  const local = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return fromZonedTime(local, EDUPAGE_TIMEZONE).toISOString();
}

function emptyTimetable(): TimetableDto {
  return {
    friday: [],
    monday: [],
    saturday: [],
    sunday: [],
    thursday: [],
    tuesday: [],
    wednesday: [],
  };
}

function lookupStudyProgramName(
  database: TimetableDatabaseDto,
  id: number
): null | string {
  return (
    database.studyPrograms.find(program => program.id === id)?.name ?? null
  );
}

function parseIds(ids: string[] | undefined): number[] {
  return (ids ?? []).filter(id => id.length > 0).map(Number);
}
