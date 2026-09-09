import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return false;
    }
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
      setErrorMessage('Please create a password');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
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
      const result = await register(name.trim(), email.trim(), password);
      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed. Please try again.');
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
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300 shadow-glow mb-2 animate-float-gentle">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-amber-400/90 block">
            New Chapter
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-wide text-white drop-shadow-md">
            Begin Your Story
          </h1>
        </div>
        <p className="text-sm font-serif italic text-stone-300/90 max-w-xs mx-auto leading-relaxed">
          “Create a private space for the moments you never want to forget.”
        </p>
      </div>

      {/* Inline Error Message Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs font-serif flex items-start gap-2.5 animate-fade-in shadow-lg"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-name"
            className="block text-xs font-serif font-semibold text-stone-300 pl-1"
          >
            Your Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-400 transition-colors">
              <User className="w-4 h-4" />
            </div>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Eleanor Vance"
              required
              autoComplete="name"
              disabled={isSubmitting}
              className="w-full bg-black/40 border border-white/15 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-sans text-white placeholder:text-stone-500 placeholder:font-serif outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-email"
            className="block text-xs font-serif font-semibold text-stone-300 pl-1"
          >
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="register-email"
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
              className="w-full bg-black/40 border border-white/15 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-sans text-white placeholder:text-stone-500 placeholder:font-serif outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-password"
            className="block text-xs font-serif font-semibold text-stone-300 pl-1"
          >
            Password <span className="text-stone-400 text-[10px] font-normal">(min 6 characters)</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={isSubmitting}
              className="w-full bg-black/40 border border-white/15 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 rounded-2xl pl-10 pr-11 py-2.5 text-sm font-sans text-white placeholder:text-stone-500 outline-none transition-all duration-200"
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

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-confirm-password"
            className="block text-xs font-serif font-semibold text-stone-300 pl-1"
          >
            Confirm Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={isSubmitting}
              className="w-full bg-black/40 border border-white/15 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 rounded-2xl pl-10 pr-11 py-2.5 text-sm font-sans text-white placeholder:text-stone-500 outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              disabled={isSubmitting}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-serif font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-glow hover:shadow-lg active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
              <span>Creating Your Diary...</span>
            </>
          ) : (
            <>
              <span>Create My Diary</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <p className="text-xs font-serif text-stone-300">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isSubmitting}
            className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 decoration-amber-400/40 hover:decoration-amber-300 transition-colors cursor-pointer ml-1"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
