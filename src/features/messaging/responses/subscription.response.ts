import { z } from "zod";

import type { MessagingSubscriptionDto } from "@/features/messaging/dtos/messaging-subscription.dto.ts";

import {
  OPENAPI_DATETIME_EXAMPLE,
  OPENAPI_EMAIL_EXAMPLE,
  OPENAPI_FCM_TOKEN_EXAMPLE,
  OPENAPI_STUDY_PROGRAM_ID_EXAMPLE,
  OPENAPI_SUBSCRIPTION_ID_EXAMPLE,
} from "@/lib/openapi.ts";

export const subscriptionResponseSchema = z
  .object({
    createdAt: z.iso.datetime().meta({
      description: "When the subscription was created",
      examples: [OPENAPI_DATETIME_EXAMPLE],
    }),
    deviceInfo: z.string().meta({
      description: "Client device metadata captured at subscribe time",
      examples: ["Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36"],
    }),
    email: z.string().nullable().meta({
      description: "Subscribed email address, or null when using FCM only",
      examples: [OPENAPI_EMAIL_EXAMPLE, null],
    }),
    fcmToken: z.string().nullable().meta({
      description: "Subscribed FCM token, or null when using email only",
      examples: [OPENAPI_FCM_TOKEN_EXAMPLE, null],
    }),
    id: z.uuid().meta({
      description: "Subscription UUID",
      examples: [OPENAPI_SUBSCRIPTION_ID_EXAMPLE],
    }),
    lastNotifiedAt: z.iso
      .datetime()
      .nullable()
      .meta({
        description: "When the subscriber was last successfully notified",
        examples: [OPENAPI_DATETIME_EXAMPLE, null],
      }),
    studyProgramId: z.number().meta({
      description: "Subscribed study program ID",
      examples: [OPENAPI_STUDY_PROGRAM_ID_EXAMPLE],
    }),
  })
  .meta({ description: "An active messaging subscription" });

export type SubscriptionResponse = z.infer<typeof subscriptionResponseSchema>;

export function toSubscriptionResponse(
  dto: MessagingSubscriptionDto,
): SubscriptionResponse {
  return {
    createdAt: dto.createdAt.toISOString(),
    deviceInfo: dto.deviceInfo,
    email: dto.email,
    fcmToken: dto.fcmToken,
    id: dto.id,
    lastNotifiedAt: dto.lastNotifiedAt?.toISOString() ?? null,
    studyProgramId: dto.studyProgramId,
  };
}
