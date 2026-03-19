import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import Layout from '../components/Layout';
import { summaryApi, expensesApi, MonthlySummary, Expense } from '../api';
import { CATEGORY_LABELS } from '../categories';

const COLORS = [
  '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6b7280',
];

function buildWeeklyData(expenses: Expense[]) {
  const weekMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const d = new Date(e.spent_at);
    // ISO week day label: Mon DD
    const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit' });
    weekMap[label] = (weekMap[label] ?? 0) + parseFloat(e.amount_tnd);
  });
  return Object.entries(weekMap)
    .map(([day, total]) => ({ day, total: Math.round(total * 10) / 10 }))
    .slice(-7);
}

export default function Analytics() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = new Date(year, month, 1);
    const endDate = nextMonth.toISOString().split('T')[0];

    Promise.all([
      summaryApi.month(year, month),
      expensesApi.list({ from: startDate, to: endDate }),
    ])
      .then(([s, e]) => {
        setSummary(s);
        setExpenses(e);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const weeklyData = buildWeeklyData(expenses);
  const monthName = new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  return (
    <Layout title="Analytics">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-gray-500 hover:text-gray-900">‹</button>
        <span className="font-semibold text-gray-800">{monthName}</span>
        <button onClick={nextMonth} className="p-2 text-gray-500 hover:text-gray-900">›</button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
          <div className="h-40 bg-gray-100 animate-pulse rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Pie chart */}
          <div className="card mb-4">
            <h2 className="font-semibold text-gray-800 mb-1">Spending by Category</h2>
            <p className="text-gray-500 text-sm mb-3">
              Total: <span className="font-bold text-gray-900">{summary?.total.toFixed(1) ?? '0.0'} TND</span>
            </p>
            {summary && summary.breakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={summary.breakdown}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ percent }: { name: string; percent: number }) =>
                        `${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {summary.breakdown.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)} TND`,
                        CATEGORY_LABELS[name] ?? name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <ul className="mt-2 space-y-1">
                  {summary.breakdown.map(({ category, total }, idx) => (
                    <li key={category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: COLORS[idx % COLORS.length] }}
                        />
                        <span>{CATEGORY_LABELS[category] ?? category}</span>
                      </div>
                      <span className="font-medium">{total.toFixed(1)} TND</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-center text-gray-400 py-8">No data for this month.</p>
            )}
          </div>

          {/* Weekly trend */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-3">Daily Spending (last 7 days)</h2>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} TND`, 'Spent']} />
                  <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-6">No data.</p>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
