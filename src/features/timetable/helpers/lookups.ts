import type {
  IdNamePairDto,
  TimetableDatabaseDto,
} from "@/contracts/timetable-database.ts";

export function lookupName<T extends number | string>(
  list: IdNamePairDto<T>[],
  id: T
): null | string {
  return list.find(pair => pair.id === id)?.name ?? null;
}

export function lookupStudyProgramName(
  database: TimetableDatabaseDto,
  id: number
): null | string {
  return (
    database.studyPrograms.find(program => program.id === id)?.name ?? null
  );
}
