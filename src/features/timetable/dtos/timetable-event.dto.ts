import type {
  TimetableEventDepartment,
  TimetableEventType,
  TimetableEventYear,
} from "@/features/timetable/helpers/timetable-event.types.ts";

export interface TimetableEventDto {
  classRoomIds: number[];
  classRoomNames: string[];
  department: null | TimetableEventDepartment;
  directions: null | string[];
  endDateTime: string;
  id: number;
  name: string;
  startDateTime: string;
  studyProgramIds: number[];
  studyProgramNames: string[];
  teacherIds: number[];
  teacherNames: string[];
  type: TimetableEventType;
  year: null | TimetableEventYear;
}
