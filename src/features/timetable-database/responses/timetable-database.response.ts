import { z } from "zod";

import type { TimetableDatabaseDto } from "@/features/timetable-database/dtos/timetable-database.dto.ts";

import {
  timetableEventDepartmentSchema,
  timetableEventYearSchema,
} from "@/features/timetable/helpers/timetable-event.schemas.ts";
import { OPENAPI_STUDY_PROGRAM_ID_EXAMPLE } from "@/lib/openapi.ts";

const idNamePairNumberSchema = z
  .object({
    id: z.number().meta({
      description: "Edupage numeric identifier",
      examples: [42],
    }),
    name: z.string().meta({
      description: "Human-readable label",
      examples: ["Room A1"],
    }),
  })
  .meta({ description: "Numeric ID paired with a display name" });

const idNamePairStringSchema = z
  .object({
    id: z.string().meta({
      description: "Edupage string identifier",
      examples: ["lec"],
    }),
    name: z.string().meta({
      description: "Human-readable label",
      examples: ["Lecture"],
    }),
  })
  .meta({ description: "String ID paired with a display name" });

const studyProgramResponseSchema = z
  .object({
    department: timetableEventDepartmentSchema,
    direction: z
      .string()
      .nullable()
      .meta({
        description: "Study direction or track, or null when not applicable",
        examples: ["Software Engineering", null],
      }),
    id: z.number().meta({
      description: "Edupage study program identifier",
      examples: [OPENAPI_STUDY_PROGRAM_ID_EXAMPLE],
    }),
    name: z.string().meta({
      description: "Study program display name",
      examples: ["Computer Science"],
    }),
    studyYear: timetableEventYearSchema,
  })
  .meta({ description: "A study program offered at the faculty" });

export const timetableDatabaseResponseSchema = z
  .object({
    classRooms: z.array(idNamePairNumberSchema).meta({
      description: "All classrooms referenced by the timetable",
      examples: [[{ id: 42, name: "Room A1" }]],
    }),
    eventTypes: z.array(idNamePairStringSchema).meta({
      description: "All event types used in the timetable",
      examples: [[{ id: "lec", name: "Lecture" }]],
    }),
    studyPrograms: z.array(studyProgramResponseSchema).meta({
      description: "All study programs for the current academic year",
      examples: [
        [
          {
            department: "COMPUTER_SCIENCE",
            direction: "Software Engineering",
            id: OPENAPI_STUDY_PROGRAM_ID_EXAMPLE,
            name: "Computer Science",
            studyYear: "FIRST",
          },
        ],
      ],
    }),
    subjects: z.array(idNamePairNumberSchema).meta({
      description: "All subjects referenced by the timetable",
      examples: [[{ id: 7, name: "Mathematics" }]],
    }),
    teachers: z.array(idNamePairNumberSchema).meta({
      description: "All teachers referenced by the timetable",
      examples: [[{ id: 101, name: "Jane Doe" }]],
    }),
  })
  .meta({
    description: "Reference data mapping Edupage IDs to human-readable names",
  });

export type TimetableDatabaseResponse = z.infer<
  typeof timetableDatabaseResponseSchema
>;

export function toTimetableDatabaseResponse(
  dto: TimetableDatabaseDto
): TimetableDatabaseResponse {
  return dto;
}
