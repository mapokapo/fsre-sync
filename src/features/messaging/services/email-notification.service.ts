import nodemailer, { type Transporter } from "nodemailer";

import type { TimetableUpdatedMessageDto } from "@/features/messaging/dtos/timetable-updated-message.dto.ts";

import { config } from "@/config.ts";
import { EmailSendMessageFailed } from "@/features/messaging/errors/messaging.errors.ts";
import { buildTimetableUpdatedEmailHtml } from "@/features/messaging/helpers/templates/timetable-updated.ts";

let mailTransport: null | Transporter = null;

export async function sendEmailNotification(
  email: string,
  message: TimetableUpdatedMessageDto
): Promise<void> {
  const transport = getMailTransport();
  if (!transport) {
    throw new EmailSendMessageFailed("Mail transport is not configured");
  }

  try {
    await transport.sendMail({
      from: `"${config.mail.fromName}" <${config.mail.from}>`,
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

function createMailTransport(): null | Transporter {
  if (!config.mail.username || !config.mail.password) {
    return null;
  }

  return nodemailer.createTransport({
    auth: { pass: config.mail.password, user: config.mail.username },
    host: config.mail.host,
    port: config.mail.port,
    requireTLS: true,
    secure: false,
  });
}

function getMailTransport(): null | Transporter {
  mailTransport ??= createMailTransport();
  return mailTransport;
}
