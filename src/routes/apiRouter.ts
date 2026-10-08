import { Router } from "express";
import {
  getProfile,
  getProjects,
  getProjectBySlug,
  getSkills,
  getExperience,
  getStats
} from "../controllers/portfolioController.js";
import { submitContact, getContactSubmissions } from "../controllers/contactController.js";

const router = Router();

// Portfolio Metadata & Resource Routes
router.get("/profile", getProfile);
router.get("/projects", getProjects);
router.get("/projects/:slug", getProjectBySlug);
router.get("/skills", getSkills);
router.get("/experience", getExperience);
router.get("/stats", getStats);

// Interactive Contact Submission
router.post("/contact", submitContact);
router.get("/contact/messages", getContactSubmissions);

export { router as apiRouter };
