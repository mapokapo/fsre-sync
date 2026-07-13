import type {
  TimetableEventDepartment,
  TimetableEventYear,
} from "@/features/timetable/helpers/timetable-event.types.ts";

export interface IdNamePairDto<T extends number | string> {
  id: T;
  name: string;
}

export interface StudyProgramDto {
  department: TimetableEventDepartment;
  direction: null | string;
  id: number;
  name: string;
  studyYear: TimetableEventYear;
}

export interface TimetableDatabaseDto {
  classRooms: IdNamePairDto<number>[];
  eventTypes: IdNamePairDto<string>[];
  studyPrograms: StudyProgramDto[];
  subjects: IdNamePairDto<number>[];
  teachers: IdNamePairDto<number>[];
}
