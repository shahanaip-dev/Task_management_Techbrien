import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates req.body against the given Zod schema.
 * On failure → 422 with a list of field-level error messages.
 * On success  → replaces req.body with the parsed (coerced) value.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
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
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      res.status(422).json({ success: false, errors });
      return;
    }
    next();
  };
}
