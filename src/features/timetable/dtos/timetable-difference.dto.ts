import type { TimetableEventDto } from "@/features/timetable/dtos/timetable-event.dto.ts";

// TODO: Detect "updated" events (e.g. same subject ID rescheduled or changed classrooms) instead of
// reporting them as "one removed + one added".
export interface TimetableDifferenceDto {
  newEvents: TimetableEventDto[];
  removedEvents: TimetableEventDto[];
}
