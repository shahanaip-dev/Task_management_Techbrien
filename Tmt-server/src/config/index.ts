import dotenv from 'dotenv';
dotenv.config();

// ── Validate required env vars at startup ──────────────────────────────────
const REQUIRED: string[] = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'JWT_SECRET'];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`[Config] Missing required environment variable: "${key}"`);
  }
}

export const config = {
  app: {
    env:   process.env.NODE_ENV ?? 'development',
    port:  parseInt(process.env.PORT ?? '5000', 10),
    isDev: process.env.NODE_ENV !== 'production',
  },
  db: {
    user:     process.env.DB_USER!,
    host:     process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port:     parseInt(process.env.DB_PORT ?? '5432', 10),
  },
  jwt: {
    secret:    process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },
} as const;
