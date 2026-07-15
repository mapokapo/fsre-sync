import type { Message } from "firebase-admin/messaging";

import { getMessaging } from "firebase-admin/messaging";

export async function sendFcmMessage(message: Message): Promise<void> {
  await getMessaging().send(message);
}
