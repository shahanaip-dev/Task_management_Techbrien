/**
 * TaskService Unit Tests
 */
import { TaskService } from '../src/services/task.service';
import { AppError } from '../src/middleware/error.middleware';
import { TaskStatus } from '@prisma/client';

const mockTaskRepo = {
  findById:              jest.fn(),
  findByIdWithRelations: jest.fn(),
  create:                jest.fn(),
  update:                jest.fn(),
  delete:                jest.fn(),
  findMany:              jest.fn(),
};
const mockProjectRepo = { findById: jest.fn() };
const mockUserRepo    = { findById: jest.fn() };

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService(mockTaskRepo as any, mockProjectRepo as any, mockUserRepo as any);
    jest.clearAllMocks();
  });

  // ── createTask ─────────────────────────────────────────────────────────
  describe('createTask', () => {
    it('should create a task when project and assignee exist', async () => {
      const input = {
        title:      'Fix bug',
        projectId:  'proj-uuid-1',
        assignedTo: 'user-uuid-1',
      };
      const created = { id: 'task-uuid-1', ...input, status: TaskStatus.TODO, createdAt: new Date() };

      mockProjectRepo.findById.mockResolvedValue({ id: 'proj-uuid-1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'user-uuid-1' });
      mockTaskRepo.create.mockResolvedValue(created);

      const result = await service.createTask(input);
      expect(result.title).toBe('Fix bug');
    });

    it('should throw 404 when project does not exist', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      await expect(
        service.createTask({ title: 'T', projectId: 'bad-id' })
      ).rejects.toThrow(new AppError(404, 'Project not found'));
    });

    it('should throw 404 when assignee does not exist', async () => {
      mockProjectRepo.findById.mockResolvedValue({ id: 'proj-uuid-1' });
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        service.createTask({ title: 'T', projectId: 'proj-uuid-1', assignedTo: 'bad-user' })
      ).rejects.toThrow(new AppError(404, 'Assigned user not found'));
    });
  });

  // ── assignTask ─────────────────────────────────────────────────────────
  describe('assignTask', () => {
    it('should assign a task to a valid user', async () => {
      const task    = { id: 'task-uuid-1', assignedTo: null };
      const updated = { ...task, assignedTo: 'user-uuid-1' };

      mockTaskRepo.findById.mockResolvedValue(task);
      mockUserRepo.findById.mockResolvedValue({ id: 'user-uuid-1' });
      mockTaskRepo.update.mockResolvedValue(updated);

      const result = await service.assignTask('task-uuid-1', { assignedTo: 'user-uuid-1' });
      expect(result.assignedTo).toBe('user-uuid-1');
    });

    it('should throw 404 when task not found', async () => {
      mockTaskRepo.findById.mockResolvedValue(null);

      await expect(
        service.assignTask('bad-id', { assignedTo: 'user-uuid-1' })
      ).rejects.toThrow(new AppError(404, 'Task not found'));
    });
  });
});
