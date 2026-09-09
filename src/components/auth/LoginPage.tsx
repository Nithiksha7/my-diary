import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Feather } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field validation helper
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-fade-in text-white">
      {/* Header Emblem & Titles */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300 shadow-glow mb-2 animate-float-gentle">
          <Feather className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-amber-400/90 block">
            Private Journal
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-wide text-white drop-shadow-md">
            MY DIARY
          </h1>
        </div>
        <p className="text-sm font-serif italic text-stone-300/90 max-w-xs mx-auto leading-relaxed">
          “Your thoughts. Your memories. Your private little world.”
        </p>
      </div>

      {/* Inline Error Message Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs font-serif flex items-start gap-2.5 animate-fade-in shadow-lg"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-serif font-semibold text-stone-300 pl-1"
          >
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isSubmitting}
              className="w-full bg-black/40 border border-white/15 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 rounded-2xl pl-10 pr-4 py-3 text-sm font-sans text-white placeholder:text-stone-500 placeholder:font-serif outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pl-1">
            <label
              htmlFor="login-password"
              className="block text-xs font-serif font-semibold text-stone-300"
            >
              Password
            </label>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              className="w-full bg-black/40 border border-white/15 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 rounded-2xl pl-10 pr-11 py-3 text-sm font-sans text-white placeholder:text-stone-500 outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isSubmitting}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-serif font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-glow hover:shadow-lg active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
              <span>Opening Diary...</span>
            </>
          ) : (
            <>
              <span>Enter My Diary</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-xs font-serif text-stone-300">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={isSubmitting}
            className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 decoration-amber-400/40 hover:decoration-amber-300 transition-colors cursor-pointer ml-1"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};
