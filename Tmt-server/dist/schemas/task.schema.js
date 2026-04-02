"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQuerySchema = exports.AssignTaskSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = void 0;
const zod_1 = require("zod");
exports.CreateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters').max(300),
    description: zod_1.z.string().max(2000).optional(),
    projectId: zod_1.z.string().uuid('Invalid project ID'),
    assignedTo: zod_1.z.string().uuid('Invalid user ID').optional(),
    dueDate: zod_1.z.string().datetime({ message: 'Invalid ISO date' }).optional(),
});
exports.UpdateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(300).optional(),
    description: zod_1.z.string().max(2000).optional(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    assignedTo: zod_1.z.string().uuid().nullable().optional(),
    dueDate: zod_1.z.string().datetime().nullable().optional(),
}).refine((d) => Object.values(d).some((v) => v !== undefined), { message: 'At least one field must be provided' });
exports.AssignTaskSchema = zod_1.z.object({
    assignedTo: zod_1.z.string().uuid('Invalid user ID'),
});
exports.TaskQuerySchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    assignedTo: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    cursor: zod_1.z.string().optional(),
});
//# sourceMappingURL=task.schema.js.map