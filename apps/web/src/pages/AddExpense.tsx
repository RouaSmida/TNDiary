import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { expensesApi } from '../api';
import { CATEGORIES, CATEGORY_KEYS, CATEGORY_LABELS, SUBCATEGORY_LABELS } from '../categories';

export default function AddExpense() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subcategories = category ? CATEGORIES[category] ?? [] : [];

  async function handleSave() {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await expensesApi.create({
        amount_tnd: parsed,
        category,
        subcategory: subcategory || undefined,
        note: note || undefined,
      });
      navigate('/expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Add Expense">
      <div className="space-y-4">
        {/* Amount */}
        <div className="card">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Amount (TND)
          </label>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-4xl font-bold bg-transparent outline-none text-gray-900 placeholder-gray-300"
              autoFocus
            />
            <span className="text-xl font-semibold text-gray-400">TND</span>
          </div>
        </div>

        {/* Category */}
        <div className="card">
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => {
                  setCategory(key);
                  setSubcategory('');
                }}
                className={`py-2 px-3 rounded-xl text-sm font-medium text-left transition-colors border ${
                  category === key
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                {CATEGORY_LABELS[key] ?? key}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <div className="card">
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Subcategory <span className="text-gray-400">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubcategory(subcategory === sub ? '' : sub)}
                  className={`py-1.5 px-3 rounded-full text-sm transition-colors border ${
                    subcategory === sub
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  {SUBCATEGORY_LABELS[sub] ?? sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="card">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Note <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Add a note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm px-1">{error}</p>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? 'Saving…' : '💾 Save Expense'}
        </button>
      </div>
    </Layout>
  );
}
