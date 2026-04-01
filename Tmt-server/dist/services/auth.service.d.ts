import { UserRepository } from '../repositories/user.repository';
import { LoginInput } from '../schemas/auth.schema';
export declare class AuthService {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    /**
     * Validates credentials and returns a signed JWT.
     * Throws 401 if email not found or password is wrong.
     * (Same generic message prevents user enumeration.)
     */
    login(input: LoginInput): Promise<{
        token: string;
        user: object;
    }>;
}
