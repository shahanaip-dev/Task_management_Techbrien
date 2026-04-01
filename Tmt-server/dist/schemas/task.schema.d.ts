import { z } from 'zod';
export declare const CreateTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    assignedTo: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    projectId: string;
    description?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}, {
    title: string;
    projectId: string;
    description?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}>;
export declare const UpdateTaskSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "DONE"]>>;
    assignedTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
    title?: string | undefined;
    assignedTo?: string | null | undefined;
    dueDate?: string | null | undefined;
}, {
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
    title?: string | undefined;
    assignedTo?: string | null | undefined;
    dueDate?: string | null | undefined;
}>, {
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
    title?: string | undefined;
    assignedTo?: string | null | undefined;
    dueDate?: string | null | undefined;
}, {
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
    title?: string | undefined;
    assignedTo?: string | null | undefined;
    dueDate?: string | null | undefined;
}>;
export declare const AssignTaskSchema: z.ZodObject<{
    assignedTo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    assignedTo: string;
}, {
    assignedTo: string;
}>;
export declare const TaskQuerySchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "DONE"]>>;
    assignedTo: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    limit?: string | undefined;
    offset?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
    title?: string | undefined;
    projectId?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}, {
    description?: string | undefined;
    limit?: string | undefined;
    offset?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
    title?: string | undefined;
    projectId?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type AssignTaskInput = z.infer<typeof AssignTaskSchema>;
