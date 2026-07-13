import type {
  TimetableEventDepartment,
  TimetableEventType,
  TimetableEventYear,
} from "@/features/timetable/helpers/timetable-event.types.ts";

const YEAR_REGEX = /.*-?(\s*)?(\d)\.? ?(godina|god).*?$/;
const UNDERGRADUATE = "preddiplomsk";
const DIRECTION_REGEX = /^.+(godina, |god |god\.)(smjer|modul)?(.+)$/;
const TYPE_REGEX = /.*-(\s*)?(P|V|P\+V|V\+P)(\s*)?$/;

export function determineTimetableEventDepartment(
  studyProgramName: string
): null | TimetableEventDepartment {
  const lower = studyProgramName.toLowerCase();
  if (lower.includes("računarstv")) return "COMPUTER_SCIENCE";
  if (lower.includes("elektrotehnik")) return "ELECTRICAL_ENGINEERING";
  if (lower.includes("strojarstv")) return "MECHANICAL_ENGINEERING";
  return null;
}

export function determineTimetableEventDirections(
  studyProgramNames: string[]
): (null | string)[] {
  const matches = studyProgramNames.map(name => {
    if (!DIRECTION_REGEX.test(name)) return null;
    const extracted = name.replace(DIRECTION_REGEX, "$3").trim();
    const cleaned = extracted.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    return cleaned.length === 0 ? null : cleaned;
  });
  return [...new Set(matches)];
}

export function determineTimetableEventType(
  subject: string
): TimetableEventType {
  const typeCode = subject.replace(TYPE_REGEX, "$2");
  switch (typeCode) {
    case "P+V":
    case "V+P":
      return "LECTURE_AND_EXERCISE";
    case "V":
      return "EXERCISE";
    default:
      return "LECTURE";
  }
}

export function determineTimetableEventYear(
  studyProgramName: string
): null | TimetableEventYear {
  if (!YEAR_REGEX.test(studyProgramName)) return null;

  const yearDigit = studyProgramName.replace(YEAR_REGEX, "$2");
  const isUndergrad = studyProgramName.toLowerCase().includes(UNDERGRADUATE);

  switch (yearDigit) {
    case "1":
      return isUndergrad ? "FIRST" : "FOURTH";
    case "2":
      return isUndergrad ? "SECOND" : "FIFTH";
    case "3":
      return "THIRD";
    case "4":
      return "FOURTH";
    case "5":
      return "FIFTH";
    default:
      return null;
  }
}
