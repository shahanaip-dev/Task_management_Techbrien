import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().max(1000).optional(),
  memberIds:   z.array(z.string().uuid('Invalid user ID')).optional(),
});

export const UpdateProjectSchema = z.object({
  name:        z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
}).refine((d) => d.name !== undefined || d.description !== undefined, {
  message: 'At least one field must be provided',
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
