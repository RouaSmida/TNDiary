import { Request, Response, NextFunction } from 'express';

/**
 * Simple CSRF protection for session-cookie-based APIs.
 * State-changing requests (POST/PUT/PATCH/DELETE) must include the
 * custom header "X-Requested-With: XMLHttpRequest".
 *
 * This is a lightweight defense-in-depth measure alongside:
 *  - SameSite=Lax cookies (blocks cross-site cookie sending)
 *  - CORS origin restriction (blocks cross-origin fetch access)
 *
 * TODO: When adding Google OAuth, consider csrf-csrf or a token-based approach
 * for the OAuth redirect flow.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (safeMethod) {
    next();
    return;
  }

  const header = req.headers['x-requested-with'];
  if (header !== 'XMLHttpRequest') {
    res.status(403).json({ error: 'Forbidden: missing CSRF header' });
    return;
  }

  next();
}
