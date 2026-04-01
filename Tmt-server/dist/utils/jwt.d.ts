import { JwtPayload, JwtUser } from '../types';
export declare function signToken(user: JwtUser): string;
export declare function verifyToken(token: string): JwtPayload;
