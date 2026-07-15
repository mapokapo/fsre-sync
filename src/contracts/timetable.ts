import type { TimetableEventDto } from "@/contracts/timetable-event.ts";
import type { YearWeek } from "@/primitives/year-week.ts";

// TODO: Detect "updated" events (e.g. same subject ID rescheduled or changed classrooms) instead of
// reporting them as "one removed + one added".
export interface TimetableDifferenceDto {
  newEvents: TimetableEventDto[];
  removedEvents: TimetableEventDto[];
}

export interface TimetableDto {
  friday: TimetableEventDto[];
  monday: TimetableEventDto[];
  saturday: TimetableEventDto[];
  sunday: TimetableEventDto[];
  thursday: TimetableEventDto[];
  tuesday: TimetableEventDto[];
  wednesday: TimetableEventDto[];
}

export interface TimetableKeyDto {
  studyProgramId: null | number;
  yearWeek: YearWeek;
}
