"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var app_js_1 = require("./app.js");
var PORT = process.env.PORT || 5001;
var server = app_js_1.app.listen(PORT, function () {
    console.log("====================================================");
    console.log("\uD83D\uDE80 Portfolio Backend API is Live!");
    console.log("\uD83D\uDCE1 URL: http://localhost:".concat(PORT));
    console.log("\uD83E\uDE7A Health: http://localhost:".concat(PORT, "/health"));
    console.log("\uD83D\uDCDA API Root: http://localhost:".concat(PORT).concat(process.env.API_PREFIX || "/api/v1"));
    console.log("\u2699\uFE0F  Environment: ".concat(process.env.NODE_ENV || "development"));
    console.log("====================================================");
});
var handleShutdown = function (signal) {
    console.log("\n[".concat(signal, "] Initiating graceful server shutdown..."));
    server.close(function () {
        console.log("Server connections closed. Exiting process.");
        process.exit(0);
    });
};
process.on("SIGTERM", function () { return handleShutdown("SIGTERM"); });
process.on("SIGINT", function () { return handleShutdown("SIGINT"); });
