import nodemailer from "nodemailer";

// Our own outgoing mail, independent of Supabase Auth's emails (which only
// cover confirm/reset/magic-link — not a plain "welcome" email). Sends via
// Gmail SMTP using an App Password (a regular Google account password
// won't work for SMTP auth), configured entirely through env vars so no
// credential lives in code.
//
// Reused across hot-reloads in dev the same way lib/prisma.ts reuses its
// client, so `next dev` doesn't open a fresh SMTP connection pool on every
// file save.
const globalForMailer = globalThis as unknown as {
  mailer: nodemailer.Transporter | undefined;
};

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export const mailer = globalForMailer.mailer ?? createTransporter();

if (process.env.NODE_ENV !== "production") {
  globalForMailer.mailer = mailer;
}

export const MAIL_FROM = `"${process.env.SMTP_FROM_NAME ?? "Dawiini"}" <${process.env.SMTP_USER}>`;
