import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title:       z.string().min(2, 'Title must be at least 2 characters').max(300),
  description: z.string().max(2000).optional(),
  projectId:   z.string().uuid('Invalid project ID'),
  assignedTo:  z.string().uuid('Invalid user ID').optional(),
  dueDate:     z.string().datetime({ message: 'Invalid ISO date' }).optional(),
});

export const UpdateTaskSchema = z.object({
  title:       z.string().min(2).max(300).optional(),
  description: z.string().max(2000).optional(),
  status:      z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  assignedTo:  z.string().uuid().nullable().optional(),
  dueDate:     z.string().datetime().nullable().optional(),
}).refine(
  (d) => Object.values(d).some((v) => v !== undefined),
  { message: 'At least one field must be provided' }
);

export const AssignTaskSchema = z.object({
  assignedTo: z.string().uuid('Invalid user ID'),
});

export const TaskQuerySchema = z.object({
  projectId:  z.string().uuid().optional(),
  status:     z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  assignedTo: z.string().uuid().optional(),
  title:      z.string().optional(),
  description: z.string().optional(),
  dueDate:    z.string().optional(),
  limit:      z.string().optional(),
  offset:     z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type AssignTaskInput = z.infer<typeof AssignTaskSchema>;
