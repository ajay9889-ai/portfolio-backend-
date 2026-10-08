import { Request, Response } from "express";
import { z } from "zod";

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

// In-memory persistent queue for contact submissions
const messagesStore: ContactMessage[] = [];

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
