"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOTPData = exports.validatePasswordChange = exports.validateProfileData = exports.validateLoginData = exports.validateAuthData = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const http_errors_1 = __importDefault(require("http-errors"));
const validateAuthData = async (data) => {
    const ajv = new ajv_1.default();
    (0, ajv_formats_1.default)(ajv);
    ajv.addFormat('email', {
        type: 'string',
        validate: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }
    });
    const schema = {
        type: "object",
        properties: {
            fullName: {
                type: "string",
                minLength: 2,
                maxLength: 100,
            },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8, maxLength: 128 },
        },
        required: ["fullName", "email", "password"],
    };
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    if (!isValid) {
        const errors = validate.errors?.map(error => {
            return { key: error.instancePath, message: error.message };
        });
        throw new http_errors_1.default.BadRequest(JSON.stringify(errors));
    }
    ;
};
exports.validateAuthData = validateAuthData;
const validateLoginData = async (data) => {
    const ajv = new ajv_1.default();
    (0, ajv_formats_1.default)(ajv);
    ajv.addFormat("email", {
        type: "string",
        validate: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
    });
    const schema = {
        type: "object",
        properties: {
            email: {
                type: "string",
                format: "email",
            },
            password: {
                type: "string",
                minLength: 1,
            },
        },
        required: ["email", "password"],
        additionalProperties: false,
    };
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    if (!isValid) {
        const errors = validate.errors?.map((error) => {
            const field = error.instancePath.replace("/", "") ||
                error.params?.missingProperty ||
                "unknown";
            return {
                field: field,
                message: `${field}: ${error.message}`,
            };
        });
        throw new http_errors_1.default.BadRequest(JSON.stringify({
            message: "Login validation failed",
            errors,
        }));
    }
};
exports.validateLoginData = validateLoginData;
const validateProfileData = async (data) => {
    const ajv = new ajv_1.default();
    (0, ajv_formats_1.default)(ajv);
    ajv.addFormat("email", {
        type: "string",
        validate: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
    });
    ajv.addFormat('phone', {
        type: 'string',
        validate: (value) => {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        }
    });
    const schema = {
        type: "object",
        properties: {
            fullName: { type: "string", maxlength: 100 },
            phone: { type: "string", pattern: "^\\+?[1-9]\\d{1,14}$" },
            profilePicture: { type: "string", format: "url" },
            email: { type: "string" },
            role: { type: "string", enum: ["ADMIN", "CLIENT"] },
            Biography: { type: "string", maxLength: 500 },
        },
    };
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    if (!isValid) {
        const errors = validate.errors?.map(error => {
            return { key: error.instancePath, message: error.message };
        });
        throw new http_errors_1.default.BadRequest(JSON.stringify(errors));
    }
    ;
};
exports.validateProfileData = validateProfileData;
const validatePasswordChange = async (data) => {
    const ajv = new ajv_1.default();
    const schema = {
        type: "object",
        properties: {
            currentPassword: {
                type: "string",
                minLength: 1,
            },
            newPassword: {
                type: "string",
                minLength: 8,
                maxLength: 128,
            },
            confirmPassword: {
                type: "string",
                minLength: 8,
                maxLength: 128,
            },
        },
        required: ["currentPassword", "newPassword", "confirmPassword"],
        additionalProperties: false,
    };
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    if (!isValid) {
        const errors = validate.errors?.map((error) => {
            const field = error.instancePath.replace("/", "") ||
                error.params?.missingProperty ||
                "unknown";
            return {
                field: field,
                message: `${field}: ${error.message}`,
            };
        });
        throw new http_errors_1.default.BadRequest(JSON.stringify({
            message: "Password validation failed",
            errors,
        }));
    }
    if (data.newPassword !== data.confirmPassword) {
        throw new http_errors_1.default.BadRequest(JSON.stringify({
            message: "Password confirmation failed",
            errors: [
                { field: "confirmPassword", message: "Passwords do not match" },
            ],
        }));
    }
};
exports.validatePasswordChange = validatePasswordChange;
const validateOTPData = async (data) => {
    const ajv = new ajv_1.default();
    (0, ajv_formats_1.default)(ajv);
    ajv.addFormat("email", {
        type: "string",
        validate: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
    });
    const schema = {
        type: "object",
        properties: {
            otp: {
                type: "string",
                pattern: "^[0-9]{4,8}$",
            },
            email: {
                type: "string",
                format: "email",
            },
            phone: {
                type: "string",
                pattern: "^\\+?[1-9]\\d{1,14}$",
            },
        },
        required: ["otp"],
        additionalProperties: false,
    };
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    if (!isValid) {
        const errors = validate.errors?.map((error) => {
            const field = error.instancePath.replace("/", "") ||
                error.params?.missingProperty ||
                "unknown";
            return {
                field: field,
                message: `${field}: ${error.message}`,
            };
        });
        throw new http_errors_1.default.BadRequest(JSON.stringify({
            message: "OTP validation failed",
            errors,
        }));
    }
};
exports.validateOTPData = validateOTPData;
//# sourceMappingURL=validate.js.map