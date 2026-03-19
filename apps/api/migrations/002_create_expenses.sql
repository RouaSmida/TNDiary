CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_tnd  NUMERIC(12, 1) NOT NULL,
  category    TEXT NOT NULL,
  subcategory TEXT,
  note        TEXT,
  spent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_spent_at
  ON expenses (user_id, spent_at);

CREATE INDEX IF NOT EXISTS idx_expenses_user_category
  ON expenses (user_id, category);
