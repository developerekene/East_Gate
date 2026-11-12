import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signIn, signUp } = useStore();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, displayName.trim());
        setSuccessMsg('Account created successfully! Welcome aboard.');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        await signIn(email.trim(), password);
        setSuccessMsg('Signed in successfully.');
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else {
        console.error(err);
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-4 animate-in fade-in duration-150">
      <div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0B2545] bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
        >
          <span>← Back to Store</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl w-full border border-blue-100 shadow-lg overflow-hidden">
        {/* Header Banner */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-white/20 rounded-xl">
              <Sparkles className="w-4 h-4 text-blue-100" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-100">
              East Gate
            </span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            {mode === 'signin' ? 'Sign In' : 'Create an Account'}
          </h3>
          <p className="text-xs text-blue-100/90 mt-1">
            {mode === 'signin'
              ? 'Access your orders, saved items, and account.'
              : 'Create an account to track orders and manage your profile.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-800 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 hover:from-blue-900 hover:to-blue-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : mode === 'signin' ? (
              <span>Sign In</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          {/* Toggle between mode */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-blue-800 hover:text-blue-800 underline cursor-pointer"
                >
                  Sign Up here
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-blue-800 hover:text-blue-800 underline cursor-pointer"
                >
                  Sign In here
                </button>
              </p>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
