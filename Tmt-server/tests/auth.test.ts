/**
 * Auth Service Unit Tests
 * Tests business logic in isolation using mocked repositories.
 */
import { AuthService } from '../src/services/auth.service';
import { AppError } from '../src/middleware/error.middleware';
import * as bcryptUtil from '../src/utils/bcrypt';
import * as jwtUtil from '../src/utils/jwt';
import { Role } from '@prisma/client';

// ── Mock dependencies ──────────────────────────────────────────────────────
const mockUserRepo = {
  findByEmail:   jest.fn(),
  findById:      jest.fn(),
  create:        jest.fn(),
  findMany:      jest.fn(),
  existsByEmail: jest.fn(),
};

jest.mock('../src/utils/bcrypt');
jest.mock('../src/utils/jwt');

const mockCompare = bcryptUtil.comparePassword as jest.MockedFunction<typeof bcryptUtil.comparePassword>;
const mockSign    = jwtUtil.signToken         as jest.MockedFunction<typeof jwtUtil.signToken>;

// ── Test suite ─────────────────────────────────────────────────────────────
describe('AuthService.login', () => {
  let authService: AuthService;

  const fakeUser = {
    id:        'user-uuid-1',
    name:      'Test User',
    email:     'test@example.com',
    password:  'hashed_password',
    role:      Role.EMPLOYEE,
    createdAt: new Date(),
  };

  beforeEach(() => {
    authService = new AuthService(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('should return a token and user on valid credentials', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(fakeUser);
    mockCompare.mockResolvedValue(true);
    mockSign.mockReturnValue('mock.jwt.token');

    const result = await authService.login({ email: 'test@example.com', password: 'Correct@123' });

    expect(result.token).toBe('mock.jwt.token');
    expect((result.user as any).email).toBe('test@example.com');
    expect((result.user as any).password).toBeUndefined(); // never exposed
  });

  it('should throw 401 when email is not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'nobody@example.com', password: 'any' })
    ).rejects.toThrow(new AppError(401, 'Invalid email or password'));
  });

  it('should throw 401 when password is wrong', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(fakeUser);
    mockCompare.mockResolvedValue(false);

    await expect(
      authService.login({ email: 'test@example.com', password: 'Wrong@123' })
    ).rejects.toThrow(new AppError(401, 'Invalid email or password'));
  });

  it('should not leak whether email exists (same error message)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockCompare.mockResolvedValue(false);

    let emailError: AppError | undefined;
    let passError:  AppError | undefined;

    try { await authService.login({ email: 'none@x.com', password: 'x' }); }
    catch (e) { emailError = e as AppError; }

    mockUserRepo.findByEmail.mockResolvedValue(fakeUser);
    try { await authService.login({ email: 'test@example.com', password: 'wrong' }); }
    catch (e) { passError = e as AppError; }

    expect(emailError?.message).toBe(passError?.message);
  });
});
