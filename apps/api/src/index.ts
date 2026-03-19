import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { pool } from './db';
import authRouter from './routes/auth';
import expensesRouter from './routes/expenses';
import summaryRouter from './routes/summary';
import { csrfProtection } from './middleware/csrfProtection';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Body parsing
app.use(express.json());

// CORS – allow the web dev server with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV === 'production') {
        callback(null, true);
        return;
      }

      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigin = process.env.WEB_URL || 'http://localhost:5173';
      if (origin === allowedOrigin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Sessions backed by Postgres
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    },
  })
);

// Routes
app.use(csrfProtection);
app.use('/auth', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/summary', summaryRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const webDistPath = path.resolve(__dirname, '../../web/dist');
  if (fs.existsSync(webDistPath)) {
    app.use(express.static(webDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path === '/health') {
        next();
        return;
      }

      res.sendFile(path.join(webDistPath, 'index.html'));
    });
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TNDiary API listening on http://0.0.0.0:${PORT}`);
});

export default app;
