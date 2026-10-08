"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 500; }
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
var errorHandler = function (err, _req, res, _next) {
    var statusCode = "statusCode" in err ? err.statusCode : 500;
    var message = err.message || "An unexpected server error occurred";
    console.error("[API Error] ".concat(statusCode, " - ").concat(message));
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};
exports.errorHandler = errorHandler;
