import type {
  TimetableDifferenceDto,
  TimetableDto,
  TimetableKeyDto,
} from "@/contracts/timetable.ts";
import type { MessagingSubscriptionDto } from "@/features/messaging";

import * as messaging from "@/features/messaging";
import {
  diffTimetables,
  fetchTimetable,
  getActiveTimetableKeys,
  getTimetable,
  getTimetableDatabase,
  setTimetable,
} from "@/features/timetable";
import { logger } from "@/lib/logger.ts";
import { ServiceError } from "@/lib/service-error.ts";

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

export async function notifySubscribers(
  subscribers: MessagingSubscriptionDto[],
  key: TimetableKeyDto,
  difference: TimetableDifferenceDto
): Promise<void> {
  const message = { difference, timetableKey: key };

  for (const subscription of subscribers) {
    try {
      await messaging.sendTimetableUpdate(subscription, message);
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
    const subscribers = await messaging.findByStudyProgramId(program.id);
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
