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
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
