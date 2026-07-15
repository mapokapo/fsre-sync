import { Elysia } from "elysia";

import {
  timetableDatabaseResponseSchema,
  toTimetableDatabaseResponse,
} from "@/features/timetable/responses/timetable-database.response.ts";
import { getTimetableDatabase } from "@/features/timetable/services/timetable-database.service.ts";

export const timetableDatabaseRoutes = new Elysia().get(
  "/timetable-database",
  () => toTimetableDatabaseResponse(getTimetableDatabase()),
  {
    detail: {
      summary:
        "Get the timetable definitions database for the current study year",
      tags: ["timetable-database"],
    },
    response: { 200: timetableDatabaseResponseSchema },
  }
);
