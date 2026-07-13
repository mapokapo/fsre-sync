import { z } from "zod";

import type { TimetableDto } from "@/features/timetable/dtos/timetable.dto.ts";

import {
  timetableEventDepartmentSchema,
  timetableEventTypeSchema,
  timetableEventYearSchema,
} from "@/features/timetable/helpers/timetable-event.schemas.ts";

const timetableEventResponseSchema = z
  .object({
    classRoomIds: z.array(z.number()).meta({
      description: "Edupage classroom IDs where the event takes place",
      examples: [[42, 43]],
    }),
    classRoomNames: z.array(z.string()).meta({
      description: "Human-readable classroom names, parallel to classRoomIds",
      examples: [["Room A1", "Room A2"]],
    }),
    department: timetableEventDepartmentSchema.nullable().meta({
      description:
        "Faculty department for the event, or null when not applicable",
      examples: ["COMPUTER_SCIENCE", null],
    }),
    directions: z.array(z.string()).nullable().meta({
      description:
        "Study directions or tracks for the event, or null when not applicable",
      examples: [["Software Engineering"], null],
    }),
    endDateTime: z.iso.datetime().meta({
      description: "Event end time in UTC",
      examples: ["2024-03-15T10:00:00.000Z"],
    }),
    id: z.number().meta({
      description: "Edupage event identifier",
      examples: [12345],
    }),
    name: z.string().meta({
      description: "Subject or event title",
      examples: ["Mathematics"],
    }),
    startDateTime: z.iso.datetime().meta({
      description: "Event start time in UTC",
      examples: ["2024-03-15T10:00:00.000Z"],
    }),
    studyProgramIds: z.array(z.number()).meta({
      description: "Study program IDs the event belongs to",
      examples: [[-54]],
    }),
    studyProgramNames: z.array(z.string()).meta({
      description:
        "Human-readable study program names, parallel to studyProgramIds",
      examples: [["Computer Science"]],
    }),
    teacherIds: z.array(z.number()).meta({
      description: "Edupage teacher IDs assigned to the event",
      examples: [[101]],
    }),
    teacherNames: z.array(z.string()).meta({
      description:
        "Human-readable teacher names, parallel to teacherIds",
      examples: [["Jane Doe"]],
    }),
    type: timetableEventTypeSchema,
    year: timetableEventYearSchema.nullable().meta({
      description: "Target study year for the event, or null when not applicable",
      examples: ["FIRST", null],
    }),
  })
  .meta({ description: "A single timetable event" });

const dayEventsSchema = z.array(timetableEventResponseSchema).meta({
  description: "Events scheduled on this day of the week",
  examples: [[]],
});

export const timetableResponseSchema = z
  .object({
    friday: dayEventsSchema,
    monday: dayEventsSchema,
    saturday: dayEventsSchema,
    sunday: dayEventsSchema,
    thursday: dayEventsSchema,
    tuesday: dayEventsSchema,
    wednesday: dayEventsSchema,
  })
  .meta({ description: "Weekly timetable grouped by day of week" });

export type TimetableResponse = z.infer<typeof timetableResponseSchema>;

export function toTimetableResponse(dto: TimetableDto): TimetableResponse {
  return dto;
}
