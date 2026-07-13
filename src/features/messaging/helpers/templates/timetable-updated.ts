import { format } from "date-fns";

import type { TimetableUpdatedMessageDto } from "@/features/messaging/dtos/timetable-updated-message.dto.ts";
import type { TimetableEventDto } from "@/features/timetable/dtos/timetable-event.dto.ts";

import { buildSummary } from "@/features/messaging/services/summary-formatter.service.ts";

export function buildTimetableUpdatedEmailHtml(
  message: TimetableUpdatedMessageDto
): string {
  const summary = buildSummary(message.difference);
  const newEvents = message.difference.newEvents
    .map(event => formatEventHtml(event, true))
    .join("");
  const removedEvents = message.difference.removedEvents
    .map(event => formatEventHtml(event, false))
    .join("");

  return (
    "<h1>Timetable updated</h1>" +
    "<p>Your timetable has been updated. The following changes have been made:</p>" +
    `<p><strong>Summary:</strong> ${summary}</p>` +
    `<h4>New events:</h4><ul>${newEvents}</ul>` +
    `<h4>Removed events:</h4><ul>${removedEvents}</ul>`
  );
}

function formatEventHtml(event: TimetableEventDto, isNew: boolean): string {
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  const bg = isNew ? "0, 255" : "255, 0";

  const lines = [
    `<li>Duration: ${format(start, "HH:mm")} - ${format(end, "HH:mm")}</li>`,
    `<li>Date: ${format(start, "EEE, dd MMM")}</li>`,
    formatListItem("Teacher", event.teacherNames),
    formatListItem("Class room", event.classRoomNames),
    formatListItem("Study program", event.studyProgramNames),
  ].filter(Boolean);

  return `<li style="background-color: rgba(${bg}, 0, 0.1); padding: 1rem;"><strong>${event.name}</strong><ul>${lines.join("")}</ul></li>`;
}

function formatListItem(label: string, names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return `<li>${label}: ${names[0] ?? ""}</li>`;
  return `<li>${label}s: ${names.join(", ")}</li>`;
}
