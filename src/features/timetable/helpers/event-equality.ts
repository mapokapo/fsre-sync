import type { TimetableEventDto } from "@/features/timetable/dtos/timetable-event.dto.ts";

const EVENT_EQUALITY_KEYS = [
  "id",
  "department",
  "type",
  "year",
  "name",
  "startDateTime",
  "endDateTime",
  "directions",
  "studyProgramIds",
  "classRoomIds",
  "teacherIds",
  "studyProgramNames",
  "classRoomNames",
  "teacherNames",
] as const satisfies readonly (keyof TimetableEventDto)[];

export function eventsEqual(a: TimetableEventDto, b: TimetableEventDto): boolean {
  return EVENT_EQUALITY_KEYS.every((key) => {
    const left = a[key];
    const right = b[key];

    if (Array.isArray(left) || Array.isArray(right)) {
      if (!Array.isArray(left) || !Array.isArray(right)) return false;
      if (left.length !== right.length) return false;
      return left.every((value, index) => value === right[index]);
    }

    return left === right;
  });
}
