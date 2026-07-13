import type { YearWeek } from "@/lib/year-week.ts";

import { config } from "@/config.ts";
import { TimetableFetchFailed } from "@/features/timetable/errors/timetable.errors.ts";

export async function fetchEdupageTimetable(
  studyProgramId: number,
  yearWeek: YearWeek,
): Promise<string> {
  try {
    const response = await fetch(config.edupage.timetableUri, {
      body: serializeTimetableRequest(studyProgramId, yearWeek),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      throw new TimetableFetchFailed(
        new Error(`HTTP ${response.status.toString()}`),
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof TimetableFetchFailed) throw error;
    throw new TimetableFetchFailed(error);
  }
}

export function serializeTimetableRequest(
  studyProgramId: number,
  yearWeek: YearWeek,
): string {
  const academicYear =
    yearWeek.getWeek() <= 26 ? yearWeek.getYear() - 1 : yearWeek.getYear();

  return JSON.stringify({
    __args: [
      null,
      {
        datefrom: yearWeek.atDay(1).toISOString().slice(0, 10),
        dateto: yearWeek.atDay(7).toISOString().slice(0, 10),
        id: studyProgramId.toString(),
        table: "classes",
        year: academicYear,
      },
    ],
    __gsh: "00000000",
  });
}
