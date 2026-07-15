import type { StudyProgramDto } from "@/contracts/timetable-database.ts";
import type {
  TimetableDifferenceDto,
  TimetableDto,
  TimetableKeyDto,
} from "@/contracts/timetable.ts";

import { eventsEqual } from "@/features/timetable/helpers/event-equality.ts";
import { getWeekDays } from "@/features/timetable/helpers/timetable-operations.ts";
import { YearWeek } from "@/primitives/year-week.ts";

const activeWeekCount = 2;

// TODO: Detect "updated" events (e.g. same subject ID rescheduled or changed classrooms) instead of
// reporting them as "one removed + one added".
export function diffTimetables(
  existing: TimetableDto,
  updated: TimetableDto
): TimetableDifferenceDto {
  const existingEvents = getWeekDays(existing).flat();
  const updatedEvents = getWeekDays(updated).flat();

  const newEvents = updatedEvents.filter(
    event => !existingEvents.some(e => eventsEqual(e, event))
  );
  const removedEvents = existingEvents.filter(
    event => !updatedEvents.some(e => eventsEqual(e, event))
  );

  return { newEvents, removedEvents };
}

export function getActiveTimetableKeys(
  programs: StudyProgramDto[],
  weekCount = activeWeekCount
): TimetableKeyDto[] {
  const start = YearWeek.now();
  const weeks = Array.from({ length: weekCount }, (_, index) =>
    start.plusWeeks(index)
  );

  return programs.flatMap(program =>
    weeks.map(yearWeek => ({ studyProgramId: program.id, yearWeek }))
  );
}
