import { Elysia } from "elysia";

import { messagingRoutes } from "@/features/messaging/routes/messaging.routes.ts";

export type {
  MessagingSubscriptionDto,
  SubscribeDto,
} from "@/features/messaging/dtos/messaging-subscription.dto.ts";
export type { TimetableUpdatedMessageDto } from "@/features/messaging/dtos/timetable-updated-message.dto.ts";
export {
  findByStudyProgramId,
  sendTimetableUpdate,
  subscribe,
  unsubscribe,
} from "@/features/messaging/services/messaging.service.ts";

export const messagingFeature = new Elysia({ name: "messaging" }).use(
  messagingRoutes
);
