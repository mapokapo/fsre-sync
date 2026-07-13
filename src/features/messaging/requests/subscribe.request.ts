import { z } from "zod";

import type { SubscribeDto } from "@/features/messaging/dtos/messaging-subscription.dto.ts";

import {
  OPENAPI_EMAIL_EXAMPLE,
  OPENAPI_FCM_TOKEN_EXAMPLE,
  OPENAPI_STUDY_PROGRAM_ID_EXAMPLE,
} from "@/lib/openapi.ts";

const studyProgramIdField = z.number().meta({
  description: "Edupage study program ID to subscribe to",
  examples: [OPENAPI_STUDY_PROGRAM_ID_EXAMPLE],
});

const emailField = z.email().meta({
  description: "Email address for notification fallback",
  examples: [OPENAPI_EMAIL_EXAMPLE],
});

const fcmTokenField = z
  .string()
  .min(1)
  .meta({
    description: "Firebase Cloud Messaging device token",
    examples: [OPENAPI_FCM_TOKEN_EXAMPLE],
  });

export const subscribeRequestSchema = z
  .union([
    z.object({
      email: emailField,
      fcmToken: z.null().optional(),
      studyProgramId: studyProgramIdField,
    }),
    z.object({
      email: z.null().optional(),
      fcmToken: fcmTokenField,
      studyProgramId: studyProgramIdField,
    }),
    z.object({
      email: emailField,
      fcmToken: fcmTokenField,
      studyProgramId: studyProgramIdField,
    }),
  ])
  .check(ctx => {
    if (!ctx.value.email && !ctx.value.fcmToken) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: "At least one contact method is required",
        path: ["email", "fcmToken"],
      });
    }
  })
  .meta({
    description:
      "Subscribe to timetable change notifications for a study program. Provide email, fcmToken, or both - at least one contact method is required.",
  });

export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;

export function toSubscribeDto(
  body: SubscribeRequest,
  deviceInfo: string
): SubscribeDto {
  return {
    deviceInfo,
    email: body.email ?? null,
    fcmToken: body.fcmToken ?? null,
    studyProgramId: body.studyProgramId,
  };
}

export function toUnsubscribeDto(
  body: SubscribeRequest
): Omit<SubscribeDto, "deviceInfo"> {
  return {
    email: body.email ?? null,
    fcmToken: body.fcmToken ?? null,
    studyProgramId: body.studyProgramId,
  };
}
