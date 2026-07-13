import type { YearWeek } from "@/lib/year-week.ts";

export interface TimetableKeyDto {
  studyProgramId: null | number;
  yearWeek: YearWeek;
}
