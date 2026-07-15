import type {
  TimetableDifferenceDto,
  TimetableKeyDto,
} from "@/contracts/timetable.ts";

export interface TimetableUpdatedMessageDto {
  difference: TimetableDifferenceDto;
  timetableKey: TimetableKeyDto;
}
