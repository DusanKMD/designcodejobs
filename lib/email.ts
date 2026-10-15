export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Sending is intentionally not wired. Swap this implementation when a provider
 * (Resend, Postmark, SES) is chosen. Callers already depend on the interface.
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export class UnconfiguredEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email] provider not configured; skipped ${message.to} — ${message.subject}`);
  }
}

export function getEmailSender(): EmailSender {
  return new UnconfiguredEmailSender();
}

export async function sendAlertConfirmation(to: string) {
  const sender = getEmailSender();
  await sender.send({
    to,
    subject: "Design Code Jobs alerts",
    text: "Alerts are saved. Sending is not turned on yet, so this note is not delivered.",
  });
}
