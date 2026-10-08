"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
var express_1 = require("express");
var portfolioController_js_1 = require("../controllers/portfolioController.js");
var contactController_js_1 = require("../controllers/contactController.js");
var router = (0, express_1.Router)();
exports.apiRouter = router;
// Portfolio Metadata & Resource Routes
router.get("/profile", portfolioController_js_1.getProfile);
router.get("/projects", portfolioController_js_1.getProjects);
router.get("/projects/:slug", portfolioController_js_1.getProjectBySlug);
router.get("/skills", portfolioController_js_1.getSkills);
router.get("/experience", portfolioController_js_1.getExperience);
router.get("/stats", portfolioController_js_1.getStats);
// Interactive Contact Submission
router.post("/contact", contactController_js_1.submitContact);
router.get("/contact/messages", contactController_js_1.getContactSubmissions);
