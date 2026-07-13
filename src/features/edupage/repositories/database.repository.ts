import { config } from "@/config.ts";
import { TimetableDatabaseFetchFailed } from "@/features/timetable-database/errors/timetable-database.errors.ts";

export async function fetchEdupageTimetableDatabase(): Promise<string> {
  try {
    const response = await fetch(config.edupage.timetableDbUri, {
      body: serializeTimetableDatabaseRequest(new Date().getFullYear()),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      throw new TimetableDatabaseFetchFailed(
        new Error(`HTTP ${response.status.toString()}`)
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof TimetableDatabaseFetchFailed) throw error;
    throw new TimetableDatabaseFetchFailed(error);
  }
}

export function serializeTimetableDatabaseRequest(year: number): string {
  return JSON.stringify({
    __args: [
      null,
      year - 1,
      {},
      {
        needed_part: {
          classes: ["short", "name"],
          classrooms: ["short"],
          event_types: ["name"],
          subjects: ["short", "name"],
          teachers: ["short"],
        },
        op: "fetch",
      },
    ],
    __gsh: "00000000",
  });
}
