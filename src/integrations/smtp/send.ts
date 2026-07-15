import nodemailer, { type Transporter } from "nodemailer";

import { config } from "@/lib/config";

export interface SendMailOptions {
  html: string;
  subject: string;
  to: string;
}

let mailTransport: null | Transporter = null;

export async function sendMail(options: SendMailOptions): Promise<void> {
  const transport = getMailTransport();
  if (!transport) {
    throw new Error("Mail transport is not configured");
  }

  await transport.sendMail({
    from: `"${config.mail.fromName}" <${config.mail.from}>`,
    html: options.html,
    subject: options.subject,
    to: options.to,
  });
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
