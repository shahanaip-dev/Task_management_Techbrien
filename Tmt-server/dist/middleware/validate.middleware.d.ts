import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Validates req.body against the given Zod schema.
 * On failure → 422 with a list of field-level error messages.
 * On success  → replaces req.body with the parsed (coerced) value.
 */
export declare function validateBody(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validates req.query against the given Zod schema.
 * On failure → 422 with field-level errors.
 */
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
