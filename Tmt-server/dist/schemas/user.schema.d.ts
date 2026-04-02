import { z } from 'zod';
export declare const CreateUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    email: string;
}, {
    password: string;
    name: string;
    email: string;
}>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export declare const UpdateUserSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
}, {
    password?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
}>, {
    password?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
}, {
    password?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
}>;
export declare const UserQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit?: string | undefined;
    cursor?: string | undefined;
}, {
    limit?: string | undefined;
    cursor?: string | undefined;
}>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
