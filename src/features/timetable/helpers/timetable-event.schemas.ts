import { z } from "zod";

import {
  TIMETABLE_EVENT_DEPARTMENTS,
  TIMETABLE_EVENT_TYPES,
  TIMETABLE_EVENT_YEARS,
} from "@/features/timetable/helpers/timetable-event.types.ts";

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
