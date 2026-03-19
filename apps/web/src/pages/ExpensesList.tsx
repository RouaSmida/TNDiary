import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { expensesApi, Expense } from '../api';
import { CATEGORY_KEYS, CATEGORY_LABELS, SUBCATEGORY_LABELS } from '../categories';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expensesApi.list({
        category: filterCategory || undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
      });
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterFrom, filterTo]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return;
    try {
      await expensesApi.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <Layout title="Expenses">
      {/* Filters */}
      <div className="card mb-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input"
          >
            <option value="">All categories</option>
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABELS[k] ?? k}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              From
            </label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="input text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              To
            </label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="input text-sm"
            />
          </div>
        </div>
        {(filterCategory || filterFrom || filterTo) && (
          <button
            onClick={() => {
              setFilterCategory('');
              setFilterFrom('');
              setFilterTo('');
            }}
            className="text-xs text-primary-600 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No expenses found.</p>
      ) : (
        <ul className="space-y-3">
          {expenses.map((e) => (
            <li key={e.id} className="card flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {CATEGORY_LABELS[e.category] ?? e.category}
                  </span>
                  {e.subcategory && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {SUBCATEGORY_LABELS[e.subcategory] ?? e.subcategory}
                    </span>
                  )}
                </div>
                {e.note && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{e.note}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(e.spent_at)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">
                  {parseFloat(e.amount_tnd).toFixed(1)}
                </p>
                <p className="text-xs text-gray-400">TND</p>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                className="text-gray-300 hover:text-red-400 text-lg pl-1 transition-colors"
                aria-label="Delete expense"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
