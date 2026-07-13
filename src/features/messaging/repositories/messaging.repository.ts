import { randomUUID } from "node:crypto";

import type { MessagingSubscriptionEntity } from "@/features/messaging/entities/messaging-subscription.entity.ts";

import { getDb } from "@/db/client.ts";
import {
  toMessagingSubscriptionEntity,
  toMessagingSubscriptionRow,
} from "@/features/messaging/entities/messaging-subscription.entity.ts";

export async function deleteById(id: string): Promise<void> {
  await getDb().deleteFrom("messaging_subscriptions").where("id", "=", id).execute();
}

export async function findByEmailAndFcmToken(
  email: null | string,
  fcmToken: null | string
): Promise<MessagingSubscriptionEntity[]> {
  let query = getDb().selectFrom("messaging_subscriptions").selectAll();

  query =
    email != null
      ? query.where("email", "=", email)
      : query.where("email", "is", null);
  query =
    fcmToken != null
      ? query.where("fcm_token", "=", fcmToken)
      : query.where("fcm_token", "is", null);

  const rows = await query.execute();
  return rows.map(toMessagingSubscriptionEntity);
}

export async function findByStudyProgramId(
  studyProgramId: number
): Promise<MessagingSubscriptionEntity[]> {
  const rows = await getDb()
    .selectFrom("messaging_subscriptions")
    .selectAll()
    .where("study_program_id", "=", studyProgramId)
    .execute();
  return rows.map(toMessagingSubscriptionEntity);
}

export async function insert(
  entity: Omit<MessagingSubscriptionEntity, "id">
): Promise<MessagingSubscriptionEntity> {
  const id = randomUUID();
  const row = toMessagingSubscriptionRow({ ...entity, id });

  await getDb().insertInto("messaging_subscriptions").values(row).execute();
  return { ...entity, id };
}

export async function updateLastNotifiedAt(
  id: string,
  lastNotifiedAt: Date
): Promise<void> {
  await getDb()
    .updateTable("messaging_subscriptions")
    .set({ last_notified_at: lastNotifiedAt.toISOString() })
    .where("id", "=", id)
    .execute();
}
