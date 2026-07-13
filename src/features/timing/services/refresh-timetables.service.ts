import type { MessagingSubscriptionDto } from "@/features/messaging/dtos/messaging-subscription.dto.ts";
import type { StudyProgramDto } from "@/features/timetable-database/dtos/timetable-database.dto.ts";
import type { TimetableDifferenceDto } from "@/features/timetable/dtos/timetable-difference.dto.ts";
import type { TimetableKeyDto } from "@/features/timetable/dtos/timetable-key.dto.ts";
import type { TimetableDto } from "@/features/timetable/dtos/timetable.dto.ts";

import { ServiceError } from "@/features/common/errors/service.error.ts";
import * as messagingService from "@/features/messaging/services/messaging.service.ts";
import { getTimetableDatabase } from "@/features/timetable-database/services/timetable-database.service.ts";
import { eventsEqual } from "@/features/timetable/helpers/event-equality.ts";
import { getWeekDays } from "@/features/timetable/helpers/timetable-operations.ts";
import {
  fetchTimetable,
  getTimetable,
  setTimetable,
} from "@/features/timetable/services/timetable.service.ts";
import { logger } from "@/lib/logger.ts";
import { YearWeek } from "@/lib/year-week.ts";

const activeWeekCount = 2;

// TODO: Detect "updated" events (e.g. same subject ID rescheduled or changed classrooms) instead of
// reporting them as "one removed + one added".
export function diffTimetables(
  existing: TimetableDto,
  updated: TimetableDto
): TimetableDifferenceDto {
  const existingEvents = getWeekDays(existing).flat();
  const updatedEvents = getWeekDays(updated).flat();

  const newEvents = updatedEvents.filter(
    event => !existingEvents.some(e => eventsEqual(e, event))
  );
  const removedEvents = existingEvents.filter(
    event => !updatedEvents.some(e => eventsEqual(e, event))
  );

  return { newEvents, removedEvents };
}

export async function fetchAndDiff(key: TimetableKeyDto): Promise<{
  difference: null | TimetableDifferenceDto;
  newTimetable: TimetableDto;
}> {
  const newTimetable = await fetchTimetable(key);
  const existing = getTimetable(key);

  if (!existing) {
    logger.info(
      `No previous timetable for ${formatTimetableKey(key)}, caching silently`
    );
    return { difference: null, newTimetable };
  }

  const difference = diffTimetables(existing, newTimetable);
  if (
    difference.newEvents.length === 0 &&
    difference.removedEvents.length === 0
  ) {
    return { difference: null, newTimetable };
  }

  const changeCount =
    difference.newEvents.length + difference.removedEvents.length;
  logger.info(
    `Timetable changed for ${formatTimetableKey(key)} (${changeCount.toString()} changes)`
  );

  return { difference, newTimetable };
}

export function getActiveTimetableKeys(
  programs: StudyProgramDto[],
  weekCount = activeWeekCount
): TimetableKeyDto[] {
  const start = YearWeek.now();
  const weeks = Array.from({ length: weekCount }, (_, index) =>
    start.plusWeeks(index)
  );

  return programs.flatMap(program =>
    weeks.map(yearWeek => ({ studyProgramId: program.id, yearWeek }))
  );
}

export async function notifySubscribers(
  subscribers: MessagingSubscriptionDto[],
  key: TimetableKeyDto,
  difference: TimetableDifferenceDto
): Promise<void> {
  const message = { difference, timetableKey: key };

  for (const subscription of subscribers) {
    try {
      await messagingService.sendTimetableUpdate(subscription, message);
    } catch (error) {
      if (error instanceof ServiceError) {
        logger.error(
          `Notification failed for ${formatSubscriptionRef(subscription)} (${error.code}): ${error.message}`
        );
        continue;
      }

      throw error;
    }
  }
}

export async function refreshTimetables(): Promise<void> {
  const { studyPrograms } = getTimetableDatabase();
  logger.info(
    `Refreshing timetables for ${studyPrograms.length.toString()} study programs`
  );

  for (const program of studyPrograms) {
    const subscribers = await messagingService.findByStudyProgramId(program.id);
    if (subscribers.length === 0) continue;

    logger.info(
      `Found ${subscribers.length.toString()} subscriptions for study program ${program.id.toString()}`
    );

    for (const key of getActiveTimetableKeys([program])) {
      try {
        await refreshTimetableKey(key, subscribers);
      } catch (error) {
        logger.error(
          `Failed to refresh timetable for ${formatTimetableKey(key)}`,
          error
        );
      }
    }
  }
}

function formatSubscriptionRef(subscription: MessagingSubscriptionDto): string {
  const channel = subscription.fcmToken ?? subscription.email ?? "no channel";
  return `subscription ${subscription.id} (studyProgram ${subscription.studyProgramId.toString()}, ${channel})`;
}

function formatTimetableKey(key: TimetableKeyDto): string {
  return `${key.studyProgramId?.toString() ?? "all"} ${key.yearWeek.toString()}`;
}

async function refreshTimetableKey(
  key: TimetableKeyDto,
  subscribers: MessagingSubscriptionDto[]
): Promise<void> {
  const { difference, newTimetable } = await fetchAndDiff(key);

  if (difference) {
    await notifySubscribers(subscribers, key, difference);
  }

  setTimetable(key, newTimetable);
}
