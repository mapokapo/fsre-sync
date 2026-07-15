export type TimetableEventDepartment =
  "COMPUTER_SCIENCE" | "ELECTRICAL_ENGINEERING" | "MECHANICAL_ENGINEERING";

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

export type TimetableEventType =
  "EXERCISE" | "LABS" | "LECTURE" | "LECTURE_AND_EXERCISE";

export type TimetableEventYear =
  "FIFTH" | "FIRST" | "FOURTH" | "SECOND" | "THIRD";
