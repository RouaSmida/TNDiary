import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
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
    origin: process.env.WEB_URL || 'http://localhost:5173',
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

app.listen(PORT, () => {
  console.log(`🚀 TNDiary API listening on http://localhost:${PORT}`);
});

export default app;
