import { EdupageFetchError } from "@/integrations/edupage/errors.ts";
import { config } from "@/lib/config";

export async function fetchEdupageTimetableDatabase(): Promise<string> {
  try {
    const response = await fetch(config.edupage.timetableDbUri, {
      body: serializeTimetableDatabaseRequest(new Date().getFullYear()),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      throw new EdupageFetchError(`HTTP ${response.status.toString()}`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof EdupageFetchError) throw error;
    throw new EdupageFetchError(
      error instanceof Error
        ? error.message
        : "Failed to fetch timetable database",
      error
    );
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
