import { z } from 'zod';
export declare const CreateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    memberIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}, {
    name: string;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}>;
export declare const UpdateProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    memberIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}>, {
    name?: string | undefined;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
