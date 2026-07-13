import { Elysia } from "elysia";

import {
  getTimetableQuerySchema,
  toTimetableKeyDto,
} from "@/features/timetable/requests/get-timetable.request.ts";
import {
  timetableResponseSchema,
  toTimetableResponse,
} from "@/features/timetable/responses/timetable.response.ts";
import { getOrFetchTimetable } from "@/features/timetable/services/timetable.service.ts";

export const timetableRoutes = new Elysia().get(
  "/timetable",
  async ({ query }) =>
    toTimetableResponse(await getOrFetchTimetable(toTimetableKeyDto(query))),
  {
    detail: {
      summary: "Get the timetable data for a study program",
      tags: ["timetable"],
    },
    query: getTimetableQuerySchema,
    response: { 200: timetableResponseSchema },
  }
);
