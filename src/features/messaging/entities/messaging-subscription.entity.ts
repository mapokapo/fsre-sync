import type { Insertable, Selectable } from "kysely";

import type { MessagingSubscriptionsTable } from "@/db/schema.ts";

export interface MessagingSubscriptionEntity {
  createdAt: Date;
  deviceInfo: string;
  email: null | string;
  fcmToken: null | string;
  id: string;
  lastNotifiedAt: Date | null;
  studyProgramId: number;
}

export type MessagingSubscriptionInsert =
  Insertable<MessagingSubscriptionsTable>;
export type MessagingSubscriptionRow = Selectable<MessagingSubscriptionsTable>;

export function toMessagingSubscriptionEntity(
  row: MessagingSubscriptionRow,
): MessagingSubscriptionEntity {
  return {
    createdAt: new Date(row.created_at),
    deviceInfo: row.device_info,
    email: row.email,
    fcmToken: row.fcm_token,
    id: row.id,
    lastNotifiedAt:
      row.last_notified_at != null ? new Date(row.last_notified_at) : null,
    studyProgramId: row.study_program_id,
  };
}

export function toMessagingSubscriptionRow(
  entity: MessagingSubscriptionEntity,
): MessagingSubscriptionInsert {
  return {
    created_at: entity.createdAt.toISOString(),
    device_info: entity.deviceInfo,
    email: entity.email,
    fcm_token: entity.fcmToken,
    id: entity.id,
    last_notified_at: entity.lastNotifiedAt?.toISOString() ?? null,
    study_program_id: entity.studyProgramId,
  };
}
