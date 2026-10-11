import { Request, Response } from "express";
import { z } from "zod";
import nodemailer from "nodemailer";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200).optional().default("General Inquiry"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip?: string;
  createdAt: string;
}

// In-memory store (kept as backup log; emails are the primary notification)
const messagesStore: ContactMessage[] = [];

// Create reusable Gmail transporter
const createTransporter = () => {
  const user = process.env.SMTP_USER || "ajayhasrb123@gmail.com";
  const pass = process.env.SMTP_PASS || "eegktgkbtkcoqbyv";

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const sendNotificationEmail = async (msg: ContactMessage): Promise<void> => {
  const transporter = createTransporter();
  if (!transporter) return;

  const notifyEmail = process.env.OWNER_NOTIFY_EMAIL || process.env.SMTP_USER;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0E0E12; border: 1px solid rgba(255,255,255,0.10); border-radius: 14px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FF5500, #FF7A00); padding: 24px 28px;">
        <h2 style="margin: 0; color: #fff; font-size: 18px; font-weight: 700;">📬 New Portfolio Message</h2>
      </div>
      <div style="padding: 28px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #8B8B95; font-size: 13px; width: 80px; vertical-align: top;">From</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${msg.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8B8B95; font-size: 13px; vertical-align: top;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${msg.email}" style="color: #FF7A00; text-decoration: none; font-size: 14px;">${msg.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8B8B95; font-size: 13px; vertical-align: top;">Subject</td>
            <td style="padding: 8px 0; color: #E0E0E8; font-size: 14px;">${msg.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;">
          <p style="margin: 0; color: #E0E0E8; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${msg.message}</p>
        </div>
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">
          <p style="margin: 0; color: #555; font-size: 11px; font-family: monospace;">
            Received at ${new Date(msg.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            &nbsp;·&nbsp; ID: ${msg.id}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: notifyEmail,
      replyTo: msg.email,
      subject: `💬 ${msg.name} — ${msg.subject}`,
      html: htmlBody,
    });
    console.log(`[Email] ✅ Notification sent to ${notifyEmail}`);
  } catch (err) {
    console.error("[Email] ❌ Failed to send notification:", err);
  }
};

export const submitContact = (req: Request, res: Response): void => {
  const parseResult = contactSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: parseResult.error.format()
    });
    return;
  }

  const { name, email, subject, message } = parseResult.data;
  const newMsg: ContactMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    name,
    email,
    subject,
    message,
    ip: req.ip || req.socket.remoteAddress,
    createdAt: new Date().toISOString()
  };

  messagesStore.push(newMsg);
  console.log(`[Contact Form Received] From: ${name} <${email}> | Subject: ${subject}`);

  // Fire-and-forget email notification (don't block the response)
  sendNotificationEmail(newMsg);

  res.status(201).json({
    success: true,
    message: "Thank you for reaching out! Your message has been successfully received. I will get back to you shortly.",
    data: {
      id: newMsg.id,
      receivedAt: newMsg.createdAt
    }
  });
};

export const getContactSubmissions = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: messagesStore.length,
    data: messagesStore
  });
};
