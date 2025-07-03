"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const index_1 = require("../logger/index");
const helper_1 = require("@/helpers/helper");
const errorHandler = (err, req, res, next) => {
    index_1.logger.error(err.message, err);
    index_1.rollbar.error(err);
    if (process.env.NODE_ENV === 'production') {
        (0, helper_1.constructHttpErrorResponse)(null, (0, http_errors_1.default)(500, ' Internal Server Error'), 500)(res);
    }
    return (0, helper_1.constructHttpErrorResponse)(null, err, err.statusCode || 500)(res);
};
exports.default = errorHandler;
//# sourceMappingURL=error-Handler.js.map