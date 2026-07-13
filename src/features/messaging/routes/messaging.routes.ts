import { Elysia } from "elysia";

import { subscribeRequestSchema, toSubscribeDto, toUnsubscribeDto } from "@/features/messaging/requests/subscribe.request.ts";
import {
  subscriptionResponseSchema,
  toSubscriptionResponse,
} from "@/features/messaging/responses/subscription.response.ts";
import * as messagingService from "@/features/messaging/services/messaging.service.ts";
import { deviceInfoPlugin } from "@/plugins/device-info.ts";

export const messagingRoutes = new Elysia()
  .use(deviceInfoPlugin)
  .post(
    "/messaging/subscribe",
    async ({ body, deviceInfo }) =>
      toSubscriptionResponse(
        await messagingService.subscribe(toSubscribeDto(body, deviceInfo)),
      ),
    {
      body: subscribeRequestSchema,
      detail: {
        summary: "Subscribe to a study program using an email and/or FCM token",
        tags: ["messaging"],
      },
      response: { 200: subscriptionResponseSchema },
    },
  )
  .post(
    "/messaging/unsubscribe",
    ({ body }) => messagingService.unsubscribe(toUnsubscribeDto(body)),
    {
      body: subscribeRequestSchema,
      detail: {
        summary:
          "Unsubscribe from a study program for a specific email and/or FCM token",
        tags: ["messaging"],
      },
    },
  );
