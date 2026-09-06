import { mailer, MAIL_FROM } from "./transporter";

// Sent once, right after a new Prisma `User` row is created (see
// app/api/auth/signup/route.ts) — purely a "welcome" email, not a
// verification step. Deliberately swallows its own errors rather than
// throwing: a failed send (missing SMTP credentials, Gmail rate limit,
// etc.) must never fail signup itself, since account creation already
// succeeded by the time this runs.
export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  try {
    await mailer.sendMail({
      from: MAIL_FROM,
      to,
      subject: "Welcome to Dawiini!",
      text: `Hi ${firstName},\n\nWelcome to Dawiini — we're glad you're here. You can now track your medications, check pharmacy availability, and manage your health all in one place.\n\n— The Dawiini team`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #0f172a;">Welcome to Dawiini, ${firstName}! 👋</h1>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            We're glad you're here. You can now track your medications, check
            pharmacy availability, and manage your health all in one place.
          </p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">
            — The Dawiini team
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
