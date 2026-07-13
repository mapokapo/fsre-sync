import { initializeFirebase } from "@/features/messaging/services/firebase.service.ts";
import {
  fetchTimetableDatabase,
  setTimetableDatabase,
} from "@/features/timetable-database/services/timetable-database.service.ts";
import {
  fetchTimetable,
  setTimetable,
} from "@/features/timetable/services/timetable.service.ts";
import { getActiveTimetableKeys } from "@/features/timing/services/refresh-timetables.service.ts";
import { logger } from "@/lib/logger.ts";

export async function runStartup(): Promise<void> {
  logger.info("Fetching timetable database...");
  const database = await fetchTimetableDatabase();
  setTimetableDatabase(database);
  logger.info("Timetable database fetched!");

  initializeFirebase();

  const keys = getActiveTimetableKeys(database.studyPrograms);

  logger.info(`Warming timetable cache for ${keys.length.toString()} keys...`);
  await Promise.all(
    keys.map(async key => {
      setTimetable(key, await fetchTimetable(key));
    })
  );
  logger.info("Timetable cache populated!");
}
