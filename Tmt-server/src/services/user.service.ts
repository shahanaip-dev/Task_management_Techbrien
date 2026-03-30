import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/bcrypt';
import { AppError } from '../middleware/error.middleware';
import { buildPaginated, parsePagination } from '../utils/pagination';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { Role } from '../types';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(input: CreateUserInput) {
    const exists = await this.userRepo.existsByEmail(input.email);
    if (exists) {
      throw new AppError(409, `Email "${input.email}" is already registered`);
    }

    const hashedPassword = await hashPassword(input.password);

    return this.userRepo.create({
      name:     input.name,
      email:    input.email,
      password: hashedPassword,
      role:     'EMPLOYEE' as Role,
    });
  }

  async listUsers(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const [users, total] = await this.userRepo.findMany(pagination);
    return buildPaginated(users, total, pagination);
  }

  async getUser(id: string) {
    const user = await this.userRepo.findPublicById(id);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new AppError(404, 'User not found');

    if (!input.name && !input.email && !input.password) {
      throw new AppError(400, 'At least one field must be provided');
    }

    if (input.email) {
      const ownerId = await this.userRepo.findIdByEmail(input.email);
      if (ownerId && ownerId !== id) {
        throw new AppError(409, `Email "${input.email}" is already registered`);
      }
    }

    const hashedPassword = input.password ? await hashPassword(input.password) : undefined;

    return this.userRepo.update(id, {
      name:     input.name,
      email:    input.email?.toLowerCase().trim(),
      password: hashedPassword,
      role:     undefined,
    });
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new AppError(404, 'User not found');
    if (user.email === 'admin@tmt.com' || user.name === 'System Admin') {
      throw new AppError(403, 'System admin cannot be deleted');
    }
    await this.userRepo.delete(id);
  }
}
