import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { User as UserIcon, Mail, Lock, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) return;

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100-4rem)] flex items-center justify-center py-16 px-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-[20%] right-[20%] w-80 h-80 rounded-full bg-brand-500/5 blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[20%] w-96 h-96 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg mb-4 text-lg">
            CJ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Start tracking your DSA progress and streaks today
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="space-y-1 text-left">
            <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <UserIcon size={16} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

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
            <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Password
            </label>
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
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div className="space-y-1 text-left">
            <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:scale-[1.01] active:scale-95 duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <CheckCircle size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-350 transition-colors">
              Log In instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
