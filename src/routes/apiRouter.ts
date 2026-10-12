import { Router } from "express";
import {
  getProfile,
  getProjects,
  getProjectBySlug,
  getSkills,
  getExperience,
  getStats,
} from "../controllers/portfolioController.js";
import { submitContact, getContactSubmissions } from "../controllers/contactController.js";
import { handleChat, handleChatStream, handleChatFeedback } from "../controllers/chatController.js";
import { sessionContactLimit } from "../middleware/sessionContactLimit.js";
import availabilityRouter from "./availabilityRouter.js";
import analyticsRouter from "./analyticsRouter.js";

const router = Router();

// Portfolio Metadata & Resource Routes
router.get("/profile", getProfile);
router.get("/projects", getProjects);
router.get("/projects/:slug", getProjectBySlug);
router.get("/skills", getSkills);
router.get("/experience", getExperience);
router.get("/stats", getStats);

// Interactive Contact Submission (protected by per-session contact limiter)
router.post("/contact", sessionContactLimit, submitContact);
router.get("/contact/messages", getContactSubmissions);

// AI Voice & Chat Agent
router.post("/chat", handleChat);
router.post("/chat/stream", handleChatStream);
router.post("/chat/feedback", handleChatFeedback);

// Availability & Analytics sub-routers
router.use("/availability", availabilityRouter);
router.use("/analytics", analyticsRouter);

export { router as apiRouter };
