"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectQuerySchema = exports.UpdateProjectSchema = exports.CreateProjectSchema = void 0;
const zod_1 = require("zod");
exports.CreateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(200),
    description: zod_1.z.string().max(1000).optional(),
    memberIds: zod_1.z.array(zod_1.z.string().uuid('Invalid user ID')).optional(),
});
exports.UpdateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    memberIds: zod_1.z.array(zod_1.z.string().uuid('Invalid user ID')).optional(),
}).refine((d) => d.name !== undefined || d.description !== undefined || d.memberIds !== undefined, {
    message: 'At least one field must be provided',
});
exports.ProjectQuerySchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    cursor: zod_1.z.string().optional(),
});
//# sourceMappingURL=project.schema.js.map