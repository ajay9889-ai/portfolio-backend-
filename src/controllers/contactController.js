"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactSubmissions = exports.submitContact = void 0;
var zod_1 = require("zod");
var contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(100),
    email: zod_1.z.string().email("Please provide a valid email address"),
    subject: zod_1.z.string().min(3, "Subject must be at least 3 characters").max(200).optional().default("General Inquiry"),
    message: zod_1.z.string().min(10, "Message must be at least 10 characters").max(2000),
});
// In-memory persistent queue for contact submissions
var messagesStore = [];
var submitContact = function (req, res) {
    var parseResult = contactSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            error: "Validation failed",
            details: parseResult.error.format()
        });
        return;
    }
    var _a = parseResult.data, name = _a.name, email = _a.email, subject = _a.subject, message = _a.message;
    var newMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: name,
        email: email,
        subject: subject,
        message: message,
        ip: req.ip || req.socket.remoteAddress,
        createdAt: new Date().toISOString()
    };
    messagesStore.push(newMsg);
    console.log("[Contact Form Received] From: ".concat(name, " <").concat(email, "> | Subject: ").concat(subject));
    res.status(201).json({
        success: true,
        message: "Thank you for reaching out! Your message has been successfully received. I will get back to you shortly.",
        data: {
            id: newMsg.id,
            receivedAt: newMsg.createdAt
        }
    });
};
exports.submitContact = submitContact;
var getContactSubmissions = function (_req, res) {
    res.json({
        success: true,
        count: messagesStore.length,
        data: messagesStore
    });
};
exports.getContactSubmissions = getContactSubmissions;
