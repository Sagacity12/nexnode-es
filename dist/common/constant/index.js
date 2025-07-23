"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isDevelopment = exports.isProduction = void 0;
exports.isProduction = process.env.NODE_ENV === 'production';
exports.isDevelopment = process.env.NODE_ENV === 'development';
exports.isTest = process.env.NODE_ENV === 'test';
//# sourceMappingURL=index.js.map