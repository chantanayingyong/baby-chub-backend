// src/utils/mailer.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = "no-reply@example.com",
  NODE_ENV,
} = process.env;

let transporter;

export function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_PORT) === "465", // 465 = secure
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  const info = await t.sendMail({ from: MAIL_FROM, to, subject, html, text });

  if (NODE_ENV !== "production") {
    console.log("[MAIL] sent:", info.messageId);
    if (nodemailer.getTestMessageUrl) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log("[MAIL] preview:", preview);
    }
  }
  return info;
}

export const emailTemplates = {
  verify({ link }) {
    return {
      subject: "Verify your email",
      html: `
        <p>Hi,</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${link}" target="_blank" rel="noopener">${link}</a></p>
        <p>If you didn’t create this account, please ignore this email.</p>
      `,
      text: `Verify your email: ${link}`,
    };
  },
  reset({ link }) {
    return {
      subject: "Reset your password",
      html: `
        <p>Hi,</p>
        <p>We received a request to reset your password:</p>
        <p><a href="${link}" target="_blank" rel="noopener">${link}</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Reset your password: ${link}`,
    };
  },
};
