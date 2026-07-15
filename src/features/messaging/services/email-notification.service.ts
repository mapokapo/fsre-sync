import type { TimetableUpdatedMessageDto } from "@/features/messaging/dtos/timetable-updated-message.dto.ts";

import { EmailSendMessageFailed } from "@/features/messaging/errors/messaging.errors.ts";
import { buildTimetableUpdatedEmailHtml } from "@/features/messaging/helpers/templates/timetable-updated.ts";
import { sendMail } from "@/integrations/smtp/send.ts";

export async function sendEmailNotification(
  email: string,
  message: TimetableUpdatedMessageDto
): Promise<void> {
  try {
    await sendMail({
      html: buildTimetableUpdatedEmailHtml(message),
      subject: "Timetable updated",
      to: email,
    });
  } catch (error) {
    throw new EmailSendMessageFailed(
      error instanceof Error ? error.message : "Failed to send email",
      error
    );
  }
}
