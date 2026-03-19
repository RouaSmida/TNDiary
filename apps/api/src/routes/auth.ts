import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
// Side-effect import for session type augmentation
import '../types';

const router = Router();

/**
 * POST /auth/dev-login
 * Body: { email: string, displayName?: string }
 * Creates (or finds) a user and sets session.
 * Use this for local development; real Google OAuth comes later.
 */
router.post('/dev-login', async (req: Request, res: Response): Promise<void> => {
  const { email, displayName } = req.body as {
    email?: string;
    displayName?: string;
  };

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'email is required' });
    return;
  }

  try {
    // Upsert user by email
    const rows = await query<{
      id: string;
      email: string;
      display_name: string | null;
      avatar_url: string | null;
    }>(
      `INSERT INTO users (id, email, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET display_name = COALESCE(EXCLUDED.display_name, users.display_name)
       RETURNING id, email, display_name, avatar_url`,
      [uuidv4(), email, displayName ?? null]
    );

    const user = rows[0];
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.displayName = user.display_name ?? email;
    if (user.avatar_url) req.session.avatarUrl = user.avatar_url;

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name ?? email,
    });
  } catch (err) {
    console.error('dev-login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/logout
 */
router.post('/logout', (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Could not log out' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

/**
 * GET /auth/me
 * Returns current session user or 401.
 */
router.get('/me', (req: Request, res: Response): void => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({
    id: req.session.userId,
    email: req.session.email,
    displayName: req.session.displayName,
    avatarUrl: req.session.avatarUrl ?? null,
  });
});

/**
 * GET /auth/google
 * TODO: Wire real Google OAuth here.
 * 1. Install passport + passport-google-oauth20
 * 2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars
 * 3. Replace this stub with passport.authenticate('google', { scope: ['profile','email'] })
 */
router.get('/google', (_req: Request, res: Response): void => {
  res.status(501).json({
    error: 'Google OAuth not configured yet',
    todo: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars and wire passport-google-oauth20',
  });
});

/**
 * GET /auth/google/callback
 * TODO: Wire real Google OAuth callback here.
 */
router.get('/google/callback', (_req: Request, res: Response): void => {
  res.status(501).json({
    error: 'Google OAuth callback not configured yet',
  });
});

export default router;
