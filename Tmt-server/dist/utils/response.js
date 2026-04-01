"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendCreated = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    const body = { success: true, message, data };
    res.status(statusCode).json(body);
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message = 'Created') => (0, exports.sendSuccess)(res, data, message, 201);
exports.sendCreated = sendCreated;
const sendError = (res, message, statusCode = 400, errors) => {
    const body = { success: false, message, ...(errors && { errors }) };
    res.status(statusCode).json(body);
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map