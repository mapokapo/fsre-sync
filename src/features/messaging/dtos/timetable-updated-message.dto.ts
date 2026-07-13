import type { TimetableDifferenceDto } from "@/features/timetable/dtos/timetable-difference.dto.ts";
import type { TimetableKeyDto } from "@/features/timetable/dtos/timetable-key.dto.ts";

export interface TimetableUpdatedMessageDto {
  difference: TimetableDifferenceDto;
  timetableKey: TimetableKeyDto;
}
