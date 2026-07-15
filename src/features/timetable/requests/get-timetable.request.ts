import { z } from "zod";

import type { TimetableKeyDto } from "@/contracts/timetable.ts";

import { InvalidIsoWeekError } from "@/features/timetable/errors/timetable.errors.ts";
import {
  OPENAPI_ISO_WEEK_EXAMPLE,
  OPENAPI_STUDY_PROGRAM_ID_EXAMPLE,
} from "@/lib/openapi.ts";
import { YearWeek } from "@/primitives/year-week.ts";

export const getTimetableQuerySchema = z.object({
  isoWeek: z
    .string()
    .regex(/^\d{4}-W\d{2}$/)
    .meta({
      description: "ISO 8601 week identifier",
      examples: [OPENAPI_ISO_WEEK_EXAMPLE],
    }),
  studyProgram: z.coerce
    .number()
    .optional()
    .meta({
      description:
        "Study program ID; omit to merge timetables for all programs",
      examples: [OPENAPI_STUDY_PROGRAM_ID_EXAMPLE],
    }),
});

export type GetTimetableQuery = z.infer<typeof getTimetableQuerySchema>;

export function toTimetableKeyDto(query: GetTimetableQuery): TimetableKeyDto {
  let yearWeek: YearWeek;
  try {
    yearWeek = YearWeek.parse(query.isoWeek);
  } catch {
    throw new InvalidIsoWeekError(query.isoWeek);
  }

  return {
    studyProgramId: query.studyProgram ?? null,
    yearWeek,
  };
}
