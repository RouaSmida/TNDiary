import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthProvider';
import { summaryApi, MonthlySummary } from '../api';
import { CATEGORY_LABELS } from '../categories';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const now = new Date();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    summaryApi
      .month(now.getFullYear(), now.getMonth() + 1)
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Layout
      title="TNDiary"
      action={
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">
          Sign out
        </button>
      }
    >
      {/* Greeting */}
      <div className="mb-4">
        <p className="text-gray-500 text-sm">Welcome back,</p>
        <p className="font-bold text-xl">{user?.displayName ?? user?.email}</p>
      </div>

      {/* Monthly total card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white mb-4">
        <p className="text-primary-100 text-sm">{monthName}</p>
        {loading ? (
          <div className="h-10 bg-primary-500 animate-pulse rounded-lg mt-1" />
        ) : (
          <p className="text-4xl font-bold mt-1">
            {summary?.total.toFixed(1) ?? '0.0'}{' '}
            <span className="text-xl font-medium text-primary-200">TND</span>
          </p>
        )}
        <p className="text-primary-200 text-xs mt-1">Total spent this month</p>
      </div>

      {/* Quick add button */}
      <Link
        to="/add"
        className="btn-primary w-full text-center block mb-4"
      >
        ➕ Add Expense
      </Link>

      {/* Category breakdown */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Breakdown</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : summary && summary.breakdown.length > 0 ? (
          <ul className="space-y-2">
            {summary.breakdown.map(({ category, total }) => (
              <li key={category} className="flex items-center justify-between">
                <span className="text-sm">
                  {CATEGORY_LABELS[category] ?? category}
                </span>
                <span className="font-semibold text-sm">{total.toFixed(1)} TND</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">
            No expenses yet this month.{' '}
            <Link to="/add" className="text-primary-600 underline">
              Add one!
            </Link>
          </p>
        )}
      </div>
    </Layout>
  );
}
