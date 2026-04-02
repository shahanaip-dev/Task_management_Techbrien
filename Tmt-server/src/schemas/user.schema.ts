import { z } from 'zod';

export const CreateUserSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^[A-Z]/, 'Password must start with a capital letter')
    .regex(/[A-Z]/,  'Password must contain at least one uppercase letter')
    .regex(/[0-9]/,  'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').max(255).optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^[A-Z]/, 'Password must start with a capital letter')
    .regex(/[A-Z]/,  'Password must contain at least one uppercase letter')
    .regex(/[0-9]/,  'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .optional(),
}).refine((data) => Object.values(data).some((v) => v !== undefined), {
  message: 'At least one field must be provided',
});

export const UserQuerySchema = z.object({
  limit:  z.string().optional(),
  cursor: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^[A-Z]/, 'Password must start with a capital letter')
    .regex(/[A-Z]/,  'Password must contain at least one uppercase letter')
    .regex(/[0-9]/,  'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
