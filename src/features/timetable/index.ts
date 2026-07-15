import { Elysia } from "elysia";

import { timetableDatabaseRoutes } from "@/features/timetable/routes/timetable-database.routes.ts";
import { timetableRoutes } from "@/features/timetable/routes/timetable.routes.ts";

export {
  fetchTimetableDatabase,
  getTimetableDatabase,
  setTimetableDatabase,
} from "@/features/timetable/services/timetable-database.service.ts";
export {
  diffTimetables,
  getActiveTimetableKeys,
} from "@/features/timetable/services/timetable-diff.service.ts";
export {
  fetchTimetable,
  getOrFetchTimetable,
  getTimetable,
  setTimetable,
} from "@/features/timetable/services/timetable.service.ts";

export const timetableFeature = new Elysia({ name: "timetable" })
  .use(timetableDatabaseRoutes)
  .use(timetableRoutes);
