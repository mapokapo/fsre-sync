import { formatInTimeZone } from "date-fns-tz";

import type { TimetableDifferenceDto } from "@/features/timetable/dtos/timetable-difference.dto.ts";
import type { TimetableEventDto } from "@/features/timetable/dtos/timetable-event.dto.ts";

const MAX_DETAIL_LINES = 3;
const SUMMARY_MAX_LENGTH = 180;
/** Compact mobile push line: weekday + HH:mm in UTC (client TZ unknown). */
const EVENT_TIME_PATTERN = "EEE HH:mm";

export function buildDetailLines(difference: TimetableDifferenceDto): string[] {
  const lines: string[] = [];
  addDetails(difference.newEvents, "+", lines);
  addDetails(difference.removedEvents, "-", lines);
  return lines;
}

export function buildSummary(difference: TimetableDifferenceDto): string {
  if (
    difference.newEvents.length === 0 &&
    difference.removedEvents.length === 0
  ) {
    return "No timetable changes detected.";
  }

  const summaryParts = [
    formatCount(difference.newEvents.length, "added class"),
    formatCount(difference.removedEvents.length, "removed class"),
  ].filter(part => part.length > 0);

  const detailLines = buildDetailLines(difference);
  const summary = summaryParts.length > 0 ? `${summaryParts.join(", ")}.` : "";

  if (detailLines.length === 0) return summary;
  return summary
    ? `${summary} ${detailLines.join("; ")}`
    : detailLines.join("; ");
}

export function buildSummaryBody(difference: TimetableDifferenceDto): string {
  const lines = buildDetailLines(difference);
  return lines.length > 0 ? lines.join("\n") : buildSummary(difference);
}

export function buildSummaryTitle(difference: TimetableDifferenceDto): string {
  const parts: string[] = [];
  const { newEvents, removedEvents } = difference;

  if (newEvents.length > 0) {
    parts.push(
      `${newEvents.length.toString()} ${newEvents.length === 1 ? "new class" : "new classes"}`
    );
  }
  if (removedEvents.length > 0) {
    parts.push(`${removedEvents.length.toString()} removed`);
  }

  return parts.length > 0
    ? `Timetable: ${parts.join(" · ")}`
    : "Timetable updated";
}

export function trimLength(
  value: string,
  maxLength = SUMMARY_MAX_LENGTH
): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

function addDetails(
  events: TimetableEventDto[],
  prefix: string,
  lines: string[]
): void {
  const sorted = [...events].sort(
    (a, b) =>
      a.startDateTime.localeCompare(b.startDateTime) ||
      a.name.localeCompare(b.name)
  );

  for (const event of sorted) {
    if (lines.length >= MAX_DETAIL_LINES) break;
    lines.push(formatEventDetail(event, prefix));
  }
}

function formatCount(size: number, label: string): string {
  if (size === 0) return "";
  return `${size.toString()} ${label}${size === 1 ? "" : "es"}`;
}

function formatEventDetail(event: TimetableEventDto, prefix: string): string {
  const name = event.name || "Class";
  const timeLabel = event.startDateTime
    ? formatInTimeZone(new Date(event.startDateTime), "UTC", EVENT_TIME_PATTERN)
    : "time TBD";
  const room = event.classRoomNames[0];
  const location = room ? ` @${room}` : "";
  return `${prefix} ${name} ${timeLabel}${location}`;
}
