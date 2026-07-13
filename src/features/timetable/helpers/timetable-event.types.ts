export const TIMETABLE_EVENT_DEPARTMENTS = [
  "COMPUTER_SCIENCE",
  "ELECTRICAL_ENGINEERING",
  "MECHANICAL_ENGINEERING",
] as const;

export const TIMETABLE_EVENT_TYPES = [
  "LECTURE",
  "EXERCISE",
  "LECTURE_AND_EXERCISE",
  "LABS",
] as const;

export const TIMETABLE_EVENT_YEARS = [
  "FIRST",
  "SECOND",
  "THIRD",
  "FOURTH",
  "FIFTH",
] as const;

export type TimetableEventDepartment =
  (typeof TIMETABLE_EVENT_DEPARTMENTS)[number];

export type TimetableEventType = (typeof TIMETABLE_EVENT_TYPES)[number];

export type TimetableEventYear = (typeof TIMETABLE_EVENT_YEARS)[number];
