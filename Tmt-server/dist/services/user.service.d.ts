import { UserRepository } from '../repositories/user.repository';
import { ChangePasswordInput, CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
export declare class UserService {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    createUser(input: CreateUserInput): Promise<Omit<import("../types").User, "password">>;
    listUsers(query: Record<string, unknown>): Promise<import("../types").CursorResult<Omit<import("../types").User, "password">>>;
    getUser(id: string): Promise<Omit<import("../types").User, "password">>;
    updateUser(id: string, input: UpdateUserInput): Promise<Omit<import("../types").User, "password">>;
    deleteUser(id: string): Promise<void>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
}
