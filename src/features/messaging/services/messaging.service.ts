import type { MessagingSubscriptionDto } from "@/features/messaging/dtos/messaging-subscription.dto.ts";
import type { SubscribeDto } from "@/features/messaging/dtos/messaging-subscription.dto.ts";
import type { TimetableUpdatedMessageDto } from "@/features/messaging/dtos/timetable-updated-message.dto.ts";
import type { MessagingSubscriptionEntity } from "@/features/messaging/entities/messaging-subscription.entity.ts";

import { MessagingSubscriptionAlreadyRegistered } from "@/features/messaging/errors/messaging.errors.ts";
import * as messagingRepository from "@/features/messaging/repositories/messaging.repository.ts";
import { sendEmailNotification } from "@/features/messaging/services/email-notification.service.ts";
import { sendFcmNotification } from "@/features/messaging/services/fcm-notification.service.ts";
import { isFirebaseInitialized } from "@/features/messaging/services/firebase.service.ts";
import { logger } from "@/lib/logger.ts";

export async function findByStudyProgramId(
  studyProgramId: number
): Promise<MessagingSubscriptionDto[]> {
  const entities =
    await messagingRepository.findByStudyProgramId(studyProgramId);
  return entities.map(toDto);
}

export async function sendTimetableUpdate(
  subscription: MessagingSubscriptionDto,
  message: TimetableUpdatedMessageDto
): Promise<void> {
  if (subscription.fcmToken && isFirebaseInitialized()) {
    await sendFcmNotification(subscription.fcmToken, message);
    await messagingRepository.updateLastNotifiedAt(subscription.id, new Date());
    return;
  }

  if (subscription.email) {
    await sendEmailNotification(subscription.email, message);
    await messagingRepository.updateLastNotifiedAt(subscription.id, new Date());
    return;
  }

  logger.warn(
    `No notification channel for subscription ${subscription.id} (studyProgram ${subscription.studyProgramId.toString()})`
  );
}

export async function subscribe(dto: SubscribeDto): Promise<MessagingSubscriptionDto> {
  const existing = await messagingRepository.findByEmailAndFcmToken(
    dto.email,
    dto.fcmToken
  );

  if (existing.some(sub => sub.studyProgramId === dto.studyProgramId)) {
    throw new MessagingSubscriptionAlreadyRegistered(
      dto.email,
      dto.fcmToken,
      dto.studyProgramId
    );
  }

  const entity = await messagingRepository.insert({
    createdAt: new Date(),
    deviceInfo: dto.deviceInfo,
    email: dto.email,
    fcmToken: dto.fcmToken,
    lastNotifiedAt: null,
    studyProgramId: dto.studyProgramId,
  });

  return toDto(entity);
}

export async function unsubscribe(
  dto: Omit<SubscribeDto, "deviceInfo">
): Promise<void> {
  const existing = await messagingRepository.findByEmailAndFcmToken(
    dto.email,
    dto.fcmToken
  );

  await Promise.all(
    existing
      .filter(sub => sub.studyProgramId === dto.studyProgramId)
      .map(sub => messagingRepository.deleteById(sub.id))
  );
}

function toDto(entity: MessagingSubscriptionEntity): MessagingSubscriptionDto {
  return { ...entity };
}
