import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';
import { db }            from './db';
import { config }        from './config';
import { createV1Router } from './api';
import { errorHandler }  from './middleware/error.middleware';

const app = express();

// ── Security ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      config.cors.origin,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Parsing ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ────────────────────────────────────────────────────────────────
app.use(morgan(config.app.isDev ? 'dev' : 'combined'));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1', createV1Router(db));

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`\n🚀 TMT Server running on http://localhost:${PORT}`);
  console.log(`   Env    : ${config.app.env}`);
  console.log(`   DB     : ${config.db.host}:${config.db.port}/${config.db.database}`);
  console.log(`   API    : http://localhost:${PORT}/api/v1\n`);
});

export { app, db };
