import { Pool } from 'pg';
import { User, Role, CursorParams, CursorResult } from '../types';
export declare class UserRepository {
    private readonly db;
    constructor(db: Pool);
    findById(id: string): Promise<User | null>;
    findPublicById(id: string): Promise<Omit<User, 'password'> | null>;
    findByEmail(email: string): Promise<User | null>;
    findIdByEmail(email: string): Promise<string | null>;
    create(data: {
        name: string;
        email: string;
        password: string;
        role: Role;
    }): Promise<Omit<User, 'password'>>;
    update(id: string, data: {
        name?: string;
        email?: string;
        password?: string;
        role?: Role;
    }): Promise<Omit<User, 'password'>>;
    delete(id: string): Promise<void>;
    findMany({ limit, cursor }: CursorParams): Promise<CursorResult<Omit<User, 'password'>>>;
    existsByEmail(email: string): Promise<boolean>;
}
