import { z } from "zod";

import type { TimetableEventDepartment } from "@/contracts/timetable-event.ts";
import type { TimetableEventType } from "@/contracts/timetable-event.ts";
import type { TimetableEventYear } from "@/contracts/timetable-event.ts";

export const TIMETABLE_EVENT_DEPARTMENTS = [
  "COMPUTER_SCIENCE",
  "ELECTRICAL_ENGINEERING",
  "MECHANICAL_ENGINEERING",
] as const satisfies readonly TimetableEventDepartment[];

export const TIMETABLE_EVENT_TYPES = [
  "LECTURE",
  "EXERCISE",
  "LECTURE_AND_EXERCISE",
  "LABS",
] as const satisfies readonly TimetableEventType[];

export const TIMETABLE_EVENT_YEARS = [
  "FIRST",
  "SECOND",
  "THIRD",
  "FOURTH",
  "FIFTH",
] as const satisfies readonly TimetableEventYear[];

export const timetableEventDepartmentSchema = z
  .enum(TIMETABLE_EVENT_DEPARTMENTS)
  .meta({
    description: "Faculty department the event belongs to",
    examples: ["COMPUTER_SCIENCE"],
  });

export const timetableEventTypeSchema = z.enum(TIMETABLE_EVENT_TYPES).meta({
  description: "Kind of scheduled teaching activity",
  examples: ["LECTURE"],
});

export const timetableEventYearSchema = z.enum(TIMETABLE_EVENT_YEARS).meta({
  description: "Study year the event is intended for",
  examples: ["FIRST"],
});
