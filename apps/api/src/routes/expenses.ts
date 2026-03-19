import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { requireAuth } from '../middleware/requireAuth';
import { isValidCategory, isValidSubcategory } from '../categories';
import '../types';

const router = Router();

/**
 * POST /api/expenses
 * Body: { amount_tnd, category, subcategory?, note?, spent_at? }
 */
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { amount_tnd, category, subcategory, note, spent_at } = req.body as {
    amount_tnd?: unknown;
    category?: string;
    subcategory?: string;
    note?: string;
    spent_at?: string;
  };

  if (!amount_tnd || isNaN(Number(amount_tnd)) || Number(amount_tnd) <= 0) {
    res.status(400).json({ error: 'amount_tnd must be a positive number' });
    return;
  }
  if (!category || !isValidCategory(category)) {
    res.status(400).json({ error: 'Invalid category' });
    return;
  }
  if (subcategory && !isValidSubcategory(category, subcategory)) {
    res.status(400).json({ error: 'Invalid subcategory for this category' });
    return;
  }

  try {
    const rows = await query<{
      id: string;
      user_id: string;
      amount_tnd: string;
      category: string;
      subcategory: string | null;
      note: string | null;
      spent_at: string;
      created_at: string;
    }>(
      `INSERT INTO expenses (id, user_id, amount_tnd, category, subcategory, note, spent_at)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()))
       RETURNING *`,
      [
        uuidv4(),
        req.session.userId,
        Number(amount_tnd).toFixed(1),
        category,
        subcategory ?? null,
        note ?? null,
        spent_at ?? null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/expenses error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/expenses?from=&to=&category=&subcategory=
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { from, to, category, subcategory } = req.query as Record<string, string | undefined>;

  const conditions: string[] = ['user_id = $1'];
  const params: unknown[] = [req.session.userId];
  let idx = 2;

  if (from) {
    conditions.push(`spent_at >= $${idx++}::timestamptz`);
    params.push(from);
  }
  if (to) {
    conditions.push(`spent_at <= $${idx++}::timestamptz`);
    params.push(to);
  }
  if (category) {
    conditions.push(`category = $${idx++}`);
    params.push(category);
  }
  if (subcategory) {
    conditions.push(`subcategory = $${idx++}`);
    params.push(subcategory);
  }

  try {
    const rows = await query(
      `SELECT * FROM expenses WHERE ${conditions.join(' AND ')} ORDER BY spent_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/expenses error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/expenses/:id
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const rows = await query(
      `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.session.userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json({ ok: true, id });
  } catch (err) {
    console.error('DELETE /api/expenses/:id error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
