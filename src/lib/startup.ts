import { migrateToLatest } from "@/db/migrate.ts";
import {
  fetchTimetable,
  fetchTimetableDatabase,
  getActiveTimetableKeys,
  setTimetable,
  setTimetableDatabase,
} from "@/features/timetable";
import { initializeFirebase } from "@/integrations/firebase/firebase.service.ts";
import { logger } from "@/lib/logger.ts";

export async function runStartup(): Promise<void> {
  logger.info("Applying database migrations...");
  await migrateToLatest();

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
