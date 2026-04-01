"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
/**
 * Validates req.body against the given Zod schema.
 * On failure → 422 with a list of field-level error messages.
 * On success  → replaces req.body with the parsed (coerced) value.
 */
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            res.status(422).json({ success: false, errors });
            return;
        }
        req.body = result.data;
        next();
    };
}
/**
 * Validates req.query against the given Zod schema.
 * On failure → 422 with field-level errors.
 */
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            res.status(422).json({ success: false, errors });
            return;
        }
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map