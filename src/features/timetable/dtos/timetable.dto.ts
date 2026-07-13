import type { TimetableEventDto } from "@/features/timetable/dtos/timetable-event.dto.ts";

export interface TimetableDto {
  friday: TimetableEventDto[];
  monday: TimetableEventDto[];
  saturday: TimetableEventDto[];
  sunday: TimetableEventDto[];
  thursday: TimetableEventDto[];
  tuesday: TimetableEventDto[];
  wednesday: TimetableEventDto[];
}
