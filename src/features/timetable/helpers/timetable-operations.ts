import type { TimetableEventDto } from "@/features/timetable/dtos/timetable-event.dto.ts";
import type { TimetableDto } from "@/features/timetable/dtos/timetable.dto.ts";

const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const satisfies readonly (keyof TimetableDto)[];

export function deduplicateTimetable(timetable: TimetableDto): void {
  for (const day of WEEK_DAYS) {
    const seen = new Map<number, TimetableEventDto>();
    for (const event of timetable[day]) {
      seen.set(event.id, event);
    }
    timetable[day] = [...seen.values()];
  }
}

export function emptyTimetable(): TimetableDto {
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

export function getWeekDays(timetable: TimetableDto): TimetableEventDto[][] {
  return WEEK_DAYS.map(day => timetable[day]);
}

export function mergeTimetables(
  target: TimetableDto,
  other: TimetableDto
): void {
  for (const day of WEEK_DAYS) {
    if (other[day].length > 0) {
      target[day].push(...other[day]);
    }
  }
}
