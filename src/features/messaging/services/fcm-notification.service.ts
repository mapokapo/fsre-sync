import { getMessaging } from "firebase-admin/messaging";

import type { TimetableUpdatedMessageDto } from "@/features/messaging/dtos/timetable-updated-message.dto.ts";

import { FcmSendMessageFailed } from "@/features/messaging/errors/messaging.errors.ts";
import {
  buildSummary,
  buildSummaryBody,
  buildSummaryTitle,
  trimLength,
} from "@/features/messaging/services/summary-formatter.service.ts";

// TODO: Add iOS (APNs) notification configuration alongside the Android block.

export async function sendFcmNotification(
  fcmToken: string,
  message: TimetableUpdatedMessageDto
): Promise<void> {
  try {
    const { difference, timetableKey } = message;
    const title = buildSummaryTitle(difference);
    const body = trimLength(buildSummaryBody(difference));

    await getMessaging().send({
      android: {
        notification: { body, priority: "high", title },
        priority: "high",
      },
      data: {
        newTimetableEvents: JSON.stringify(difference.newEvents),
        removedTimetableEvents: JSON.stringify(difference.removedEvents),
        summary: trimLength(buildSummary(difference)),
        timestamp: new Date().toISOString(),
        timetableKey: JSON.stringify({
          studyProgramId: timetableKey.studyProgramId,
          yearWeek: timetableKey.yearWeek.toString(),
        }),
      },
      notification: { body, title },
      token: fcmToken,
    });
  } catch (error) {
    throw new FcmSendMessageFailed(
      error instanceof Error ? error.message : "FCM send failed",
      error
    );
  }
}
