import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, JwtUser } from '../types';

export function signToken(user: JwtUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
