import { UserRepository } from '../repositories/user.repository';
import { comparePassword } from '../utils/bcrypt';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { LoginInput } from '../schemas/auth.schema';

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Validates credentials and returns a signed JWT.
   * Throws 401 if email not found or password is wrong.
   * (Same generic message prevents user enumeration.)
   */
  async login(input: LoginInput): Promise<{ token: string; user: object }> {
    const user = await this.userRepo.findByEmail(input.email);

    const INVALID_CREDENTIALS = new AppError(401, 'Invalid email or password');

    if (!user) throw INVALID_CREDENTIALS;

    const passwordMatch = await comparePassword(input.password, user.password);
    if (!passwordMatch) throw INVALID_CREDENTIALS;

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      token,
      user: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
