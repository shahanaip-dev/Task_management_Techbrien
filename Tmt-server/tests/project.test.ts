/**
 * ProjectService Unit Tests
 */
import { ProjectService } from '../src/services/project.service';
import { AppError } from '../src/middleware/error.middleware';

const mockProjectRepo = {
  findById:            jest.fn(),
  findByIdWithCreator: jest.fn(),
  create:              jest.fn(),
  update:              jest.fn(),
  delete:              jest.fn(),
  findMany:            jest.fn(),
};

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    service = new ProjectService(mockProjectRepo as any);
    jest.clearAllMocks();
  });

  // ── createProject ──────────────────────────────────────────────────────
  describe('createProject', () => {
    it('should create and return a project', async () => {
      const input  = { name: 'New Project', description: 'A test project' };
      const userId = 'user-uuid-1';
      const created = { id: 'proj-uuid-1', ...input, createdBy: userId, createdAt: new Date() };

      mockProjectRepo.create.mockResolvedValue(created);

      const result = await service.createProject(input, userId);
      expect(result).toEqual(created);
      expect(mockProjectRepo.create).toHaveBeenCalledWith({ ...input, createdBy: userId });
    });
  });

  // ── getProject ─────────────────────────────────────────────────────────
  describe('getProject', () => {
    it('should return the project when found', async () => {
      const project = { id: 'proj-uuid-1', name: 'Test' };
      mockProjectRepo.findByIdWithCreator.mockResolvedValue(project);

      const result = await service.getProject('proj-uuid-1');
      expect(result).toEqual(project);
    });

    it('should throw 404 when project not found', async () => {
      mockProjectRepo.findByIdWithCreator.mockResolvedValue(null);

      await expect(service.getProject('nonexistent-id'))
        .rejects.toThrow(new AppError(404, 'Project not found'));
    });
  });

  // ── updateProject ──────────────────────────────────────────────────────
  describe('updateProject', () => {
    it('should update and return the project', async () => {
      const existing = { id: 'proj-uuid-1', name: 'Old', description: 'Desc' };
      const updated  = { ...existing, name: 'New Name' };

      mockProjectRepo.findById.mockResolvedValue(existing);
      mockProjectRepo.update.mockResolvedValue(updated);

      const result = await service.updateProject('proj-uuid-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should throw 404 when project not found', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      await expect(service.updateProject('none', { name: 'x' }))
        .rejects.toThrow(new AppError(404, 'Project not found'));
    });
  });

  // ── deleteProject ──────────────────────────────────────────────────────
  describe('deleteProject', () => {
    it('should delete the project', async () => {
      mockProjectRepo.findById.mockResolvedValue({ id: 'proj-uuid-1' });
      mockProjectRepo.delete.mockResolvedValue(undefined);

      await expect(service.deleteProject('proj-uuid-1')).resolves.toBeUndefined();
      expect(mockProjectRepo.delete).toHaveBeenCalledWith('proj-uuid-1');
    });

    it('should throw 404 when project not found', async () => {
      mockProjectRepo.findById.mockResolvedValue(null);

      await expect(service.deleteProject('none'))
        .rejects.toThrow(new AppError(404, 'Project not found'));
    });
  });
});
