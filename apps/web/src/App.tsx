import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoginScreen from './components/LoginScreen';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import ExpensesList from './pages/ExpensesList';
import Analytics from './pages/Analytics';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">💸</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add" element={<AddExpense />} />
      <Route path="/expenses" element={<ExpensesList />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
