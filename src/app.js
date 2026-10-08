"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var express_rate_limit_1 = require("express-rate-limit");
var apiRouter_js_1 = require("./routes/apiRouter.js");
var errorHandler_js_1 = require("./middleware/errorHandler.js");
var app = (0, express_1.default)();
exports.app = app;
// 1. Security & Headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// 2. CORS Configuration
var allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
            callback(null, true);
        }
        else {
            callback(new Error("CORS policy violation"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
// 3. Body Parsing & Logging
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
if (process.env.NODE_ENV !== "test") {
    app.use((0, morgan_1.default)("dev"));
}
// 4. Rate Limiting for Contact Form
var contactLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many contact requests from this IP. Please try again in 15 minutes."
    }
});
app.use("/api/v1/contact", contactLimiter);
// 5. Root Health Endpoint
app.get("/health", function (_req, res) {
    res.json({
        status: "healthy",
        service: "Portfolio API Backend",
        version: "1.0.0",
        uptimeSeconds: Math.floor(process.processUptime ? process.processUptime() : process.uptime()),
        timestamp: new Date().toISOString()
    });
});
// 6. Mount API v1 Router
var prefix = process.env.API_PREFIX || "/api/v1";
app.use(prefix, apiRouter_js_1.apiRouter);
// 7. 404 Catch-all
app.use("*", function (req, res) {
    res.status(404).json({
        success: false,
        error: "Resource not found at ".concat(req.method, " ").concat(req.originalUrl)
    });
});
// 8. Global Error Handler
app.use(errorHandler_js_1.errorHandler);
