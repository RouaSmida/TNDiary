/// <reference types="vite/client" />

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error || res.statusText);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export const authApi = {
  me: () => apiFetch<User>('/auth/me'),
  devLogin: (email: string, displayName?: string) =>
    apiFetch<User>('/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ email, displayName }),
    }),
  logout: () => apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
};

// ─── Expenses ────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  user_id: string;
  amount_tnd: string;
  category: string;
  subcategory: string | null;
  note: string | null;
  spent_at: string;
  created_at: string;
}

export interface CreateExpenseInput {
  amount_tnd: number;
  category: string;
  subcategory?: string;
  note?: string;
  spent_at?: string;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  category?: string;
  subcategory?: string;
}

export const expensesApi = {
  list: (filters?: ExpenseFilters) => {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.subcategory) params.set('subcategory', filters.subcategory);
    const qs = params.toString();
    return apiFetch<Expense[]>(`/api/expenses${qs ? `?${qs}` : ''}`);
  },
  create: (data: CreateExpenseInput) =>
    apiFetch<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ ok: boolean; id: string }>(`/api/expenses/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Summary ─────────────────────────────────────────────────────────────────

export interface MonthlySummary {
  year: number;
  month: number;
  total: number;
  breakdown: { category: string; total: number }[];
}

export const summaryApi = {
  month: (year: number, month: number) =>
    apiFetch<MonthlySummary>(`/api/summary/month?year=${year}&month=${month}`),
};
