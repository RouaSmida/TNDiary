import { Router, Request, Response } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/requireAuth';
import '../types';

const router = Router();

/**
 * GET /api/summary/month?year=YYYY&month=MM
 * Returns total + category breakdown for the given month.
 */
router.get('/month', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const year = Number(req.query.year) || now.getUTCFullYear();
  const month = Number(req.query.month) || now.getUTCMonth() + 1;

  if (month < 1 || month > 12) {
    res.status(400).json({ error: 'month must be 1–12' });
    return;
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 1).toISOString().split('T')[0]; // first day of next month

  try {
    const totalRows = await query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_tnd), 0)::text AS total
       FROM expenses
       WHERE user_id = $1
         AND spent_at >= $2::timestamptz
         AND spent_at < $3::timestamptz`,
      [req.session.userId, startDate, endDate]
    );

    const breakdownRows = await query<{ category: string; total: string }>(
      `SELECT category, SUM(amount_tnd)::text AS total
       FROM expenses
       WHERE user_id = $1
         AND spent_at >= $2::timestamptz
         AND spent_at < $3::timestamptz
       GROUP BY category
       ORDER BY SUM(amount_tnd) DESC`,
      [req.session.userId, startDate, endDate]
    );

    res.json({
      year,
      month,
      total: parseFloat(totalRows[0]?.total ?? '0'),
      breakdown: breakdownRows.map((r) => ({
        category: r.category,
        total: parseFloat(r.total),
      })),
    });
  } catch (err) {
    console.error('GET /api/summary/month error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
