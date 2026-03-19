import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await login(email, name || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💸</div>
          <h1 className="text-3xl font-bold text-gray-900">TNDiary</h1>
          <p className="text-gray-500 mt-1">Smart Finance Tracker</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Sign in (Dev mode)</h2>

          {/* TODO: Replace this form with real Google OAuth button when
              GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
              Use: <a href="/auth/google">Continue with Google</a> */}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Google login coming soon — this is a dev stub.
          </p>
        </div>
      </div>
    </div>
  );
}
