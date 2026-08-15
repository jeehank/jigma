import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';
import Scanner from '../common/Scanner';
import { Eye, EyeOff, Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (signUpErr) throw signUpErr;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName || email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
          });

          if (data.session) {
            onSuccess({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName || email.split('@')[0],
              avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
            });
          } else {
            setMessage('ACCOUNT REGISTERED. CHECK EMAIL FOR CONFIRMATION OR LOGIN DIRECTLY.');
            setIsSignUp(false);
          }
        }
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) throw signInErr;

        if (data.user) {
          onSuccess({
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'SYSTEM ACCESS DENIED. VERIFY CREDENTIALS.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    const demoUser: UserProfile = {
      id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
      email: 'convener@xcelsior.tech',
      full_name: 'Convenor Admin',
      avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=xcelsior-convener',
    };
    onSuccess(demoUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black overflow-hidden font-mono">
      {/* Scanner WebGL Background */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-auto">
        <Scanner
          color1="#00ff66"
          color2="#042f1a"
          color3="#22c55e"
          speed={0.6}
          sweepSpeed={0.3}
          glow={0.35}
          bandDensity={14}
        />
      </div>

      {/* Terminal Card matching xcelsior26 reference image */}
      <div className="w-full max-w-md bg-[#070b09]/90 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-emerald-500/40 z-10 relative glow-green-sm">
        <div className="flex items-center space-x-2 text-emerald-400 mb-2">
          <Terminal className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest font-bold">XCELSIOR TERMINAL v2.6</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase mb-1 font-mono">
          SYSTEM ACCESS
        </h1>
        <p className="text-xs text-gray-400 mb-6 font-mono">
          {isSignUp ? 'Enter credentials to register' : 'Enter credentials to log in'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/60 rounded-xl flex items-center space-x-2 text-red-400 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1.5 font-mono">
                FULL NAME / CALLSIGN
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="convener"
                className="w-full px-4 py-3 bg-[#e8f1ff] border-0 rounded-lg text-black font-mono font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1.5 font-mono">
              USERNAME / EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="convener@xcelsior.tech"
              className="w-full px-4 py-3 bg-[#e8f1ff] border-0 rounded-lg text-black font-mono font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1.5 font-mono">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-3 pr-12 bg-[#e8f1ff] border-0 rounded-lg text-black font-mono font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-700 hover:text-black transition-colors"
                title={showPassword ? 'Hide password' : 'See password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-white hover:bg-emerald-400 text-black font-extrabold text-sm uppercase tracking-widest rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 mt-2 font-mono flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <span>ACCESS TERMINAL</span>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-emerald-900/60"></div>
          <span className="px-3 text-[10px] text-gray-400 uppercase tracking-widest font-mono">OR INSTANT GUEST</span>
          <div className="flex-1 border-t border-emerald-900/60"></div>
        </div>

        <button
          type="button"
          onClick={handleDemoSignIn}
          className="w-full py-3 px-4 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider rounded-xl font-mono transition-all text-center"
        >
          ENTER AS GUEST CONVENER
        </button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-mono tracking-wider underline uppercase"
          >
            {isSignUp ? 'EXISTING AGENT? SIGN IN' : 'NEW AGENT? REGISTER HERE'}
          </button>
        </div>
      </div>
    </div>
  );
};
