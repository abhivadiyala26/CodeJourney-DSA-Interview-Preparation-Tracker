import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Errors are caught and toasted inside context
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100-4rem)] flex items-center justify-center py-16 px-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Decorative Glow blobs */}
      <div className="absolute top-[20%] left-[20%] w-80 h-80 rounded-full bg-brand-500/5 blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl shadow-xl">
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg mb-4 text-lg">
            CJ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to track your DSA prep and streaks
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-1 text-left">
            <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:scale-[1.01] active:scale-95 duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-350 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
