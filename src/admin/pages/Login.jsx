import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function Login() {
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const success = await login(email, password);
    if (!success) setError('Invalid credentials.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(178,34,34,0.08),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(178,34,34,0.05),transparent_40%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#B5232B] rounded-2xl mb-4 shadow-lg shadow-[#B5232B]/30">
            <span className="text-white text-xl font-black tracking-tighter">T</span>
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">Tony Original Morocco</h1>
          <p className="text-white/40 text-sm mt-1 font-medium">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-white/40 text-sm mb-8">Sign in to your admin panel</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-white/50 uppercase mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tonyoriginal.ma"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A24B] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-semibold tracking-widest uppercase mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B5232B] focus:bg-white/8 transition-all duration-200"
                required
              />
            </div>

            {error && (
              <div className="bg-[#B5232B]/10 border border-[#B5232B]/30 text-[#ff6b6b] text-xs rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B5232B] hover:bg-[#9a1c23] text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#B5232B]/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
